import type { CSSProperties } from 'react'
import placeholder from './assets/icon-placeholder.svg'
import arrowRight from './assets/icon-arrow-right.svg'
import styles from './Button.module.css'

/**
 * Renders a Figma-exported SVG as a CSS mask so it takes `currentColor`
 * (the SVGs ship with fixed fills, which would ignore the theme).
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

/** Figma's default icon-l (placeholder grid). */
export const PlaceholderIcon = () => <MaskIcon src={placeholder} />

/** Figma's default icon-r (arrow). */
export const ArrowRightIcon = () => <MaskIcon src={arrowRight} />
