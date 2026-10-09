// Checks that the components still work outside this repo's Vite setup — the way developers copy them into an app.
//   1. No Vite-only code, no .ts/.tsx extensions in imports, no .svg imports from TS (they mean different things in
//      every bundler — the components use the strings in glyphs.ts instead).
//   2. TypeScript in strict mode with a plain app's setup (tsconfig.portable.json: no Vite types).
//   3. Server rendering (Next.js-style): every component's playground example, a closed and an open BottomSheet, and
//      the ThemeProvider render with react-dom/server.
// Run with `npm run check:portable`. Exits 1 on any problem.

import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const repo = fileURLToPath(new URL('../', import.meta.url))
const problems: string[] = []

// ---- 1. Source rules ----------------------------------------------------------------------------------------------
const dirs = ['src/components', 'src/tokens', 'src/theme', 'src/icons/lemonnade']
const stripComments = (code: string) => code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
const rules: [RegExp, string][] = [
  [/import\.meta\b/, "uses import.meta (Vite-only) — use isDev from src/components/env.ts"],
  [/from\s+'\.{1,2}\/[^']+\.tsx?'/, 'imports a path ending in .ts/.tsx — drop the extension'],
  [/from\s+'[^']+\.svg'/, 'imports an .svg file — add it to scripts/build-glyphs.ts and import the string from glyphs.ts'],
]
let files = 0
for (const dir of dirs) {
  for (const f of readdirSync(repo + dir, { recursive: true, encoding: 'utf8' })) {
    if (!/\.tsx?$/.test(f) || f.endsWith('.d.ts')) continue
    files++
    const code = stripComments(readFileSync(`${repo}${dir}/${f}`, 'utf8'))
    for (const [re, why] of rules) if (re.test(code)) problems.push(`${dir}/${f}: ${why}`)
  }
}
console.log(`1. Source rules: ${files} files checked`)

// ---- 2. Strict TypeScript, plain app setup ---------------------------------------------------------------------------
try {
  execFileSync(process.execPath, [repo + 'node_modules/typescript/bin/tsc', '-p', repo + 'tsconfig.portable.json'], { stdio: 'pipe' })
  console.log('2. TypeScript (strict, no Vite types): no errors')
} catch (e) {
  const out = String((e as { stdout?: Buffer }).stdout ?? e)
  const errors = out.split('\n').filter((l) => l.includes('error TS'))
  problems.push(...errors.map((l) => 'TypeScript: ' + l.trim()))
  console.log(`2. TypeScript (strict, no Vite types): ${errors.length} errors`)
}

// ---- 3. Server rendering ---------------------------------------------------------------------------------------------
const require = createRequire(repo + 'package.json')
const { createServer } = await import(require.resolve('vite'))
const react = (await import(require.resolve('@vitejs/plugin-react'))).default
// Its own cache folder and no dependency pre-bundling, so it never rewrites the dev server's node_modules/.vite
// (a running `npm run dev` would otherwise serve a mix of old and new React files).
const server = await createServer({
  root: repo,
  configFile: false,
  cacheDir: repo + 'node_modules/.vite-check-portable',
  optimizeDeps: { noDiscovery: true, include: [] },
  logLevel: 'silent',
  plugins: [react()],
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
})
const { renderToString } = require('react-dom/server') as typeof import('react-dom/server')
const { createElement: h } = require('react') as typeof import('react')
let rendered = 0
const render = async (name: string, make: () => Promise<import('react').ReactNode>) => {
  try {
    renderToString(await make())
    rendered++
  } catch (e) {
    problems.push(`Server render: ${name}: ${String((e as Error).message).split('\n')[0]}`)
  }
}
try {
  const { playgrounds } = await server.ssrLoadModule('/src/docs/playgrounds.tsx')
  for (const [id, def] of Object.entries(playgrounds as Record<string, { controls: { name: string; default: unknown }[]; render: (v: Record<string, unknown>) => import('react').ReactNode }>)) {
    await render(id, async () => def.render(Object.fromEntries(def.controls.map((c) => [c.name, c.default]))))
  }
  const sheet = await server.ssrLoadModule('/src/components/BottomSheet/index.ts')
  await render('BottomSheet (closed)', async () => h(sheet.BottomSheet, { open: false, onClose() {}, 'aria-label': 'Test' }, 'x'))
  await render('BottomSheet (open)', async () => h(sheet.BottomSheet, { open: true, onClose() {}, 'aria-label': 'Test' }, 'x'))
  const theme = await server.ssrLoadModule('/src/theme/index.ts')
  await render('ThemeProvider', async () => h(theme.ThemeProvider, null, 'x'))
} finally {
  await server.close()
}
console.log(`3. Server rendering: ${rendered} rendered`)

if (problems.length) {
  console.error(`\n✗ ${problems.length} problem${problems.length === 1 ? '' : 's'}:\n` + problems.map((p) => '  - ' + p).join('\n'))
  process.exit(1)
}
console.log('\n✓ Portable: the components work outside this repo (any bundler, strict TypeScript, server rendering).')
