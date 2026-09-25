// Product × mode combinations exported from the Figma "🎨 L3 → Theme" collection.
// Shared by the React theme provider and scripts/build-tokens.ts.

export const products = ['lm', 'cspro', 'kuber'] as const
export type Product = (typeof products)[number]

export type Mode = 'light' | 'dark'

export const productLabels: Record<Product, string> = {
  lm: 'Lemonn',
  cspro: 'CS PRO',
  kuber: 'Kuber',
}

/** Modes each product ships. CS PRO is dark-only. */
export const productModes: Record<Product, readonly Mode[]> = {
  lm: ['light', 'dark'],
  cspro: ['dark'],
  kuber: ['light', 'dark'],
}

export const themes = [
  { id: 'lm-light', product: 'lm', mode: 'light', figmaMode: '🍋 LM → Light' },
  { id: 'lm-dark', product: 'lm', mode: 'dark', figmaMode: '🍋 LM → Dark' },
  { id: 'cspro-dark', product: 'cspro', mode: 'dark', figmaMode: 'CS PRO → Dark' },
  { id: 'kuber-light', product: 'kuber', mode: 'light', figmaMode: '🐲 Kuber → Light' },
  { id: 'kuber-dark', product: 'kuber', mode: 'dark', figmaMode: '🐲 Kuber → Dark' },
] as const satisfies readonly { id: string; product: Product; mode: Mode; figmaMode: string }[]

export type ThemeId = (typeof themes)[number]['id']

export const defaultProduct: Product = 'lm'
export const defaultMode: Mode = 'light'

/** Falls back to the product's first supported mode (e.g. CS PRO + light → dark). */
export function resolveMode(product: Product, mode: Mode): Mode {
  const supported = productModes[product]
  return supported.includes(mode) ? mode : supported[0]
}

export function isProduct(value: unknown): value is Product {
  return typeof value === 'string' && (products as readonly string[]).includes(value)
}
