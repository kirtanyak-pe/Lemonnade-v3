// The Build canvas: an infinite, pannable and zoomable surface holding the phone, which can itself be moved anywhere.
// Zooming here scales the canvas only; the browser's own zoom is left alone (pinch and Ctrl/⌘ + wheel are captured).
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { SystemStatusbar } from '../components/SystemStatusbar'
import { ViewportPicker } from '../docs/PhoneFrame'
import { useViewportWidth } from '../docs/viewport'
import { msAdd, msDragIndicator, msFitScreen, msRemove } from '../icons/material'
import docs from '../docs/Docs.module.css'
import styles from './Build.module.css'

type View = { x: number; y: number; zoom: number }
const MIN_ZOOM = 0.1
const MAX_ZOOM = 4
const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))
const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))

/** Swallow the click that ends a pan or a phone move, so it doesn't select or deselect anything. */
function swallowNextClick() {
  const stop = (e: MouseEvent) => { e.stopPropagation(); e.preventDefault() }
  window.addEventListener('click', stop, { capture: true, once: true })
  setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 0)
}

export function Canvas({ children, onViewChange }: { children: ReactNode; onViewChange?: () => void }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const deviceRef = useRef<HTMLDivElement>(null)
  const width = useViewportWidth()
  const [view, setView] = useState<View>({ x: 0, y: 0, zoom: 1 })
  const [phone, setPhone] = useState({ x: 0, y: 0 }) // the phone's place on the canvas, in canvas units
  const fitted = useRef(false)
  const [spaceHeld, setSpaceHeld] = useState(false)
  const [panning, setPanning] = useState(false)
  const gesture = useRef<{ kind: 'pan' | 'phone'; startX: number; startY: number; origin: { x: number; y: number }; moved: boolean } | null>(null)
  const viewRef = useRef(view)
  useLayoutEffect(() => { viewRef.current = view }, [view])

  /** Zoom by `factor` keeping the point (px, py) of the viewport still. */
  const zoomAt = useCallback((factor: number, px?: number, py?: number) => {
    const el = viewportRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = px ?? r.left + r.width / 2
    const cy = py ?? r.top + r.height / 2
    setView((v) => {
      const zoom = clampZoom(v.zoom * factor)
      const k = zoom / v.zoom
      const ox = cx - r.left
      const oy = cy - r.top
      return { zoom, x: ox - (ox - v.x) * k, y: oy - (oy - v.y) * k }
    })
  }, [])

  /** Fit the phone in view (never above 100%) and centre it. */
  const fit = useCallback(() => {
    const el = viewportRef.current
    const device = deviceRef.current
    if (!el || !device) return
    const W = el.clientWidth
    const H = el.clientHeight
    const w = device.offsetWidth
    const h = device.offsetHeight
    if (!W || !H || !w || !h) return
    const zoom = clampZoom(Math.min(1, (W - 96) / w, (H - 64) / h))
    setView({ zoom, x: (W - w * zoom) / 2 - phone.x * zoom, y: (H - h * zoom) / 2 - phone.y * zoom })
  }, [phone.x, phone.y])

  const setZoom = (zoom: number) => zoomAt(clampZoom(zoom) / viewRef.current.zoom)

  // First paint: fit the phone.
  // Measuring the DOM is the external input here, so this runs once as a layout effect.
  useLayoutEffect(() => {
    if (fitted.current) return
    fitted.current = true
    fit()
  }, [fit])

  // Let the page re-measure its overlays (selection, badges) after the canvas moves.
  useLayoutEffect(() => { onViewChange?.() }, [view, phone, width, onViewChange])

  // Wheel: pinch or Ctrl/⌘ + wheel zooms the canvas; plain scrolling pans it, except over a phone screen that can scroll.
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX, e.clientY)
        return
      }
      const screen = (e.target as HTMLElement).closest<HTMLElement>('[data-container="root"]')
      if (screen) {
        const canScroll = e.deltaY < 0 ? screen.scrollTop > 0 : screen.scrollTop + screen.clientHeight < screen.scrollHeight - 1
        if (canScroll && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) return // scroll the screen itself
      }
      e.preventDefault()
      setView((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }))
    }
    // Safari's pinch comes as gesture events.
    let lastScale = 1
    const onGestureStart = (e: Event) => { e.preventDefault(); lastScale = 1 }
    const onGestureChange = (e: Event) => {
      e.preventDefault()
      const g = e as Event & { scale: number; clientX: number; clientY: number }
      zoomAt(g.scale / lastScale, g.clientX, g.clientY)
      lastScale = g.scale
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('gesturestart', onGestureStart)
    el.addEventListener('gesturechange', onGestureChange)
    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('gesturestart', onGestureStart)
      el.removeEventListener('gesturechange', onGestureChange)
    }
  }, [zoomAt])

  // Keyboard: hold Space to pan; Ctrl/⌘ + = / − / 0 zoom the canvas instead of the browser; Shift + 1 fits the phone.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return
      if (e.code === 'Space' && !e.repeat) { setSpaceHeld(true); e.preventDefault() }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomAt(1.25) }
        else if (e.key === '-') { e.preventDefault(); zoomAt(0.8) }
        else if (e.key === '0') { e.preventDefault(); zoomAt(1 / viewRef.current.zoom) }
      } else if (e.shiftKey && e.key === '!') {
        fit()
      }
    }
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpaceHeld(false) }
    const blur = () => setSpaceHeld(false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
    }
  }, [zoomAt, fit])

  // Pan: drag empty canvas, drag anywhere while holding Space, or drag with the middle mouse button.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    const onPhone = !!target.closest(`.${styles.device}`)
    if (e.button === 1 || spaceHeld || (e.button === 0 && !onPhone)) {
      if (target.closest(`.${styles.zoomBar}`)) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      gesture.current = { kind: 'pan', startX: e.clientX, startY: e.clientY, origin: { x: view.x, y: view.y }, moved: false }
      setPanning(true)
    }
  }
  const startPhoneMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    viewportRef.current?.setPointerCapture(e.pointerId)
    gesture.current = { kind: 'phone', startX: e.clientX, startY: e.clientY, origin: { ...phone }, moved: false }
    setPanning(true)
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (!g.moved && Math.hypot(dx, dy) > 3) g.moved = true
    if (g.kind === 'pan') setView((v) => ({ ...v, x: g.origin.x + dx, y: g.origin.y + dy }))
    else setPhone({ x: g.origin.x + dx / view.zoom, y: g.origin.y + dy / view.zoom })
  }
  const endGesture = () => {
    if (gesture.current?.moved) swallowNextClick()
    gesture.current = null
    setPanning(false)
  }

  const world: CSSProperties = { transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }
  const dots: CSSProperties = {
    backgroundSize: `calc(var(--l3-spacing-20) * ${view.zoom}) calc(var(--l3-spacing-20) * ${view.zoom})`,
    backgroundPosition: `${view.x}px ${view.y}px`,
  }

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      style={dots}
      data-panning={panning || undefined}
      data-space={spaceHeld || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endGesture}
      onPointerCancel={endGesture}
    >
      <div className={styles.world} style={world}>
        <div ref={deviceRef} className={styles.device} style={{ left: phone.x, top: phone.y }}>
          <div className={styles.deviceBar}>
            <button type="button" className={styles.deviceGrip} aria-label="Drag to move the phone" title="Drag to move the phone" onPointerDown={startPhoneMove}>
              <Icon icon={msDragIndicator} size={16} />
              Phone
            </button>
            <ViewportPicker />
          </div>
          <div className={docs.phone} style={{ '--screen-width': `${width}px` } as CSSProperties}>
            <div className={docs.phoneScreen} role="figure" aria-label={`Generated screen (${width}px wide)`}>
              <SystemStatusbar />
              {children}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.zoomBar} role="group" aria-label="Canvas zoom">
        <button type="button" aria-label="Zoom out" title="Zoom out (Ctrl/⌘ −)" onClick={() => zoomAt(0.8)}>
          <Icon icon={msRemove} size={18} />
        </button>
        <button type="button" className={styles.zoomValue} aria-label="Reset zoom to 100%" title="Reset to 100% (Ctrl/⌘ 0)" onClick={() => setZoom(1)}>
          {Math.round(view.zoom * 100)}%
        </button>
        <button type="button" aria-label="Zoom in" title="Zoom in (Ctrl/⌘ +)" onClick={() => zoomAt(1.25)}>
          <Icon icon={msAdd} size={18} />
        </button>
        <button type="button" aria-label="Fit the phone in view" title="Fit (Shift 1)" onClick={fit}>
          <Icon icon={msFitScreen} size={18} />
        </button>
      </div>
    </div>
  )
}
