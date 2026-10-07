// A Figma frame as editable layers: the shape the server sends after reading a frame with the Figma API, and the helpers
// the canvas uses to draw and edit it. Every layer keeps Figma's own geometry (size plus a transform relative to its
// parent), so the result lines up with the design exactly. Values here are the design's own, not L3 tokens.

export type Point = { x: number; y: number }
export type Stop = { color: string; position: number }

/**
 * A fill or stroke. Colors are CSS color strings with the paint's opacity applied: rgba(), or var(--l3-…) for colors
 * bound to an L3 theme variable, so they follow the canvas theme.
 */
export type Paint =
  | { kind: 'solid'; color: string }
  | { kind: 'linear' | 'radial'; stops: Stop[]; /** Figma's gradient handles, 0–1 across the layer's box. */ handles: Point[] }
  | {
      kind: 'image'
      url: string
      fit: 'cover' | 'contain' | 'tile' | 'stretch'
      opacity: number
      /** CSS mix-blend-mode, when the image blends with what is under it. */
      blend?: string
      /** Cropped images: the part of the image shown, as [x, y, width, height] fractions of the image. */
      crop?: [number, number, number, number]
    }

export type Shadow = { inner: boolean; x: number; y: number; blur: number; spread: number; color: string }

export type TextStyle = {
  family: string
  weight: number
  size: number
  italic?: boolean
  /** px; unset = the font's normal line height */
  lineHeight?: number
  /** px */
  letterSpacing?: number
  align: 'left' | 'center' | 'right' | 'justify'
  valign: 'top' | 'center' | 'bottom'
  textCase?: 'upper' | 'lower' | 'title'
  decoration?: 'underline' | 'line-through'
  color?: string
  /** The L3 text style this text is linked to, e.g. "heading-16" (--l3-text-heading-16). */
  token?: string
}

/** A stretch of a text layer with its own style (Figma's character style overrides). */
export type TextRun = { text: string; style: Partial<TextStyle> }

export type LayerType = 'frame' | 'group' | 'rect' | 'vector' | 'text'

/** Figma auto layout: the frame stacks its children in a row or column. */
export type AutoLayout = {
  dir: 'row' | 'column'
  gap: number
  /** Figma's "Auto" spacing: children spread out, first and last at the edges. */
  spaceBetween?: boolean
  /** [top, right, bottom, left] */
  padding: [number, number, number, number]
  /** Along the direction. */
  justify: 'start' | 'center' | 'end'
  /** Across the direction. */
  align: 'start' | 'center' | 'end' | 'baseline'
  wrap?: boolean
  /** Gap between wrapped lines. */
  rowGap?: number
}

/** How a child of an auto-layout frame is sized on each axis: its own size, its content, or the space left. */
export type Sizing = 'fixed' | 'hug' | 'fill'

export type Layer = {
  id: string
  name: string
  type: LayerType
  hidden?: boolean
  /** Layer size in px. */
  w: number
  h: number
  /** CSS matrix(a, b, c, d, e, f) placing the layer inside its parent (Figma's relativeTransform). */
  t: [number, number, number, number, number, number]
  opacity?: number
  blend?: string
  fills?: Paint[]
  strokes?: Paint[]
  strokeWeight?: number
  strokeAlign?: 'inside' | 'outside' | 'center'
  /** One radius, or [top-left, top-right, bottom-right, bottom-left]. */
  radius?: number | [number, number, number, number]
  /** Children outside the frame are hidden. */
  clip?: boolean
  shadows?: Shadow[]
  blur?: number
  backdropBlur?: number
  /** Vectors: SVG paths in the layer's own coordinates. Stroke paths are already outlines, so they are filled. */
  paths?: { d: string; evenOdd?: boolean }[]
  strokePaths?: { d: string; evenOdd?: boolean }[]
  text?: { style: TextStyle; runs: TextRun[]; /** Width and height follow the text: never wrap. */ autoWidth?: boolean }
  /** Crops the children to this outline (a Figma mask), in this layer's coordinates. */
  mask?: {
    t: Layer['t']
    paths: { d: string; evenOdd?: boolean }[]
    /** Image masks cut by the image's transparency (e.g. a QR code), not by the outline. */
    image?: { url: string; w: number; h: number }
  }
  /** This frame lays its children out automatically. */
  layout?: AutoLayout
  /** Sizing on each axis, inside an auto-layout parent (and Hug for an auto-layout frame itself). Unset = fixed. */
  sizeW?: Sizing
  sizeH?: Sizing
  /** Placed freely inside an auto-layout parent, outside the flow (Figma's absolute position). */
  absolute?: boolean
  minW?: number
  maxW?: number
  minH?: number
  maxH?: number
  /** Set in Figma to a light or dark theme mode: this layer and everything in it keep it, whatever the canvas mode. */
  themeMode?: 'light' | 'dark'
  /** For instances: the component it comes from, e.g. "L3: Button". */
  component?: string
  children?: Layer[]
}

/* ---- Drawing --------------------------------------------------------------------------------------------- */

export const matrix = (t: Layer['t']) => `matrix(${t.join(',')})`

/** CSS for a gradient over a w×h box, matching Figma's handles. */
export function gradientCss(p: Extract<Paint, { kind: 'linear' | 'radial' }>, w: number, h: number): string {
  const [a, b, c] = p.handles.map((q) => ({ x: q.x * w, y: q.y * h }))
  if (p.kind === 'radial') {
    const rx = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const ry = c ? Math.hypot(c.x - a.x, c.y - a.y) || rx : rx
    return `radial-gradient(${rx}px ${ry}px at ${a.x}px ${a.y}px, ${p.stops.map((s) => `${s.color} ${s.position * 100}%`).join(', ')})`
  }
  // CSS draws a linear gradient along a line through the box centre, long enough to reach the corners. Re-map Figma's
  // stops (placed between its two handles) onto that line.
  const angle = Math.atan2(b.x - a.x, -(b.y - a.y))
  const u = { x: Math.sin(angle), y: -Math.cos(angle) }
  const length = Math.abs(w * u.x) + Math.abs(h * u.y) || 1
  const along = (q: Point) => (q.x - w / 2) * u.x + (q.y - h / 2) * u.y + length / 2
  const s0 = along(a)
  const s1 = along(b)
  const stops = p.stops.map((s) => `${s.color} ${((s0 + s.position * (s1 - s0)) / length) * 100}%`)
  return `linear-gradient(${(angle * 180) / Math.PI}deg, ${stops.join(', ')})`
}

/** Image fills that are see-through or blended can't be CSS backgrounds; they are drawn as overlays instead. */
export const isOverlayPaint = (p: Paint) => p.kind === 'image' && (p.opacity < 1 || !!p.blend)

/** A box's fills as CSS backgrounds (Figma lists fills bottom first; CSS lists them top first). */
export function backgroundCss(fills: Paint[] | undefined, w: number, h: number): { backgroundImage?: string; backgroundColor?: string; backgroundSize?: string; backgroundRepeat?: string; backgroundPosition?: string } {
  if (!fills?.length) return {}
  const layers = [...fills].reverse().map((p) => {
    if (p.kind === 'solid') return { image: `linear-gradient(${p.color}, ${p.color})`, size: '100% 100%', repeat: 'no-repeat' as string, position: undefined as string | undefined }
    if (p.kind === 'image') {
      if (p.crop) {
        // Scale the whole image so the cropped part fills the box, then shift that part into view.
        const [cx, cy, cw, ch] = p.crop
        const iw = w / cw
        const ih = h / ch
        return { image: `url("${p.url}")`, size: `${iw}px ${ih}px`, repeat: 'no-repeat', position: `${-cx * iw}px ${-cy * ih}px` }
      }
      const size = { cover: 'cover', contain: 'contain', tile: 'auto', stretch: '100% 100%' }[p.fit]
      return { image: `url("${p.url}")`, size, repeat: p.fit === 'tile' ? 'repeat' : 'no-repeat' }
    }
    return { image: gradientCss(p, w, h), size: '100% 100%', repeat: 'no-repeat' }
  }) as { image: string; size: string; repeat: string; position?: string }[]
  return {
    backgroundImage: layers.map((l) => l.image).join(', '),
    backgroundSize: layers.map((l) => l.size).join(', '),
    backgroundRepeat: layers.map((l) => l.repeat).join(', '),
    backgroundPosition: layers.map((l) => l.position ?? 'center').join(', '),
  }
}

/** The first solid color of a list of paints, for color pickers and text. */
export const solidColor = (paints?: Paint[]) => paints?.find((p): p is Extract<Paint, { kind: 'solid' }> => p.kind === 'solid')?.color

/** rgba(...) → #rrggbb for <input type="color">. */
export function toHex(color?: string): string {
  const m = color?.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/)
  if (!m) return '#000000'
  return `#${[m[1], m[2], m[3]].map((v) => Math.round(Number(v)).toString(16).padStart(2, '0')).join('')}`
}

/** #rrggbb → rgba(...), keeping the alpha of `previous`. */
export function fromHex(hex: string, previous?: string): string {
  const alpha = previous?.match(/rgba\([^)]*,\s*([\d.]+)\)/)?.[1] ?? '1'
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

/** Every font family a layer tree uses, so the page can load them. */
export function fontFamilies(layer: Layer, into = new Set<string>()): Set<string> {
  if (layer.text) {
    into.add(layer.text.style.family)
    for (const r of layer.text.runs) if (r.style.family) into.add(r.style.family)
  }
  layer.children?.forEach((c) => fontFamilies(c, into))
  return into
}

/* ---- Editing (immutable) --------------------------------------------------------------------------------- */

export function findLayer(layer: Layer, id: string): Layer | null {
  if (layer.id === id) return layer
  for (const c of layer.children ?? []) {
    const found = findLayer(c, id)
    if (found) return found
  }
  return null
}

/** The chain of layers from the root down to `id`, or null. */
export function layerPath(layer: Layer, id: string): Layer[] | null {
  if (layer.id === id) return [layer]
  for (const c of layer.children ?? []) {
    const path = layerPath(c, id)
    if (path) return [layer, ...path]
  }
  return null
}

export function updateLayer(layer: Layer, id: string, change: (l: Layer) => Layer): Layer {
  if (layer.id === id) return change(layer)
  if (!layer.children) return layer
  let changed = false
  const children = layer.children.map((c) => {
    const next = updateLayer(c, id, change)
    if (next !== c) changed = true
    return next
  })
  return changed ? { ...layer, children } : layer
}

export function removeLayer(layer: Layer, id: string): Layer {
  if (!layer.children) return layer
  const children = layer.children.filter((c) => c.id !== id).map((c) => removeLayer(c, id))
  return { ...layer, children }
}

/** The plain text of a text layer. */
export const plainText = (l: Layer) => l.text?.runs.map((r) => r.text).join('') ?? ''

/* ---- Auto layout ------------------------------------------------------------------------------------------------ */

/** Insert `layer` into container `parentId` at `index` (among its children). */
export function insertLayer(root: Layer, parentId: string, index: number, layer: Layer): Layer {
  return updateLayer(root, parentId, (p) => {
    const children = [...(p.children ?? [])]
    children.splice(Math.max(0, Math.min(index, children.length)), 0, layer)
    return { ...p, children }
  })
}

const isPlain = (t: Layer['t']) => Math.abs(t[1]) < 1e-6 && Math.abs(t[2]) < 1e-6

/**
 * Turn a frame or group whose children were placed by hand into an auto-layout frame, the way Figma's "Add auto
 * layout" does: the direction, order, gap, padding and alignment come from where the children are now. Children that
 * overlap the stack (backgrounds, decorations) stay where they are, outside the flow.
 */
export function addAutoLayout(l: Layer): Layer {
  const kids = (l.children ?? []).filter((c) => !c.hidden && isPlain(c.t))
  if (!kids.length) return { ...l, type: 'frame', layout: { dir: 'column', gap: 0, padding: [0, 0, 0, 0], justify: 'start', align: 'start' } }
  const box = (c: Layer) => ({ x: c.t[4], y: c.t[5], r: c.t[4] + c.w * c.t[0], b: c.t[5] + c.h * c.t[3] })
  const boxes = kids.map(box)
  const span = (a: number[], b: number[]) => Math.max(...b) - Math.min(...a)
  // Stack along the axis where the children spread out more relative to their own size.
  const vertical = span(boxes.map((b) => b.y), boxes.map((b) => b.b)) / Math.max(...kids.map((k) => k.h), 1) >= span(boxes.map((b) => b.x), boxes.map((b) => b.r)) / Math.max(...kids.map((k) => k.w), 1)
  const start = (b: ReturnType<typeof box>) => (vertical ? b.y : b.x)
  const end = (b: ReturnType<typeof box>) => (vertical ? b.b : b.r)
  const order = kids.map((k, i) => ({ k, b: boxes[i] })).sort((p, q) => start(p.b) - start(q.b))

  const flow: typeof order = []
  const out: Set<string> = new Set()
  for (const item of order) {
    const prev = flow[flow.length - 1]
    if (prev && start(item.b) < end(prev.b) - 4) out.add(item.k.id) // overlaps the one before: keep it where it is
    else flow.push(item)
  }
  const gaps = flow.slice(1).map((item, i) => start(item.b) - end(flow[i].b)).sort((a, b) => a - b)
  const gap = Math.max(0, Math.round(gaps.length ? gaps[Math.floor(gaps.length / 2)] : 0))
  const first = flow[0].b
  const last = flow[flow.length - 1].b
  const crossStart = Math.min(...flow.map((f) => (vertical ? f.b.x : f.b.y)))
  const crossEnd = Math.max(...flow.map((f) => (vertical ? f.b.r : f.b.b)))
  const size = vertical ? l.w : l.h
  const centred = flow.every((f) => Math.abs((vertical ? f.b.x + f.b.r : f.b.y + f.b.b) / 2 - size / 2) < 4)
  const pad = (n: number) => Math.max(0, Math.round(n))
  const padding: AutoLayout['padding'] = vertical
    ? [pad(first.y), centred ? 0 : pad(l.w - crossEnd), pad(l.h - last.b), centred ? 0 : pad(crossStart)]
    : [centred ? 0 : pad(crossStart), pad(l.w - last.r), centred ? 0 : pad(l.h - crossEnd), pad(first.x)]

  const flowIds = new Set(flow.map((f) => f.k.id))
  const children = [
    ...flow.map((f) => ({ ...f.k, t: [f.k.t[0], f.k.t[1], f.k.t[2], f.k.t[3], 0, 0] as Layer['t'], absolute: undefined })),
    ...(l.children ?? []).filter((c) => !flowIds.has(c.id)).map((c) => ({ ...c, absolute: out.has(c.id) || !isPlain(c.t) || c.absolute ? true : undefined })),
  ]
  return {
    ...l,
    type: 'frame',
    layout: { dir: vertical ? 'column' : 'row', gap, padding, justify: 'start', align: centred ? 'center' : 'start' },
    children,
  }
}

/** Take a frame out of auto layout: every child keeps its current place, measured by the caller (in this frame's units). */
export function removeAutoLayout(l: Layer, places: Record<string, { x: number; y: number; w: number; h: number }>): Layer {
  return {
    ...l,
    layout: undefined,
    children: l.children?.map((c) => {
      const p = places[c.id]
      if (!p || c.absolute) return { ...c, absolute: undefined }
      return { ...c, absolute: undefined, sizeW: undefined, sizeH: undefined, w: p.w, h: p.h, t: [c.t[0], c.t[1], c.t[2], c.t[3], p.x, p.y] }
    }),
  }
}
