// Bundles a Figma script for the Figma MCP `use_figma` tool: CONFIG + DATA + lib/core.js + the script, comments stripped.
//
//   node scripts/figma/bundle.ts audit --config '{"nodeIds":["10874:19460"]}'
//   node scripts/figma/bundle.ts swap --config-file my-rules.json --out /tmp/swap.js
//   node scripts/figma/bundle.ts --list
//   flags: --out <file> · --pretty (keep indentation) · --full (keep all of lib/core.js and every swap strategy;
//          by default unused core helpers and, for swap, strategies no rule uses are dropped)
//
// DATA comes from docs/migration/figma-library.json (keys), docs/migration/d2-to-l3.json (mappings) and the generated
// code tokens (exact light-mode colours), so Figma scripts and code can never disagree. Paste the output as the
// `code` of use_figma (fileKey = the file you work on). Keep each bundle under 50,000 characters.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..', '..')
const read = (p: string) => readFileSync(join(root, p), 'utf8')
const SCRIPTS: Record<string, { core: boolean; data: string[]; about: string }> = {
  registry: { core: false, data: [], about: 'Export the library registry (run on the LIBRARY file)' },
  'verify-registry': { core: false, data: ['components', 'textStyles'], about: 'Prove every registry key imports (run in a consumer file)' },
  audit: { core: true, data: ['components', 'collections', 'textStyles', 'colors', 'oldCollections', 'colorsLight', 'scales'], about: 'Read-only inventory + phased plan + swap rules' },
  'migrate-tokens': { core: true, data: ['collections', 'textStyles', 'colors', 'contexts', 'oldCollections', 'scales', 'text', 'colorsLight'], about: 'Colours, numbers, text styles → L3 (dryRun supported)' },
  swap: { core: true, data: ['components', 'collections', 'textStyles', 'icons', 'scales'], about: 'Rule-based, layout-preserving component swaps (dryRun / sandbox)' },
  'build-screen': { core: true, data: ['components', 'collections', 'textStyles', 'effectStyles', 'icons', 'scales'], about: 'Build a screen spec as L3 instances (sandbox supported)' },
}

const args = process.argv.slice(2)
if (!args.length || args[0] === '--list') {
  console.log('Figma scripts (node scripts/figma/bundle.ts <name> --config \'{...}\'):')
  for (const [k, v] of Object.entries(SCRIPTS)) console.log(`  ${k.padEnd(16)} ${v.about}`)
  process.exit(0)
}
const name = args[0]
const spec = SCRIPTS[name]
if (!spec) { console.error(`Unknown script "${name}". Run with --list.`); process.exit(1) }
const opt = (flag: string) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : undefined }
const config = opt('--config') ? JSON.parse(opt('--config')!) : opt('--config-file') ? JSON.parse(readFileSync(opt('--config-file')!, 'utf8')) : {}

// ---- DATA ----------------------------------------------------------------------------------
const lib = JSON.parse(read('docs/migration/figma-library.json'))
const map = JSON.parse(read('docs/migration/d2-to-l3.json'))
const strip = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('$')))

/** Exact LM-light value of every theme token, from the generated CSS (plain colours only; color-mix tokens are skipped). */
function colorsLight(): Record<string, string> {
  const base = Object.fromEntries([...read('src/tokens/generated/base.css').matchAll(/(--l3-[\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1], m[2].toLowerCase()]))
  const css = read('src/tokens/generated/themes.css')
  const block = css.slice(css.indexOf('{') + 1, css.indexOf('}'))
  const cssVal = Object.fromEntries([...block.matchAll(/(--l3-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
  const tokens = read('src/tokens/generated/tokens.ts')
  const names = [...tokens.matchAll(/'([a-z][\w/.-]*)': '(--l3-[\w-]+)'/g)]
  const out: Record<string, string> = {}
  for (const [, figmaName, cssVar] of names) {
    const v = cssVal[cssVar]
    if (!v) continue
    const ref = v.match(/^var\((--l3-[\w-]+)\)$/)
    const hex = ref ? base[ref[1]] ?? (cssVal[ref[1]] && base[cssVal[ref[1]].replace(/^var\((.*)\)$/, '$1')]) : /^#[0-9a-f]{6}$/i.test(v) ? v.toLowerCase() : undefined
    if (hex) out[figmaName] = hex
  }
  return out
}

const all: Record<string, unknown> = {
  components: lib.components.map((c: { name: string; key: string; status: string }) => ({ name: c.name, key: c.key, status: c.status })),
  collections: { theme: { key: lib.collections.theme.key }, number: { key: lib.collections.number.key } },
  textStyles: lib.textStyles,
  effectStyles: lib.effectStyles,
  icons: strip(lib.icons ?? {}),
  colors: strip(map.colors),
  colorPatterns: map.colorPatterns ?? [],
  contexts: strip(map.contexts),
  oldCollections: map.oldCollections,
  scales: map.scales,
  text: strip(map.text),
  colorsLight: spec.data.includes('colorsLight') ? colorsLight() : undefined,
}
const library: Record<string, unknown> = {}
const data: Record<string, unknown> = { l3ColorPrefix: map.l3ColorPrefix, library }
for (const k of spec.data) {
  if (['components', 'collections', 'textStyles', 'effectStyles'].includes(k)) library[k] = all[k]
  else data[k] = all[k]
  if (k === 'colors') data.colorPatterns = all.colorPatterns
}

// swap: drop DATA the rules' strategies never read (text-style keys: select / price-change; icon keys: select).
if (name === 'swap' && Array.isArray(config.rules) && config.rules.every((r: { strategy?: string }) => r.strategy) && !args.includes('--full')) {
  const used = new Set(config.rules.map((r: { strategy: string }) => r.strategy))
  if (!used.has('select') && !used.has('price-change')) delete library.textStyles
  if (!used.has('select')) delete data.icons
  data.scales = { spacing: (all.scales as { spacing: number[] }).spacing }
}
// Signature-only swaps never look up registry names, so they only need their own targets (saves ~4k characters).
if (name === 'swap' && Array.isArray(config.rules) && config.rules.length && config.rules.every((r: { match?: { signature?: string } }) => r.match?.signature)) {
  const targets = new Set(config.rules.map((r: { to?: string }) => r.to))
  library.components = (library.components as { name: string }[]).filter((c) => targets.has(c.name))
}

// ---- Code ----------------------------------------------------------------------------------
const clean = (src: string) => src.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n').replace(/\n{3,}/g, '\n\n')

/**
 * Tree-shakes lib/core.js: keeps only the top-level declarations the script reaches (transitively), in their original
 * order. Every top-level statement in core.js is a declaration starting at column 0 (keep it that way). Matching is by
 * identifier text, so a name inside a string can keep an unused helper — never drop a used one. Dogfood: swap went
 * from 40k to ~25k characters, i.e. a third less to paste per call.
 */
function treeShake(core: string, script: string): string {
  const chunks: { names: string[]; text: string }[] = []
  for (const line of core.split('\n')) {
    const head = line.match(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:const|let|var)\s+([A-Za-z_$][\w$]*)/)
    if (head) chunks.push({ names: [head[1] ?? head[2]], text: line })
    else if (chunks.length) chunks[chunks.length - 1].text += '\n' + line
  }
  const ids = (t: string) => new Set(t.match(/[A-Za-z_$][\w$]*/g) ?? [])
  const byName = new Map(chunks.flatMap((c) => c.names.map((n) => [n, c] as const)))
  const keep = new Set<(typeof chunks)[number]>()
  const queue = [...ids(script)]
  while (queue.length) {
    const c = byName.get(queue.pop()!)
    if (!c || keep.has(c)) continue
    keep.add(c)
    queue.push(...ids(c.text))
  }
  return chunks.filter((c) => keep.has(c)).map((c) => c.text).join('\n')
}

const file = join(root, 'scripts/figma', `${name}.js`)
if (!existsSync(file)) { console.error(`Missing ${file}`); process.exit(1) }
/** swap.js: drops the STRATEGIES members no rule uses (members start with `  async name(` inside `const STRATEGIES = {`). */
function pruneStrategies(src: string, used: Set<string>): string {
  if (used.has('icon-swap')) used.add('variant-swap')
  const lines = src.split('\n')
  const start = lines.findIndex((l) => /^const STRATEGIES = \{/.test(l))
  const end = lines.findIndex((l, i) => i > start && /^\}/.test(l))
  if (start < 0 || end < 0) return src
  const out: string[] = []
  let keep = true
  for (let i = start + 1; i < end; i++) {
    const m = lines[i].match(/^ {2}async '?([\w-]+)'?\(/)
    if (m) keep = used.has(m[1])
    if (keep) out.push(lines[i])
  }
  return [...lines.slice(0, start + 1), ...out, ...lines.slice(end)].join('\n')
}
let scriptSrc = clean(read(`scripts/figma/${name}.js`))
if (name === 'swap' && Array.isArray(config.rules) && config.rules.every((r: { strategy?: string }) => r.strategy) && !args.includes('--full'))
  scriptSrc = pruneStrategies(scriptSrc, new Set(config.rules.map((r: { strategy: string }) => r.strategy)))
const coreSrc = spec.core ? clean(read('scripts/figma/lib/core.js')) : ''
const parts = [
  `// L3 ${name} — bundled ${new Date().toISOString().slice(0, 10)} by scripts/figma/bundle.ts (source: scripts/figma/${name}.js)`,
  `const CONFIG = ${JSON.stringify(config)}`,
  `const DATA = ${JSON.stringify(data)}`,
  args.includes('--full') ? coreSrc : treeShake(coreSrc, scriptSrc),
  scriptSrc,
]
// Minify by default (indentation + blank lines): pasting fewer characters is faster for every agent. --pretty keeps them.
const joined = parts.filter(Boolean).join('\n')
const out = args.includes('--pretty') ? joined : joined.split('\n').map((l) => l.trim()).filter(Boolean).join('\n')
if (out.length > 50000) console.error(`⚠ ${out.length} characters — over the 50,000 limit of use_figma. Trim DATA for this script in bundle.ts.`)
const dest = opt('--out')
if (dest) { writeFileSync(dest, out); console.error(`${name}: ${out.length} characters → ${dest}`) } else process.stdout.write(out)
