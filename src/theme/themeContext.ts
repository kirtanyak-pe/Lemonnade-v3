import { createContext } from 'react'
import type { Contrast, Mode, Product } from '../tokens/themes.ts'

export type ModePreference = Mode | 'system'

export type ThemeContextValue = {
  product: Product
  /** Mode actually applied, after system preference and product support are resolved. */
  mode: Mode
  modePreference: ModePreference
  availableModes: readonly Mode[]
  setProduct: (product: Product) => void
  setModePreference: (mode: ModePreference) => void
  /** ♿ Accessible (Figma "♿ Accessible" modes) or default contrast. Applied as data-contrast on <html>. */
  contrast: Contrast
  setContrast: (contrast: Contrast) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

// Keep in sync with the inline script in index.html, which applies the theme before first paint.
export const STORAGE_KEY = 'l3-theme'
