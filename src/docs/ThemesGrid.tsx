import type { ReactNode } from 'react'
import { productLabels, productModes, products } from '../tokens'
import styles from './Docs.module.css'

// Every product × mode the tokens define (CS Pro is dark only).
const themes = products.flatMap((product) => productModes[product].map((mode) => ({ product, mode })))

/**
 * Renders the same content once per theme. Themes are selected by data-product / data-mode
 * attributes (generated/themes.css), so a wrapper re-themes everything inside it.
 */
export function ThemesGrid({ render }: { render: () => ReactNode }) {
  return (
    <div className={styles.themesGrid}>
      {themes.map(({ product, mode }) => (
        <figure key={`${product}-${mode}`} className={styles.themeCell} data-product={product} data-mode={mode}>
          <figcaption>
            {productLabels[product]} · {mode === 'light' ? 'Light' : 'Dark'}
          </figcaption>
          <div className={styles.themeCanvas}>{render()}</div>
        </figure>
      ))}
    </div>
  )
}
