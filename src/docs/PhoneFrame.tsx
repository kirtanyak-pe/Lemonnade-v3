import type { ReactNode } from 'react'
import styles from './Docs.module.css'

/** Mobile device frame on a patterned stage — these components are built for phone viewports. */
export function PhoneFrame({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className={styles.stage} role="figure" aria-label={label}>
      <div className={styles.phone}>
        <div className={styles.phoneNotch} aria-hidden="true" />
        <div className={styles.phoneScreen}>{children}</div>
      </div>
    </div>
  )
}
