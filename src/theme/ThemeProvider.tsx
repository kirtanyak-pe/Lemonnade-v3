import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultProduct, isProduct, productModes, resolveMode, type Mode, type Product } from '../tokens/themes.ts'
import { STORAGE_KEY, ThemeContext, type ModePreference, type ThemeContextValue } from './themeContext.ts'

type Stored = { product: Product; mode: ModePreference }

const darkQuery = '(prefers-color-scheme: dark)'

function readStored(): Stored {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return {
      product: isProduct(parsed.product) ? parsed.product : defaultProduct,
      mode: parsed.mode === 'light' || parsed.mode === 'dark' ? parsed.mode : 'system',
    }
  } catch {
    return { product: defaultProduct, mode: 'system' }
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

/** Applies `data-product` / `data-mode` to <html>, which selects a block in generated/themes.css. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(readStored)
  const systemMode = useSystemMode()
  const mode = resolveMode(stored.product, stored.mode === 'system' ? systemMode : stored.mode)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.product = stored.product
    root.dataset.mode = mode
  }, [stored.product, mode])

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
    }),
    [stored, mode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
