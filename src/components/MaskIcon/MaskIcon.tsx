import type { CSSProperties } from 'react'
import styles from './MaskIcon.module.css'

/**
 * Renders a Figma-exported SVG as a CSS mask so it takes `currentColor`
 * (the SVGs ship with fixed fills, which would ignore the theme).
 * Fills its parent — the parent decides the size.
 */
export function MaskIcon({ src, className }: { src: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={[styles.maskIcon, className].filter(Boolean).join(' ')}
      style={{ '--mask-src': `url("${src}")` } as CSSProperties}
    />
  )
}
