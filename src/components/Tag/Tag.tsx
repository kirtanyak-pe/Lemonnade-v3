import type { HTMLAttributes, ReactNode } from 'react'
import { ChevronDownIcon, PlaceholderIcon } from '../icons'
import styles from './Tag.module.css'

/** Figma "L3: Tags" (node 4464:27218). Figma's Type=Tertiory is `tertiary` here. */
export type TagVariant = 'primary' | 'secondary' | 'tertiary'
export type TagColor = 'neutral' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo' | 'teal' | 'discover' | 'orange'
export type TagSize = 'sm' | 'md' | 'lg'

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant
  color?: TagColor
  size?: TagSize
  /** Figma Type=Disabled. Overrides variant and color. */
  disabled?: boolean
  /** Figma left "Icon leading" slot. Sized to the tag's icon size and colored with its text color. */
  iconLeft?: ReactNode
  /** Figma right "Icon leading" slot. */
  iconRight?: ReactNode
}

export function Tag({
  variant = 'primary',
  color = 'neutral',
  size = 'sm',
  disabled = false,
  iconLeft,
  iconRight,
  className,
  children,
  ...rest
}: TagProps) {
  return (
    <span
      {...rest}
      className={[styles.tag, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-color={color}
      data-size={size}
      data-disabled={disabled || undefined}
    >
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      {children != null && (
        <span className={styles.label}>
          <span className={styles.labelText}>{children}</span>
        </span>
      )}
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
    </span>
  )
}

/** Figma's default left icon (placeholder, blur_on). */
export const TagPlaceholderIcon = PlaceholderIcon

/** Figma's default right icon (keyboard_arrow_down). */
export const TagChevronIcon = ChevronDownIcon
