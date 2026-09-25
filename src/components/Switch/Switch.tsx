import type { InputHTMLAttributes } from 'react'
import styles from './Switch.module.css'

/** Figma "D2→ Toggle switch" (node 4543:65343). Figma isSmall=True is `size="sm"`. */
export type SwitchSize = 'md' | 'sm'

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: SwitchSize
}

/**
 * Native checkbox with role="switch" — keyboard, forms and labels work as usual.
 * Give it an accessible name (`aria-label`, or wrap/point a <label> at it).
 */
export function Switch({ size = 'md', className, ...rest }: SwitchProps) {
  return (
    <span className={[styles.switch, className].filter(Boolean).join(' ')} data-size={size}>
      <input {...rest} type="checkbox" role="switch" className={styles.input} />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </span>
  )
}
