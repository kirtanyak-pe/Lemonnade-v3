// Converts the Figma REST API's node JSON into editable canvas layers (src/build/figmaLayers.ts). Geometry is copied as
// is (size + relativeTransform), so layers land exactly where Figma draws them; vectors keep their SVG paths.
import type { Layer, LayerType, Paint, Shadow, Sizing, TextRun, TextStyle } from '../src/build/figmaLayers.ts'
import { themeCollectionKey, themeModes, themeVariables } from '../src/build/figmaThemeVariables.ts'

type Color = { r: number; g: number; b: number; a: number }
type Bound = { color?: { id: string } }
type RawPaint = {
  type: string
  visible?: boolean
  opacity?: number
  color?: Color
  boundVariables?: Bound
  gradientStops?: { color: Color; position: number; boundVariables?: Bound }[]
  gradientHandlePositions?: { x: number; y: number }[]
  imageRef?: string
  scaleMode?: string
  imageTransform?: [[number, number, number], [number, number, number]]
  blendMode?: string
}
type RawStyle = {
  fontFamily?: string
  fontWeight?: number
  fontSize?: number
  italic?: boolean
  letterSpacing?: number
  lineHeightPx?: number
  lineHeightUnit?: string
  textAlignHorizontal?: string
  textAlignVertical?: string
  textCase?: string
  textDecoration?: string
  textAutoResize?: string
  fills?: RawPaint[]
}
export type RawNode = {
  id: string
  name: string
  type: string
  visible?: boolean
  isMask?: boolean
  children?: RawNode[]
  size?: { x: number; y: number }
  relativeTransform?: [[number, number, number], [number, number, number]]
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number } | null
  opacity?: number
  blendMode?: string
  fills?: RawPaint[]
  strokes?: RawPaint[]
  strokeWeight?: number
  strokeAlign?: string
  cornerRadius?: number
  rectangleCornerRadii?: [number, number, number, number]
  clipsContent?: boolean
  effects?: { type: string; visible?: boolean; color?: Color; offset?: { x: number; y: number }; radius?: number; spread?: number; boundVariables?: Bound }[]
  fillGeometry?: { path: string; windingRule?: string }[]
  strokeGeometry?: { path: string; windingRule?: string }[]
  characters?: string
  style?: RawStyle
  characterStyleOverrides?: number[]
  styleOverrideTable?: Record<string, RawStyle>
  lineTypes?: string[]
  componentId?: string
  explicitVariableModes?: Record<string, string>
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
  itemSpacing?: number
  counterAxisSpacing?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  primaryAxisAlignItems?: string
  counterAxisAlignItems?: string
  layoutWrap?: string
  layoutPositioning?: string
  layoutSizingHorizontal?: string
  layoutSizingVertical?: string
  layoutGrow?: number
  layoutAlign?: string
  minWidth?: number | null
  maxWidth?: number | null
  minHeight?: number | null
  maxHeight?: number | null
}

/** Layers per board. Beyond this a page is too heavy to edit smoothly; the rest is left out with a note. */
const MAX_LAYERS = 8000

const round = (n: number, places = 2) => Math.round(n * 10 ** places) / 10 ** places
const rgba = (c: Color, opacity = 1) => `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${round(c.a * opacity, 3)})`

/**
 * A color bound to an L3 theme variable becomes that CSS variable (Figma's value as the fallback), so it follows the
 * canvas theme. Variable ids look like "VariableID:<library key>/<local id>".
 */
function color(c: Color, opacity: number, bound?: Bound): string {
  const key = bound?.color?.id.match(/^VariableID:([0-9a-f]+)\//)?.[1]
  const cssVar = key ? themeVariables[key] : undefined
  if (!cssVar) return rgba(c, opacity)
  const token = `var(${cssVar}, ${rgba(c)})`
  return opacity < 1 ? `color-mix(in srgb, ${token} ${round(opacity * 100, 1)}%, transparent)` : token
}

const kinds: Record<string, LayerType> = {
  FRAME: 'frame', COMPONENT: 'frame', COMPONENT_SET: 'frame', INSTANCE: 'frame', SECTION: 'frame',
  GROUP: 'group',
  RECTANGLE: 'rect',
  ELLIPSE: 'vector', VECTOR: 'vector', STAR: 'vector', LINE: 'vector', REGULAR_POLYGON: 'vector', POLYGON: 'vector', BOOLEAN_OPERATION: 'vector',
  TEXT: 'text',
}

const blends: Record<string, string> = {
  MULTIPLY: 'multiply', SCREEN: 'screen', OVERLAY: 'overlay', DARKEN: 'darken', LIGHTEN: 'lighten', COLOR_DODGE: 'color-dodge',
  COLOR_BURN: 'color-burn', HARD_LIGHT: 'hard-light', SOFT_LIGHT: 'soft-light', DIFFERENCE: 'difference', EXCLUSION: 'exclusion',
  HUE: 'hue', SATURATION: 'saturation', COLOR: 'color', LUMINOSITY: 'luminosity',
}

export type Converter = {
  /** imageRef → URL, from the file's images endpoint. */
  images: Record<string, string>
  /** componentId → readable component name. */
  componentName: (id?: string) => string | undefined
}

const blendOf = (p: RawPaint) => (p.blendMode && blends[p.blendMode] ? { blend: blends[p.blendMode] } : {})

function paint(p: RawPaint, images: Record<string, string>): Paint | null {
  if (p.visible === false) return null
  const opacity = p.opacity ?? 1
  switch (p.type) {
    case 'SOLID':
      return p.color ? { kind: 'solid', color: color(p.color, opacity, p.boundVariables) } : null
    case 'GRADIENT_LINEAR':
    case 'GRADIENT_ANGULAR': // drawn as linear: CSS conic gradients don't map onto Figma's handles
    case 'GRADIENT_RADIAL':
    case 'GRADIENT_DIAMOND': // drawn as radial
      if (!p.gradientStops?.length || !p.gradientHandlePositions?.length) return null
      return {
        kind: p.type === 'GRADIENT_LINEAR' || p.type === 'GRADIENT_ANGULAR' ? 'linear' : 'radial',
        stops: p.gradientStops.map((s) => ({ color: color(s.color, opacity, s.boundVariables), position: round(s.position, 4) })),
        handles: p.gradientHandlePositions.map((h) => ({ x: round(h.x, 4), y: round(h.y, 4) })),
      }
    case 'IMAGE': {
      const url = p.imageRef ? images[p.imageRef] : undefined
      if (!url) return null
      const fit = ({ FILL: 'cover', FIT: 'contain', TILE: 'tile', STRETCH: 'stretch' } as const)[p.scaleMode as 'FILL'] ?? 'cover'
      // STRETCH with a transform is Figma's crop: the transform maps the layer's box onto the part of the image shown.
      const m = p.imageTransform
      if (p.scaleMode === 'STRETCH' && m && (m[0][0] !== 1 || m[1][1] !== 1 || m[0][2] || m[1][2]) && m[0][0] > 0 && m[1][1] > 0) {
        return { kind: 'image', url, fit, opacity: round(opacity, 3), ...blendOf(p), crop: [round(m[0][2], 5), round(m[1][2], 5), round(m[0][0], 5), round(m[1][1], 5)] }
      }
      return { kind: 'image', url, fit, opacity: round(opacity, 3), ...blendOf(p) }
    }
    default:
      return null
  }
}

const paints = (list: RawPaint[] | undefined, images: Record<string, string>) => {
  const out = (list ?? []).map((p) => paint(p, images)).filter((p): p is Paint => p !== null)
  return out.length ? out : undefined
}

function textStyle(s: RawStyle, images: Record<string, string>): Partial<TextStyle> {
  const out: Partial<TextStyle> = {}
  if (s.fontFamily) out.family = s.fontFamily
  if (s.fontWeight) out.weight = s.fontWeight
  if (s.fontSize) out.size = round(s.fontSize)
  if (s.italic) out.italic = true
  if (s.lineHeightPx && s.lineHeightUnit !== 'INTRINSIC_%') out.lineHeight = round(s.lineHeightPx)
  if (s.letterSpacing) out.letterSpacing = round(s.letterSpacing)
  if (s.textAlignHorizontal) out.align = ({ LEFT: 'left', CENTER: 'center', RIGHT: 'right', JUSTIFIED: 'justify' } as const)[s.textAlignHorizontal as 'LEFT'] ?? 'left'
  if (s.textAlignVertical) out.valign = ({ TOP: 'top', CENTER: 'center', BOTTOM: 'bottom' } as const)[s.textAlignVertical as 'TOP'] ?? 'top'
  if (s.textCase) out.textCase = ({ UPPER: 'upper', LOWER: 'lower', TITLE: 'title' } as const)[s.textCase as 'UPPER']
  if (s.textDecoration) out.decoration = ({ UNDERLINE: 'underline', STRIKETHROUGH: 'line-through' } as const)[s.textDecoration as 'UNDERLINE']
  const fill = s.fills && paints(s.fills, images)?.find((p) => p.kind === 'solid')
  if (fill && fill.kind === 'solid') out.color = fill.color
  return out
}

/** Figma stores list bullets per line, not in the text: write them into the text so they show and can be edited. */
function withListMarkers(node: RawNode): { chars: string; overrides: number[] } {
  const chars = node.characters ?? ''
  const overrides = node.characterStyleOverrides ?? []
  const types = node.lineTypes ?? []
  if (!types.some((t) => t === 'UNORDERED' || t === 'ORDERED')) return { chars, overrides }
  let out = ''
  const outOverrides: number[] = []
  let number = 0
  chars.split('\n').forEach((line, i, lines) => {
    const start = chars.split('\n').slice(0, i).join('\n').length + (i ? 1 : 0)
    const type = types[i]
    number = type === 'ORDERED' ? number + 1 : 0
    const marker = type === 'UNORDERED' ? '•  ' : type === 'ORDERED' ? `${number}.  ` : ''
    const own = Array.from({ length: line.length }, (_, k) => overrides[start + k] ?? 0)
    out += marker + line + (i < lines.length - 1 ? '\n' : '')
    outOverrides.push(...Array(marker.length).fill(own[0] ?? 0), ...own, ...(i < lines.length - 1 ? [overrides[start + line.length] ?? 0] : []))
  })
  return { chars: out, overrides: outOverrides }
}

/** Split a text layer into runs wherever Figma's per-character style changes. */
function textRuns(node: RawNode, images: Record<string, string>): TextRun[] {
  const { chars, overrides } = withListMarkers(node)
  const table = node.styleOverrideTable ?? {}
  if (!overrides.some(Boolean)) return [{ text: chars, style: {} }]
  const runs: TextRun[] = []
  let start = 0
  for (let i = 1; i <= chars.length; i++) {
    if (i < chars.length && (overrides[i] ?? 0) === (overrides[start] ?? 0)) continue
    const id = overrides[start] ?? 0
    runs.push({ text: chars.slice(start, i), style: id && table[id] ? textStyle(table[id], images) : {} })
    start = i
  }
  return runs
}

const sizing = (s?: string): Sizing | undefined => (s === 'HUG' ? 'hug' : s === 'FILL' ? 'fill' : undefined)

/** Auto layout, sizing and positioning, copied from Figma. */
function layoutOf(node: RawNode, layer: Layer, parentFlow: 'row' | 'column' | undefined) {
  if (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL') {
    layer.layout = {
      dir: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
      gap: round(node.itemSpacing ?? 0),
      padding: [round(node.paddingTop ?? 0), round(node.paddingRight ?? 0), round(node.paddingBottom ?? 0), round(node.paddingLeft ?? 0)],
      justify: node.primaryAxisAlignItems === 'CENTER' ? 'center' : node.primaryAxisAlignItems === 'MAX' ? 'end' : 'start',
      align: node.counterAxisAlignItems === 'CENTER' ? 'center' : node.counterAxisAlignItems === 'MAX' ? 'end' : node.counterAxisAlignItems === 'BASELINE' ? 'baseline' : 'start',
      ...(node.primaryAxisAlignItems === 'SPACE_BETWEEN' ? { spaceBetween: true } : {}),
      ...(node.layoutWrap === 'WRAP' ? { wrap: true, rowGap: round(node.counterAxisSpacing ?? 0) } : {}),
    }
  }
  // Older files have no layoutSizing*: read the grow / stretch flags instead.
  let w = sizing(node.layoutSizingHorizontal)
  let h = sizing(node.layoutSizingVertical)
  if (!node.layoutSizingHorizontal && parentFlow) {
    const grow = node.layoutGrow === 1
    const stretch = node.layoutAlign === 'STRETCH'
    if (parentFlow === 'row') { w = grow ? 'fill' : undefined; h = stretch ? 'fill' : undefined }
    else { h = grow ? 'fill' : undefined; w = stretch ? 'fill' : undefined }
  }
  if (w) layer.sizeW = w
  if (h) layer.sizeH = h
  // Rotated or flipped layers keep their exact place: CSS flow can't rotate around Figma's origin.
  const t = layer.t
  if (parentFlow && (node.layoutPositioning === 'ABSOLUTE' || Math.abs(t[1]) > 1e-6 || Math.abs(t[2]) > 1e-6 || t[0] < 0 || t[3] < 0)) layer.absolute = true
  if (node.minWidth) layer.minW = round(node.minWidth)
  if (node.maxWidth) layer.maxW = round(node.maxWidth)
  if (node.minHeight) layer.minH = round(node.minHeight)
  if (node.maxHeight) layer.maxH = round(node.maxHeight)
}

/** Convert one node (and its children). `budget.left` counts down the layers still allowed. */
export function toLayer(node: RawNode, conv: Converter, budget: { left: number; notes: Set<string> }, root = false, parentFlow?: 'row' | 'column'): Layer | null {
  if (node.visible === false) return null
  const type = kinds[node.type]
  if (!type || !node.size) return null
  if (budget.left <= 0) {
    budget.notes.add(`The design has more than ${MAX_LAYERS} layers; the rest were left out.`)
    return null
  }
  budget.left--

  const size = node.size
  const rt = node.relativeTransform ?? [[1, 0, 0], [0, 1, 0]]
  const layer: Layer = {
    id: node.id,
    name: node.name,
    type,
    w: round(size.x),
    h: round(size.y),
    // A board's root sits at the board's own origin.
    t: root ? [1, 0, 0, 1, 0, 0] : [round(rt[0][0], 5), round(rt[1][0], 5), round(rt[0][1], 5), round(rt[1][1], 5), round(rt[0][2]), round(rt[1][2])],
  }
  layoutOf(node, layer, root ? undefined : parentFlow)
  if (node.opacity !== undefined && node.opacity < 1) layer.opacity = round(node.opacity, 3)
  // A frame set to a theme mode in Figma (e.g. a dark section on a light page) stays light or dark.
  const mode = Object.entries(node.explicitVariableModes ?? {}).find(([collection]) => collection.includes(themeCollectionKey))?.[1]
  if (mode && themeModes[mode]) layer.themeMode = themeModes[mode]
  if (node.blendMode && blends[node.blendMode]) layer.blend = blends[node.blendMode]

  if (type !== 'group') {
    const fills = paints(node.fills, conv.images)
    const strokes = node.strokeWeight ? paints(node.strokes, conv.images) : undefined
    if (type !== 'text' && fills) layer.fills = fills
    if (strokes) {
      layer.strokes = strokes
      layer.strokeWeight = round(node.strokeWeight!)
      layer.strokeAlign = ({ INSIDE: 'inside', OUTSIDE: 'outside', CENTER: 'center' } as const)[node.strokeAlign as 'INSIDE'] ?? 'inside'
    }
  }
  if (node.rectangleCornerRadii && new Set(node.rectangleCornerRadii).size > 1) layer.radius = node.rectangleCornerRadii.map((r) => round(r)) as Layer['radius']
  else if (node.cornerRadius) layer.radius = round(node.cornerRadius)
  if (node.clipsContent) layer.clip = true

  for (const e of node.effects ?? []) {
    if (e.visible === false) continue
    if ((e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') && e.color) {
      const shadow: Shadow = { inner: e.type === 'INNER_SHADOW', x: round(e.offset?.x ?? 0), y: round(e.offset?.y ?? 0), blur: round(e.radius ?? 0), spread: round(e.spread ?? 0), color: color(e.color, 1, e.boundVariables) }
      ;(layer.shadows ??= []).push(shadow)
    } else if (e.type === 'LAYER_BLUR' && e.radius) layer.blur = round(e.radius)
    else if ((e.type === 'BACKGROUND_BLUR' || e.type === 'GLASS') && e.radius) layer.backdropBlur = round(e.radius)
  }

  if (type === 'vector') {
    const toPath = (g: { path: string; windingRule?: string }) => ({ d: g.path, ...(g.windingRule === 'EVENODD' ? { evenOdd: true } : {}) })
    if (node.fillGeometry?.length) layer.paths = node.fillGeometry.map(toPath)
    if (node.strokeGeometry?.length && layer.strokes) layer.strokePaths = node.strokeGeometry.map(toPath)
    return layer // a boolean operation's parts are already merged into its paths
  }

  if (type === 'text' && node.style) {
    const base = textStyle(node.style, conv.images)
    const color = paints(node.fills, conv.images)?.find((p) => p.kind === 'solid')
    layer.text = {
      style: { family: 'Inter', weight: 400, size: 14, align: 'left', valign: 'top', ...base, ...(color?.kind === 'solid' ? { color: color.color } : {}) },
      runs: textRuns(node, conv.images),
      ...(node.style.textAutoResize === 'WIDTH_AND_HEIGHT' ? { autoWidth: true } : {}),
    }
    return layer
  }

  if (node.type === 'INSTANCE') layer.component = conv.componentName(node.componentId)
  const children = convertChildren(node.children ?? [], layer, conv, budget, layer.layout?.dir)
  if (children.length) layer.children = children
  return layer
}

/**
 * A mask crops every layer above it in the same parent to its shape. As in Figma, the mask shape itself is drawn; the
 * layers above it go into one group carrying the mask's outline (in the parent's coordinates).
 */
function convertChildren(nodes: RawNode[], parent: Layer, conv: Converter, budget: { left: number; notes: Set<string> }, flow?: 'row' | 'column'): Layer[] {
  const out: Layer[] = []
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (node.isMask && node.visible !== false) {
      const shape = toLayer({ ...node, isMask: false }, conv, budget, false, flow)
      const paths = shape?.paths ?? (shape ? [{ d: `M0 0H${shape.w}V${shape.h}H0Z` }] : undefined)
      // Masked layers are drawn in place inside the mask group, outside any auto layout.
      const masked = convertChildren(nodes.slice(i + 1), parent, conv, budget)
      if (shape) out.push(shape)
      const image = shape?.fills?.find((p) => p.kind === 'image')
      const mask = shape && paths ? { t: shape.t, paths, ...(image?.kind === 'image' ? { image: { url: image.url, w: shape.w, h: shape.h } } : {}) } : undefined
      if (mask && masked.length) out.push({ id: `${node.id}-mask`, name: `${node.name} (mask)`, type: 'group', w: parent.w, h: parent.h, t: [1, 0, 0, 1, 0, 0], mask, children: masked, ...(flow ? { absolute: true } : {}) })
      else if (!shape) out.push(...masked)
      break
    }
    const layer = toLayer(node, conv, budget, false, flow)
    if (layer) out.push(layer)
  }
  return out
}

/** Image fills used anywhere in a node tree. */
export function usesImages(node: RawNode): boolean {
  return (node.fills ?? []).some((f) => f.type === 'IMAGE') || (node.children ?? []).some(usesImages)
}

export const newBudget = () => ({ left: MAX_LAYERS, notes: new Set<string>() })
