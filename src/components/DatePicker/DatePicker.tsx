import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '../Icon'
import { msChevronLeft, msChevronRight } from '../icons/glyphs'
import styles from './DatePicker.module.css'

export type DateRange = { start: Date | null; end: Date | null }

type Common = {
  /** Earliest pickable day (e.g. account opening for reports). */
  min?: Date
  /** Latest pickable day (e.g. today for reports). */
  max?: Date
  /** Month shown first. Defaults to the selected day's month, or today's. */
  initialMonth?: Date
  /** Accessible name of the calendar, e.g. "Report period". */
  label: string
  className?: string
}

export type DatePickerProps =
  | (Common & { mode?: 'single'; value: Date | null; onChange: (value: Date) => void })
  | (Common & { mode: 'range'; value: DateRange; onChange: (value: DateRange) => void })

const day0 = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const same = (a: Date | null | undefined, b: Date | null | undefined) => !!a && !!b && a.getTime() === b.getTime()
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const monthTitle = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })
const fullDate = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const WEEKDAYS = [['M', 'Monday'], ['T', 'Tuesday'], ['W', 'Wednesday'], ['T', 'Thursday'], ['F', 'Friday'], ['S', 'Saturday'], ['S', 'Sunday']] as const

/**
 * L3 Date picker (Figma L3: Date picker): a month calendar for one day (`mode="single"`) or a range (`mode="range"`).
 * Weeks start on Monday; always 6 rows so the sheet doesn't change height. Put it in an L3 BottomSheet with a ButtonGroup ("Apply").
 * Keyboard: arrows move by day / week, Home / End to the week's ends, PageUp / PageDown by month, Enter or Space picks.
 */
export function DatePicker(props: DatePickerProps) {
  const { min, max, label, className } = props
  const today = day0(new Date())
  const selected = props.mode === 'range' ? props.value.start : props.value
  const [month, setMonth] = useState(() => { const m = props.initialMonth ?? selected ?? today; return new Date(m.getFullYear(), m.getMonth(), 1) })
  const [focus, setFocus] = useState<Date>(() => day0(selected ?? today))
  const grid = useRef<HTMLDivElement>(null)

  const days = useMemo(() => {
    const offset = (month.getDay() + 6) % 7
    return Array.from({ length: 42 }, (_, i) => addDays(month, i - offset))
  }, [month])

  const disabled = (d: Date) => (min && d < day0(min)) || (max && d > day0(max)) || false
  const range = props.mode === 'range' ? props.value : null
  const stateOf = (d: Date) => {
    if (d.getMonth() !== month.getMonth()) return 'empty'
    if (disabled(d)) return 'disabled'
    if (range) {
      const { start, end } = range
      if (same(d, start) && (!end || same(start, end))) return 'selected'
      if (same(d, start)) return 'range-start'
      if (same(d, end)) return 'range-end'
      if (start && end && d > start && d < end) return 'range-middle'
    } else if (same(d, props.value as Date | null)) return 'selected'
    if (same(d, today)) return 'today'
    return 'default'
  }

  const pick = (d: Date) => {
    if (disabled(d)) return
    if (props.mode === 'range') {
      const { start, end } = props.value
      if (!start || end || d < start) props.onChange({ start: d, end: null })
      else props.onChange({ start, end: d })
    } else props.onChange(d)
  }

  const moveFocus = (d: Date) => {
    setFocus(d)
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) setMonth(new Date(d.getFullYear(), d.getMonth(), 1))
    requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-date="${d.getTime()}"]`)?.focus())
  }

  const onKey = (e: KeyboardEvent) => {
    const map: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }
    const dow = (focus.getDay() + 6) % 7
    if (e.key in map) moveFocus(addDays(focus, map[e.key]))
    else if (e.key === 'Home') moveFocus(addDays(focus, -dow))
    else if (e.key === 'End') moveFocus(addDays(focus, 6 - dow))
    else if (e.key === 'PageUp' || e.key === 'PageDown') moveFocus(new Date(focus.getFullYear(), focus.getMonth() + (e.key === 'PageUp' ? -1 : 1), Math.min(focus.getDate(), 28)))
    else return
    e.preventDefault()
  }

  const shift = (n: number) => { const m = new Date(month.getFullYear(), month.getMonth() + n, 1); setMonth(m); setFocus(m) }
  const prevOff = min && new Date(month.getFullYear(), month.getMonth(), 0) < day0(min)
  const nextOff = max && new Date(month.getFullYear(), month.getMonth() + 1, 1) > day0(max)
  const focusInMonth = focus.getMonth() === month.getMonth() ? focus : month

  return (
    <div className={[styles.picker, className].filter(Boolean).join(' ')}>
      <div className={styles.header}>
        <button type="button" className={styles.nav} aria-label="Previous month" disabled={prevOff} onClick={() => shift(-1)}><Icon icon={msChevronLeft} /></button>
        <h2 className={styles.month} aria-live="polite">{monthTitle.format(month)}</h2>
        <button type="button" className={styles.nav} aria-label="Next month" disabled={nextOff} onClick={() => shift(1)}><Icon icon={msChevronRight} /></button>
      </div>
      <div role="grid" aria-label={`${label}, ${monthTitle.format(month)}`} ref={grid} onKeyDown={onKey} className={styles.grid}>
        <div role="row" className={styles.row}>
          {WEEKDAYS.map(([s, full]) => <span key={full} role="columnheader" aria-label={full} className={styles.weekday}>{s}</span>)}
        </div>
        {Array.from({ length: 6 }, (_, r) => (
          <div role="row" key={r} className={styles.row}>
            {days.slice(r * 7, r * 7 + 7).map((d) => {
              const state = stateOf(d)
              if (state === 'empty') return <span key={d.getTime()} role="gridcell" className={styles.cell} data-state="empty" />
              const isSel = state === 'selected' || state === 'range-start' || state === 'range-end' || state === 'range-middle'
              return (
                <span key={d.getTime()} role="gridcell" aria-selected={isSel} className={styles.cell} data-state={state}>
                  <button
                    type="button"
                    data-date={d.getTime()}
                    className={styles.day}
                    tabIndex={same(d, focusInMonth) ? 0 : -1}
                    aria-label={fullDate.format(d)}
                    aria-current={same(d, today) ? 'date' : undefined}
                    aria-disabled={state === 'disabled' || undefined}
                    onClick={() => { setFocus(d); pick(d) }}
                  >
                    {d.getDate()}
                  </button>
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
