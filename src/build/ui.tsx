import { useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { Icon } from '../components/Icon'
import styles from './Build.module.css'

/** Icon-only button: a name is required. `pressed` makes it a two-state toggle (default / selected). */
export function IconButton({ icon, label, onClick, disabled, pressed }: { icon: string; label: string; onClick?: () => void; disabled?: boolean; pressed?: boolean }) {
  return (
    <button type="button" className={styles.iconButton} aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} disabled={disabled}>
      <Icon icon={icon} size={20} />
    </button>
  )
}

/**
 * Drag handle on the edge of a panel. `side` is where the panel sits: `start` = the panel is on the left of the handle
 * (dragging right makes it wider), `end` = on the right. Focus it and use ←/→ (Shift = bigger steps), Home/End;
 * double-click resets.
 */
export function Splitter({ label, side, value, min, max, onChange, onReset, onResizing, className }: {
  label: string
  side: 'start' | 'end'
  value: number
  min: number
  max: number
  onChange: (width: number) => void
  onReset: () => void
  onResizing: (resizing: boolean) => void
  className?: string
}) {
  const start = useRef<{ x: number; width: number } | null>(null)
  const dir = side === 'start' ? 1 : -1
  const clamp = (w: number) => Math.round(Math.min(max, Math.max(min, w)))

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { x: e.clientX, width: value }
    onResizing(true)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!start.current) return
    onChange(clamp(start.current.width + (e.clientX - start.current.x) * dir))
  }
  const stop = () => {
    if (!start.current) return
    start.current = null
    onResizing(false)
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 64 : 16
    const next =
      e.key === 'ArrowRight' ? value + step * dir
      : e.key === 'ArrowLeft' ? value - step * dir
      : e.key === 'Home' ? min
      : e.key === 'End' ? max
      : null
    if (next === null) return
    e.preventDefault()
    onChange(clamp(next))
  }

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      title={`${label} (double-click to reset)`}
      className={`${styles.splitter} ${className ?? ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onKeyDown={onKeyDown}
      onDoubleClick={onReset}
    />
  )
}
