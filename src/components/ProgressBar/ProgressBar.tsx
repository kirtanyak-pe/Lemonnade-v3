import type { CSSProperties } from 'react'
import styles from './ProgressBar.module.css'

export type ProgressStatus = 'default' | 'success' | 'warning' | 'error'

export type ProgressBarProps = {
  /** 0–100. Figma steps in 10s; code takes any value. */
  value: number
  /** Figma Type: `progress` (a fill on a track) or `range` (a marker on a track, e.g. the 24H low/high). */
  type?: 'progress' | 'range'
  /** Figma Size: Small (4px bar) · Medium (8px bar). */
  size?: 'sm' | 'md'
  /** Figma Status: Default (discover) · Success · Warning (near a limit) · Error (over a limit). */
  status?: ProgressStatus
  /** Accessible name, e.g. "Margin used". Always show the value as text nearby too. */
  label: string
  /** What screen readers announce, e.g. "₹3,42,000 of ₹5,00,000". Defaults to the percentage. */
  valueText?: string
  className?: string
}

/**
 * L3 Progress bar (Figma L3: Progress bar). Progress = role="progressbar"; Range = role="meter" (a position, not progress).
 * Colour is never the only signal: pair it with the value as text.
 */
export function ProgressBar({ value, type = 'progress', size = 'sm', status = 'default', label, valueText, className }: ProgressBarProps) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <div
      role={type === 'range' ? 'meter' : 'progressbar'}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-valuetext={valueText}
      className={[styles.bar, className].filter(Boolean).join(' ')}
      data-type={type}
      data-size={size}
      data-status={status}
      style={{ '--pb-value': `${v}%` } as CSSProperties}
    >
      <span className={styles.track} />
      {type === 'range' ? <span className={styles.marker} /> : <span className={styles.fill} />}
    </div>
  )
}
