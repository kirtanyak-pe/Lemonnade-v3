import type { ReactNode } from 'react'
import { Icon } from '../Icon'
import { lmSwitchArrowVertical, msKeyboardArrowDown } from '../icons/glyphs'
import styles from './Select.module.css'

export type SelectSize = 'sm' | 'md' | 'lg'

export type SelectProps = {
  /** The current choice, e.g. "Quantity", "Gold", "Deposit & Credits". */
  children: ReactNode
  /** Opens the options — usually an L3 BottomSheet with a list of Radio rows. */
  onClick: () => void
  /** Figma Size: Small (Label/12, form rows) · Medium (Label/14, filters) · Large (Heading/14, titles). */
  size?: SelectSize
  /** Figma isSubtle: content/secondary instead of content/primary. */
  subtle?: boolean
  /** Figma ↪ Icon: `swap` (↕, toggling between a few modes) or `chevron` (a filter list). */
  icon?: 'swap' | 'chevron'
  /** Whether the options are open (sets aria-expanded). */
  expanded?: boolean
  /** Context for screen readers when the label alone isn't enough, e.g. "Order quantity in". */
  'aria-label'?: string
  className?: string
}

const iconSize = { sm: 12, md: 16, lg: 16 } as const

/**
 * L3 Select (Figma "L3: Select switcher"): an inline trigger — a label plus ↕ or ⌄ — that opens a sheet of options.
 * No box: it hugs its label and icon and sits in a row or a header. The touch area grows to size/tap-target (48 × 48)
 * without taking layout space.
 */
export function Select({ children, onClick, size = 'sm', subtle = false, icon = 'swap', expanded, 'aria-label': ariaLabel, className }: SelectProps) {
  return (
    <button
      type="button"
      className={[styles.select, className].filter(Boolean).join(' ')}
      data-size={size}
      data-subtle={subtle || undefined}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span className={styles.label}>{children}</span>
      <Icon icon={icon === 'chevron' ? msKeyboardArrowDown : lmSwitchArrowVertical} size={iconSize[size]} />
    </button>
  )
}
