// Builds CSS custom properties + TS types from the DTCG sources in src/tokens/source.
// Run with `npm run tokens` (Node strips the TS types natively).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { themes, defaultProduct, defaultMode, productModes } from '../src/tokens/themes.ts'

const root = fileURLToPath(new URL('../src/tokens/', import.meta.url))
const OPACITY_EXT = 'l3.opacity'

type TypographyValue = { fontFamily: string; fontWeight: string; fontSize: string; lineHeight: string; letterSpacing: string }
type ShadowValue = { color: string; offsetX: string; offsetY: string; blur: string; spread: string }
type Leaf = { $type: string; $value: string | number | TypographyValue | ShadowValue; $description?: string; $extensions?: Record<string, string> }
type Tree = { [key: string]: Tree | Leaf }

const readJson = (path: string): Tree => JSON.parse(readFileSync(root + path, 'utf8'))
const isLeaf = (node: Tree | Leaf): node is Leaf => '$value' in node

// JS objects list integer-like keys ("10") before others ("00", "full"), so restore scale order:
// numeric keys ascending, then named keys in source order.
const isNumeric = (key: string) => /^\d+$/.test(key)
const byScale = ([a]: [string, unknown], [b]: [string, unknown]) =>
  isNumeric(a) && isNumeric(b) ? Number(a) - Number(b) : Number(isNumeric(b)) - Number(isNumeric(a))

function flatten(tree: Tree, prefix: string[] = [], out = new Map<string, Leaf>()) {
  for (const [key, node] of Object.entries(tree).sort(byScale)) {
    if (key.startsWith('$')) continue // group metadata ($description etc.)
    if (isLeaf(node)) out.set([...prefix, key].join('.'), node)
    else flatten(node, [...prefix, key], out)
  }
  return out
}

const refPath = (value: string) => {
  const match = /^\{(.+)\}$/.exec(value)
  if (!match) throw new Error(`Expected a {reference}, got ${value}`)
  return match[1]
}

// `component.button.buy.surface` → `--l3-button-buy-surface`; base/opacity keep their group prefix.
const varName = (path: string) =>
  '--l3-' + path.replace(/^component\./, '').replaceAll('.', '-')

const base = flatten(readJson('source/base.colors.json'))
const opacity = flatten(readJson('source/base.opacity.json'))
// Figma "🌌 Number" (spacing / radius / size) + "ℹ️ L3 → Icon size" (one variable, a mode per size).
const numbers = new Map([
  ...flatten(readJson('source/base.number.json')),
  ...flatten(readJson('source/base.icon-size.json')),
  ...flatten(readJson('source/local.size.json')), // not in Figma (e.g. size/tap-target)
])

// ---- base.css -------------------------------------------------------------
const baseLines = [base, opacity, numbers].flatMap((group) =>
  [...group].map(([path, leaf]) => `  ${varName(path)}: ${leaf.$value};`))

// ---- themes.css -----------------------------------------------------------
const themeTokens = themes.map((theme) => ({ theme, tokens: flatten(readJson(`source/themes/${theme.id}.json`)) }))
const tokenPaths = [...themeTokens[0].tokens.keys()]

function cssValue(leaf: Leaf, tokens: Map<string, Leaf>, themeId: string, path: string): string {
  const target = refPath(String(leaf.$value))
  if (!base.has(target) && !tokens.has(target)) throw new Error(`${themeId}: ${path} → unknown ${target}`)
  const color = `var(${varName(target)})`
  const opacityRef = leaf.$extensions?.[OPACITY_EXT]
  if (!opacityRef) return color
  const step = opacity.get(refPath(opacityRef))
  if (!step) throw new Error(`${themeId}: ${path} → unknown ${opacityRef}`)
  return `color-mix(in srgb, ${color} ${Math.round(Number(step.$value) * 100)}%, transparent)`
}

function selectorFor(theme: (typeof themes)[number]) {
  // Single-mode products match on product alone, so any requested mode resolves.
  let sel = productModes[theme.product].length === 1
    ? `[data-product="${theme.product}"]`
    : `[data-product="${theme.product}"][data-mode="${theme.mode}"]`
  // ♿ Accessible themes add [data-contrast="accessible"]: more specific, so they win over the standard block.
  const accessible = 'contrast' in theme && theme.contrast === 'accessible'
  if (accessible) sel += '[data-contrast="accessible"]'
  return !accessible && theme.product === defaultProduct && theme.mode === defaultMode ? `:root,\n${sel}` : sel
}

const themeBlocks = themeTokens.map(({ theme, tokens }) => {
  const missing = tokenPaths.filter((p) => !tokens.has(p))
  const extra = [...tokens.keys()].filter((p) => !tokenPaths.includes(p))
  if (missing.length || extra.length) throw new Error(`${theme.id}: token set differs (${[...missing, ...extra].join(', ')})`)
  const lines = tokenPaths.map((p) => `  ${varName(p)}: ${cssValue(tokens.get(p)!, tokens, theme.id, p)};`)
  return `/* ${theme.figmaMode} */\n${selectorFor(theme)} {\n  color-scheme: ${theme.mode};\n${lines.join('\n')}\n}`
})

// ---- typography.css -------------------------------------------------------
// local.typography.json: values Figma uses without a text style (e.g. the 8/10 chip tab sub label).
const localTypography = flatten(readJson('source/local.typography.json'))
const isTextStyle = (path: string) => path.startsWith('text.')
const fontTokens = new Map([
  ...flatten(readJson('source/base.typography.json')),
  ...[...localTypography].filter(([path]) => !isTextStyle(path)),
])
const textStyles = new Map([
  ...flatten(readJson('source/text-styles.json')),
  ...[...localTypography].filter(([path]) => isTextStyle(path)),
])

const fontRef = (value: string) => {
  const target = refPath(value)
  if (!fontTokens.has(target)) throw new Error(`typography: unknown ${target}`)
  return `var(${varName(target)})`
}

const fontLines = [...fontTokens].map(([path, leaf]) =>
  `  ${varName(path)}: ${leaf.$type === 'fontFamily' ? `'${leaf.$value}', sans-serif` : leaf.$value};`)

const styleLines = [...textStyles].flatMap(([path, leaf]) => {
  const v = leaf.$value as TypographyValue
  const name = varName(path)
  const [family, weight, size] = [fontRef(v.fontFamily), fontRef(v.fontWeight), fontRef(v.fontSize)]
  return [
    `  /* ${leaf.$extensions?.['l3.figmaStyle']} */`,
    `  ${name}-weight: ${weight};`,
    `  ${name}-size: ${size};`,
    `  ${name}-line-height: ${v.lineHeight};`,
    `  ${name}-letter-spacing: ${v.letterSpacing};`,
    `  ${name}: ${weight} ${size}/${v.lineHeight} ${family};`,
  ]
})

// Figma role names (Display · Heading · Label · Paragraph) as aliases of the weight-named styles above.
// A style lists its roles in $extensions["l3.roles"], e.g. ["display/14", "heading/section"].
const rolesOf = (leaf: { $extensions?: Record<string, unknown> }) => (leaf.$extensions?.['l3.roles'] as string[] | undefined) ?? []
const textRoles = [...textStyles].flatMap(([path, leaf]) =>
  rolesOf(leaf).map((role) => ({ role, cssVar: `--l3-text-${role.replace('/', '-')}`, alias: varName(path) })))
const roleLines = textRoles.map(({ cssVar, alias }) => `  ${cssVar}: var(${alias});`)

// ---- effects.css ----------------------------------------------------------
const shadows = flatten(readJson('source/effect-styles.json'))
const shadowLines = [...shadows].flatMap(([path, leaf]) => {
  const v = leaf.$value as ShadowValue
  return [`  /* ${leaf.$extensions?.['l3.figmaStyle']} */`, `  ${varName(path)}: ${v.offsetX} ${v.offsetY} ${v.blur} ${v.spread} ${v.color};`]
})

// ---- motion (local, not from Figma) → effects.css ------------------------
const motion = flatten(readJson('source/local.motion.json'))
const motionLines = [...motion].map(([path, leaf]) => {
  const v = leaf.$value
  return `  ${varName(path)}: ${Array.isArray(v) ? `cubic-bezier(${v.join(', ')})` : v};`
})

// ---- tokens.ts ------------------------------------------------------------
const figmaName = (path: string) => path.replaceAll('.', '/')

const header = '/* Generated by scripts/build-tokens.ts from src/tokens/source — do not edit. */\n'
mkdirSync(root + 'generated', { recursive: true })
writeFileSync(root + 'generated/base.css', `${header}:root {\n${baseLines.join('\n')}\n}\n`)
writeFileSync(root + 'generated/themes.css', `${header}${themeBlocks.join('\n\n')}\n`)
writeFileSync(
  root + 'generated/tokens.ts',
  `${header}
/** Theme token (Figma name without the "🔷 L3/color/" prefix) → CSS custom property. */
export const themeTokenVars = {
${tokenPaths.map((p) => `  '${figmaName(p)}': '${varName(p)}',`).join('\n')}
} as const

/** Base color (Figma name without the "L3-color-base/" prefix) → CSS custom property. */
export const baseColorVars = {
${[...base.keys()].map((p) => `  '${figmaName(p.replace(/^base\./, ''))}': '${varName(p)}',`).join('\n')}
} as const

/** Spacing / radius / size / icon-size variable (Figma name) → CSS custom property. */
export const numberVars = {
${[...numbers.keys()].map((p) => `  '${figmaName(p)}': '${varName(p)}',`).join('\n')}
} as const

/** Figma text style → CSS custom property (use as \`font: var(--l3-text-bold-16)\`). */
export const textStyles = [
${[...textStyles].map(([path, leaf]) => {
  const v = leaf.$value as TypographyValue
  const [, weight, size] = path.split('.')
  const legacy = leaf.$extensions?.['l3.legacy'] ? `, legacy: ${JSON.stringify(leaf.$extensions['l3.legacy'])}` : ''
  return `  { figmaName: '${leaf.$extensions?.['l3.figmaStyle']}', cssVar: '${varName(path)}', weight: '${weight}', fontSize: ${Number(size)}, lineHeight: ${parseFloat(v.lineHeight)}, roles: ${JSON.stringify(rolesOf(leaf))}${legacy} },`
}).join('\n')}
] as const

/** Figma role name → CSS custom property (an alias of a weight-named style). Use as \`font: var(--l3-text-label-12)\`. */
export const textRoles = [
${textRoles.map(({ role, cssVar, alias }) => `  { role: '${role}', cssVar: '${cssVar}', alias: '${alias}' },`).join('\n')}
] as const

export type ThemeToken = keyof typeof themeTokenVars
export type BaseColor = keyof typeof baseColorVars
export type NumberToken = keyof typeof numberVars
export type TextStyle = (typeof textStyles)[number]['cssVar']
export type TextRole = (typeof textRoles)[number]['cssVar']
`,
)
writeFileSync(root + 'generated/typography.css', `${header}:root {\n${fontLines.join('\n')}\n\n${styleLines.join('\n')}\n\n  /* Figma roles — aliases of the styles above */\n${roleLines.join('\n')}\n}\n`)
writeFileSync(
  root + 'generated/effects.css',
  `${header}:root {\n${shadowLines.join('\n')}\n\n  /* Motion — local tokens, not in Figma yet (source/local.motion.json) */\n${motionLines.join('\n')}\n}\n`,
)

console.log(`tokens: ${base.size} base colors, ${opacity.size} opacity steps, ${numbers.size} number tokens, ${tokenPaths.length} theme tokens × ${themes.length} themes, ${fontTokens.size} font tokens, ${textStyles.size} text styles (${textRoles.length} role aliases), ${shadows.size} shadows, ${motion.size} motion (local)`)
