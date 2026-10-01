import { useDeferredValue, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { msArrowUpward, msClose, msFormatAlignCenter, msFormatAlignLeft, msFormatAlignRight, msLayers } from '../icons/material'
import type { Mode, Product } from '../tokens/themes'
import type { IconCatalog } from './useIconCatalog'
import {
  baseIdOf, clearColors, colorOptions, defaultIconName, findNode, flatten, isIconPart, labelHint, parentOf, partLabels, partOf,
  partsOf, radii, sizeHint, spacingHint, steps, textSizes, variantHint, variantOptions, weights,
  type ColorKey, type DesignNode, type Hint, type IconSpec, type Step, type Weight,
} from './design'
import { IconButton } from './ui'
import styles from './Build.module.css'

type Theme = { product: Product; mode: Mode }

type InspectorProps = {
  /** `docked`: a panel beside the canvas, with the full Layers list. `floating`: a compact box beside the phone. */
  variant: 'docked' | 'floating'
  tree: DesignNode[]
  selectedId: string | null
  /** The canvas theme: color swatches are painted in it so they match what the design shows. */
  theme: Theme
  /** The full icon set; null until it has loaded. */
  catalog: IconCatalog | null
  onSelect: (id: string | null) => void
  onChange: (id: string, patch: Partial<DesignNode>) => void
  onAsk: (text: string) => void
}

/* ---- Small controls ------------------------------------------------------------------------------------ */

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className={styles.group} aria-label={title}>
      {children}
    </section>
  )
}

/** A label above a control; two of these sit side by side in a `pair`. */
function Mini({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={styles.mini}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

/** Only warnings interrupt; plain guidance is shown where the rule is chosen (style) and nowhere else. */
function Warn({ hint }: { hint: Hint | null }) {
  return hint && hint.level === 'warn' ? <p className={styles.hint} data-level="warn">{hint.text}</p> : null
}

function Select<T extends string | number>({ value, options, onChange, format }: {
  value: T; options: readonly T[]; onChange: (v: T) => void; format?: (v: T) => string
}) {
  return (
    <select className={styles.nativeSelect} value={String(value)} onChange={(e) => onChange(options.find((o) => String(o) === e.target.value)!)}>
      {options.map((o) => (
        <option key={String(o)} value={String(o)}>
          {format ? format(o) : String(o)}
        </option>
      ))}
    </select>
  )
}

function Segmented<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly { value: T; label: string; icon?: string }[]; onChange: (v: T) => void
}) {
  return (
    <div className={styles.segmented} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} aria-label={o.label} title={o.label} onClick={() => onChange(o.value)}>
          {o.icon ? <Icon icon={o.icon} size={18} /> : o.label}
        </button>
      ))}
    </div>
  )
}

type Dot = { key: string; label: string; dot: string; border?: string }

/**
 * A row of color dots. The chosen name sits in the title, so the dots need no captions. Each dot carries the canvas
 * theme, so it shows the color the design will actually use.
 */
function Dots({ title, dots, value, theme, onPick }: {
  title: string; dots: Dot[]; value: string | undefined; theme: Theme; onPick: (key: string) => void
}) {
  const current = dots.find((d) => d.key === value)
  return (
    <div className={styles.field} role="radiogroup" aria-label={title}>
      <span className={styles.fieldLabel}>
        {title}
        {current && <span className={styles.fieldValue}> · {current.label}</span>}
      </span>
      <div className={styles.dots}>
        {dots.map((d) => (
          <button key={d.key} type="button" role="radio" aria-checked={value === d.key} aria-label={d.label} title={d.label} className={styles.dotButton} onClick={() => onPick(d.key)}>
            <span className={styles.swatchDot} data-product={theme.product} data-mode={theme.mode} style={{ '--dot': d.dot, '--dot-border': d.border ?? 'var(--l3-border-light)' } as CSSProperties} />
          </button>
        ))}
      </div>
    </div>
  )
}

const colorDots: Dot[] = colorOptions.map((o) => ({ key: o.value, label: o.label, dot: o.color }))

const stepLabel = (s: Step) => `${Number(s)}`

/** Rarely needed options stay folded away, so the box stays short. */
function More({ children }: { children: ReactNode }) {
  return (
    <details className={styles.more}>
      <summary>More</summary>
      <div className={styles.moreBody}>{children}</div>
    </details>
  )
}

/* ---- Layers (docked only) ------------------------------------------------------------------------------- */

function layerName(n: DesignNode) {
  if (n.kind === 'section') return n.name
  return `${n.name} · ${(n.text ?? '').slice(0, 24)}`
}

function Layers({ tree, selectedId, onSelect }: { tree: DesignNode[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const rows = (list: DesignNode[], depth: number): ReactNode =>
    list.map((n) => (
      <li key={n.id}>
        <button type="button" className={styles.layerRow} style={{ paddingInlineStart: `calc(var(--l3-spacing-08) + ${depth} * var(--l3-spacing-16))` }} aria-current={selectedId === n.id || undefined} onClick={() => onSelect(n.id)}>
          {layerName(n)}
        </button>
        {n.kind === 'button' && (
          <ul className={styles.layerList}>
            {partsOf(n).map((p) => (
              <li key={p}>
                <button type="button" className={styles.layerRow} style={{ paddingInlineStart: `calc(var(--l3-spacing-08) + ${depth + 1} * var(--l3-spacing-16))` }} aria-current={selectedId === `${n.id}:${p}` || undefined} onClick={() => onSelect(`${n.id}:${p}`)}>
                  {partLabels[p]}
                </button>
              </li>
            ))}
          </ul>
        )}
        {n.children && <ul className={styles.layerList}>{rows(n.children, depth + 1)}</ul>}
      </li>
    ))
  return <ul className={styles.layerList} aria-label="Layers">{rows(tree, 0)}</ul>
}

/* ---- Icon picker -------------------------------------------------------------------------------------------- */

const PAGE = 30
const humanize = (name: string) => name.replaceAll('_', ' ')

function IconPicker({ spec, fallback, catalog, onPick }: {
  spec: IconSpec; fallback: string; catalog: IconCatalog | null; onPick: (patch: Partial<IconSpec>) => void
}) {
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE)
  const q = useDeferredValue(query.trim().toLowerCase())
  const current = spec.name ?? fallback

  const results = useMemo(() => {
    if (!catalog) return []
    return catalog.catalog
      .filter((i) => !q || i.name.includes(q.replaceAll(' ', '_')) || i.tags.some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => b.popularity - a.popularity)
  }, [catalog, q])

  const canFill = catalog?.catalog.find((i) => i.name === current)?.hasFill ?? true

  return (
    <>
      <input
        className={styles.fieldInput}
        type="search"
        placeholder={`Search icons · now ${humanize(current)}`}
        aria-label="Search icons"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setLimit(PAGE) }}
      />
      {!catalog ? (
        <p className={styles.hint} data-level="info">Loading icons…</p>
      ) : (
        <div className={styles.iconGrid} role="group" aria-label="Icons">
          {results.slice(0, limit).map((i) => (
            <button
              key={i.name}
              type="button"
              className={styles.iconCell}
              aria-label={humanize(i.name)}
              title={humanize(i.name)}
              aria-pressed={current === i.name}
              onClick={() => onPick({ name: i.name, fill: !!spec.fill && i.hasFill })}
            >
              <Icon icon={catalog.iconUrl(i.name, false) ?? ''} size={20} />
            </button>
          ))}
          {results.length === 0 && <p className={styles.hint} data-level="info">No icons match “{query}”.</p>}
          {results.length > limit && (
            <button type="button" className={styles.iconMore} onClick={() => setLimit((l) => l + PAGE)}>
              More
            </button>
          )}
        </div>
      )}
      <label className={styles.check}>
        <input type="checkbox" checked={!!spec.fill && canFill} disabled={!canFill} onChange={(e) => onPick({ fill: e.target.checked })} />
        Filled
      </label>
    </>
  )
}

/* ---- Inspector -------------------------------------------------------------------------------------------- */

export function Inspector({ variant, tree, selectedId, theme, catalog, onSelect, onChange, onAsk }: InspectorProps) {
  const [ask, setAsk] = useState('')
  const node = selectedId ? findNode(tree, baseIdOf(selectedId)) : null
  const part = selectedId ? partOf(selectedId) : null

  const set = (patch: Partial<DesignNode>) => node && onChange(node.id, patch)
  const send = () => {
    if (!ask.trim()) return
    onAsk(ask.trim())
    setAsk('')
  }

  const otherButtons = flatten(tree).filter((n) => n.kind === 'button' && n.id !== node?.id)
  const container = node ? parentOf(tree, node.id) : undefined
  const siblings = node && container !== undefined ? (container === null ? tree : findNode(tree, container)?.children ?? []).filter((n) => n.id !== node.id) : []
  const iconSpec = node && isIconPart(part) ? node[part] ?? {} : null
  const title = node ? (part ? `${node.name} › ${partLabels[part]}` : node.name) : ''
  // The way back up: a part goes to its button, a node to its section.
  const upId = node ? (part ? node.id : parentOf(tree, node.id)) : null
  const up = upId ? findNode(tree, upId) : null

  const spacing = node && (
    <div className={styles.pair}>
      <Mini label="Space above">
        <Select value={node.before ?? '00'} options={steps} format={stepLabel} onChange={(before) => set({ before })} />
      </Mini>
      <Mini label="Space below">
        <Select value={node.after ?? '00'} options={steps} format={stepLabel} onChange={(after) => set({ after })} />
      </Mini>
    </div>
  )

  return (
    <aside className={styles.inspector} data-variant={variant} aria-label="Properties">
      {variant === 'docked' && (
        <Group title="Layers">
          <Layers tree={tree} selectedId={selectedId} onSelect={onSelect} />
        </Group>
      )}

      {variant === 'floating' && node && (
        <div className={styles.floatHeader}>
          <span className={styles.popoverTitle}>{title}</span>
          {up && (
            <button type="button" className={styles.chip} onClick={() => onSelect(up.id)}>
              ‹ {up.name}
            </button>
          )}
          <IconButton icon={msClose} label="Deselect" onClick={() => onSelect(null)} />
        </div>
      )}

      {!node && (
        <p className={styles.inspectorEmpty}>
          <Icon icon={msLayers} size={18} /> Select a layer, or click the design, to edit it.
        </p>
      )}

      {/* ---- An icon on a button ---- */}
      {node?.kind === 'button' && isIconPart(part) && iconSpec && (
        <Group>
          <IconPicker
            spec={iconSpec}
            fallback={defaultIconName[part]}
            catalog={catalog}
            onPick={(patch) => set({ [part]: { ...iconSpec, ...patch } })}
          />
          <Dots
            title="Icon color"
            dots={[{ key: 'auto', label: 'Auto', dot: `var(--l3-button-${node.variant ?? 'primary'}-content)` }, ...colorDots]}
            value={iconSpec.color ?? 'auto'}
            theme={theme}
            onPick={(k) => set({ [part]: { ...iconSpec, color: k === 'auto' ? undefined : (k as ColorKey) } })}
          />
          <Button variant="tertiary" size="sm" onClick={() => { set({ [part]: undefined }); onSelect(node.id) }}>
            Remove icon
          </Button>
        </Group>
      )}

      {/* ---- The label of a button ---- */}
      {node?.kind === 'button' && part === 'label' && (
        <Group>
          <Mini label="Text">
            <input className={styles.fieldInput} value={node.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
          </Mini>
          <Warn hint={labelHint(node.text ?? '')} />
          <Dots
            title="Label color"
            dots={[{ key: 'auto', label: 'Auto', dot: `var(--l3-button-${node.variant ?? 'primary'}-content)` }, ...colorDots]}
            value={node.labelColor ?? 'auto'}
            theme={theme}
            onPick={(k) => set({ labelColor: k === 'auto' ? undefined : (k as ColorKey) })}
          />
        </Group>
      )}

      {/* ---- A whole button ---- */}
      {node?.kind === 'button' && !part && (
        <>
          <Group>
            <Mini label="Label">
              <input className={styles.fieldInput} value={node.text ?? ''} onChange={(e) => set({ text: e.target.value })} />
            </Mini>
            <Warn hint={labelHint(node.text ?? '')} />
            <Dots
              title="Style"
              dots={variantOptions.map((o) => ({ key: o.value, label: o.label, dot: o.surface, border: o.border }))}
              value={node.variant}
              theme={theme}
              // A new style recolors the whole button: label and icons follow it again, per the Button rules.
              onPick={(k) => set({ variant: k as typeof node.variant, ...clearColors(node) })}
            />
            {node.variant && <p className={styles.hint} data-level={variantHint(node.variant, otherButtons).level}>{variantHint(node.variant, otherButtons).text}</p>}
          </Group>
          <Group>
            <div className={styles.pair}>
              <label className={styles.check}>
                <input type="checkbox" checked={!!node.iconLeft} onChange={(e) => set({ iconLeft: e.target.checked ? {} : undefined })} />
                Left icon
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={!!node.iconRight} onChange={(e) => set({ iconRight: e.target.checked ? {} : undefined })} />
                Right icon
              </label>
            </div>
            <div className={styles.pair}>
              <Segmented
                label="Button size"
                value={node.buttonSize ?? 'lg'}
                options={[{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }]}
                onChange={(buttonSize) => set({ buttonSize })}
              />
              <Segmented
                label="Button width"
                value={node.fill === false ? 'hug' : 'fill'}
                options={[{ value: 'fill', label: 'Fill' }, { value: 'hug', label: 'Hug' }]}
                onChange={(w) => set({ fill: w === 'fill' })}
              />
            </div>
            <Warn hint={sizeHint(node.buttonSize ?? 'lg', siblings)} />
          </Group>
          <More>
            {spacing}
            {(node.labelColor || node.iconLeft?.color || node.iconRight?.color) && (
              <Button variant="tertiary" size="sm" onClick={() => set(clearColors(node))}>
                Reset part colors
              </Button>
            )}
          </More>
        </>
      )}

      {/* ---- Heading / text ---- */}
      {node && (node.kind === 'heading' || node.kind === 'text') && (
        <>
          <Group>
            <div className={styles.pair}>
              <Mini label="Weight">
                <Select
                  value={node.weight ?? 'regular'}
                  options={weights}
                  format={(w) => w[0].toUpperCase() + w.slice(1)}
                  onChange={(weight: Weight) => {
                    const sizes = textSizes[weight]
                    const size = node.size ?? 14
                    set({ weight, size: sizes.includes(size) ? size : sizes[sizes.length - 1] })
                  }}
                />
              </Mini>
              <Mini label="Size">
                <Select value={node.size ?? 14} options={textSizes[node.weight ?? 'regular']} onChange={(size) => set({ size })} />
              </Mini>
            </div>
            <Segmented
              label="Text alignment"
              value={node.textAlign ?? 'left'}
              options={[
                { value: 'left', label: 'Align left', icon: msFormatAlignLeft },
                { value: 'center', label: 'Align centre', icon: msFormatAlignCenter },
                { value: 'right', label: 'Align right', icon: msFormatAlignRight },
              ]}
              onChange={(textAlign) => set({ textAlign })}
            />
            <Dots
              title="Color"
              dots={colorDots}
              value={node.color ?? (node.kind === 'heading' ? 'primary' : 'secondary')}
              theme={theme}
              onPick={(k) => set({ color: k as ColorKey })}
            />
            <p className={styles.hint} data-level="info">Type on the canvas to change the text.</p>
          </Group>
          <More>{spacing}</More>
        </>
      )}

      {/* ---- Section ---- */}
      {node?.kind === 'section' && (
        <>
          <Group>
            <Segmented
              label="Align items"
              value={node.align ?? 'stretch'}
              options={[{ value: 'stretch', label: 'Stretch' }, { value: 'start', label: 'Start' }, { value: 'center', label: 'Centre' }, { value: 'end', label: 'End' }]}
              onChange={(align) => set({ align })}
            />
            <div className={styles.pair}>
              <Mini label="Padding">
                <Select value={node.padding ?? '00'} options={steps} format={stepLabel} onChange={(padding) => set({ padding })} />
              </Mini>
              <Mini label="Gap">
                <Select value={node.gap ?? '00'} options={steps} format={stepLabel} onChange={(gap) => set({ gap })} />
              </Mini>
            </div>
            <Warn hint={spacingHint(node)?.level === 'warn' ? spacingHint(node) : null} />
            <Dots
              title="Background"
              dots={[
                { key: 'none', label: 'None', dot: 'transparent' },
                ...(['primary', 'secondary', 'tertiary'] as const).map((b) => ({ key: b, label: b[0].toUpperCase() + b.slice(1), dot: `var(--l3-surface-${b})` })),
              ]}
              value={node.background ?? 'none'}
              theme={theme}
              onPick={(k) => set({ background: k as typeof node.background })}
            />
            <div className={styles.pair}>
              <Mini label="Corner radius">
                <Select value={node.radius ?? '00'} options={radii} format={stepLabel} onChange={(radius) => set({ radius })} />
              </Mini>
              <label className={styles.check}>
                <input type="checkbox" checked={!!node.border} onChange={(e) => set({ border: e.target.checked })} />
                Border
              </label>
            </div>
          </Group>
          <More>{spacing}</More>
        </>
      )}

      {node && (
        <div className={styles.askRow}>
          <input
            className={styles.fieldInput}
            placeholder={`Ask about this ${(part ? partLabels[part] : node.name).toLowerCase()}…`}
            aria-label="Ask for something else"
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); send() } }}
          />
          <IconButton icon={msArrowUpward} label="Send" disabled={!ask.trim()} onClick={send} />
        </div>
      )}
    </aside>
  )
}
