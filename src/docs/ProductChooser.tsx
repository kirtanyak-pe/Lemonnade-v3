import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/Button'
import { productLabels, productModes, products, type Product } from '../tokens'
import { useTheme } from '../theme'
import styles from './ProductChooser.module.css'

// First-visit picker: designers work on one product, so ask which one and theme the whole site for it.
// Shown once (remembered in localStorage); the header's brand menu changes it later.

const SEEN_KEY = 'l3-product-chosen'

const notes: Record<Product, string> = {
  lm: 'Light & dark',
  cspro: 'Dark only',
  kuber: 'Light & dark',
}

function alreadyChosen() {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return true // storage blocked: don't nag on every visit
  }
}

export function ProductChooser() {
  const { product, setProduct } = useTheme()
  const [open, setOpen] = useState(() => !alreadyChosen())
  const [choice, setChoice] = useState<Product>(product)
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = dialog.current
    if (open && d && !d.open) d.showModal()
  }, [open])

  const finish = (p: Product) => {
    setProduct(p)
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* storage unavailable */ }
    dialog.current?.close()
    setOpen(false)
  }

  if (!open) return null

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="product-chooser-title"
      onCancel={(e) => { e.preventDefault(); finish(product) }}
    >
      <div className={styles.body}>
        <h2 id="product-chooser-title" className={styles.title}>Which product do you work on?</h2>
        <p className={styles.lede}>The docs will use its brand and themes. You can switch any time from the header.</p>

        <div className={styles.options} role="radiogroup" aria-labelledby="product-chooser-title">
          {products.map((p) => (
            <label key={p} className={styles.option} data-product={p} data-mode={productModes[p][0]} data-selected={choice === p || undefined}>
              <input
                type="radio"
                name="l3-product"
                className={styles.radio}
                checked={choice === p}
                onChange={() => setChoice(p)}
              />
              <span className={styles.preview} aria-hidden="true">
                <span className={styles.brandFill} />
                <span className={styles.lines}><span /><span /></span>
              </span>
              <span className={styles.name}>{productLabels[p]}</span>
              <span className={styles.note}>{notes[p]}</span>
            </label>
          ))}
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={() => finish(product)}>Not now</Button>
          <Button onClick={() => finish(choice)}>Continue with {productLabels[choice]}</Button>
        </div>
      </div>
    </dialog>
  )
}
