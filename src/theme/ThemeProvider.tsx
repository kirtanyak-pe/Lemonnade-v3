import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultProduct, isContrast, isProduct, productModes, resolveMode, type Contrast, type Mode, type Product } from '../tokens/themes.ts'
import { STORAGE_KEY, ThemeContext, type ModePreference, type ThemeContextValue } from './themeContext.ts'

type Stored = { product: Product; mode: ModePreference; contrast: Contrast }

const darkQuery = '(prefers-color-scheme: dark)'

function readStored(): Stored {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return {
      product: isProduct(parsed.product) ? parsed.product : defaultProduct,
      mode: parsed.mode === 'light' || parsed.mode === 'dark' ? parsed.mode : 'system',
      contrast: isContrast(parsed.contrast) ? parsed.contrast : 'default',
    }
  } catch {
    return { product: defaultProduct, mode: 'system', contrast: 'default' }
  }
}

function useSystemMode(): Mode {
  const [mode, setMode] = useState<Mode>(() => (matchMedia(darkQuery).matches ? 'dark' : 'light'))
  useEffect(() => {
    const query = matchMedia(darkQuery)
    const onChange = () => setMode(query.matches ? 'dark' : 'light')
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return mode
}

/** Applies `data-product` / `data-mode` / `data-contrast` to <html>, which selects a block in generated/themes.css. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(readStored)
  const systemMode = useSystemMode()
  const mode = resolveMode(stored.product, stored.mode === 'system' ? systemMode : stored.mode)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.product = stored.product
    root.dataset.mode = mode
    if (stored.contrast === 'accessible') root.dataset.contrast = 'accessible'
    else delete root.dataset.contrast
  }, [stored.product, mode, stored.contrast])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // Storage unavailable (private mode, blocked): theme still works for this session.
    }
  }, [stored])

  const value = useMemo<ThemeContextValue>(
    () => ({
      product: stored.product,
      mode,
      modePreference: stored.mode,
      availableModes: productModes[stored.product],
      setProduct: (product) => setStored((s) => ({ ...s, product })),
      setModePreference: (modePreference) => setStored((s) => ({ ...s, mode: modePreference })),
      contrast: stored.contrast,
      setContrast: (contrast) => setStored((s) => ({ ...s, contrast })),
    }),
    [stored, mode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
