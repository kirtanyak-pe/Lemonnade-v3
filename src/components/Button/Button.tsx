import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { MaskIcon } from '../MaskIcon'
import loaderTrack from './assets/loader-track.svg'
import loaderArc from './assets/loader-arc.svg'
import styles from './Button.module.css'

/** Figma "L3: Button" (node 4471:29225). */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'brand' | 'buy' | 'sell'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Figma State=♻︎ Loading: shows the loader, keeps the button's width, ignores clicks. */
  loading?: boolean
  /** Figma icon-l slot. Sized to the button's icon size and colored with its content color. */
  iconLeft?: ReactNode
  /** Figma icon-r slot. */
  iconRight?: ReactNode
  /** Stretch to the container width (Figma instances are fixed-width). */
  fullWidth?: boolean
}

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
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      {children != null && (
        <span className={styles.label}>
          <span className={styles.labelText}>{children}</span>
        </span>
      )}
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
      {state === 'loading' && (
        <span className={styles.loader} aria-hidden="true">
          <MaskIcon src={loaderTrack} />
          <MaskIcon src={loaderArc} className={styles.loaderArc} />
        </span>
      )}
    </button>
  )
}
