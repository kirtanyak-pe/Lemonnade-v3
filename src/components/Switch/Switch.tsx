import { forwardRef, useRef, type InputHTMLAttributes } from 'react'
import { useAccessibleNameWarning } from '../a11y'
import { useMergedRefs } from '../refs'
import styles from './Switch.module.css'

/** Figma "L3→ Toggle switch" (node 4543:65343). Figma isSmall=True is `size="sm"`. */
export type SwitchSize = 'md' | 'sm'

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> & {
  size?: SwitchSize
}

/**
 * Native checkbox with role="switch" — keyboard, forms and labels work as usual.
 * Give it an accessible name (`aria-label`, or wrap/point a <label> at it).
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ size = 'md', className, ...rest }, forwardedRef) {
  const ref = useRef<HTMLInputElement>(null)
  const mergedRef = useMergedRefs(ref, forwardedRef)
  useAccessibleNameWarning(ref, 'Switch')
  return (
    <span className={[styles.switch, className].filter(Boolean).join(' ')} data-size={size}>
      <input {...rest} ref={mergedRef} type="checkbox" role="switch" className={styles.input} />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </span>
  )
})
