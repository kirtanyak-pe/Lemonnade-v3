import type { CSSProperties } from 'react'
import styles from './Icon.module.css'

/** Sizes from the Figma "ℹ️ L3 → Icon size" collection (--l3-icon-size-*). */
export type IconSize = 12 | 14 | 16 | 18 | 20 | 22 | 24

export type IconProps = {
  /** A Material Symbols import, e.g. `import { msSearch } from '../icons/material'`. */
  icon: string
  size?: IconSize
  /** Give meaningful icons a name ("Search"); leave it out for decorative ones (hidden from screen readers). */
  label?: string
  className?: string
}

/**
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24) as a mask, so it takes the current
 * text colour — set `color` (ideally a token) on it or a parent to recolour.
 */
export function Icon({ icon, size = 24, label, className }: IconProps) {
  return (
    <span
      className={[styles.icon, className].filter(Boolean).join(' ')}
      style={{ '--icon-src': `url("${icon}")`, '--icon-size': `var(--l3-icon-size-${size})` } as CSSProperties}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  )
}
