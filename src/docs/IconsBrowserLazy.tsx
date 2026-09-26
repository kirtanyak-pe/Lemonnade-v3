import { lazy, Suspense } from 'react'
import styles from './Docs.module.css'

// The icon browser lists ~6.5k SVGs, so it only loads when its page is opened.
const IconsBrowser = lazy(() => import('../preview/IconsBrowser').then((m) => ({ default: m.IconsBrowser })))

export function IconsBrowserLazy() {
  return (
    <Suspense fallback={<p className={styles.lede}>Loading icons…</p>}>
      <IconsBrowser />
    </Suspense>
  )
}
