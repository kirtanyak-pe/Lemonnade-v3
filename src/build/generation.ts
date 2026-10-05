// Shared by the browser and the server: how a design travels to and from Claude, and the checks applied to whatever
// comes back. Claude never draws pixels: it returns a flat list of nodes drawn only from the vocabulary in schema.ts,
// and everything is validated here before it reaches the canvas.
import { isContainer, type DesignNode } from './design.ts'
import {
  actionIcons, aerobarTones, aligns, allTextSizes, backgrounds, brands, buttonSizes, cardSurfaces, cellControls, cellVariants,
  colorKeys, directions, fieldStatuses, kinds, logoVariants, navIconNames, radii, steps, tabAppearances, tagColors, tagSizes,
  tagVariants, textAligns, textSizes, variants, weights,
  type ColorKey, type NavIconKey, type NodeKind, type Weight,
} from './schema.ts'

/** One node as Claude sees and returns it. Containers (section, card, dock) sit at the root and cannot nest. */
export type FlatNode = {
  id: string
  parent: string
  kind: NodeKind
  name?: string
  text?: string
  description?: string
  value?: string
  weight?: Weight
  size?: number
  color?: ColorKey
  textAlign?: (typeof textAligns)[number]
  variant?: (typeof variants)[number]
  buttonSize?: (typeof buttonSizes)[number]
  fill?: boolean
  iconLeft?: string
  iconRight?: string
  before?: (typeof steps)[number]
  after?: (typeof steps)[number]
  padding?: (typeof steps)[number]
  gap?: (typeof steps)[number]
  align?: (typeof aligns)[number]
  background?: (typeof backgrounds)[number]
  radius?: (typeof radii)[number]
  border?: boolean
  back?: boolean
  actions?: string[]
  items?: string[]
  active?: number
  appearance?: (typeof tabAppearances)[number]
  tagColor?: (typeof tagColors)[number]
  tagVariant?: (typeof tagVariants)[number]
  tagSize?: (typeof tagSizes)[number]
  cellVariant?: (typeof cellVariants)[number]
  chevron?: boolean
  control?: (typeof cellControls)[number]
  checked?: boolean
  placeholder?: string
  helper?: string
  status?: (typeof fieldStatuses)[number]
  tone?: (typeof aerobarTones)[number]
  floating?: boolean
  navItems?: { label: string; icon: NavIconKey }[]
  brand?: (typeof brands)[number]
  logoVariant?: (typeof logoVariants)[number]
  surface?: (typeof cardSurfaces)[number]
  flat?: boolean
  direction?: (typeof directions)[number]
}

const strEnum = (values: readonly string[], description?: string) => ({ type: 'string', enum: [...values], ...(description ? { description } : {}) })
const strList = (description: string) => ({ type: 'array', items: { type: 'string' }, description })

/** JSON Schema for structured output. No recursion, and every object closed (`additionalProperties: false`). */
export const outputSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    reply: { type: 'string', description: 'One to three short sentences: what you built or changed, then up to three assumptions or open questions.' },
    nodes: {
      type: 'array',
      description: 'The whole design, top to bottom. Array order is visual order within each parent.',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', description: 'Short unique id such as hero, title, cta. Keep the ids of nodes you do not change.' },
          parent: { type: 'string', description: '"root" for the top level, or the id of a section, card or dock. Containers are always at the root.' },
          kind: strEnum(kinds),
          name: { type: 'string', description: 'Containers only (section, card, dock): a short label such as Hero or Actions.' },
          text: { type: 'string', description: 'The main text: heading or text content, button label (verb first, 1–3 words), tag text, list-row label, field label, switch/checkbox/radio label, status-bar heading, empty-state title, action-bar title.' },
          description: { type: 'string', description: 'Secondary text: list-row description, status-bar paragraph, empty-state description, action-bar subtitle.' },
          value: { type: 'string', description: 'List row: the value shown on the right. Empty state: the label of its action button.' },
          weight: strEnum(weights),
          size: { type: 'integer', enum: [...allTextSizes] },
          color: strEnum(colorKeys, 'Text colour token. Headings are usually primary, supporting text secondary.'),
          textAlign: strEnum(textAligns),
          variant: strEnum(variants, 'Button style.'),
          buttonSize: strEnum(buttonSizes),
          fill: { type: 'boolean', description: 'Button spans the full width when true, hugs its label when false.' },
          iconLeft: { type: 'string', description: 'Material Symbols Rounded name in snake_case, e.g. add, wallet. Buttons, list rows and icon nodes. Omit for none.' },
          iconRight: { type: 'string', description: 'Buttons only. Material Symbols Rounded name in snake_case, e.g. arrow_forward. Omit for none.' },
          before: strEnum(steps, 'Space above, in px.'),
          after: strEnum(steps, 'Space below, in px.'),
          padding: strEnum(steps, 'Sections only, in px.'),
          gap: strEnum(steps, 'Sections and cards, in px.'),
          align: strEnum(aligns, 'Sections and cards.'),
          background: strEnum(backgrounds, 'Sections only.'),
          radius: strEnum(radii, 'Sections only, in px.'),
          border: { type: 'boolean', description: 'Sections only.' },
          back: { type: 'boolean', description: 'Action bar only: show the back button.' },
          actions: strList(`Action bar only: up to two action icons from ${actionIcons.join(', ')}.`),
          items: strList('Tabs: the tab labels (2–6, short). Action bar: tab labels shown under the bar (this is where top tabs go).'),
          active: { type: 'integer', enum: [0, 1, 2, 3, 4, 5], description: 'Tabs, action-bar tabs and bottom navigation: index of the selected item.' },
          appearance: strEnum(tabAppearances, 'Tabs only. underline for sections, pill for filters and chips.'),
          tagColor: strEnum(tagColors, 'Tag only. profit/loss for price moves and P&L, success/error for outcomes, processing for in progress.'),
          tagVariant: strEnum(tagVariants),
          tagSize: strEnum(tagSizes),
          cellVariant: strEnum(cellVariants, 'List row only. plain is a flat row, card is a bordered rounded row.'),
          chevron: { type: 'boolean', description: 'List row only: show a chevron on the right.' },
          control: strEnum(cellControls, 'List row only: a switch or checkbox on the right.'),
          checked: { type: 'boolean', description: 'Switch, checkbox, radio, or a list row with a control.' },
          placeholder: { type: 'string', description: 'Text field only.' },
          helper: { type: 'string', description: 'Text field only: helper or error text under the field.' },
          status: strEnum(fieldStatuses, 'Text field only.'),
          tone: strEnum(aerobarTones, 'Status bar only.'),
          floating: { type: 'boolean', description: 'Status bar only: a floating toast instead of a full-width strip.' },
          navItems: {
            type: 'array',
            description: 'Bottom navigation only: 3 to 5 sections.',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: { label: { type: 'string' }, icon: strEnum(navIconNames) },
              required: ['label', 'icon'],
            },
          },
          brand: strEnum(brands, 'Brand logo only.'),
          logoVariant: strEnum(logoVariants, 'Brand logo only. full is mark and wordmark, icon is the mark alone.'),
          surface: strEnum(cardSurfaces, 'Card only.'),
          flat: { type: 'boolean', description: 'Card only: no border, radius or shadow.' },
          direction: strEnum(directions, 'Button dock only. horizontal puts the strong button on the right.'),
        },
        required: ['id', 'parent', 'kind'],
      },
    },
  },
  required: ['reply', 'nodes'],
} as const

/* ---- Tree <-> flat list ---------------------------------------------------------------------------------------- */

const strip = <T extends object>(o: T): T => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T

export function toFlat(tree: DesignNode[]): FlatNode[] {
  const out: FlatNode[] = []
  const walk = (list: DesignNode[], parent: string) => {
    for (const n of list) {
      out.push(strip({
        id: n.id, parent, kind: n.kind,
        name: isContainer(n.kind) ? n.name : undefined,
        text: n.text, description: n.description, value: n.value,
        weight: n.weight, size: n.size, color: n.color, textAlign: n.textAlign,
        variant: n.variant, buttonSize: n.buttonSize, fill: n.fill,
        iconLeft: n.iconLeft ? n.iconLeft.name ?? (n.kind === 'button' ? 'add' : 'info') : undefined,
        iconRight: n.iconRight ? n.iconRight.name ?? 'arrow_forward' : undefined,
        before: n.before, after: n.after, padding: n.padding, gap: n.gap, align: n.align,
        background: n.background, radius: n.radius, border: n.border,
        back: n.back, actions: n.actions, items: n.items, active: n.active, appearance: n.appearance,
        tagColor: n.tagColor, tagVariant: n.tagVariant, tagSize: n.tagSize,
        cellVariant: n.cellVariant, chevron: n.chevron, control: n.control, checked: n.checked,
        placeholder: n.placeholder, helper: n.helper, status: n.status, tone: n.tone, floating: n.floating,
        navItems: n.navItems, brand: n.brand, logoVariant: n.logoVariant, surface: n.surface, flat: n.flat, direction: n.direction,
      }) as FlatNode)
      if (n.children) walk(n.children, n.id)
    }
  }
  walk(tree, 'root')
  return out
}

export type Sanitized = { tree: DesignNode[]; warnings: string[] }

const oneOf = <T extends string>(list: readonly T[], v: unknown): T | undefined => (typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : undefined)
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '')
const bool = (v: unknown) => (typeof v === 'boolean' ? v : undefined)
const list = (v: unknown, min: number, max: number, maxLen = 24): string[] | undefined => {
  if (!Array.isArray(v)) return undefined
  const out = v.map((x) => clean(x, maxLen)).filter(Boolean).slice(0, max)
  return out.length >= min ? out : undefined
}
const MAX_NODES = 100

const defaultNames: Record<NodeKind, string> = {
  section: 'Section', card: 'Card', dock: 'Button dock', actionbar: 'Action bar', tabs: 'Tabs', heading: 'Heading', text: 'Text',
  button: 'Button', tag: 'Tag', listcell: 'List row', textfield: 'Text field', switch: 'Switch', checkbox: 'Checkbox', radio: 'Radio',
  aerobar: 'Status bar', emptystate: 'Empty state', bottomnav: 'Bottom navigation', brandlogo: 'Brand logo', icon: 'Icon',
}

/**
 * Turn Claude's flat list into a design tree, dropping anything outside the vocabulary and fixing the hard rules.
 * `prev` is the design before this request: edits Claude cannot express (per-part colours) are carried over by id.
 * `iconNames` is the set of real Material Symbols names; unknown icons are dropped.
 */
export function fromFlat(raw: unknown, opts: { iconNames?: ReadonlySet<string>; prev?: DesignNode[] } = {}): Sanitized {
  const warnings: string[] = []
  if (!Array.isArray(raw)) throw new Error('The design was not a list of nodes.')

  const prevById = new Map<string, DesignNode>()
  const index = (l: DesignNode[]) => l.forEach((n) => { prevById.set(n.id, n); if (n.children) index(n.children) })
  if (opts.prev) index(opts.prev)

  const iconOk = (name: string) => {
    if (!name) return undefined
    if (opts.iconNames && !opts.iconNames.has(name)) { warnings.push(`Icon “${name}” doesn’t exist, so it was left out.`); return undefined }
    return name
  }

  const seen = new Set<string>()
  const nodes: { flat: FlatNode; node: DesignNode }[] = []

  for (const item of raw.slice(0, MAX_NODES)) {
    if (!item || typeof item !== 'object') continue
    const f = item as Record<string, unknown>
    const kind = oneOf(kinds, f.kind)
    if (!kind) { warnings.push('Skipped an item with an unknown kind.'); continue }

    let id = clean(f.id, 40).replace(/[^\w-]/g, '-') || `${kind}-${nodes.length + 1}`
    while (seen.has(id)) id = `${id}-${nodes.length + 1}`
    seen.add(id)

    const node: DesignNode = { id, kind, name: isContainer(kind) ? clean(f.name, 30) || defaultNames[kind] : defaultNames[kind], before: oneOf(steps, f.before), after: oneOf(steps, f.after) }
    const text = clean(f.text, 600)
    const description = clean(f.description, 300)

    switch (kind) {
      case 'section':
        node.padding = oneOf(steps, f.padding); node.gap = oneOf(steps, f.gap); node.align = oneOf(aligns, f.align)
        node.background = oneOf(backgrounds, f.background); node.radius = oneOf(radii, f.radius); node.border = bool(f.border)
        node.children = []
        break
      case 'card':
        node.gap = oneOf(steps, f.gap); node.align = oneOf(aligns, f.align); node.surface = oneOf(cardSurfaces, f.surface); node.flat = bool(f.flat)
        node.children = []
        break
      case 'dock':
        node.direction = oneOf(directions, f.direction) ?? 'horizontal'
        node.children = []
        break
      case 'heading':
      case 'text': {
        node.text = text || (kind === 'heading' ? 'Heading' : 'Text')
        const weight = oneOf(weights, f.weight) ?? (kind === 'heading' ? 'semibold' : 'regular')
        let size = typeof f.size === 'number' ? f.size : kind === 'heading' ? 20 : 14
        if (!textSizes[weight].includes(size)) size = textSizes[weight].reduce((best, s) => (Math.abs(s - size) < Math.abs(best - size) ? s : best))
        node.weight = weight; node.size = size
        node.color = oneOf(colorKeys, f.color) ?? (kind === 'heading' ? 'primary' : 'secondary')
        node.textAlign = oneOf(textAligns, f.textAlign)
        break
      }
      case 'button': {
        node.text = clean(f.text, 40) || 'Continue'
        node.variant = oneOf(variants, f.variant) ?? 'primary'
        node.buttonSize = oneOf(buttonSizes, f.buttonSize)
        node.fill = bool(f.fill)
        const left = iconOk(clean(f.iconLeft, 60)); const right = iconOk(clean(f.iconRight, 60))
        if (left) node.iconLeft = { name: left }
        if (right) node.iconRight = { name: right }
        const before = prevById.get(id)
        if (before?.kind === 'button') {
          node.labelColor = before.labelColor
          if (node.iconLeft && before.iconLeft) node.iconLeft = { ...node.iconLeft, fill: before.iconLeft.fill, color: before.iconLeft.color }
          if (node.iconRight && before.iconRight) node.iconRight = { ...node.iconRight, fill: before.iconRight.fill, color: before.iconRight.color }
        }
        break
      }
      case 'actionbar': {
        node.text = text || 'Screen title'; node.description = description || undefined; node.back = bool(f.back)
        const acts = Array.isArray(f.actions) ? f.actions.filter((a): a is string => typeof a === 'string' && (actionIcons as readonly string[]).includes(a)).slice(0, 2) : []
        node.actions = acts.length ? acts : undefined
        node.items = list(f.items, 2, 5, 16)
        node.active = node.items ? Math.min(Math.max(0, Math.trunc(Number(f.active) || 0)), node.items.length - 1) : undefined
        break
      }
      case 'tabs':
        node.items = list(f.items, 2, 6, 16) ?? ['One', 'Two']
        node.active = Math.min(Math.max(0, Math.trunc(Number(f.active) || 0)), node.items.length - 1)
        node.appearance = oneOf(tabAppearances, f.appearance) ?? 'underline'
        break
      case 'tag':
        node.text = clean(f.text, 24) || 'Tag'; node.tagColor = oneOf(tagColors, f.tagColor) ?? 'neutral'
        node.tagVariant = oneOf(tagVariants, f.tagVariant); node.tagSize = oneOf(tagSizes, f.tagSize)
        break
      case 'listcell': {
        node.text = clean(f.text, 60) || 'Row'; node.description = description || undefined; node.value = clean(f.value, 30) || undefined
        node.cellVariant = oneOf(cellVariants, f.cellVariant); node.chevron = bool(f.chevron)
        node.control = oneOf(cellControls, f.control); node.checked = bool(f.checked)
        const left = iconOk(clean(f.iconLeft, 60))
        if (left) node.iconLeft = { name: left }
        break
      }
      case 'textfield':
        node.text = clean(f.text, 40) || 'Label'; node.placeholder = clean(f.placeholder, 60) || undefined
        node.helper = clean(f.helper, 100) || undefined; node.status = oneOf(fieldStatuses, f.status)
        break
      case 'switch':
      case 'checkbox':
      case 'radio':
        node.text = clean(f.text, 80) || 'Option'; node.checked = bool(f.checked)
        break
      case 'aerobar':
        node.text = clean(f.text, 60) || undefined; node.description = description || undefined
        node.tone = oneOf(aerobarTones, f.tone) ?? 'primary'; node.floating = bool(f.floating)
        if (!node.text && !node.description) node.text = 'Notice'
        break
      case 'emptystate':
        node.text = clean(f.text, 60) || 'Nothing here yet'; node.description = description || undefined; node.value = clean(f.value, 24) || undefined
        break
      case 'bottomnav': {
        const navItems = Array.isArray(f.navItems)
          ? f.navItems.flatMap((i: unknown) => {
              const r = i as Record<string, unknown>
              const icon = oneOf(navIconNames, r?.icon)
              const label = clean(r?.label, 14)
              return icon && label ? [{ label, icon }] : []
            }).slice(0, 5)
          : []
        node.navItems = navItems.length >= 2 ? navItems : [{ label: 'Stocks', icon: 'stocks' }, { label: 'Market', icon: 'market' }, { label: 'Portfolio', icon: 'portfolio' }]
        node.active = Math.min(Math.max(0, Math.trunc(Number(f.active) || 0)), node.navItems.length - 1)
        break
      }
      case 'brandlogo':
        node.brand = oneOf(brands, f.brand) ?? 'lemonn'; node.logoVariant = oneOf(logoVariants, f.logoVariant)
        break
      case 'icon': {
        const left = iconOk(clean(f.iconLeft, 60)) ?? 'info'
        node.iconLeft = { name: left }
        break
      }
    }

    nodes.push({ flat: { ...(f as FlatNode), id, kind }, node })
  }

  // Build the tree. Containers sit at the root; anything pointing at a missing container goes to the root.
  const containers = new Map(nodes.filter((n) => isContainer(n.node.kind)).map((n) => [n.flat.id, n.node]))
  const tree: DesignNode[] = []
  for (const { flat, node } of nodes) {
    const parent = isContainer(node.kind) ? undefined : containers.get(String(flat.parent))
    if (parent) parent.children!.push(node)
    else tree.push(node)
  }

  // A button dock holds one or two buttons, always Large (Button/USAGE.md §2–3).
  const walkDocks = (l: DesignNode[]) => {
    for (const n of l) {
      if (n.kind !== 'dock') continue
      const kids = (n.children ?? []).filter((c) => c.kind === 'button')
      if (kids.length !== (n.children ?? []).length) warnings.push('A button dock can only hold buttons, so other items were moved out of it.')
      const extra = (n.children ?? []).filter((c) => c.kind !== 'button')
      if (extra.length) tree.splice(tree.indexOf(n) + 1, 0, ...extra)
      if (kids.length > 2) warnings.push(`A button dock holds at most two buttons, so “${kids[2].text}” was removed.`)
      n.children = kids.slice(0, 2)
      for (const k of n.children) { k.buttonSize = 'lg'; k.fill = undefined }
    }
  }
  walkDocks(tree)

  // Hard Button rules (Button/USAGE.md §1): one primary per screen, and secondary only beside a stronger button.
  const buttons: DesignNode[] = []
  const collect = (l: DesignNode[]) => l.forEach((n) => { if (n.kind === 'button') buttons.push(n); if (n.children) collect(n.children) })
  collect(tree)
  let primaryTaken = false
  for (const b of buttons) {
    if (b.variant !== 'primary') continue
    if (primaryTaken) { b.variant = 'tertiary'; warnings.push(`“${b.text}” was a second primary button, so it became tertiary (one primary per screen).`) }
    primaryTaken = true
  }
  const strong = buttons.some((b) => b.variant && ['primary', 'buy', 'sell', 'brand'].includes(b.variant))
  for (const b of buttons) {
    if (b.variant === 'secondary' && !strong) { b.variant = 'tertiary'; warnings.push(`“${b.text}” was a secondary button with nothing stronger beside it, so it became tertiary.`) }
  }

  if (!tree.length) throw new Error('The design came back empty.')
  return { tree, warnings }
}

/* ---- Demo mode: a plausible screen when no API key is configured ------------------------------------------------ */

export function mockDesign(prompt: string, hasDesign: boolean): { reply: string; nodes: FlatNode[] } {
  const p = prompt.toLowerCase()
  const note = 'Demo mode: no Claude key is configured, so this is a canned screen, not a real generation.'

  if (hasDesign) return { reply: `${note} I added your request as a note on the screen.`, nodes: [] }

  const trade = /order|buy|sell|trade|stock/.test(p)
  const title = /login|sign in|signin|otp|verify/.test(p) ? 'Welcome back' : trade ? 'Review your order' : /kyc|onboard|profile/.test(p) ? 'Let’s verify you' : 'Your new screen'
  const cta = trade ? 'Place order' : /login|sign in|otp|verify/.test(p) ? 'Continue' : 'Get started'
  return {
    reply: `${note} Try describing a screen, or add a key to generate real ones.`,
    nodes: [
      { id: 'bar', parent: 'root', kind: 'actionbar', text: title, back: true },
      { id: 'hero', parent: 'root', kind: 'section', name: 'Hero', gap: '08', padding: '16' },
      { id: 'body', parent: 'hero', kind: 'text', text: prompt.slice(0, 160) || 'Describe what this screen should do.', weight: 'regular', size: 14, color: 'secondary' },
      { id: 'dock', parent: 'root', kind: 'dock', name: 'Actions', direction: 'horizontal' },
      { id: 'skip', parent: 'dock', kind: 'button', text: 'Maybe later', variant: 'secondary' },
      { id: 'cta', parent: 'dock', kind: 'button', text: cta, variant: trade ? 'buy' : 'primary' },
    ],
  }
}
