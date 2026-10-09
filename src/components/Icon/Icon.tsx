import type { CSSProperties } from 'react'
import styles from './Icon.module.css'

/** Sizes from the Figma "ℹ️ L3 → Icon size" collection (--l3-icon-size-*). */
export type IconSize = 12 | 14 | 16 | 18 | 20 | 22 | 24

/**
 * The SVG to show: a string (a data URI from `npm run glyphs -- --pick`, or a URL — what an .svg import gives in Vite
 * and Create React App) or an object with `src` (what an .svg import gives in Next.js). A URL on another domain needs
 * CORS headers, because CSS masks load with CORS.
 */
export type IconSource = string | { src: string }

export type IconProps = {
  /** e.g. `import { msSearch } from '../icons/material'` (docs, Vite) or a string from `npm run glyphs -- --pick search`. */
  icon: IconSource
  size?: IconSize
  /** Give meaningful icons a name ("Search"); leave it out for decorative ones (hidden from screen readers). */
  label?: string
  className?: string
}

/**
 * Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24) as a mask, so it takes the current
 * text color — set `color` (ideally a token) on it or a parent to recolor.
 */
export function Icon({ icon, size = 24, label, className }: IconProps) {
  return (
    <span
      className={[styles.icon, className].filter(Boolean).join(' ')}
      style={{ '--icon-src': `url("${typeof icon === 'string' ? icon : icon.src}")`, '--icon-size': `var(--l3-icon-size-${size})` } as CSSProperties}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    />
  )
}
