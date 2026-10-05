// The vocabulary of a Build design: every value a node can take. Pure data with no imports, so the browser, the dev
// server and (later) the Supabase function all share one definition.

/**
 * Every component in DESIGN_SYSTEM.md §5 that a screen can hold. `section`, `card` and `dock` contain other items;
 * the rest are leaves. (BottomSheet is an overlay, not part of a screen's layout, so it is not here yet.)
 */
export const kinds = [
  'section', 'card', 'dock',
  'actionbar', 'tabs', 'heading', 'text', 'button', 'tag', 'listcell', 'textfield', 'switch', 'checkbox', 'radio',
  'aerobar', 'emptystate', 'bottomnav', 'brandlogo', 'icon',
] as const
export type NodeKind = (typeof kinds)[number]

export const variants = ['primary', 'secondary', 'tertiary', 'ghost', 'brand', 'buy', 'sell'] as const
export type ButtonVariant = (typeof variants)[number]

export const buttonSizes = ['sm', 'md', 'lg'] as const
export type ButtonSize = (typeof buttonSizes)[number]

/** Steps of the 4px spacing scale (DESIGN_SYSTEM.md §1), as token suffixes: --l3-spacing-<step>. */
export const steps = ['00', '04', '08', '12', '16', '24', '32', '40', '48', '64'] as const
export type Step = (typeof steps)[number]

export const radii = ['00', '08', '12', '16', '24'] as const
export type RadiusStep = (typeof radii)[number]

export const weights = ['regular', 'medium', 'semibold', 'bold', 'extrabold'] as const
export type Weight = (typeof weights)[number]

/** Text styles that exist as `--l3-text-<weight>-<size>` tokens. */
export const textSizes: Record<Weight, readonly number[]> = {
  regular: [12, 14, 16, 18, 20],
  medium: [12, 14, 16, 18, 20],
  semibold: [12, 14, 16, 18, 20, 24, 28, 32, 36],
  bold: [12, 14, 16, 18, 20, 24, 28, 32, 36],
  extrabold: [12, 14, 16, 18, 20, 24, 28, 32, 36],
}
export const allTextSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36] as const

export const colorKeys = ['primary', 'secondary', 'tertiary', 'inverted', 'brand', 'discover', 'success', 'error', 'warning', 'profit', 'loss'] as const
export type ColorKey = (typeof colorKeys)[number]

export const aligns = ['stretch', 'start', 'center', 'end'] as const
export const textAligns = ['left', 'center', 'right'] as const
export const backgrounds = ['none', 'primary', 'secondary', 'tertiary'] as const

export type Part = 'label' | 'iconLeft' | 'iconRight'

/* ---- Options for the other components ---- */

export const tagColors = ['neutral', 'profit', 'loss', 'success', 'error', 'warning', 'discover', 'processing', 'indigo', 'teal', 'purple', 'zing'] as const
export type TagColorKey = (typeof tagColors)[number]
export const tagVariants = ['primary', 'secondary', 'tertiary'] as const
export const tagSizes = ['sm', 'md', 'lg'] as const

export const aerobarTones = ['primary', 'discover', 'danger', 'success', 'warning'] as const
export const fieldStatuses = ['default', 'error', 'success'] as const
export const tabAppearances = ['underline', 'pill'] as const
export const cellVariants = ['plain', 'card'] as const
export const cellControls = ['none', 'switch', 'checkbox'] as const
export const cardSurfaces = ['default', 'primary', 'secondary', 'tertiary', 'inverted'] as const
export const directions = ['horizontal', 'vertical'] as const
export const brands = ['lemonn', 'zing'] as const
export const logoVariants = ['full', 'icon'] as const

/** Icons offered for the Actionbar's action buttons (at most two). */
export const actionIcons = ['search', 'notifications', 'share', 'more_vert', 'star', 'bookmark', 'add', 'settings', 'info', 'filter_list'] as const
/** The bottom navigation's own illustrations (Figma artwork, not Material Symbols). */
export const navIconNames = ['stocks', 'market', 'portfolio', 'mutualFund', 'mfSips', 'fno', 'fnoOptionChain', 'fnoScalper'] as const
export type NavIconKey = (typeof navIconNames)[number]

/* ---- Claude models a user can pick in the chat ---- */

export type ModelOption = {
  id: string
  label: string
  /** One line for the picker. */
  note: string
  /** Haiku 4.5 rejects `effort`. */
  effort: boolean
  /** Server-side refusal fallback is documented for these models only. */
  fallbacks: boolean
}

export const models: ModelOption[] = [
  { id: 'claude-opus-5-5', label: 'Opus 5.5', note: 'Best quality. Recommended.', effort: true, fallbacks: true },
  { id: 'claude-sonnet-5-5', label: 'Sonnet 5.5', note: 'Faster and about half the cost.', effort: true, fallbacks: true },
  { id: 'claude-haiku-4-5', label: 'Haiku 4.5', note: 'Fastest and cheapest. Simpler screens.', effort: false, fallbacks: false },
  { id: 'claude-fable-5-1', label: 'Fable 5.1', note: 'Most capable, slowest, highest cost.', effort: true, fallbacks: true },
]
export const defaultModel = 'claude-opus-5-5'

