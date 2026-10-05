import type { ReactNode } from 'react'
import { productLabels, productModes, products } from '../tokens'
import styles from './Docs.module.css'

// Every product × mode the tokens define (CS Pro is dark only), then the same set in ♿ Accessible contrast.
const base = products.flatMap((product) => productModes[product].map((mode) => ({ product, mode, accessible: false })))
const themes = [...base, ...base.map((t) => ({ ...t, accessible: true }))]

/**
 * Renders the same content once per theme. Themes are selected by data-product / data-mode / data-contrast
 * attributes (generated/themes.css), so a wrapper re-themes everything inside it.
 */
export function ThemesGrid({ render }: { render: () => ReactNode }) {
  return (
    <div className={styles.themesGrid}>
      {themes.map(({ product, mode, accessible }) => (
        <figure
          key={`${product}-${mode}-${accessible}`}
          className={styles.themeCell}
          data-product={product}
          data-mode={mode}
          data-contrast={accessible ? 'accessible' : undefined}
        >
          <figcaption>
            {accessible && '♿ '}{productLabels[product]} · {mode === 'light' ? 'Light' : 'Dark'}{accessible && ' · Accessible'}
          </figcaption>
          <div className={styles.themeCanvas}>{render()}</div>
        </figure>
      ))}
    </div>
  )
}
