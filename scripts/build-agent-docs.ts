// Generates plain-text docs for AI agents from the same data the docs site renders:
//   public/llms.txt              — index (llmstxt.org format)
//   public/llms-full.txt         — everything in one file (paste into Claude Design, ChatGPT…)
//   public/agent-docs/<id>.md    — one file per docs page, plus rules / tokens / typography / spacing
// The docs site is a JS-rendered SPA, so agents that fetch it see nothing; these files are what they read.
// Run: npm run agent-docs (also runs before build).
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isValidElement, type ReactNode } from 'react'
import { createServer } from 'vite'

const root = join(import.meta.dirname, '..')
const outDir = join(root, 'public')
const pageDir = join(outDir, 'agent-docs')
const SITE = 'https://kirtanyak-pe.github.io/lemonnade-v3-docs/'

type PropRow = { name: string; type: string; default?: string; description: string }
type TreeLeaf = { label: string; note?: string }
type TreeSpec = { title: string; note?: string; branches: { label: string; note?: string; groups?: { label: string; note?: string; leaves: TreeLeaf[] }[]; leaves?: TreeLeaf[] }[] }
type Page = {
  id: string; title: string; group: string; description: string; status?: string; progress?: string; altNames?: string
  overview?: ReactNode; content?: ReactNode; props?: PropRow[]; figmaNodeId?: string; source?: string; exports?: string[]; tokens?: string[]
}

// Load the docs modules through Vite so CSS modules, SVG and asset imports resolve as in the app.
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true } })
const load = (path: string) => vite.ssrLoadModule(path)
const { pages, navGroups, figmaUrl, progressOf } = await load('/src/docs/pages.tsx')
const { guidelines } = await load('/src/docs/guidelineData.tsx')
const { changelog } = await load('/src/docs/changelog.ts')
const { componentTrees } = await load('/src/docs/trees/componentTrees.tsx')
const { textStyles, textRoles, numberVars, themeTokenVars, themes } = await load('/src/tokens/index.ts')
await vite.close()

// ---- React element tree → Markdown ------------------------------------------------------------
// Host elements become Markdown; function components (demos, phone frames) are skipped except for
// their text children, so explanatory prose survives and interactive previews don't.
const BLOCK = new Set(['p', 'div', 'section', 'header', 'footer', 'article', 'aside', 'figure', 'figcaption'])
function text(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(text).join('')
  if (!isValidElement(node)) return ''
  const { type } = node
  const props = node.props as { children?: ReactNode; href?: string }
  const kids = () => text(props.children)
  // Fragments (symbols) keep everything; components keep only what was passed to them as children.
  if (typeof type !== 'string') return typeof type === 'symbol' ? kids() : childrenOnly(props.children)
  switch (type) {
    case 'h1': return `\n# ${kids().trim()}\n\n`
    case 'h2': return `\n## ${kids().trim()}\n\n`
    case 'h3': return `\n### ${kids().trim()}\n\n`
    case 'h4': return `\n#### ${kids().trim()}\n\n`
    case 'strong': case 'b': return `**${kids()}**`
    case 'em': case 'i': return `*${kids()}*`
    case 'code': return `\`${kids()}\``
    case 'pre': return `\n\`\`\`\n${kids()}\n\`\`\`\n\n`
    case 'a': return props.href && !props.href.startsWith('#') ? `[${kids()}](${props.href})` : kids()
    case 'br': return '\n'
    case 'ul': case 'ol': return `\n${kids()}\n`
    case 'li': return `- ${kids().trim()}\n`
    case 'svg': case 'img': case 'button': case 'input': return ''
    default: return BLOCK.has(type) ? `\n${kids().trim()}\n\n` : kids()
  }
}
// Fragments keep everything; other components (demos) keep only plain text/markup passed as children.
function childrenOnly(children: ReactNode): string {
  if (children == null) return ''
  if (Array.isArray(children)) return children.map(childrenOnly).join('')
  if (isValidElement(children) && typeof children.type !== 'string') return childrenOnly((children.props as { children?: ReactNode }).children)
  return text(children)
}
const tidy = (md: string) => md.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')

// ---- Token values per theme (from the generated CSS) -----------------------------------------
const baseCss = readFileSync(join(root, 'src/tokens/generated/base.css'), 'utf8')
const themesCss = readFileSync(join(root, 'src/tokens/generated/themes.css'), 'utf8')
const baseVals = new Map([...baseCss.matchAll(/(--l3-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
const themeBlocks = new Map<string, Map<string, string>>()
for (const block of themesCss.split(/\/\* /).slice(1)) {
  const name = block.slice(0, block.indexOf(' */'))
  themeBlocks.set(name, new Map([...block.matchAll(/(--l3-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])))
}
function resolve(value: string, scope: Map<string, string>, depth = 0): string {
  const m = value.match(/^var\((--l3-[\w-]+)\)$/)
  if (!m || depth > 8) return value
  const next = scope.get(m[1]) ?? baseVals.get(m[1])
  return next ? resolve(next, scope, depth + 1) : value
}

// ---- Pages -------------------------------------------------------------------------------------
const files: { id: string; title: string; summary: string; body: string; section: string }[] = []
const add = (id: string, title: string, summary: string, body: string, section: string) => files.push({ id, title, summary, body: tidy(body), section })

const readIf = (p: string) => (existsSync(p) ? readFileSync(p, 'utf8') : '')

// Rules first: the agent contract and the full rulebook.
add('agents', 'Instructions for AI agents', 'Read first. Workflow, non-negotiable rules and how to verify a screen.', readIf(join(root, 'AGENTS.md')), 'Rules')
add('design-system', 'Design system rules', 'Spacing, layout, tokens, typography, components, states, accessibility, theming, Do/Don\'t.', readIf(join(root, 'DESIGN_SYSTEM.md')), 'Rules')

for (const p of pages as Page[]) {
  if (p.id === 'home') continue
  const lines: string[] = [`# ${p.title}`, '', `> ${p.description}`, '']
  const meta = [
    `Group: ${p.group}`,
    progressOf(p) && `Lifecycle: ${progressOf(p)}`,
    p.status && `Status: ${p.status}`,
    changelog[p.id]?.[0] && `Version: ${changelog[p.id].find((r: { version: string }) => r.version !== 'unreleased')?.version ?? 'unreleased'}`,
    p.figmaNodeId && `Figma: ${figmaUrl(p.figmaNodeId)}`,
    p.source && `Source: \`${p.source}\``,
    p.altNames && `Also called: ${p.altNames}`,
  ].filter(Boolean)
  lines.push(...meta.map((m) => `- ${m}`), '')
  if (p.exports?.length) lines.push('## Import', '', '```tsx', `import { ${p.exports.join(', ')} } from './${(p.source ?? '').replace(/^src\//, '')}' // path relative to src/`, '```', '')

  // Component usage rules (USAGE.md) are the most specific guidance — put them first.
  const usage = p.source ? readIf(join(root, p.source, 'USAGE.md')) : ''
  if (usage) lines.push('## Usage rules (USAGE.md)', '', usage.replace(/^# .*\n/, '').replace(/^## /gm, '### '), '')

  // Page sections are h2 on the site; nest them under "Overview" here.
  const prose = tidy(text(p.overview ?? p.content)).replace(/^(#{2,3}) /gm, '#$1 ')
  if (prose) lines.push('## Overview', '', prose, '')

  const g = guidelines[p.id] as { title: string; do: { text: string }; dont: { text: string } }[] | undefined
  if (g?.length) {
    lines.push('## Do / Don\'t', '')
    for (const item of g) lines.push(`### ${item.title}`, '', `- ✅ **Do:** ${item.do.text}`, `- ❌ **Don't:** ${item.dont.text}`, '')
  }

  const tree = componentTrees[p.id] as TreeSpec | undefined
  if (tree) {
    lines.push('## Options (tree)', '', `${tree.title}${tree.note ? ` — ${tree.note}` : ''}`, '')
    for (const b of tree.branches) {
      lines.push(`- **${b.label}**${b.note ? ` — ${b.note}` : ''}`)
      for (const grp of b.groups ?? []) {
        lines.push(`  - *${grp.label}*${grp.note ? ` — ${grp.note}` : ''}`)
        for (const l of grp.leaves) lines.push(`    - \`${l.label}\`${l.note ? ` — ${l.note}` : ''}`)
      }
      for (const l of b.leaves ?? []) lines.push(`  - \`${l.label}\`${l.note ? ` — ${l.note}` : ''}`)
    }
    lines.push('')
  }

  if (p.props?.length) {
    lines.push('## Props', '', '| Prop | Type | Default | Description |', '|---|---|---|---|')
    for (const r of p.props) lines.push(`| \`${cell(r.name)}\` | \`${cell(r.type)}\` | ${r.default ? `\`${cell(r.default)}\`` : ''} | ${cell(r.description)} |`)
    lines.push('')
  }
  if (p.tokens?.length) lines.push('## Tokens used', '', ...p.tokens.map((t) => `- \`${t}\``), '')

  const releases = (changelog[p.id] ?? []).slice(0, 3) as { version: string; date: string; summary: string; changes: { kind: string; text: string }[] }[]
  if (releases.length) {
    lines.push('## Recent changes', '')
    for (const r of releases) lines.push(`- **${r.version}** (${r.date}) ${r.summary}: ${r.changes.map((c) => c.text).join(' ')}`)
    lines.push('')
  }
  add(p.id, p.title, p.description, lines.join('\n'), p.group === 'Foundations' ? 'Foundations' : `Components · ${p.group}`)
}

// ---- Foundations as data tables ---------------------------------------------------------------
{
  const cols = (themes as { id: string; figmaMode: string }[]).filter((t) => !t.id.startsWith('acc-'))
  const lines = ['# Color tokens', '', '> Every semantic color token with its value in each theme. Use the CSS variable; never the hex.', '',
    'Themes are chosen with `data-product` (lm · cspro · kuber), `data-mode` (light · dark) and optional `data-contrast="accessible"` on `<html>` or any wrapper. CS PRO is dark only.', '',
    `| Token (Figma: 🔷 L3/color/…) | CSS variable | ${cols.map((c) => c.figmaMode).join(' | ')} |`, `|---|---|${cols.map(() => '---').join('|')}|`]
  for (const [name, cssVar] of Object.entries(themeTokenVars as Record<string, string>)) {
    lines.push(`| \`${name}\` | \`${cssVar}\` | ${cols.map((c) => { const scope = themeBlocks.get(c.figmaMode) ?? new Map(); const v = scope.get(cssVar); return v ? `\`${resolve(v, scope)}\`` : '—' }).join(' | ')} |`)
  }
  add('color-tokens', 'Color tokens', 'All semantic color tokens with values per theme.', lines.join('\n'), 'Foundations')
}
{
  const lines = ['# Typography tokens', '', '> Manrope. Use one font shorthand token: `font: var(--l3-text-…)`. Prefer the role names.', '',
    '## Roles (use these)', '', '| Role | CSS variable | Same as |', '|---|---|---|']
  for (const r of textRoles as { role: string; cssVar: string; alias: string }[]) lines.push(`| ${r.role} | \`${r.cssVar}\` | \`${r.alias}\` |`)
  lines.push('', '## Styles by weight', '', '| CSS variable | Size / line height | Figma style | Note |', '|---|---|---|---|')
  for (const s of textStyles as { cssVar: string; fontSize: number; lineHeight: number; figmaName: string; legacy?: string }[]) lines.push(`| \`${s.cssVar}\` | ${s.fontSize}/${s.lineHeight} | ${s.figmaName} | ${s.legacy ? `Legacy — ${cell(s.legacy)}` : ''} |`)
  add('typography-tokens', 'Typography tokens', 'Text roles (Display, Heading, Label, Paragraph, Description) and every text style.', lines.join('\n'), 'Foundations')
}
{
  const lines = ['# Spacing, radius & size tokens', '', '> Never use raw px (1px hairlines are the one exception).', '', '| Figma variable | CSS variable | Value |', '|---|---|---|']
  for (const [name, cssVar] of Object.entries(numberVars as Record<string, string>)) lines.push(`| \`${name}\` | \`${cssVar}\` | ${baseVals.get(cssVar) ?? ''} |`)
  add('spacing-tokens', 'Spacing, radius & size tokens', 'Spacing, radius, size and icon-size values.', lines.join('\n'), 'Foundations')
}

// ---- Write -------------------------------------------------------------------------------------
rmSync(pageDir, { recursive: true, force: true })
mkdirSync(pageDir, { recursive: true })
for (const f of files) writeFileSync(join(pageDir, `${f.id}.md`), `${f.body}\n`)

const sections = [...new Set(files.map((f) => f.section))]
const order = ['Rules', 'Foundations', ...sections.filter((s) => s !== 'Rules' && s !== 'Foundations')]
const index = [
  '# Lemonnade V3 (L3) design system',
  '',
  '> React + TypeScript components and design tokens for Lemonn, CS Pro and Kuber — mobile-first trading apps. Build UI only from these components and `--l3-*` tokens; read the rules first.',
  '',
  `Human docs: ${SITE} · Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/ · Everything in one file: llms-full.txt`,
  '',
  ...order.flatMap((s) => [`## ${s}`, '', ...files.filter((f) => f.section === s).map((f) => `- [${f.title}](agent-docs/${f.id}.md): ${f.summary}`), '']),
].join('\n')
writeFileSync(join(outDir, 'llms.txt'), `${index}\n`)
writeFileSync(join(outDir, 'llms-full.txt'), `${index}\n\n${order.flatMap((s) => files.filter((f) => f.section === s)).map((f) => f.body).join('\n\n---\n\n')}\n`)

const groups = (navGroups as { group: string }[]).length
console.log(`agent docs: ${files.length} files (${groups} nav groups) → public/llms.txt, public/llms-full.txt, public/agent-docs/`)
