import { useEffect, useRef, type InputHTMLAttributes } from 'react'
import styles from './Checkbox.module.css'

/** Figma "D2: Radio button & check box" (node 4543:65366), isRadio=False. */
export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Figma State=Intermediate — the "some selected" dash. */
  indeterminate?: boolean
}

/** Native checkbox — give it an accessible name (`aria-label`, or a <label>). */
export function Checkbox({ indeterminate = false, className, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)

  // `indeterminate` is a DOM property only; there is no HTML attribute for it.
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <span className={[styles.control, className].filter(Boolean).join(' ')} data-kind="checkbox">
      <input {...rest} ref={ref} type="checkbox" className={styles.input} />
      <span className={styles.box} aria-hidden="true" />
    </span>
  )
}

/** Figma "D2: Radio button & check box", isRadio=True. Group radios with a shared `name`. */
export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>

export function Radio({ className, ...rest }: RadioProps) {
  return (
    <span className={[styles.control, className].filter(Boolean).join(' ')} data-kind="radio">
      <input {...rest} type="radio" className={styles.input} />
      <span className={styles.box} aria-hidden="true" />
    </span>
  )
}
