import { useId, type ReactNode } from 'react'
import { Icon } from '../Icon'
import { msAdd, msRemove } from '../icons/glyphs'
import styles from './Stepper.module.css'

export type StepperSize = 'sm' | 'lg'

export type StepperProps = {
  value: number
  onChange: (value: number) => void
  /** Lowest value; the − button is disabled at it. */
  min?: number
  /** Highest value; the + button is disabled at it. */
  max?: number
  /** Amount each tap adds or removes (e.g. the lot size). Default 1. */
  step?: number
  /** Figma Size: Small (inline in order-pad rows) or Large (standalone, with an optional sublabel). */
  size?: StepperSize
  /** Large only: a line under the value, e.g. "91 Lots". */
  sublabel?: ReactNode
  /** How the value is shown. Default: the number with Indian grouping. */
  format?: (value: number) => string
  /** Accessible name of the whole control, e.g. "Quantity". */
  label: string
  disabled?: boolean
  className?: string
}

const indian = new Intl.NumberFormat('en-IN')

/**
 * L3 Stepper (Figma L3: Stepper): a number with − / + buttons, for quantity and lots.
 * The buttons disable themselves at `min` / `max` (Figma .L3: Stepper button State=Disabled).
 */
export function Stepper({ value, onChange, min = 0, max = Infinity, step = 1, size = 'sm', sublabel, format = (v) => indian.format(v), label, disabled, className }: StepperProps) {
  const id = useId()
  const atMin = disabled || value - step < min
  const atMax = disabled || value + step > max
  const set = (next: number) => onChange(Math.min(max, Math.max(min, next)))

  return (
    <div role="group" aria-label={label} className={[styles.stepper, className].filter(Boolean).join(' ')} data-size={size}>
      <button type="button" className={styles.button} aria-label={`Decrease ${label.toLowerCase()}`} aria-controls={id} disabled={atMin} onClick={() => set(value - step)}>
        <Icon icon={msRemove} size={size === 'lg' ? 24 : 16} />
      </button>
      <span className={styles.value}>
        <output id={id} aria-live="polite" className={styles.number}>{format(value)}</output>
        {size === 'lg' && sublabel ? <span className={styles.sublabel}>{sublabel}</span> : null}
      </span>
      <button type="button" className={styles.button} aria-label={`Increase ${label.toLowerCase()}`} aria-controls={id} disabled={atMax} onClick={() => set(value + step)}>
        <Icon icon={msAdd} size={size === 'lg' ? 24 : 16} />
      </button>
    </div>
  )
}
