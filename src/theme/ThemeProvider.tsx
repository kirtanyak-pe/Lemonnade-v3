import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultProduct, isContrast, isProduct, productModes, resolveMode, type Contrast, type Mode, type Product } from '../tokens/themes.ts'
import { STORAGE_KEY, ThemeContext, type ModePreference, type ThemeContextValue } from './themeContext.ts'

/** `contrast: null` = never chosen: follow the OS "Increase contrast" setting. */
type Stored = { product: Product; mode: ModePreference; contrast: Contrast | null }

const darkQuery = '(prefers-color-scheme: dark)'
const moreContrastQuery = '(prefers-contrast: more)'

function readStored(): Stored {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return {
      product: isProduct(parsed.product) ? parsed.product : defaultProduct,
      mode: parsed.mode === 'light' || parsed.mode === 'dark' ? parsed.mode : 'system',
      // Before v2 every visitor got contrast: 'default' saved without choosing, so only trust it from v2 on.
      contrast: isContrast(parsed.contrast) && (parsed.v === 2 || parsed.contrast === 'accessible') ? parsed.contrast : null,
    }
  } catch {
    return { product: defaultProduct, mode: 'system', contrast: null }
  }
}

/** Live result of a media query (system dark mode, "Increase contrast"). */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const list = matchMedia(query)
    const onChange = () => setMatches(list.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Applies `data-product` / `data-mode` / `data-contrast` to <html>, which selects a block in generated/themes.css. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState(readStored)
  const systemMode: Mode = useMediaQuery(darkQuery) ? 'dark' : 'light'
  const systemMoreContrast = useMediaQuery(moreContrastQuery)
  const mode = resolveMode(stored.product, stored.mode === 'system' ? systemMode : stored.mode)
  // An explicit choice wins; otherwise users who ask the OS for more contrast get the ♿ theme.
  const contrast: Contrast = stored.contrast ?? (systemMoreContrast ? 'accessible' : 'default')

  useEffect(() => {
    const root = document.documentElement
    root.dataset.product = stored.product
    root.dataset.mode = mode
    if (contrast === 'accessible') root.dataset.contrast = 'accessible'
    else delete root.dataset.contrast
  }, [stored.product, mode, contrast])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, v: 2 }))
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
      contrast,
      setContrast: (next) => setStored((s) => ({ ...s, contrast: next })),
    }),
    [stored, mode, contrast],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
