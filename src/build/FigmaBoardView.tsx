// Draws a Figma frame as real, editable layers: boxes, text, vectors and images, each placed with Figma's own geometry.
// Click a layer to select it, drag to move it, double-click text to edit it in place.
import { createContext, memo, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { backgroundCss, findLayer, fontFamilies, isOverlayPaint, layerPath, matrix, type AutoLayout, plainText, type Layer, type Paint, type Shadow, type TextStyle } from './figmaLayers'
import type { Product } from '../tokens/themes'
import { themeVariables } from './figmaThemeVariables'
import { textTokens } from './figmaTokens'
import styles from './Build.module.css'

/**
 * The canvas product, for layers that Figma pins to light or dark: they set both, as the theme selectors need. Null
 * while the board shows Figma's own colors.
 */
const ProductContext = createContext<Product | null>(null)

/**
 * Figma's own colors: every theme variable set to the guaranteed-invalid `initial`, so each `var(--l3-…, <Figma color>)`
 * falls back to the color the design was made with.
 */
const asDesigned = Object.fromEntries([
  ...Object.values(themeVariables),
  ...textTokens.flatMap((t) => [`--l3-text-${t}`, `--l3-text-${t}-letter-spacing`]),
].map((v) => [v, 'initial'])) as CSSProperties

/* ---- Spacing and radius: values on the L3 scales are drawn with their tokens ----------------------------------- */

const spacingSteps = [0, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96]
const radiusSteps = [0, 2, 4, 6, 8, 12, 16, 20, 24, 32]
const pad2 = (n: number) => String(n).padStart(2, '0')
const space = (n: number) => (spacingSteps.includes(n) ? `var(--l3-spacing-${pad2(n)}, ${n}px)` : `${n}px`)
const corner = (n: number) => (radiusSteps.includes(n) ? `var(--l3-radius-${pad2(n)}, ${n}px)` : `${n}px`)

/* ---- Fonts: load the design's fonts from Google Fonts when they exist there ---------------------------------- */

const requested = new Set<string>(['Manrope']) // Manrope ships with the app
function loadFont(family: string) {
  if (requested.has(family)) return
  requested.add(family)
  const name = family.trim().replace(/ /g, '+')
  // Variable fonts take a weight range; static ones need the weights listed; some only exist in one weight.
  const tries = [`${name}:ital,wght@0,100..900;1,100..900`, `${name}:wght@100..900`, `${name}:wght@100;200;300;400;500;600;700;800;900`, name]
  const attempt = (i: number) => {
    if (i >= tries.length) return // not on Google Fonts (e.g. a paid font): the browser falls back
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${tries[i]}&display=swap`
    link.onerror = () => { link.remove(); attempt(i + 1) }
    document.head.appendChild(link)
  }
  attempt(0)
}

/* ---- Styles --------------------------------------------------------------------------------------------- */

const firstColor = (p?: Paint) => (!p ? undefined : p.kind === 'solid' ? p.color : p.kind === 'image' ? undefined : p.stops[0]?.color)

function shadowCss(shadows: Shadow[] | undefined): string[] {
  return (shadows ?? []).map((s) => `${s.inner ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
}

/** Strokes on a box, drawn as box-shadows over the layer (Figma paints strokes above the content). */
function strokeCss(l: Layer): string | undefined {
  const color = firstColor(l.strokes?.[0])
  const w = l.strokeWeight ?? 0
  if (!color || !w) return undefined
  if (l.strokeAlign === 'outside') return `0 0 0 ${w}px ${color}`
  if (l.strokeAlign === 'center') return `inset 0 0 0 ${w / 2}px ${color}, 0 0 0 ${w / 2}px ${color}`
  return `inset 0 0 0 ${w}px ${color}`
}

const radiusCss = (r: Layer['radius']) => (r === undefined ? undefined : typeof r === 'number' ? corner(r) : r.map(corner).join(' '))

function maskCss(l: Layer): CSSProperties {
  if (!l.mask) return {}
  if (l.mask.image) {
    const { url: src, w, h } = l.mask.image
    const [, , , , x, y] = l.mask.t
    const url = `url("${src}")`
    return { maskImage: url, WebkitMaskImage: url, maskSize: `${w}px ${h}px`, WebkitMaskSize: `${w}px ${h}px`, maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: `${x}px ${y}px`, WebkitMaskPosition: `${x}px ${y}px` }
  }
  const paths = l.mask.paths.map((p) => `<path transform="${matrix(l.mask!.t)}" d="${p.d}"${p.evenOdd ? ' fill-rule="evenodd"' : ''}/>`).join('')
  const url = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${l.w}" height="${l.h}">${paths}</svg>`)}")`
  return { maskImage: url, WebkitMaskImage: url, maskSize: `${l.w}px ${l.h}px`, WebkitMaskSize: `${l.w}px ${l.h}px`, maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: '0 0' }
}

function fontCss(s: Partial<TextStyle>, base?: TextStyle): CSSProperties {
  // Linked to an L3 text style: the whole font comes from its token, with Figma's own values as the fallback.
  const font: CSSProperties = s.token
    ? (() => {
        const v = { ...base, ...s }
        const family = `"${v.family ?? 'Manrope'}", "Manrope", system-ui, sans-serif`
        return {
          font: `var(--l3-text-${s.token}, ${v.weight ?? 400} ${v.size ?? 14}px/${v.lineHeight !== undefined ? `${v.lineHeight}px` : 'normal'} ${family})`,
          letterSpacing: `var(--l3-text-${s.token}-letter-spacing, ${v.letterSpacing ?? 0}px)`,
        }
      })()
    : {
        fontFamily: s.family ? `"${s.family}", "Manrope", system-ui, sans-serif` : undefined,
        fontWeight: s.weight,
        fontSize: s.size !== undefined ? `${s.size}px` : undefined,
        lineHeight: s.lineHeight !== undefined ? `${s.lineHeight}px` : undefined,
        letterSpacing: s.letterSpacing !== undefined ? `${s.letterSpacing}px` : undefined,
      }
  return {
    ...font,
    fontStyle: s.italic ? 'italic' : undefined,
    textTransform: s.textCase === 'upper' ? 'uppercase' : s.textCase === 'lower' ? 'lowercase' : s.textCase === 'title' ? 'capitalize' : undefined,
    textDecoration: s.decoration,
    color: s.color,
  }
}

/* ---- SVG for vectors ---------------------------------------------------------------------------------------- */

const svgId = (layerId: string, i: number) => `fg-${layerId.replace(/[^\w-]/g, '_')}-${i}`

function SvgPaint({ id, paint, w, h }: { id: string; paint: Paint; w: number; h: number }) {
  if (paint.kind === 'linear') {
    const [a, b] = paint.handles
    return (
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={a.x * w} y1={a.y * h} x2={b.x * w} y2={b.y * h}>
        {paint.stops.map((s, i) => <stop key={i} offset={s.position} style={{ stopColor: s.color }} />)}
      </linearGradient>
    )
  }
  if (paint.kind === 'radial') {
    const [a, b, c] = paint.handles.map((q) => ({ x: q.x * w, y: q.y * h }))
    const rx = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const ry = c ? Math.hypot(c.x - a.x, c.y - a.y) || rx : rx
    return (
      <radialGradient id={id} gradientUnits="userSpaceOnUse" cx={a.x} cy={a.y} r={rx} gradientTransform={`translate(${a.x} ${a.y}) scale(1 ${ry / rx}) translate(${-a.x} ${-a.y})`}>
        {paint.stops.map((s, i) => <stop key={i} offset={s.position} style={{ stopColor: s.color }} />)}
      </radialGradient>
    )
  }
  if (paint.kind === 'image') {
    const aspect = { cover: 'xMidYMid slice', contain: 'xMidYMid meet', tile: 'none', stretch: 'none' }[paint.fit]
    const [cx, cy, cw, ch] = paint.crop ?? [0, 0, 1, 1]
    return (
      <pattern id={id} patternUnits="userSpaceOnUse" width={w} height={h}>
        <image href={paint.url} x={(-cx / cw) * w} y={(-cy / ch) * h} width={w / cw} height={h / ch} preserveAspectRatio={aspect} opacity={paint.opacity} />
      </pattern>
    )
  }
  return null
}

function Vector({ l }: { l: Layer }) {
  const fills = l.fills ?? []
  const strokes = (l.strokes ?? []).filter((p) => p.kind !== 'image')
  const ref = (p: Paint, id: string) => (p.kind === 'solid' ? p.color : `url(#${id})`)
  const drop = (l.shadows ?? []).filter((s) => !s.inner).map((s) => `drop-shadow(${s.x}px ${s.y}px ${s.blur / 2}px ${s.color})`).join(' ')
  return (
    <svg width={l.w || 1} height={l.h || 1} overflow="visible" style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: drop || undefined }} aria-hidden="true">
      <defs>
        {fills.map((p, i) => <SvgPaint key={`f${i}`} id={svgId(l.id, i)} paint={p} w={l.w} h={l.h} />)}
        {strokes.map((p, i) => <SvgPaint key={`s${i}`} id={svgId(l.id, 100 + i)} paint={p} w={l.w} h={l.h} />)}
      </defs>
      {/* Colors go in style, not the fill attribute: attributes can't read theme variables. */}
      {fills.map((p, i) => l.paths?.map((path, j) => <path key={`f${i}-${j}`} d={path.d} fillRule={path.evenOdd ? 'evenodd' : 'nonzero'} style={{ fill: ref(p, svgId(l.id, i)) }} />))}
      {strokes.map((p, i) => l.strokePaths?.map((path, j) => <path key={`s${i}-${j}`} d={path.d} fillRule={path.evenOdd ? 'evenodd' : 'nonzero'} style={{ fill: ref(p, svgId(l.id, 100 + i)) }} />))}
    </svg>
  )
}

/* ---- Layers ----------------------------------------------------------------------------------------------- */

const flexAlign = { start: 'flex-start', center: 'center', end: 'flex-end', baseline: 'baseline' } as const

/** A Figma auto-layout frame as a flexbox. */
function layoutCss(a: AutoLayout): CSSProperties {
  return {
    display: 'flex',
    flexDirection: a.dir,
    flexWrap: a.wrap ? 'wrap' : 'nowrap',
    columnGap: a.spaceBetween && a.dir === 'row' ? undefined : a.dir === 'row' ? space(a.gap) : a.rowGap !== undefined ? space(a.rowGap) : undefined,
    rowGap: a.spaceBetween && a.dir === 'column' ? undefined : a.dir === 'column' ? space(a.gap) : a.rowGap !== undefined ? space(a.rowGap) : undefined,
    justifyContent: a.spaceBetween ? 'space-between' : flexAlign[a.justify],
    alignItems: flexAlign[a.align],
    padding: a.padding.map(space).join(' '),
    boxSizing: 'border-box',
  }
}

/**
 * Size on each axis. Inside an auto-layout parent, Fill takes the space left (along the direction) or stretches
 * (across it); Hug follows the content (auto-layout frames and text); everything else keeps its Figma size.
 */
function sizeCss(l: Layer, flow: AutoLayout['dir'] | undefined): CSSProperties {
  const out: CSSProperties = { flexShrink: 0 }
  for (const dim of ['w', 'h'] as const) {
    const sizing = dim === 'w' ? l.sizeW : l.sizeH
    const along = flow === (dim === 'w' ? 'row' : 'column')
    if (flow && sizing === 'fill') {
      if (along) Object.assign(out, { flexGrow: 1, flexBasis: 0, [dim === 'w' ? 'minWidth' : 'minHeight']: 0 })
      else out.alignSelf = 'stretch'
      continue
    }
    if (sizing === 'hug' && (l.layout || l.type === 'text')) continue
    out[dim === 'w' ? 'width' : 'height'] = dim === 'w' ? l.w : l.h
  }
  if (l.minW) out.minWidth = l.minW
  if (l.maxW) out.maxWidth = l.maxW
  if (l.minH) out.minHeight = l.minH
  if (l.maxH) out.maxHeight = l.maxH
  return out
}

/** `flow`: the parent's auto-layout direction, when the parent has auto layout. `root`: the board's frame. */
type LayerViewProps = { l: Layer; flow?: AutoLayout['dir']; root?: boolean; editingId: string | null; onCommitText: (id: string, text: string) => void }

const LayerView = memo(function LayerView({ l, flow, root, editingId, onCommitText }: LayerViewProps) {
  const product = useContext(ProductContext)
  if (l.hidden) return null
  // In an auto-layout parent the browser places the layer, as Figma does; otherwise Figma's exact transform does.
  const inFlow = root || (!!flow && !l.absolute)
  const box: CSSProperties = {
    ...(inFlow
      ? { position: 'relative', ...sizeCss(l, root ? undefined : flow) }
      : { position: 'absolute', left: 0, top: 0, transform: matrix(l.t), transformOrigin: '0 0', ...sizeCss(l, undefined) }),
    opacity: l.opacity,
    mixBlendMode: l.blend as CSSProperties['mixBlendMode'],
    filter: l.blur ? `blur(${l.blur / 2}px)` : undefined,
    backdropFilter: l.backdropBlur ? `blur(${l.backdropBlur / 2}px)` : undefined,
    WebkitBackdropFilter: l.backdropBlur ? `blur(${l.backdropBlur / 2}px)` : undefined,
    ...maskCss(l),
  }

  let content: ReactNode = null
  let stroke: string | undefined
  if (l.type === 'frame' || l.type === 'rect') {
    Object.assign(box, backgroundCss(l.fills?.filter((p) => !isOverlayPaint(p)), l.w, l.h), { borderRadius: radiusCss(l.radius), overflow: l.clip ? 'hidden' : undefined }, l.layout ? layoutCss(l.layout) : {})
    const overlays = l.fills?.filter(isOverlayPaint) ?? []
    if (overlays.length) {
      content = overlays.map((p, i) => (
        <span key={i} className={styles.layerStroke} style={{ ...backgroundCss([p], l.w, l.h), borderRadius: radiusCss(l.radius), opacity: p.kind === 'image' ? p.opacity : undefined, mixBlendMode: p.kind === 'image' ? (p.blend as CSSProperties['mixBlendMode']) : undefined }} />
      ))
    }
    const shadows = shadowCss(l.shadows)
    if (shadows.length) box.boxShadow = shadows.join(', ')
    stroke = strokeCss(l)
  } else if (l.type === 'vector') {
    content = <Vector l={l} />
  } else if (l.type === 'text' && l.text) {
    const { style, runs, autoWidth } = l.text
    const textShadow = (l.shadows ?? []).filter((s) => !s.inner).map((s) => `${s.x}px ${s.y}px ${s.blur / 2}px ${s.color}`).join(', ')
    Object.assign(box, fontCss(style), {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: { top: 'flex-start', center: 'center', bottom: 'flex-end' }[style.valign],
      textAlign: style.align,
      whiteSpace: autoWidth ? 'pre' : 'pre-wrap',
      overflowWrap: 'break-word',
      textShadow: textShadow || undefined,
    })
    content =
      editingId === l.id ? (
        <EditableText text={plainText(l)} onDone={(text) => onCommitText(l.id, text)} />
      ) : (
        <span>{runs.map((r, i) => <span key={i} style={fontCss(r.style, style)}>{r.text}</span>)}</span>
      )
  }

  return (
    <div
      style={box}
      data-layer={l.id}
      data-container={l.type === 'frame' || l.type === 'group' ? '' : undefined}
      data-flow={l.layout?.dir}
      data-inflow={inFlow && !root ? '' : undefined}
      data-product={l.themeMode && product ? product : undefined}
      data-mode={product ? l.themeMode : undefined}
    >
      {content}
      {l.children?.map((c) => <LayerView key={c.id} l={c} flow={l.layout?.dir} editingId={editingId} onCommitText={onCommitText} />)}
      {stroke && <span className={styles.layerStroke} style={{ boxShadow: stroke, borderRadius: radiusCss(l.radius) }} />}
    </div>
  )
})

/** In-place text editing: plain text, finished by clicking away, Esc, or ⌘/Ctrl + Enter. */
function EditableText({ text, onDone }: { text: string; onDone: (text: string) => void }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [])
  return (
    <span
      ref={ref}
      className={styles.layerEditing}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      role="textbox"
      aria-label="Edit text"
      aria-multiline="true"
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={(e) => onDone(e.currentTarget.innerText.replace(/\n$/, ''))}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) e.currentTarget.blur()
      }}
    >
      {text}
    </span>
  )
}

/* ---- Board ------------------------------------------------------------------------------------------------- */

const kindNames: Record<Layer['type'], string> = { frame: 'Frame', group: 'Group', rect: 'Rectangle', vector: 'Vector', text: 'Text' }

/** What a layer is, for the name badge: "Component · L3: Button", "Section · Hero", "Text · Gold". */
function layerLabel(l: Layer, isSection: boolean): string {
  const name = l.name.length > 32 ? `${l.name.slice(0, 31)}…` : l.name
  if (l.component) return `Component · ${l.component}`
  return `${isSection ? 'Section' : kindNames[l.type]} · ${name}`
}

export type BoardViewProps = {
  boardId: string
  root: Layer
  /** The canvas product theme. */
  product: Product
  /** Colors bound to L3 variables follow the canvas theme; until then the board shows Figma's own colors. */
  followTheme: boolean
  zoom: number
  selectedId: string | null
  editingId: string | null
  onSelect: (layerId: string) => void
  /** The pointer went down on a layer that can be dragged; the page follows the pointer from here (across boards too). */
  onPress: (layerId: string, e: ReactPointerEvent) => void
  onEditText: (layerId: string) => void
  onCommitText: (layerId: string, text: string) => void
}

type Badge = { id: string; text: string; left: number; top: number }

export function FigmaBoardView({ boardId, root, product, followTheme, zoom, selectedId, editingId, onSelect, onPress, onEditText, onCommitText }: BoardViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  // A stable callback, so unchanged layers skip re-rendering while another one is dragged or edited.
  const commitRef = useRef(onCommitText)
  useEffect(() => { commitRef.current = onCommitText }, [onCommitText])
  const commit = useCallback((id: string, text: string) => commitRef.current(id, text), [])
  const [hover, setHover] = useState<Badge | null>(null)
  const badgeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => { fontFamilies(root).forEach(loadFont) }, [root])

  /** The layers from the board's frame down to the deepest one under the pointer. */
  const pathAt = (target: EventTarget) => {
    const id = (target as HTMLElement).closest<HTMLElement>('[data-layer]')?.dataset.layer
    return id ? layerPath(root, id) : null
  }

  /**
   * What a click selects, as in Figma: the layer at the same depth as the current selection (with nothing selected,
   * a section of the board), so a click picks a whole section or component. Inside the selection, the selection
   * itself (to drag it). ⌘/Ctrl-click: the deepest layer.
   */
  const pick = (path: Layer[], deep: boolean): Layer => {
    if (deep) return path[path.length - 1]
    if (selectedId && path.some((l) => l.id === selectedId)) return path.find((l) => l.id === selectedId)!
    const selected = selectedId ? layerPath(root, selectedId) : null
    let scope = 0
    for (let i = (selected?.length ?? 1) - 2; i >= 0; i--) {
      const at = path.findIndex((l) => l.id === selected![i].id)
      if (at >= 0) { scope = at; break }
    }
    return path[scope + 1] ?? path[scope]
  }

  /** A badge with the layer's name at its top-left corner, in board units. */
  const badgeFor = (l: Layer): Badge | null => {
    const el = ref.current?.querySelector<HTMLElement>(`[data-layer="${CSS.escape(l.id)}"]`)
    const board = ref.current?.getBoundingClientRect()
    if (!el || !board) return null
    const r = el.getBoundingClientRect()
    const isSection = layerPath(root, l.id)?.length === 2
    return { id: l.id, text: layerLabel(l, isSection), left: (r.left - board.left) / zoom, top: (r.top - board.top) / zoom }
  }

  // Keep the selection's badge on it as the design changes (edits, moves, a new zoom). It is placed straight in the
  // page: its position comes from measuring the drawn layer.
  useLayoutEffect(() => {
    const el = badgeRef.current
    if (!el) return
    const l = selectedId ? findLayer(root, selectedId) : null
    const b = l ? badgeFor(l) : null
    el.hidden = !b
    if (!b) return
    el.textContent = b.text
    Object.assign(el.style, { left: `${b.left}px`, top: `${b.top}px`, transform: `translateY(-100%) scale(${1 / zoom})` })
  })

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return
    const path = pathAt(e.target)
    if (!path) return
    e.stopPropagation()
    const target = pick(path, e.metaKey || e.ctrlKey)
    if (target.id !== selectedId) onSelect(target.id)
    if (target.id !== root.id) onPress(target.id, e) // the board itself moves by its title bar
  }

  // Hover: outline and name of what a click would select.
  const onPointerMove = (e: ReactPointerEvent) => {
    if (e.buttons) return
    const path = pathAt(e.target)
    const l = path ? pick(path, e.metaKey || e.ctrlKey) : null
    if (!l || l.id === selectedId || l.id === root.id) { if (hover) setHover(null); return }
    if (hover?.id !== l.id) setHover(badgeFor(l))
  }

  // Double-click steps one level into the selection; on text it starts typing.
  const onDoubleClick = (e: ReactMouseEvent) => {
    const path = pathAt(e.target)
    if (!path) return
    const at = selectedId ? path.findIndex((l) => l.id === selectedId) : -1
    const next = at >= 0 ? path[at + 1] : undefined
    const current = at >= 0 ? path[at] : path[path.length - 1]
    if (next) {
      if (next.type === 'text') onEditText(next.id)
      else onSelect(next.id)
    } else if (current.type === 'text') onEditText(current.id)
  }

  // Selection and hover outlines, drawn in screen pixels whatever the zoom.
  const line = (id: string, width: number, style: string) => `[data-board="${CSS.escape(boardId)}"] [data-layer="${CSS.escape(id)}"]{outline:${width / zoom}px ${style} var(--figma-select);outline-offset:${-width / zoom}px}`
  const css = [selectedId && line(selectedId, 2, 'solid'), hover && line(hover.id, 1, 'solid')].filter(Boolean).join('')

  // The badges and outline color sit outside the design: a board showing Figma's own colors switches the theme
  // tokens off inside it, and the editing chrome must keep its own colors.
  return (
    <div className={styles.boardFrame}>
      {css && <style>{css}</style>}
      <div
        ref={ref}
        className={styles.boardLayers}
        data-board={boardId}
        style={followTheme ? undefined : asDesigned}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={() => setHover(null)}
        onDoubleClick={onDoubleClick}
      >
        <ProductContext.Provider value={followTheme ? product : null}>
          <LayerView l={root} root editingId={editingId} onCommitText={commit} />
        </ProductContext.Provider>
      </div>
      {hover && (
        <span className={styles.layerBadge} data-kind="hover" style={{ left: hover.left, top: hover.top, transform: `translateY(-100%) scale(${1 / zoom})` }} aria-hidden="true">
          {hover.text}
        </span>
      )}
      <span ref={badgeRef} className={styles.layerBadge} data-kind="selected" hidden aria-hidden="true" />
    </div>
  )
}
