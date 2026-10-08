import type { CSSProperties } from 'react'
import styles from './Skeleton.module.css'

export type SkeletonShape = 'line' | 'circle' | 'box'

export type SkeletonProps = {
  /** Figma Shape: Line (a line of text) · Circle (icon, avatar) · Box (image, chart, button). */
  shape?: SkeletonShape
  /** CSS width, ideally a token (e.g. `var(--l3-size-96)`) or a %. Lines default to 100%. */
  width?: string
  /** Line: the text's line height (12 · 16 · 20, default 16). Circle: the diameter (default 32). Box: default 80. */
  height?: string
  /** Figma isOnGrey: use on grey cards and panels (surface/secondary) so it stays visible. */
  onGrey?: boolean
  className?: string
}

const defaults: Record<SkeletonShape, { width: string; height: string }> = {
  line: { width: '100%', height: 'var(--l3-size-16)' },
  circle: { width: 'var(--l3-size-32)', height: 'var(--l3-size-32)' },
  box: { width: '100%', height: 'var(--l3-size-80)' },
}

/**
 * L3 Skeleton (Figma L3: Skeleton): a loading placeholder that mirrors the real layout.
 * Decorative: hidden from screen readers — mark the loading region with `aria-busy="true"` and give it a name.
 * Shimmers; stays still when the user prefers reduced motion.
 */
export function Skeleton({ shape = 'line', width, height, onGrey = false, className }: SkeletonProps) {
  const d = defaults[shape]
  const w = width ?? (shape === 'circle' ? height ?? d.width : d.width)
  const h = height ?? d.height
  return (
    <span
      aria-hidden
      className={[styles.skeleton, className].filter(Boolean).join(' ')}
      data-shape={shape}
      data-on-grey={onGrey || undefined}
      style={{ '--sk-w': w, '--sk-h': h } as CSSProperties}
    />
  )
}

/** Figma L3: Skeleton pattern Type=List row — matches L3 ListCell (58px): icon, two lines, a value. */
export function SkeletonListRow({ onGrey }: { onGrey?: boolean }) {
  return (
    <span className={styles.listRow} aria-hidden>
      <Skeleton shape="circle" height="var(--l3-size-20)" onGrey={onGrey} />
      <span className={styles.lines}>
        <Skeleton width="var(--l3-size-96)" onGrey={onGrey} />
        <Skeleton width="var(--l3-size-128)" onGrey={onGrey} />
      </span>
      <Skeleton width="var(--l3-size-48)" onGrey={onGrey} />
    </span>
  )
}

/** Figma L3: Skeleton pattern Type=Card — a static card with a heading line and two body lines. */
export function SkeletonCard() {
  return (
    <span className={styles.card} aria-hidden>
      <Skeleton height="var(--l3-size-20)" width="45%" />
      <Skeleton width="75%" />
      <Skeleton width="55%" />
    </span>
  )
}
