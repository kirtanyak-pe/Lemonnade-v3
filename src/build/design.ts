// The design the Build page edits: a tree of sections and components, plus the option lists and Lemonnade rules the
// inspector uses. Generated screens will produce this same shape.
import type { ButtonSize, ButtonVariant, ColorKey, NavIconKey, NodeKind, Part, RadiusStep, Step, TagColorKey, Weight } from './schema.ts'
import { radii, steps, textSizes, weights } from './schema.ts'

export { radii, steps, textSizes, weights }
export type { ButtonSize, ButtonVariant, ColorKey, NavIconKey, NodeKind, Part, RadiusStep, Step, TagColorKey, Weight }
/** One icon on a button. Present = shown; `name` unset = the default for that side. */
export type IconSpec = { name?: string; fill?: boolean; color?: ColorKey }

/**
 * Ids are `<node>` for a node and `<node>:<part>` for a part of a button (its label or icon). Parts follow the button's
 * style until they are given their own colour.
 */
export type DesignNode = {
  id: string
  kind: NodeKind
  name: string
  /** Space outside the node, from the spacing scale. */
  before?: Step
  after?: Step

  /** heading / text / button label */
  text?: string
  weight?: Weight
  size?: number
  color?: ColorKey
  textAlign?: 'left' | 'center' | 'right'

  /** button */
  variant?: ButtonVariant
  buttonSize?: ButtonSize
  fill?: boolean
  /** A label can have an icon on either side, or both (Button/USAGE.md §5). */
  iconLeft?: IconSpec
  iconRight?: IconSpec
  labelColor?: ColorKey

  /** Shared by several components */
  description?: string
  checked?: boolean
  /** Small extra text: a list row's value, an empty state's button label. */
  value?: string

  /** actionbar */
  back?: boolean
  actions?: string[]

  /** tabs, and the tabs inside an actionbar */
  items?: string[]
  active?: number
  appearance?: 'underline' | 'pill'

  /** tag */
  tagColor?: TagColorKey
  tagVariant?: 'primary' | 'secondary' | 'tertiary'
  tagSize?: 'sm' | 'md' | 'lg'

  /** listcell */
  cellVariant?: 'plain' | 'card'
  chevron?: boolean
  control?: 'none' | 'switch' | 'checkbox'

  /** textfield */
  placeholder?: string
  helper?: string
  status?: 'default' | 'error' | 'success'

  /** aerobar */
  tone?: 'primary' | 'discover' | 'danger' | 'success' | 'warning'
  floating?: boolean

  /** bottomnav */
  navItems?: { label: string; icon: NavIconKey }[]

  /** brandlogo */
  brand?: 'lemonn' | 'zing'
  logoVariant?: 'full' | 'icon'

  /** card */
  surface?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'inverted'
  flat?: boolean

  /** dock */
  direction?: 'horizontal' | 'vertical'

  /** section, card, dock: the items inside */
  children?: DesignNode[]
  padding?: Step
  gap?: Step
  align?: 'stretch' | 'start' | 'center' | 'end'
  background?: 'none' | 'primary' | 'secondary' | 'tertiary'
  radius?: RadiusStep
  border?: boolean
}

/* ---- Options (every value is a design token) -------------------------------------------------------------- */

export const colorOptions: { value: ColorKey; label: string; color: string }[] = [
  { value: 'primary', label: 'Primary', color: 'var(--l3-content-primary)' },
  { value: 'secondary', label: 'Secondary', color: 'var(--l3-content-secondary)' },
  { value: 'tertiary', label: 'Tertiary', color: 'var(--l3-content-tertiary)' },
  { value: 'inverted', label: 'Inverted', color: 'var(--l3-content-inverted)' },
  { value: 'brand', label: 'Brand', color: 'var(--l3-content-accent-brand-default)' },
  { value: 'discover', label: 'Discover', color: 'var(--l3-content-accent-discover-default)' },
  { value: 'success', label: 'Success', color: 'var(--l3-content-accent-success-default)' },
  { value: 'error', label: 'Error', color: 'var(--l3-content-accent-error-default)' },
  { value: 'warning', label: 'Warning', color: 'var(--l3-content-accent-warning-default)' },
  { value: 'profit', label: 'Profit', color: 'var(--l3-content-accent-indicator-up-default)' },
  { value: 'loss', label: 'Loss', color: 'var(--l3-content-accent-indicator-down-default)' },
]
export const colorVar = (key?: ColorKey) => colorOptions.find((o) => o.value === key)?.color

export const variantOptions: { value: ButtonVariant; label: string; surface: string; border: string }[] = [
  { value: 'primary', label: 'Primary', surface: 'var(--l3-button-primary-surface)', border: 'var(--l3-border-light)' },
  { value: 'secondary', label: 'Secondary', surface: 'var(--l3-button-secondary-surface)', border: 'var(--l3-button-secondary-border)' },
  { value: 'tertiary', label: 'Tertiary', surface: 'var(--l3-button-tertiary-surface)', border: 'var(--l3-button-tertiary-border)' },
  { value: 'ghost', label: 'Ghost', surface: 'transparent', border: 'var(--l3-button-ghost-content)' },
  { value: 'brand', label: 'Brand', surface: 'var(--l3-button-brand-surface)', border: 'var(--l3-border-light)' },
  { value: 'buy', label: 'Buy', surface: 'var(--l3-button-buy-surface)', border: 'var(--l3-border-light)' },
  { value: 'sell', label: 'Sell', surface: 'var(--l3-button-sell-surface)', border: 'var(--l3-border-light)' },
]

export const partLabels: Record<Part, string> = { label: 'Label', iconLeft: 'Left icon', iconRight: 'Right icon' }
export const isIconPart = (p: Part | null): p is 'iconLeft' | 'iconRight' => p === 'iconLeft' || p === 'iconRight'
/** Default Material Symbol per side, used until one is picked. */
export const defaultIconName = { iconLeft: 'add', iconRight: 'arrow_forward' } as const

/** The parts a node has: a button's label and whichever icons it shows. */
export const partsOf = (n: DesignNode): Part[] => (n.kind === 'button' ? ['label', ...(n.iconLeft ? ['iconLeft' as const] : []), ...(n.iconRight ? ['iconRight' as const] : [])] : [])

/** Patch that makes a button's label and icons follow its style again. */
export const clearColors = (n: DesignNode): Partial<DesignNode> => ({
  labelColor: undefined,
  iconLeft: n.iconLeft && { ...n.iconLeft, color: undefined },
  iconRight: n.iconRight && { ...n.iconRight, color: undefined },
})

export const spacingVar = (step: Step = '00') => `var(--l3-spacing-${step})`
export const radiusVar = (step: RadiusStep = '00') => `var(--l3-radius-${step})`
export const textFont = (weight: Weight, size: number) => `var(--l3-text-${weight}-${size})`

/* ---- Tree helpers (immutable) ---------------------------------------------------------------------------- */

export const baseIdOf = (id: string) => id.split(':')[0]
export const partOf = (id: string): Part | null => (id.includes(':') ? (id.split(':')[1] as Part) : null)

export function findNode(tree: DesignNode[], id: string): DesignNode | null {
  for (const n of tree) {
    if (n.id === id) return n
    const inner = n.children && findNode(n.children, id)
    if (inner) return inner
  }
  return null
}

/** Id of the section holding `id`, or null for the top level. */
export function parentOf(tree: DesignNode[], id: string, parent: string | null = null): string | null | undefined {
  for (const n of tree) {
    if (n.id === id) return parent
    const inner = n.children && parentOf(n.children, id, n.id)
    if (inner !== undefined) return inner
  }
  return undefined
}

export function updateNode(tree: DesignNode[], id: string, patch: Partial<DesignNode>): DesignNode[] {
  return tree.map((n) => (n.id === id ? { ...n, ...patch } : n.children ? { ...n, children: updateNode(n.children, id, patch) } : n))
}

function detach(tree: DesignNode[], id: string): { tree: DesignNode[]; node: DesignNode | null } {
  let node: DesignNode | null = null
  const walk = (list: DesignNode[]): DesignNode[] =>
    list
      .filter((n) => {
        if (n.id === id) { node = n; return false }
        return true
      })
      .map((n) => (n.children ? { ...n, children: walk(n.children) } : n))
  const next = walk(tree)
  return { tree: next, node }
}

/** Move `id` into section `container` (null = top level) at `index`, counted among that list without `id`. */
export function moveNode(tree: DesignNode[], id: string, container: string | null, index: number): DesignNode[] {
  const { tree: rest, node } = detach(tree, id)
  if (!node) return tree
  const put = (list: DesignNode[]): DesignNode[] => {
    const at = Math.max(0, Math.min(index, list.length))
    return [...list.slice(0, at), node, ...list.slice(at)]
  }
  if (container === null) return put(rest)
  const walk = (list: DesignNode[]): DesignNode[] =>
    list.map((n) => (n.id === container ? { ...n, children: put(n.children ?? []) } : n.children ? { ...n, children: walk(n.children) } : n))
  return walk(rest)
}

export function flatten(tree: DesignNode[]): DesignNode[] {
  return tree.flatMap((n) => [n, ...(n.children ? flatten(n.children) : [])])
}

/* ---- Suggestions: Lemonnade rules, from src/components/Button/USAGE.md and DESIGN_SYSTEM.md ---------------- */

export type Hint = { level: 'info' | 'warn'; text: string }

/** `others`: every other button in the design. */
export function variantHint(variant: ButtonVariant, others: DesignNode[]): Hint {
  const strong = others.some((n) => n.variant && ['primary', 'buy', 'sell', 'brand'].includes(n.variant))
  const hasPrimary = others.some((n) => n.variant === 'primary')
  switch (variant) {
    case 'primary':
      return hasPrimary
        ? { level: 'warn', text: 'Another button on this screen is already primary. Use one primary per screen.' }
        : { level: 'info', text: 'The main action of the screen, like Continue or Save.' }
    case 'secondary':
      return strong
        ? { level: 'info', text: 'The alternative action next to a stronger button, like Cancel next to Confirm.' }
        : { level: 'warn', text: 'Secondary only works next to a stronger button (primary, buy, sell or brand). On its own, use tertiary.' }
    case 'tertiary':
      return { level: 'info', text: 'A low-emphasis action on the page, like View all or Add another.' }
    case 'ghost':
      return { level: 'info', text: 'A text-style action inside other components. Not for a screen’s main action.' }
    case 'brand':
      return hasPrimary
        ? { level: 'warn', text: 'Brand next to a primary button is a pair to avoid. Pick one.' }
        : { level: 'info', text: 'For brand moments such as onboarding or promotions, not everyday actions.' }
    case 'buy':
    case 'sell':
      return { level: 'warn', text: `Only for placing or confirming a trade. Don’t use ${variant} for unrelated actions.` }
  }
}

export function labelHint(text: string): Hint | null {
  const t = text.trim()
  if (!t) return { level: 'warn', text: 'A button needs a label.' }
  if (/^(submit|ok|okay|yes|no)$/i.test(t)) return { level: 'warn', text: 'Be specific and start with a verb, like “Place order” or “Add funds”.' }
  if (t.split(/\s+/).length > 3) return { level: 'warn', text: 'Keep button labels to 1–3 words.' }
  return null
}

export function sizeHint(size: ButtonSize, siblings: DesignNode[]): Hint {
  if (siblings.some((n) => n.kind === 'button' && (n.buttonSize ?? 'lg') !== size)) {
    return { level: 'warn', text: 'Buttons that sit side by side use the same size.' }
  }
  return {
    lg: { level: 'info', text: 'Large: bottom docks and a screen’s main action. Docks are always Large.' },
    md: { level: 'info', text: 'Medium: actions inside content, like cards, sheet bodies and forms.' },
    sm: { level: 'info', text: 'Small: compact spots such as an empty-state action or an inline row action.' },
  }[size] as Hint
}

export function spacingHint(node: DesignNode): Hint | null {
  const used = [node.before, node.after, node.padding, node.gap]
  return used.some((s) => s && s !== '00') ? { level: 'info', text: 'Spacing uses the 4px scale. Screens keep a 16px side gutter.' } : null
}

/* ---- What each kind is called, and which kinds hold other items ---- */

export const kindLabels: Record<NodeKind, string> = {
  section: 'Section', card: 'Card', dock: 'Button dock', actionbar: 'Action bar', tabs: 'Tabs', heading: 'Heading', text: 'Text',
  button: 'Button', tag: 'Tag', listcell: 'List row', textfield: 'Text field', switch: 'Switch', checkbox: 'Checkbox', radio: 'Radio',
  aerobar: 'Status bar', emptystate: 'Empty state', bottomnav: 'Bottom navigation', brandlogo: 'Brand logo', icon: 'Icon',
}

export const isContainer = (kind: NodeKind) => kind === 'section' || kind === 'card' || kind === 'dock'
/** Full-bleed components touch the screen edges; everything else sits inside the 16px gutter (DESIGN_SYSTEM.md §15). */
export const isBleed = (n: DesignNode) => n.kind === 'actionbar' || n.kind === 'tabs' || n.kind === 'dock' || n.kind === 'bottomnav' || n.kind === 'emptystate' || (n.kind === 'listcell' && n.cellVariant !== 'card') || (n.kind === 'aerobar' && !n.floating)
/** These pin to the bottom of the screen. */
export const isFooter = (n: DesignNode) => n.kind === 'dock' || n.kind === 'bottomnav'

/** The text shown for a node in the Layers list and chat: its name for containers, its content for the rest. */
export function nodeTitle(n: DesignNode): string {
  if (isContainer(n.kind)) return n.name
  const text = n.text ?? n.items?.join(' · ') ?? n.navItems?.map((i) => i.label).join(' · ') ?? ''
  return `${kindLabels[n.kind]}${text ? ` · ${text.slice(0, 24)}` : ''}`
}

/** A colour dot in the inspector: a token-painted swatch with a name. */
export type Dot = { key: string; label: string; dot: string; border?: string }
export const colorDots: Dot[] = colorOptions.map((o) => ({ key: o.value, label: o.label, dot: o.color }))
export const stepLabel = (s: Step) => `${Number(s)}`

