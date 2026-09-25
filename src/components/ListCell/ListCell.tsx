import type { ReactNode } from 'react'
import styles from './ListCell.module.css'

/** Figma "L3: list cell" (node 4543:65400). isSmall → `size="sm"`, isPlain=False → `variant="card"`. */
export type ListCellProps = {
  /** Figma "Label goes here". */
  label: ReactNode
  /** Figma "Type description" (👁️ description). */
  description?: ReactNode
  size?: 'md' | 'sm'
  /** Figma isPlain: flat row (plain) or bordered, rounded card. */
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
  /**
   * What the row is. `button` / `a` make the whole row tappable (with press feedback);
   * `label` lets a Switch or Checkbox in `trailing` toggle from anywhere on the row.
   */
  as?: 'div' | 'button' | 'a' | 'label'
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
  as,
  href,
  onClick,
  className,
}: ListCellProps) {
  const Element = as ?? (href ? 'a' : onClick ? 'button' : 'div')
  const interactive = Element !== 'div'

  return (
    <Element
      className={[styles.cell, className].filter(Boolean).join(' ')}
      data-size={size}
      data-variant={variant}
      data-interactive={interactive || undefined}
      {...(Element === 'button' ? { type: 'button' as const } : {})}
      {...(Element === 'a' ? { href } : {})}
      onClick={onClick}
    >
      {iconLeft && (
        <span className={styles.icon}>
          {iconLeft}
          {dotLeft && <span className={styles.dot} aria-hidden="true" />}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.label}>{label}</span>
        {description && <span className={styles.description}>{description}</span>}
      </span>
      {trailing && <span className={styles.trailing}>{trailing}</span>}
      {iconRight && (
        <span className={styles.icon}>
          {iconRight}
          {dotRight && <span className={styles.dot} aria-hidden="true" />}
        </span>
      )}
    </Element>
  )
}
