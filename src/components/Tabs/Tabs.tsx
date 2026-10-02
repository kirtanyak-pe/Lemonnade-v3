import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Tab, type TabEmphasis, type TabSize } from './Tab.tsx'
import styles from './Tabs.module.css'

export type TabItem<V extends string = string> = {
  value: V
  label: string
  iconLeft?: ReactNode
  iconRight?: ReactNode
  /** Chip (pill) tabs: second line under the label (Figma 👁️ Sub label). */
  subLabel?: string
  /** Icon-only tab (Figma 👁️ Label off); `label` stays as its accessible name. Needs one icon. */
  hideLabel?: boolean
}

/**
 * Figma "L3: Tabs group" (node 4543:65938). Figma Type → `appearance`:
 * Flat tabs → `underline` · Pill tabs → `pill` · Pill group → `pill-group`.
 */
export type TabsProps<V extends string = string> = {
  items: TabItem<V>[]
  value: V
  onChange: (value: V) => void
  /**
   * `underline`: sections of a screen. `pill`: a row of filter chips.
   * `pill-group`: 2–4 options in a shared track for switching views (Tree / List); its pills are always tertiary.
   */
  appearance?: 'underline' | 'pill' | 'pill-group'
  /** `pill` only (Figma base tab Type): the chip style for the whole row — primary, secondary or tertiary. */
  emphasis?: TabEmphasis
  size?: TabSize
  /** Accessible name for the tab list, e.g. "Portfolio sections". */
  'aria-label': string
  /** Prefix for tab/panel ids so a panel can use aria-labelledby={`${idPrefix}-tab-${value}`}. */
  idPrefix?: string
  className?: string
}

/**
 * Tab bar. Scrolls horizontally when tabs overflow (mobile), keeps the selected tab
 * in view, and supports arrow / Home / End keys with automatic activation.
 */
export function Tabs<V extends string>({
  items,
  value,
  onChange,
  appearance = 'underline',
  emphasis = 'primary',
  size = 'md',
  idPrefix,
  className,
  'aria-label': ariaLabel,
}: TabsProps<V>) {
  const listRef = useRef<HTMLDivElement>(null)
  // Pill group = tertiary pills inside a surface/secondary track (Figma Type=Pill group).
  const tabAppearance = appearance === 'underline' ? 'underline' : 'pill'
  const tabEmphasis = appearance === 'pill-group' ? 'tertiary' : emphasis

  // Keep the selected tab visible inside the scrolling row (scrolls the row only, never the page).
  useEffect(() => {
    const list = listRef.current
    const tab = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!list || !tab) return
    const start = tab.offsetLeft
    const end = start + tab.offsetWidth
    if (start < list.scrollLeft) list.scrollTo({ left: start })
    else if (end > list.scrollLeft + list.clientWidth) list.scrollTo({ left: end - list.clientWidth })
  }, [value])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = items.findIndex((t) => t.value === value)
    const next =
      e.key === 'ArrowRight' ? (i + 1) % items.length
      : e.key === 'ArrowLeft' ? (i - 1 + items.length) % items.length
      : e.key === 'Home' ? 0
      : e.key === 'End' ? items.length - 1
      : -1
    if (next < 0) return
    e.preventDefault()
    onChange(items[next].value)
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className={[styles.tabs, className].filter(Boolean).join(' ')}
      data-appearance={appearance}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => (
        <Tab
          key={item.value}
          id={idPrefix ? `${idPrefix}-tab-${item.value}` : undefined}
          aria-controls={idPrefix ? `${idPrefix}-panel-${item.value}` : undefined}
          selected={item.value === value}
          appearance={tabAppearance}
          emphasis={tabEmphasis}
          size={size}
          iconLeft={item.iconLeft}
          iconRight={item.iconRight}
          subLabel={item.subLabel}
          hideLabel={item.hideLabel}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Tab>
      ))}
    </div>
  )
}
