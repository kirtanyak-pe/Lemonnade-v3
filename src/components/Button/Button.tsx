import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { MaskIcon } from '../MaskIcon'
import loaderTrack from './assets/loader-track.svg'
import loaderArc from './assets/loader-arc.svg'
import styles from './Button.module.css'

/** Figma "L3: Button" (node 4471:29225). */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'brand' | 'buy' | 'sell'
export type ButtonSize = 'sm' | 'md' | 'lg'

type ButtonBaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Figma State=♻︎ Loading: shows the loader, keeps the button's width, ignores clicks. */
  loading?: boolean
  /** Stretch to the container width (Figma instances are fixed-width). */
  fullWidth?: boolean
}

/** Something visible as the label. */
type Label = Exclude<ReactNode, null | undefined | boolean | ''>

/**
 * Figma toggles 👁️ Label · 👁️ Icon-L · 👁️ Icon-R, with two rules:
 * at least one is visible, and with the label hidden exactly one icon is shown (never both).
 */
type ButtonContent =
  /** Label, with an optional icon on either or both sides. */
  | { children: Label; iconLeft?: ReactNode; iconRight?: ReactNode }
  /** Icon-only (left slot): needs an accessible name. */
  | { children?: never; iconLeft: ReactNode; iconRight?: never; 'aria-label': string }
  /** Icon-only (right slot): needs an accessible name. */
  | { children?: never; iconLeft?: never; iconRight: ReactNode; 'aria-label': string }

export type ButtonProps = ButtonBaseProps & ButtonContent

const isVisible = (node: ReactNode) => node != null && node !== false && node !== ''

export function Button({
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  type = 'button',
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const state = disabled ? 'disabled' : loading ? 'loading' : 'default'
  const hasLabel = isVisible(children)
  // Icon-only buttons show exactly one icon (the left one wins if both are passed).
  const showLeft = isVisible(iconLeft)
  const showRight = isVisible(iconRight) && (hasLabel || !showLeft)
  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label']

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (!hasLabel && !isVisible(iconLeft) && !isVisible(iconRight)) {
      console.warn('[L3] <Button> has no label and no icon. Show at least one of label, iconLeft, iconRight.')
    } else if (!hasLabel && isVisible(iconLeft) && isVisible(iconRight)) {
      console.warn('[L3] <Button> is icon-only with two icons. Icon-only buttons show exactly one icon; iconRight is ignored.')
    }
    if (!hasLabel && !ariaLabel) console.warn('[L3] Icon-only <Button> needs an aria-label.')
  }, [hasLabel, iconLeft, iconRight, ariaLabel])

  return (
    <button
      {...rest}
      type={type}
      className={[styles.button, fullWidth && styles.fullWidth, className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
      data-state={state}
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
    >
      {showLeft && <span className={styles.icon}>{iconLeft}</span>}
      {hasLabel && (
        <span className={styles.label}>
          <span className={styles.labelText}>{children}</span>
        </span>
      )}
      {showRight && <span className={styles.icon}>{iconRight}</span>}
      {state === 'loading' && (
        <span className={styles.loader} aria-hidden="true">
          <MaskIcon src={loaderTrack} />
          <MaskIcon src={loaderArc} className={styles.loaderArc} />
        </span>
      )}
    </button>
  )
}
