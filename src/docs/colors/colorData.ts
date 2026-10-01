// Data for the Colors foundation page: token groups, usage notes and the alias (base colour + opacity)
// each theme token resolves to, read from the DTCG sources in src/tokens/source.
import { baseColorVars, themeTokenVars, type ThemeToken } from '../../tokens'

type Leaf = { $value: string; $description?: string; $extensions?: Record<string, string> }
type Tree = { [key: string]: Tree | Leaf }

const sources = import.meta.glob<Tree>('../../tokens/source/themes/*.json', { eager: true, import: 'default' })
const opacitySource = import.meta.glob<Tree>('../../tokens/source/base.opacity.json', { eager: true, import: 'default' })

const flatten = (tree: Tree, prefix: string[] = [], out = new Map<string, Leaf>()) => {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith('$')) continue
    if ('$value' in node) out.set([...prefix, key].join('/'), node as Leaf)
    else flatten(node as Tree, [...prefix, key], out)
  }
  return out
}

const themeLeaves = Object.fromEntries(
  Object.entries(sources).map(([path, tree]) => [path.split('/').pop()!.replace('.json', ''), flatten(tree)]),
)
const opacitySteps = flatten(Object.values(opacitySource)[0])

/** Theme id as used by the source files: lm-light, acc-kuber-dark, … */
export const themeId = (product: string, mode: string, contrast: string) =>
  `${contrast === 'accessible' ? 'acc-' : ''}${product}-${mode}`

/** What a token points at in a theme, e.g. "charcoal/900 · 60%" or "surface/inverted · 5%". */
export function aliasOf(token: string, theme: string): string {
  const leaf = themeLeaves[theme]?.get(token.replace(/^component\//, 'component/'))
  if (!leaf) return ''
  const target = leaf.$value.replace(/^\{|\}$/g, '').replace(/^base\.(neutral|hue)\./, '').replace(/^brand\./, 'brand/').replaceAll('.', '/')
  const op = leaf.$extensions?.['l3.opacity']
  const pct = op ? Math.round(Number((opacitySteps.get(op.replace(/^\{|\}$/g, '').replaceAll('.', '/')) as Leaf | undefined)?.$value ?? 0) * 100) : null
  return pct === null ? target : `${target} · ${pct}%`
}

export const cssVar = (token: ThemeToken) => themeTokenVars[token]
export const allTokens = Object.keys(themeTokenVars) as ThemeToken[]

// ---- Semantic roles ---------------------------------------------------------------------------

export type Role = { token: ThemeToken; use: string }

export const surfaces: Role[] = [
  { token: 'surface/default', use: 'Screen background — the page everything sits on.' },
  { token: 'surface/primary', use: 'Raised surfaces: clickable cards, sheets, bars, chips. Same as default in light mode — add border/light.' },
  { token: 'surface/secondary', use: 'Subtle fills inside a surface: inner panels, input wells, neutral soft tags.' },
  { token: 'surface/tertiary', use: 'Stronger subtle fill: selected or pressed neutral areas.' },
  { token: 'surface/quaternary', use: 'Strongest neutral fill, e.g. an off switch track.' },
  { token: 'surface/inverted', use: 'High-emphasis fill: primary button, solid neutral tag, selected chip.' },
  { token: 'surface/disabled', use: 'Fill of disabled controls.' },
  { token: 'surface/overlay', use: 'Backdrop behind bottom sheets and dialogs.' },
]

export const contents: Role[] = [
  { token: 'content/primary', use: 'Body text, headings and icons.' },
  { token: 'content/secondary', use: 'Supporting text: descriptions, labels, meta.' },
  { token: 'content/tertiary', use: 'Placeholders, hints, least important meta.' },
  { token: 'content/inverted', use: 'Text and icons on inverted surfaces.' },
  { token: 'content/inverted-secondary', use: 'Supporting text on inverted surfaces.' },
  { token: 'content/disabled', use: 'Disabled text and icons.' },
]

export const borders: Role[] = [
  { token: 'border/light', use: 'Default hairline: card outlines, dividers, bar edges.' },
  { token: 'border/intense', use: 'Stronger outline: inputs, tertiary button, neutral secondary tag.' },
  { token: 'border/dark', use: 'Highest-emphasis outline: secondary button, focus ring, selected outline.' },
  { token: 'border/disabled', use: 'Outline of disabled controls.' },
]

export const statics: Role[] = [
  { token: 'static/white', use: 'Always white, in every theme — e.g. text on profit / loss / sell fills.' },
  { token: 'static/black', use: 'Always black — e.g. text on the warning fill.' },
]

// ---- Accent families ----------------------------------------------------------------------------

export type AccentGroupId = 'brand' | 'market' | 'status' | 'subbrand' | 'misc'
export type Accent = { id: string; label: string; use: string; path: string; group: AccentGroupId }

/** Accent families grouped by meaning. Pick the group first, then the colour. */
export const accentGroups: { id: AccentGroupId; label: string; use: string }[] = [
  { id: 'brand', label: 'Brand', use: 'The product colour — changes with the brand (Lemonn lime, CS PRO gold, Kuber green).' },
  { id: 'market', label: 'Market indicators', use: 'Price direction only: up / down, P&L, buy / sell side. Never for success or error.' },
  { id: 'status', label: 'Status', use: 'Outcomes and system states: done, needs attention, failed, info, in progress.' },
  { id: 'subbrand', label: 'Sub-brands', use: 'Products and segments with their own identity (US stocks, Zing). Use only inside that product or segment.' },
  { id: 'misc', label: 'Miscellaneous', use: 'Exceptional cases only — e.g. telling categories apart when no other group fits. Not for meaning.' },
]

/** `path` is the token segment after surface/accent/, content/accent/, border/accent/. */
export const accents: Accent[] = [
  { id: 'brand', group: 'brand', label: 'Brand', path: 'brand', use: 'Brand moments, brand button, onboarding and promotions.' },
  { id: 'up', group: 'market', label: 'Profit (indicator up)', path: 'indicator/up', use: 'Price up, positive P&L, buy side. Tag colour “profit”.' },
  { id: 'down', group: 'market', label: 'Loss (indicator down)', path: 'indicator/down', use: 'Price down, negative P&L, sell side. Tag colour “loss”.' },
  { id: 'success', group: 'status', label: 'Success', path: 'success', use: 'Done: order placed, verified, saved.' },
  { id: 'warning', group: 'status', label: 'Warning', path: 'warning', use: 'Needs attention, not blocking. Solid fill takes static/black text.' },
  { id: 'error', group: 'status', label: 'Error', path: 'error', use: 'Failed or blocking: rejected, invalid.' },
  { id: 'discover', group: 'status', label: 'Discover (info)', path: 'discover', use: 'Information, tips, links and inline text actions.' },
  { id: 'orange', group: 'status', label: 'Orange (processing)', path: 'orange', use: 'In progress: open, pending. Tag colour “processing”.' },
  { id: 'us-stock', group: 'subbrand', label: 'US stocks', path: 'us-stock', use: 'US stocks segment. Still mostly identical to discover (known gap).' },
  { id: 'zing', group: 'subbrand', label: 'Zing', path: 'zing', use: 'The Zing product.' },
  { id: 'purple', group: 'misc', label: 'Purple', path: 'purple', use: 'Exceptional categorical use only.' },
  { id: 'indigo', group: 'misc', label: 'Indigo', path: 'indigo', use: 'Exceptional categorical use only.' },
  { id: 'teal', group: 'misc', label: 'Teal', path: 'teal', use: 'Exceptional categorical use only.' },
]

export const accentSlots = [
  { id: 'surface-light', label: 'Surface light', make: (p: string) => `surface/accent/${p}-light` },
  { id: 'surface-default', label: 'Surface default', make: (p: string) => `surface/accent/${p}-default` },
  { id: 'content', label: 'Content', make: (p: string) => `content/accent/${p}-default` },
  { id: 'border-light', label: 'Border light', make: (p: string) => `border/accent/${p}-light` },
  { id: 'border-default', label: 'Border default', make: (p: string) => `border/accent/${p}-default` },
] as const

export const isToken = (name: string): name is ThemeToken => name in themeTokenVars

// ---- Component tokens ---------------------------------------------------------------------------

export const buttonVariants = ['primary', 'secondary', 'tertiary', 'ghost', 'brand', 'buy', 'sell'] as const
export const buttonParts = ['surface', 'content', 'border'] as const
export const buttonStates = [
  { id: '', label: 'Default' },
  { id: '-loading', label: 'Loading' },
  { id: '-disabled', label: 'Disabled' },
] as const

export const stateLayers = (['light', 'dark'] as const).flatMap((tone) =>
  (['default', 'hover', 'pressed'] as const).map((state) => `component/state-layer/${tone}/${state}` as ThemeToken),
)

// ---- Base palette -------------------------------------------------------------------------------

const baseNames = Object.keys(baseColorVars)
export const ramps = [...new Set(baseNames.map((n) => n.split('/').slice(0, -1).join('/')))].map((ramp) => ({
  ramp,
  steps: baseNames.filter((n) => n.startsWith(ramp + '/') && n.split('/').length === ramp.split('/').length + 1),
}))
export const baseVar = (name: string) => (baseColorVars as Record<string, string>)[name]

export const opacityScale = [...opacitySteps].map(([path, leaf]) => ({
  step: path.split('/').pop()!,
  value: Number(leaf.$value),
  cssVar: `--l3-opacity-${path.split('/').pop()}`,
}))
