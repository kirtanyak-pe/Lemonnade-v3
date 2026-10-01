import { useEffect, type HTMLAttributes, type ReactNode } from 'react'
import { ChevronDownIcon, PlaceholderIcon } from '../icons'
import styles from './Tag.module.css'

/** Figma "L3: Tags" (node 4464:27218). Figma's Type=Tertiory is `tertiary` here. */
export type TagVariant = 'primary' | 'secondary' | 'tertiary'
/**
 * Figma Color. `profit` / `loss` use the indicator/up·down tokens (price moves, P&L); `success` / `error` are
 * outcomes (order placed, failed); `processing` is in-progress (orange).
 */
export type TagColor =
  | 'neutral' | 'profit' | 'loss' | 'success' | 'error' | 'warning' | 'discover' | 'processing'
  | 'indigo' | 'teal' | 'purple' | 'zing'
/** v1 names, still accepted: green → success, red → error, yellow → warning, orange → processing. */
export type TagLegacyColor = 'green' | 'red' | 'yellow' | 'orange'

const legacyColors: Record<TagLegacyColor, TagColor> = { green: 'success', red: 'error', yellow: 'warning', orange: 'processing' }
export type TagSize = 'sm' | 'md' | 'lg'

export type TagProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: TagVariant
  /** @deprecated names: `green`, `red`, `yellow`, `orange` — use `success`, `error`, `warning`, `processing`. */
  color?: TagColor | TagLegacyColor
  size?: TagSize
  /** Figma Type=Disabled. Overrides variant and color. */
  disabled?: boolean
  /** Figma left "Icon leading" slot. Sized to the tag's icon size and colored with its text color. */
  iconLeft?: ReactNode
  /** Figma right "Icon leading" slot. */
  iconRight?: ReactNode
  /**
   * Figma 👁️ Label off: icon-only tag. The label (`children`) is still required and becomes the screen-reader text.
   * Needs exactly one icon.
   */
  hideLabel?: boolean
}

export function Tag({
  variant = 'primary',
  color = 'neutral',
  size = 'sm',
  disabled = false,
  iconLeft,
  iconRight,
  hideLabel = false,
  className,
  children,
  ...rest
}: TagProps) {
  const resolved = legacyColors[color as TagLegacyColor] ?? (color as TagColor)
  // Like Button: never two icons without a label — the left one wins.
  const iconOnly = hideLabel && Boolean(iconLeft || iconRight)
  const showRight = Boolean(iconRight) && !(iconOnly && iconLeft)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (hideLabel && !iconLeft && !iconRight) console.warn('[L3] <Tag hideLabel> needs an icon; showing the label instead.')
    if (hideLabel && iconLeft && iconRight) console.warn('[L3] <Tag hideLabel> shows one icon only; iconRight is ignored.')
    if (hideLabel && (children == null || children === '')) console.warn('[L3] <Tag hideLabel> still needs children: they are the screen-reader text.')
  }, [hideLabel, iconLeft, iconRight, children])

  return (
    <span
      {...rest}
      className={[styles.tag, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-color={resolved}
      data-size={size}
      data-disabled={disabled || undefined}
      data-icon-only={iconOnly || undefined}
    >
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      {children != null && (
        <span className={iconOnly ? styles.srOnly : styles.label}>
          <span className={styles.labelText}>{children}</span>
        </span>
      )}
      {showRight && <span className={styles.icon}>{iconRight}</span>}
    </span>
  )
}

/** Figma's default left icon (placeholder, blur_on). */
export const TagPlaceholderIcon = PlaceholderIcon

/** Figma's default right icon (expand_more — the same glyph as keyboard_arrow_down in Material Symbols). */
export const TagChevronIcon = ChevronDownIcon
