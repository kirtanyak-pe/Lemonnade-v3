import { useEffect, useRef, type ReactNode } from 'react'
import styles from './ListCell.module.css'

/** Figma "L3: list cell" (node 4543:65400). isSmall → `size="sm"`, isPlain=False → `variant="card"`, isTappable → onClick / href / as="label", isSelected → `selected`. */
export type ListCellProps = {
  /** Figma "Label goes here". */
  label: ReactNode
  /** Figma "Type description" (👁️ description). */
  description?: ReactNode
  size?: 'md' | 'sm'
  /**
   * Figma isPlain: flat row (plain — no fill, edge to edge in its container) or bordered, rounded card (always inside a
   * margin, never touching its container's edges). A list cell follows the Card rules: a card row that isn't tappable is
   * a Static card (no fill + border-light); a tappable one (onClick / href / as="label") is a Clickable card
   * (surface-primary + border-light + elevation-low, press 0.98). Figma isTappable.
   */
  variant?: 'plain' | 'card'
  /** Figma Icon-L slot (24 md / 16 sm). */
  iconLeft?: ReactNode
  /** Figma Icon-R slot (24 md / 16 sm), e.g. <ChevronDownIcon />. */
  iconRight?: ReactNode
  /** Anything else on the right — a Switch, Checkbox, Tag or value text (rendered before iconRight). */
  trailing?: ReactNode
  /** Figma Dot-L / Dot-R: an unread/new dot on the left or right icon. */
  dotLeft?: boolean
  dotRight?: boolean
  /** What screen readers hear for a dot (it's otherwise only visual). */
  dotLabel?: string
  /**
   * What the row is. `button` / `a` make the whole row tappable (with press feedback);
   * `label` lets a Switch or Checkbox in `trailing` toggle from anywhere on the row.
   */
  as?: 'div' | 'button' | 'a' | 'label'
  /**
   * Figma isSelected: the chosen row in a list of choices (tappable rows only). Plain → surface/secondary background;
   * card → border/dark instead of border/light. Announced as pressed (button) or current (link); in a `label` row the
   * Radio / Checkbox carries the state.
   */
  selected?: boolean
  href?: string
  onClick?: () => void
  className?: string
}

export function ListCell({
  label,
  description,
  size = 'md',
  variant = 'plain',
  iconLeft,
  iconRight,
  trailing,
  dotLeft = false,
  dotRight = false,
  dotLabel = 'New',
  as,
  selected = false,
  href,
  onClick,
  className,
}: ListCellProps) {
  const Element = as ?? (href ? 'a' : onClick ? 'button' : 'div')
  const interactive = Element !== 'div'
  const trailingRef = useRef<HTMLSpanElement>(null)

  // A button/link row can't contain another control (invalid nesting; screen readers get confused).
  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (selected && !interactive) console.warn('[L3] <ListCell selected> needs a tappable row (onClick, href or as="label").')
    if (Element !== 'button' && Element !== 'a') return
    if (trailingRef.current?.querySelector('input, button, a, select, textarea')) {
      console.warn('[L3] <ListCell> is a button/link but `trailing` contains a control. Use as="label" (for a Switch/Checkbox) or as="div".')
    }
  })

  const dot = (
    <span className={styles.dot}>
      <span className={styles.srOnly}>{dotLabel}</span>
    </span>
  )

  return (
    <Element
      className={[styles.cell, className].filter(Boolean).join(' ')}
      data-size={size}
      data-variant={variant}
      data-interactive={interactive || undefined}
      data-selected={(interactive && selected) || undefined}
      {...(Element === 'button' ? { type: 'button' as const, 'aria-pressed': selected } : {})}
      {...(Element === 'a' ? { href, 'aria-current': selected ? ('true' as const) : undefined } : {})}
      onClick={onClick}
    >
      {iconLeft && (
        <span className={styles.icon}>
          {iconLeft}
          {dotLeft && dot}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      {trailing && <span ref={trailingRef} className={styles.trailing}>{trailing}</span>}
      {iconRight && (
        <span className={styles.icon}>
          {iconRight}
          {dotRight && dot}
        </span>
      )}
    </Element>
  )
}
