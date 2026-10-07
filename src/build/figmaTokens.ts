// Links a pasted Figma design to the Lemonnade design system. Plain colors that match an L3 color are tied to that
// token (by role: text → content, fills → surface, strokes → border), and every text gets the nearest L3 text style.
// Figma's own values stay as the fallback, so the board looks exactly as designed until the canvas theme changes;
// then the whole design takes the theme's colors and L3 typography.
import type { Layer, Paint, TextStyle } from './figmaLayers'
import { themeVariables } from './figmaThemeVariables'

type RGBA = [number, number, number, number]
export type Palette = { name: string; rgba: RGBA }[]

/* ---- Reading the theme's colors from the page --------------------------------------------------------------- */

const tokenNames = [...new Set(Object.values(themeVariables))]

/** "rgb(…)", "rgba(…)" or "color(srgb r g b / a)" → [r, g, b, a] with r, g, b in 0–255. */
export function parseColor(s: string): RGBA | null {
  let m = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/)
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] ? (m[4].endsWith('%') ? Number(m[4].slice(0, -1)) / 100 : Number(m[4])) : 1]
  m = s.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/)
  if (m) return [Number(m[1]) * 255, Number(m[2]) * 255, Number(m[3]) * 255, m[4] ? Number(m[4]) : 1]
  return null
}

/** Every L3 theme color as the browser resolves it for one product and mode. */
export function readPalette(product: string, mode: 'light' | 'dark'): Palette {
  const probe = document.createElement('div')
  probe.dataset.product = product
  probe.dataset.mode = mode
  probe.style.display = 'none'
  document.body.appendChild(probe)
  const out: Palette = []
  for (const name of tokenNames) {
    probe.style.color = `var(${name})`
    const rgba = parseColor(getComputedStyle(probe).color)
    if (rgba) out.push({ name, rgba })
  }
  probe.remove()
  return out
}

const palettes = new Map<string, Palette>()
/** The palette for a product and mode, read once. */
export function paletteFor(product: string, mode: 'light' | 'dark'): Palette {
  const key = `${product}/${mode}`
  if (!palettes.has(key)) palettes.set(key, readPalette(product, mode))
  return palettes.get(key)!
}

/** "--l3-content-accent-success-default" → "content / accent / success-default". */
export const tokenLabel = (name: string) =>
  name.replace(/^--l3-/, '').replace(/^(content|surface|border|button|static)-(accent-)?/, (_, a: string, b?: string) => `${a} / ${b ? 'accent / ' : ''}`)

/** The token a color is linked to, if any. */
export const tokenOf = (color?: string) => color?.match(/var\((--l3-[\w-]+)/)?.[1] ?? null

/** var(--token, <its value in this theme>): the fallback shows the token even while a board shows Figma's colors. */
export function tokenColor(name: string, product: string, mode: 'light' | 'dark'): string {
  const rgba = paletteFor(product, mode).find((t) => t.name === name)?.rgba
  return rgba ? `var(${name}, rgba(${Math.round(rgba[0])}, ${Math.round(rgba[1])}, ${Math.round(rgba[2])}, ${rgba[3]}))` : `var(${name})`
}

/* ---- Matching ------------------------------------------------------------------------------------------------- */

type Role = 'text' | 'fill' | 'icon' | 'stroke'

// Which tokens a color may become, in order of preference (the first of equally close tokens wins).
const families: Record<Role, string[]> = {
  text: ['--l3-content-', '--l3-static-'],
  fill: ['--l3-surface-', '--l3-static-'],
  icon: ['--l3-content-', '--l3-surface-', '--l3-static-'],
  stroke: ['--l3-border-', '--l3-static-'],
}
/** How far apart two colors may be (0–255 per channel) and still count as the same token. */
const TOLERANCE = 8

function nearest(rgba: RGBA, role: Role, palette: Palette): { name: string; rgba: RGBA } | null {
  let best: { name: string; rgba: RGBA } | null = null
  let bestScore = Infinity
  for (const [rank, prefix] of families[role].entries()) {
    for (const t of palette) {
      if (!t.name.startsWith(prefix) || t.name.includes('disabled')) continue
      const d = Math.hypot(t.rgba[0] - rgba[0], t.rgba[1] - rgba[1], t.rgba[2] - rgba[2])
      // See-through tokens only match see-through colors of the same strength.
      if (t.rgba[3] < 1 && Math.abs(t.rgba[3] - rgba[3]) > 0.05) continue
      if (d > TOLERANCE) continue
      const score = d + rank * 0.5
      if (score < bestScore) { bestScore = score; best = t }
    }
  }
  return best
}

/** A plain color linked to a token: var(--token, <Figma color>), keeping Figma's transparency on top of it. */
function link(color: string, role: Role, palette: Palette, stats: Stats): string {
  stats.colors++
  if (color.includes('var(')) { stats.linkedColors++; return color }
  const rgba = parseColor(color)
  const token = rgba && nearest(rgba, role, palette)
  if (!rgba || !token) return color
  stats.linkedColors++
  const solid = `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${token.rgba[3] < 1 ? rgba[3] : 1})`
  const v = `var(${token.name}, ${solid})`
  return token.rgba[3] >= 1 && rgba[3] < 1 ? `color-mix(in srgb, ${v} ${Math.round(rgba[3] * 1000) / 10}%, transparent)` : v
}

/* ---- Typography ------------------------------------------------------------------------------------------------- */

const roleSizes = {
  heading: [10, 12, 14, 16, 18, 20, 24, 28, 32, 36],
  label: [10, 12, 14, 16, 18],
  description: [10, 12, 14, 16, 18],
} as const
export type TextRole = keyof typeof roleSizes
/** L3 line height for each font size (the type scale's pairs). */
const lineHeights: Record<number, number> = { 10: 12, 12: 16, 14: 20, 16: 22, 18: 24, 20: 26, 24: 30, 28: 36, 32: 42, 36: 46 }
const roleWeights: Record<TextRole, number> = { heading: 750, label: 650, description: 500 }

/** Every L3 text style, e.g. "heading-16". */
export const textTokens = (Object.keys(roleSizes) as TextRole[]).flatMap((role) => roleSizes[role].map((size) => `${role}-${size}`))

/** The nearest L3 text style: the role from the weight (bold → heading, semibold → label, else description). */
export function nearestTextToken(weight: number, size: number): string {
  let role: TextRole = weight >= 700 ? 'heading' : weight >= 600 ? 'label' : 'description'
  if (size > 18) role = 'heading' // L3 only has large sizes as headings
  const sizes = roleSizes[role]
  const best = sizes.reduce((a, b) => (Math.abs(b - size) < Math.abs(a - size) ? b : a))
  return `${role}-${best}`
}

/** The values a text style stands for, so the design shows it even while it shows Figma's own values. */
export function textTokenStyle(token: string): Pick<TextStyle, 'family' | 'weight' | 'size' | 'lineHeight' | 'token'> {
  const [role, size] = token.split('-') as [TextRole, string]
  return { token, family: 'Manrope', weight: roleWeights[role], size: Number(size), lineHeight: lineHeights[Number(size)] }
}

/* ---- Linking a whole board ---------------------------------------------------------------------------------------- */

export type Stats = { colors: number; linkedColors: number; texts: number; linkedTexts: number }

const linkPaints = (paints: Paint[] | undefined, role: Role, palette: Palette, stats: Stats): Paint[] | undefined =>
  paints?.map((p) =>
    p.kind === 'solid' ? { ...p, color: link(p.color, role, palette, stats) }
    : p.kind === 'image' ? p
    : { ...p, stops: p.stops.map((s) => ({ ...s, color: link(s.color, role, palette, stats) })) },
  )

/**
 * Link every color and text of a layer tree to L3 tokens. `palettes` holds the Lemonn light and dark colors: frames
 * Figma pins to dark mode are matched against the dark ones.
 */
export function linkTokens(layer: Layer, palettes: { light: Palette; dark: Palette }, stats: Stats, mode: 'light' | 'dark' = 'light'): Layer {
  const m = layer.themeMode ?? mode
  const palette = palettes[m]
  const out: Layer = { ...layer }
  out.fills = linkPaints(layer.fills, layer.type === 'vector' ? 'icon' : 'fill', palette, stats)
  out.strokes = linkPaints(layer.strokes, layer.type === 'vector' ? 'icon' : 'stroke', palette, stats)
  if (layer.text) {
    const base = layer.text.style
    stats.texts++
    stats.linkedTexts++
    out.text = {
      ...layer.text,
      style: { ...base, token: nearestTextToken(base.weight, base.size), color: base.color && link(base.color, 'text', palette, stats) },
      runs: layer.text.runs.map((r) => {
        const style = { ...r.style }
        if (style.color) style.color = link(style.color, 'text', palette, stats)
        // A stretch in another size or weight gets its own text style.
        if (style.size !== undefined || style.weight !== undefined) style.token = nearestTextToken(style.weight ?? base.weight, style.size ?? base.size)
        return { ...r, style }
      }),
    }
  }
  if (layer.children) out.children = layer.children.map((c) => linkTokens(c, palettes, stats, m))
  return out
}
