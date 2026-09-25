import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Tabs.module.css'

/** Figma "L3: base tab" (node 4543:65889). Figma isChip → `appearance="pill"`, isSmall → `size="sm"`. */
export type TabAppearance = 'underline' | 'pill'
/** Figma isPrimary: how a selected pill looks — filled (primary) or outlined (secondary). Underline tabs are always primary. */
export type TabEmphasis = 'primary' | 'secondary'
export type TabSize = 'md' | 'sm'

export type TabProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role'> & {
  selected?: boolean
  appearance?: TabAppearance
  emphasis?: TabEmphasis
  size?: TabSize
  /** Figma "Icon - l" slot (16px). */
  iconLeft?: ReactNode
  /** Figma "Icon - r" slot (16px). */
  iconRight?: ReactNode
  children: string
}

/** A single tab. Use inside <Tabs>, which provides the tablist, selection and keyboard handling. */
export function Tab({
  selected = false,
  appearance = 'underline',
  emphasis = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  className,
  children,
  ...rest
}: TabProps) {
  return (
    <button
      type="button"
      {...rest}
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={[styles.tab, className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      data-emphasis={emphasis}
      data-size={size}
    >
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      <span className={styles.label}>
        {/* data-label reserves the bold (selected) width so tabs don't shift when selection changes. */}
        <span className={styles.labelText} data-label={children}>{children}</span>
      </span>
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
      {selected && appearance === 'underline' && <span className={styles.indicator} aria-hidden="true" />}
    </button>
  )
}
