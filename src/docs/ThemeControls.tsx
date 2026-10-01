import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { ListCell } from '../components/ListCell'
import { Switch } from '../components/Switch'
import { msAccessibilityNew, msCheck, msDarkMode, msKeyboardArrowDown, msLightMode } from '../icons/material'
import { productLabels, productModes, products, type Product } from '../tokens'
import { useTheme } from '../theme'
import styles from './Docs.module.css'

const productNotes: Record<Product, string> = {
  lm: 'Light & dark',
  cspro: 'Dark only',
  kuber: 'Light & dark',
}

/** Header theme controls: brand menu (ListCell rows) + light/dark Switch + ♿ Accessible contrast. */
export function ThemeControls() {
  return (
    <div className={styles.themeControls}>
      <BrandMenu />
      <ModeToggle />
      <ContrastToggle />
    </div>
  )
}

/** Figma "♿ Accessible" modes: higher-contrast text, borders and accents for the current brand and mode. */
function ContrastToggle() {
  const { contrast, setContrast } = useTheme()
  const on = contrast === 'accessible'
  return (
    <Button
      size="sm"
      variant={on ? 'primary' : 'tertiary'}
      aria-label="Accessible (high contrast) theme"
      aria-pressed={on}
      title={on ? 'Accessible contrast: on' : 'Accessible contrast: off'}
      iconLeft={<Icon icon={msAccessibilityNew} />}
      onClick={() => setContrast(on ? 'default' : 'accessible')}
    />
  )
}

/**
 * The brand's own accent, rendered inside that brand's theme (data-product) so the token resolves
 * to its colour — no hard-coded brand hexes.
 */
function BrandSwatch({ product }: { product: Product }) {
  return <span className={styles.brandSwatch} data-product={product} data-mode={productModes[product][0]} aria-hidden="true" />
}

function BrandMenu() {
  const { product, setProduct } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const panelId = useId()

  const items = () => [...(listRef.current?.querySelectorAll<HTMLElement>('button') ?? [])]

  // On open, focus the current brand; close on outside tap.
  useEffect(() => {
    if (!open) return
    items()[products.indexOf(product)]?.focus()
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
    // Focus only when opening, not when the product changes while open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (!open || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const list = items()
    const i = list.indexOf(document.activeElement as HTMLElement)
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? list.length - 1 : (i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length
    list[next]?.focus()
  }

  const choose = (p: Product) => {
    setProduct(p)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div ref={rootRef} className={styles.brandMenu} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.brandTrigger}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Brand: ${productLabels[product]}`}
        onClick={() => setOpen((o) => !o)}
      >
        <BrandSwatch product={product} />
        <span className={styles.brandTriggerLabel}>{productLabels[product]}</span>
        <span className={styles.brandChevron} aria-hidden="true"><Icon icon={msKeyboardArrowDown} size={16} /></span>
      </button>

      <div id={panelId} className={styles.brandPanel} hidden={!open}>
        <p className={styles.brandPanelTitle} id={`${panelId}-title`}>Brand</p>
        <ul ref={listRef} className={styles.brandList} aria-labelledby={`${panelId}-title`}>
          {products.map((p) => {
            const selected = p === product
            return (
              <li key={p}>
                <ListCell
                  as="button"
                  size="sm"
                  className={styles.brandOption}
                  iconLeft={<BrandSwatch product={p} />}
                  label={
                    <>
                      {productLabels[p]}
                      {selected && <span className={styles.visuallyHidden}>, selected</span>}
                    </>
                  }
                  description={productNotes[p]}
                  iconRight={selected ? <Icon icon={msCheck} /> : undefined}
                  onClick={() => choose(p)}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function ModeToggle() {
  const { mode, availableModes, setModePreference } = useTheme()
  const darkOnly = !availableModes.includes('light')
  const dark = mode === 'dark'

  return (
    <label className={styles.modeToggle} data-dark={dark || undefined} title={darkOnly ? 'This brand is dark only' : undefined}>
      <span className={styles.modeIcon} data-active={!dark || undefined} aria-hidden="true"><Icon icon={msLightMode} size={16} /></span>
      <Switch
        size="sm"
        checked={dark}
        disabled={darkOnly}
        onChange={(e) => setModePreference(e.target.checked ? 'dark' : 'light')}
        aria-label={darkOnly ? 'Dark mode (this brand is dark only)' : 'Dark mode'}
      />
      <span className={styles.modeIcon} data-active={dark || undefined} aria-hidden="true"><Icon icon={msDarkMode} size={16} /></span>
    </label>
  )
}
