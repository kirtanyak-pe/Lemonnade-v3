import { useDeferredValue, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import type { Mode, Product } from '../tokens/themes'
import type { Dot, Hint, IconSpec } from './design'
import type { IconCatalog } from './useIconCatalog'
import styles from './Build.module.css'

export type Theme = { product: Product; mode: Mode }

/* ---- Small controls ------------------------------------------------------------------------------------ */

export function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className={styles.group} aria-label={title}>
      {children}
    </section>
  )
}

/** A label above a control; two of these sit side by side in a `pair`. */
export function Mini({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className={styles.mini}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

/** Only warnings interrupt; plain guidance is shown where the rule is chosen (style) and nowhere else. */
export function Warn({ hint }: { hint: Hint | null }) {
  return hint && hint.level === 'warn' ? <p className={styles.hint} data-level="warn">{hint.text}</p> : null
}

export function Select<T extends string | number>({ value, options, onChange, format }: {
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

export function Segmented<T extends string>({ label, value, options, onChange }: {
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


/**
 * A row of color dots. The chosen name sits in the title, so the dots need no captions. Each dot carries the canvas
 * theme, so it shows the color the design will actually use.
 */
export function Dots({ title, dots, value, theme, onPick }: {
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

/** Rarely needed options stay folded away, so the box stays short. */
export function More({ children }: { children: ReactNode }) {
  return (
    <details className={styles.more}>
      <summary>More</summary>
      <div className={styles.moreBody}>{children}</div>
    </details>
  )
}

/* ---- Icon picker -------------------------------------------------------------------------------------------- */

const PAGE = 30
const humanize = (name: string) => name.replaceAll('_', ' ')

export function IconPicker({ spec, fallback, catalog, onPick }: {
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

