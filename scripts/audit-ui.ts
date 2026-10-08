// Code audit for L3 — finds what isn't built from the design system yet, and says what to use instead.
//
//   npm run audit:ui -- src/                      # this repo (L3 component internals are skipped)
//   npm run audit:ui -- ../zing-app/src --json     # any product codebase
//   npm run audit:ui -- ../app/src --ci            # exit 1 when there are errors (for CI)
//
// Rules (one pass per file, line-based, fast; heuristics are labelled as such):
//   raw-color     hex / rgb / hsl in styles → nearest L3 token FOR THE ROLE (text → content/*, background → surface/*,
//                 border → border/*), using the exact LM-light values of the generated tokens
//   raw-length    px in padding / margin / gap / inset → spacing token · border-radius → radius · width/height → size
//   raw-font      font-size / weight / line-height / family → one `font: var(--l3-text-<role>-<size>)`
//   raw-shadow    box-shadow without a token → --l3-shadow-elevation-*
//   hover         :hover outside @media (hover: hover) (sticks on touch screens)
//   hand-rolled   <button>, <input>, <select>, role="dialog"/"tab"/"switch"/"progressbar", class names like toast / chip /
//                 skeleton / stepper … → the L3 component that does it (heuristic)
//   sign-colour   a +/− value coloured by hand (green/red/profit/loss classes) → <PriceChange>
//   deprecated    Tag color green / red / yellow / orange → profit / loss / warning / processing
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve as resolvePath } from 'node:path'

const root = join(import.meta.dirname, '..')
const args = process.argv.slice(2)
const json = args.includes('--json'), ci = args.includes('--ci')
const targets = args.filter((a) => !a.startsWith('--')).map((a) => resolvePath(a)) // absolute, so L3 internals are recognised
if (!targets.length) targets.push(join(root, 'src'))

// ---- Token values (LM light) ---------------------------------------------------------------
const read = (p: string) => readFileSync(join(root, p), 'utf8')
const base = new Map([...read('src/tokens/generated/base.css').matchAll(/(--l3-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
const themeCss = read('src/tokens/generated/themes.css')
const light = new Map([...themeCss.slice(themeCss.indexOf('{') + 1, themeCss.indexOf('}')).matchAll(/(--l3-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
const resolve = (v: string, depth = 0): string | undefined => {
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase()
  const ref = v.match(/^var\((--l3-[\w-]+)\)$/)
  if (ref && depth < 6) { const next = light.get(ref[1]) ?? base.get(ref[1]); return next ? resolve(next, depth + 1) : undefined }
  return undefined
}
const colourTokens: { v: string; hex: string; role: string }[] = []
for (const [v, val] of light) {
  const hex = resolve(val); if (!hex) continue
  const role = v.match(/^--l3-(content|surface|border)-/)?.[1] ?? (v.startsWith('--l3-button-') ? 'component' : null)
  if (role) colourTokens.push({ v, hex, role })
}
const px = (v: string | undefined) => (v && /^\d+(\.\d+)?px$/.test(v) ? parseFloat(v) : NaN)
const numberTokens = (prefix: string) => [...base].filter(([k]) => k.startsWith(prefix)).map(([k, v]) => ({ v: k, n: px(v) })).filter((t) => !isNaN(t.n))
const spacing = numberTokens('--l3-spacing-'), radius = numberTokens('--l3-radius-'), size = numberTokens('--l3-size-')
const textSizes = [...read('src/tokens/generated/typography.css').matchAll(/--l3-text-(heading|label|description)-(\d+)-size:\s*([\d.]+)(px|rem)/g)]
  .map((m) => ({ role: m[1], size: Number(m[2]), px: m[4] === 'rem' ? Number(m[3]) * 16 : Number(m[3]) }))

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const toHex = (s: string): string | null => {
  const h = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)
  if (h) { const x = h[1].length === 3 ? h[1].split('').map((c) => c + c).join('') : h[1].slice(0, 6); return '#' + x.toLowerCase() }
  const r = s.match(/rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i)
  if (r) return '#' + [r[1], r[2], r[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')
  return null
}
function nearestColour(hex: string, role: string) {
  const [r, g, b] = rgb(hex)
  let best: { v: string; d: number } | null = null
  for (const t of colourTokens) {
    if (t.role !== role) continue
    const [r2, g2, b2] = rgb(t.hex), d = Math.hypot(r - r2, g - g2, b - b2)
    if (!best || d < best.d) best = { v: t.v, d }
  }
  return best ? `var(${best.v})${best.d === 0 ? ' (exact)' : ` (Δ${Math.round(best.d)} — check the meaning, not just the look)`}` : '—'
}
const nearestNumber = (list: { v: string; n: number }[], n: number) => {
  const b = list.reduce((a, t) => (Math.abs(t.n - n) < Math.abs(a.n - n) ? t : a), list[0])
  return `var(${b.v})${b.n === n ? '' : ` (${b.n}px — snap to the scale)`}`
}
const nearestText = (n: number) => {
  const b = textSizes.reduce((a, t) => (Math.abs(t.px - n) < Math.abs(a.px - n) ? t : a), textSizes[0])
  return `font: var(--l3-text-<heading|label|description>-${b.size}) — pick the role: heading 750 · label 650 · description 500`
}

// ---- Rules -------------------------------------------------------------------------------------
type Finding = { rule: string; level: 'error' | 'warn'; file: string; line: number; found: string; use: string }
const findings: Finding[] = []
const add = (f: Finding) => findings.push(f)
const ROLE_OF: [RegExp, string][] = [[/^(color|fill|stroke|caret-color|text-decoration-color)$/, 'content'], [/^(background|background-color)$/, 'surface'], [/^(border|border-[\w-]*color|border(-top|-right|-bottom|-left)?|outline(-color)?)$/, 'border']]
// Elements and roles that an L3 component already covers.
const HAND_TAGS: [RegExp, string][] = [
  [/<button[\s>]/, 'Button (or ListCell as="button" / Card onClick for a whole row or card)'],
  [/<input[^>]*type=["']checkbox/, 'Checkbox'], [/<input[^>]*type=["']radio/, 'Radio'], [/role=["']switch/, 'Switch'],
  [/<input[\s>]|<textarea[\s>]/, 'TextField'], [/<select[\s>]/, 'Select + BottomSheet (recipe: dropdown)'],
  [/role=["'](tab|tablist)["']/, 'Tabs'], [/role=["']dialog|aria-modal/, 'BottomSheet'], [/role=["']progressbar|<progress[\s>]/, 'ProgressBar'],
]
// Class-name keywords: a WHOLE class token, or one ending in -keyword / _keyword / Keyword ('status-tag', 'orderToast').
// Not a prefix: 'tag-grid' and 'sheet-placeholder' are layout helpers, not components (dogfood false positives).
const HAND_CLASSES: [string[], string][] = [
  [['toast', 'snackbar', 'banner'], 'Aerobar'], [['chip', 'chips', 'pill', 'pills'], 'Tabs (pill) — or Tag if it is not tappable'],
  [['skeleton', 'shimmer', 'spinner', 'loader'], 'Skeleton (content) / Button loading (actions)'], [['stepper', 'qty-stepper', 'quantity-stepper'], 'Stepper'],
  [['datepicker', 'calendar'], 'DatePicker'], [['modal', 'sheet', 'drawer'], 'BottomSheet'], [['badge', 'tag'], 'Tag'],
]
const classTokens = (code: string) => [...code.matchAll(/className=(?:["'`]([^"'`]*)["'`]|\{\s*styles\.(\w+))/g)].flatMap((m) => (m[1] ?? m[2] ?? '').split(/\s+/)).filter(Boolean)
const classHit = (token: string, kw: string) => { const t = token.toLowerCase(); return t === kw || t.endsWith('-' + kw) || t.endsWith('_' + kw) || new RegExp(kw + '$', 'i').test(token) && /[a-z]/.test(token[token.length - kw.length - 1] ?? '') && token[token.length - kw.length] === kw[0].toUpperCase() }
function handRolled(code: string): string | null {
  for (const [re, use] of HAND_TAGS) if (re.test(code)) { if (use === 'Tabs' && /<Tab[\s>]/.test(code)) continue; return use } // role="tablist" around L3 <Tab> is composition
  for (const tok of classTokens(code)) {
    // An empty self-closing element with this class is a drawn shape (a diagram's mini toast), not a lookalike component.
    if (new RegExp(`<\\w+[^>]*className=\\{?\\s*(?:styles\\.)?["'\`]?${tok}\\b[^>]*/>`).test(code)) continue
    for (const [kws, use] of HAND_CLASSES) if (kws.some((kw) => classHit(tok, kw))) return use
  }
  return null
}
const SIGN = /(className=["'`][^"'`]*\b(green|red|profit|loss|positive|negative|gain|up|down)\b[^"'`]*["'`][^>]*>[^<]*[+\-−]?\{|[+\-−]\{[^}]*\}%)/

function auditFile(file: string) {
  const ext = extname(file), rel = relative(process.cwd(), file)
  const src = readFileSync(file, 'utf8')
  const lines = src.split('\n')
  const isStyle = /\.(css|scss|less)$/.test(ext), isTsx = /\.(tsx|jsx)$/.test(ext)
  let hoverDepth = 0, depth = 0
  const hoverStack: number[] = []
  let inComment = false
  lines.forEach((raw, i) => {
    const line = raw
    const n = i + 1
    // block comments (CSS + JS) — skip their contents
    if (inComment) { if (line.includes('*/')) inComment = false; return }
    const code = line.replace(/\/\*.*?\*\//g, '').replace(/\/\/.*$/, ' ')
    if (/\/\*/.test(code) && !code.includes('*/')) inComment = true
    if (isStyle) {
      if (/@media[^{]*hover:\s*hover/.test(code)) hoverStack.push(depth + 1)
      for (const ch of code) { if (ch === '{') depth++; if (ch === '}') { if (hoverStack.length && hoverStack[hoverStack.length - 1] === depth) hoverStack.pop(); depth-- } }
      hoverDepth = hoverStack.length
      if (/:hover\b/.test(code) && !hoverDepth) add({ rule: 'hover', level: 'warn', file: rel, line: n, found: code.trim(), use: 'wrap in @media (hover: hover) { … } — hover sticks on touch screens' })
    }
    // declarations: CSS `prop: value` and JS style objects `prop: 'value'`
    const decls = isStyle ? [...code.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)/g)] : [...code.matchAll(/\b([a-zA-Z]+)\s*:\s*['"`]([^'"`]+)['"`]/g)]
    for (const d of decls) {
      const prop = d[1].replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), value = d[2].trim()
      if (value.includes('var(--l3-') && !/#[0-9a-f]{3,8}\b|rgba?\(/i.test(value.replace(/rgb\(from var\([^)]*\)[^)]*\)/g, ''))) continue
      // colours
      for (const c of value.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi) ?? []) {
        if (/rgb\(from var/.test(value)) continue
        const hex = toHex(c); if (!hex) continue
        const role = ROLE_OF.find(([re]) => re.test(prop))?.[1] ?? (prop.includes('shadow') ? null : 'surface')
        if (!role) continue
        add({ rule: 'raw-color', level: 'error', file: rel, line: n, found: `${prop}: ${c}`, use: nearestColour(hex, role) })
      }
      // lengths
      const pxs = [...value.matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)px\b/g)].map((m) => Number(m[1])).filter((v) => v > 1)
      // @media / @container conditions can't use custom properties — a px breakpoint there is not a raw length
      if (pxs.length && !/^\s*@(media|container)\b/.test(line) && !prop.includes('shadow') && !/^font|line-height|letter-spacing/.test(prop)) {
        const list = /radius/.test(prop) ? radius : /^(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)/.test(prop) ? spacing : /^(width|height|min-|max-)/.test(prop) ? size : null
        if (list && list.length) for (const v of pxs) add({ rule: 'raw-length', level: 'warn', file: rel, line: n, found: `${prop}: ${v}px`, use: nearestNumber(list, v) })
      }
      if (/^(font-size|font-weight|line-height|font-family)$/.test(prop) && !value.includes('var(--l3-')) {
        const sizePx = prop === 'font-size' ? px(value) || (value.endsWith('rem') ? parseFloat(value) * 16 : NaN) : NaN
        add({ rule: 'raw-font', level: 'warn', file: rel, line: n, found: `${prop}: ${value}`, use: isNaN(sizePx) ? 'font: var(--l3-text-<role>-<size>) — one shorthand token' : nearestText(sizePx) })
      }
      // a shadow through a custom property (var(--card-border)) is judged where that property is defined
      if (prop === 'box-shadow' && !/var\(--/.test(value) && value !== 'none') add({ rule: 'raw-shadow', level: 'warn', file: rel, line: n, found: `box-shadow: ${value}`, use: 'var(--l3-shadow-elevation-low | -medium | -high)' })
    }
    if (isTsx) {
      const use = handRolled(code)
      if (use) add({ rule: 'hand-rolled', level: 'error', file: rel, line: n, found: code.trim().slice(0, 90), use })
      if (SIGN.test(code)) add({ rule: 'sign-colour', level: 'error', file: rel, line: n, found: code.trim().slice(0, 90), use: '<PriceChange value={…} /> — sign, colour and arrow come from the value' })
      const dep = code.match(/<Tag[^>]*color=["'](green|red|yellow|orange)["']/)
      if (dep) add({ rule: 'deprecated', level: 'error', file: rel, line: n, found: `Tag color="${dep[1]}"`, use: `color="${({ green: 'profit', red: 'loss', yellow: 'warning', orange: 'processing' } as Record<string, string>)[dep[1]]}"` })
    }
  })
}

// ---- Walk ----------------------------------------------------------------------------------------
// Skip generated files, dependencies, and the internals of L3 components themselves (they ARE the system).
const SKIP_DIR = /(^|\/)(node_modules|dist|build|generated|\.git|coverage)(\/|$)/
// Every folder in this repo's src/components is an L3 component, read from disk so new components are never audited
// as "hand-rolled" lookalikes (dogfood: SectionHeader's own ⓘ button was flagged until it was added to a hand list).
const L3_FOLDERS = readdirSync(join(import.meta.dirname, '..', 'src', 'components'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
const L3_INTERNALS = new RegExp(`src/components/(${L3_FOLDERS.join('|')})/`)
// In other codebases, a folder named like an L3 component (src/l3/components/Button, src/components/Card …) is either a
// vendored copy or a home-made duplicate. One finding per folder beats one per <button> inside it (dogfood: a product
// repo vendored L3 and got 18 line-level false positives).
const L3_NAMES = new Set(L3_INTERNALS.source.match(/\(([^)]+)\)/)![1].split('|'))
const dupFolders = new Set<string>()
let files = 0
function walk(p: string) {
  const st = statSync(p)
  if (st.isDirectory()) { if (SKIP_DIR.test(p)) return; for (const f of readdirSync(p)) walk(join(p, f)); return }
  if (!/\.(css|scss|less|tsx|jsx|ts|js)$/.test(p) || /\.d\.ts$/.test(p) || (p.startsWith(root) && L3_INTERNALS.test(p))) return
  const m = p.match(/^(.*\/components\/([A-Z]\w+))\//)
  if (m && L3_NAMES.has(m[2]) && !p.startsWith(root)) {
    if (!dupFolders.has(m[1])) {
      dupFolders.add(m[1])
      const vendored = /--l3-/.test(readdirSync(m[1]).filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(m[1], f), 'utf8')).join(''))
      add({ rule: 'duplicate', level: vendored ? 'warn' : 'error', file: relative(process.cwd(), m[1]), line: 0, found: `components/${m[2]}`, use: vendored ? `vendored copy of L3 ${m[2]} — keep it identical to the L3 repo (or import the shared package); don't edit locally` : `home-made ${m[2]} — replace with L3 ${m[2]}` })
    }
    return
  }
  files++
  auditFile(p)
}
for (const t of targets) walk(t)

// ---- Report --------------------------------------------------------------------------------------------
const byRule = findings.reduce<Record<string, number>>((a, f) => ((a[f.rule] = (a[f.rule] ?? 0) + 1), a), {})
const errors = findings.filter((f) => f.level === 'error').length
if (json) console.log(JSON.stringify({ files, errors, warnings: findings.length - errors, byRule, findings }, null, 1))
else {
  console.log(`\nL3 audit: ${files} files · ${errors} errors · ${findings.length - errors} warnings`)
  for (const [rule, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) console.log(`  ${rule.padEnd(12)} ${count}`)
  const byFile = new Map<string, Finding[]>()
  for (const f of findings) byFile.set(f.file, [...(byFile.get(f.file) ?? []), f])
  for (const [file, list] of [...byFile].sort((a, b) => b[1].length - a[1].length).slice(0, 15)) {
    console.log(`\n${file} (${list.length})`)
    for (const f of list.slice(0, 8)) console.log(`  ${String(f.line).padStart(4)}  ${f.level === 'error' ? '✖' : '!'} ${f.rule.padEnd(11)} ${f.found}\n        → ${f.use}`)
    if (list.length > 8) console.log(`        … ${list.length - 8} more`)
  }
  console.log(findings.length ? '\nFix errors first; then warnings. Re-run until clean. Unsure which component? npm run find -- "<need>"\n' : '\nClean.\n')
}
if (ci && errors) process.exit(1)
