import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import styles from './SegmentedControl.module.css'

export type SegmentedSize = 'md' | 'sm'

export type SegmentItem<V extends string = string> = {
  value: V
  label: string
  /** Figma "Icon - l" slot (16px). */
  iconLeft?: ReactNode
  /** Figma "Icon - r" slot (16px). */
  iconRight?: ReactNode
  /** Figma 👁️ Label off: icon-only segment. `label` stays as its accessible name. Needs one icon. */
  hideLabel?: boolean
}

/** Figma "L3: Segmented control" (node 5147:16270) with "L3: base segment" items (node 5147:5445). */
export type SegmentedControlProps<V extends string = string> = {
  /** 2–4 options. */
  items: SegmentItem<V>[]
  value: V
  onChange: (value: V) => void
  /** Figma isSmall: segments 32 (md) or 24 (sm) tall. */
  size?: SegmentedSize
  /** Stretch to the container and split it into equal segments (common on phones). */
  fullWidth?: boolean
  /** Accessible name for the group, e.g. "Color roles view". */
  'aria-label': string
  className?: string
}

/**
 * Switch between 2–4 views of the same content. Single-select, one option always selected, never scrolls.
 * A radio group: arrow keys move and select, Tab enters and leaves the group.
 */
export function SegmentedControl<V extends string>({
  items,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<V>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (items.length < 2 || items.length > 4) console.warn(`[L3] <SegmentedControl> "${ariaLabel}" has ${items.length} options; use 2–4 (chips for more).`)
    if (!items.some((i) => i.value === value)) console.warn(`[L3] <SegmentedControl> "${ariaLabel}": value "${value}" matches no option; one must always be selected.`)
  }, [items, value, ariaLabel])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = items.findIndex((t) => t.value === value)
    const next =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % items.length
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i - 1 + items.length) % items.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? items.length - 1
      : -1
    if (next < 0) return
    e.preventDefault()
    onChange(items[next].value)
    ref.current?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus()
  }

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      className={[styles.track, className].filter(Boolean).join(' ')}
      data-size={size}
      data-full-width={fullWidth || undefined}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const selected = item.value === value
        const iconOnly = Boolean(item.hideLabel && (item.iconLeft || item.iconRight))
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={styles.segment}
            data-icon-only={iconOnly || undefined}
            aria-label={iconOnly ? item.label : undefined}
            onClick={() => onChange(item.value)}
          >
            {item.iconLeft && <span className={styles.icon}>{item.iconLeft}</span>}
            {!iconOnly && <span className={styles.label}>{item.label}</span>}
            {item.iconRight && !(iconOnly && item.iconLeft) && <span className={styles.icon}>{item.iconRight}</span>}
          </button>
        )
      })}
    </div>
  )
}
