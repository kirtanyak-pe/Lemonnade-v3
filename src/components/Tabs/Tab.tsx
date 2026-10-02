import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import styles from './Tabs.module.css'

/** Figma "L3: base tab" (node 4543:65889). Figma isPill → `appearance="pill"`, Type → `emphasis`, isSmall → `size="sm"`. */
export type TabAppearance = 'underline' | 'pill'
/**
 * Figma Type: the chip style of a whole row (never mix styles in one row). Underline tabs are always primary.
 * primary — selected black fill · unselected light border
 * secondary — selected dark outline · unselected light border
 * tertiary — selected black fill · unselected subtle fill, no border
 */
export type TabEmphasis = 'primary' | 'secondary' | 'tertiary'
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
  /** Figma 👁️ Sub label: a second line under the label (8/10). Chip (pill) tabs only. */
  subLabel?: string
  /**
   * Figma 👁️ Label off: icon-only tab. The label (`children`) stays as the accessible name.
   * Needs exactly one icon — with two, only the left one shows.
   */
  hideLabel?: boolean
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
  subLabel,
  hideLabel = false,
  className,
  children,
  ...rest
}: TabProps) {
  const iconOnly = hideLabel && Boolean(iconLeft || iconRight)
  const showRight = Boolean(iconRight) && !(iconOnly && iconLeft)
  const showSub = Boolean(subLabel) && appearance === 'pill' && !iconOnly

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (hideLabel && !iconLeft && !iconRight) console.warn(`[L3] <Tab hideLabel> "${children}" needs an icon; showing the label instead.`)
    if (hideLabel && iconLeft && iconRight) console.warn(`[L3] <Tab hideLabel> "${children}" shows one icon only; iconRight is ignored.`)
    if (subLabel && appearance !== 'pill') console.warn(`[L3] <Tab subLabel> is for chip (pill) tabs only; ignored on underline tabs.`)
  }, [hideLabel, iconLeft, iconRight, subLabel, appearance, children])

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
      data-sub-label={showSub || undefined}
      data-icon-only={iconOnly || undefined}
      aria-label={iconOnly ? children : rest['aria-label']}
    >
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      {!iconOnly && (
        <span className={styles.label}>
          {/* data-label reserves the bold (selected) width so tabs don't shift when selection changes. */}
          <span className={styles.labelText} data-label={children}>{children}</span>
          {showSub && <span className={styles.subLabel}>{subLabel}</span>}
        </span>
      )}
      {showRight && <span className={styles.icon}>{iconRight}</span>}
      {selected && appearance === 'underline' && <span className={styles.indicator} aria-hidden="true" />}
    </button>
  )
}
