import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import styles from './BottomSheet.module.css'
import { SheetDepthContext, sheetStack } from './sheetStack.ts'

/** Figma "L3: Bottom sheet" (node 4543:63932). Figma isBottom=False → `placement="top"`. */
export type BottomSheetPlacement = 'bottom' | 'top'

type SurfaceProps = {
  placement?: BottomSheetPlacement
  /** Figma 👁️ Header — usually <BottomSheetHeader />. */
  header?: ReactNode
  /** Figma "content slot" (👁️ Content Slot: leave it out to hide the area and its top space). Scrolls when the sheet is taller than the screen allows. */
  children?: ReactNode
  /** Figma "Buttons" — usually <ButtonGroup>. */
  footer?: ReactNode
  /** Figma "Utility slot" (below the buttons). */
  utility?: ReactNode
  className?: string
}

/** The sheet panel on its own — no overlay or portal. Use <BottomSheet> for the modal. */
export function BottomSheetSurface({
  placement = 'bottom',
  header,
  children,
  footer,
  utility,
  className,
  style,
}: SurfaceProps & { style?: CSSProperties }) {
  return (
    <div className={[styles.surface, className].filter(Boolean).join(' ')} data-placement={placement} style={style}>
      {header}
      {children != null && children !== false && (
        <div className={styles.content} data-sheet-content="">{children}</div>
      )}
      {footer}
      {utility}
    </div>
  )
}

export type BottomSheetProps = SurfaceProps & {
  open: boolean
  /**
   * Called on a backdrop tap, a drag down (a drag up for top sheets), Escape, or the screen-reader-only
   * close button. There is no visible close button or drag handle.
   */
  onClose: () => void
  /** Accessible name of the screen-reader-only close button. */
  closeLabel?: string
  /** Accessible name: point at the header's heading id, or use aria-label. */
  'aria-labelledby'?: string
  'aria-label'?: string
  /** Where to render (default document.body). Pass an element to keep the sheet inside it (e.g. a phone frame). */
  container?: HTMLElement | null
}

const EXIT_MS = 300 // fallback unmount if transitionend doesn't fire (reduced motion, hidden tab)

/**
 * Modal bottom (or top) sheet over the Figma "L3: Overlay" backdrop.
 * Slides in, traps focus, closes on backdrop tap / drag down / Escape, restores focus, locks page scroll.
 * Stacking: at most 2 sheets. The first has no back button; a second sheet on top of it shows the header's back
 * button (going back = closing it). Opening a third warns in development.
 * Closing is invisible: no drag handle and no ✕. The whole sheet drags — header and footer always, the content
 * once it's scrolled to the top — and a visually hidden "Close" button serves screen-reader and keyboard users.
 */
export function BottomSheet({
  open,
  onClose,
  container,
  placement = 'bottom',
  closeLabel = 'Close',
  'aria-labelledby': labelledBy,
  'aria-label': label,
  ...surface
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [dragY, setDragY] = useState(0)
  const [prevOpen, setPrevOpen] = useState(open)
  const sheetRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; startY: number; startT: number; content: HTMLElement | null; active: boolean } | null>(null)
  // Stack level: 1 = first sheet over the screen (no back button), 2 = stacked on it (back button). Max 2.
  const id = useId()
  const depth = useSyncExternalStore(sheetStack.subscribe, () => sheetStack.depthOf(id))
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  // React to `open` changing during render (no effect needed for the synchronous part).
  // The slide-in itself is CSS @starting-style, so it doesn't depend on animation frames.
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setMounted(true)
    else setDragY(0)
  }

  // Closed → keep it mounted for the exit transition, then unmount.
  useEffect(() => {
    if (open || !mounted) return
    const t = setTimeout(() => setMounted(false), EXIT_MS)
    return () => clearTimeout(t)
  }, [open, mounted])

  // Focus the sheet on open, give focus back on close; lock page scroll when covering the page.
  useEffect(() => {
    if (!open || !mounted) return
    const previous = document.activeElement as HTMLElement | null
    sheetRef.current?.focus()
    const lockPage = !container
    const overflow = document.body.style.overflow
    if (lockPage) document.body.style.overflow = 'hidden'
    return () => {
      if (lockPage) document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open, mounted, container])

  useEffect(() => {
    if (!open) return
    sheetStack.push(id)
    return () => sheetStack.remove(id)
  }, [open, id])

  // Make everything behind the sheet inert (screen-reader browse mode can't wander behind it).
  useEffect(() => {
    if (!open || !mounted) return
    const root = rootRef.current
    const siblings = root?.parentElement ? [...root.parentElement.children].filter((el) => el !== root) : []
    const touched = siblings.filter((el): el is HTMLElement => el instanceof HTMLElement && !el.inert)
    touched.forEach((el) => { el.inert = true })
    return () => touched.forEach((el) => { el.inert = false })
  }, [open, mounted])

  // Drag to dismiss (down for bottom sheets, up for top sheets): past 30% of the sheet's height, or a quick flick.
  // Native listeners so touchmove can be non-passive: at the top of the content, a downward swipe drags the
  // sheet instead of scrolling. Pointer capture starts only after 8px, so taps on buttons still work.
  useEffect(() => {
    const sheet = sheetRef.current
    if (!open || !mounted || !sheet) return
    const dir = placement === 'bottom' ? 1 : -1
    const THRESHOLD = 8
    const contentOf = (t: EventTarget | null) => (t instanceof Element ? t.closest<HTMLElement>('[data-sheet-content]') : null)
    const atEdge = (el: HTMLElement | null) =>
      !el || (dir === 1 ? el.scrollTop <= 0 : el.scrollTop + el.clientHeight >= el.scrollHeight - 1)
    const offset = (e: globalThis.PointerEvent) => (e.clientY - (drag.current?.startY ?? e.clientY)) * dir

    const down = (e: globalThis.PointerEvent) => {
      if (e.button !== 0) return
      drag.current = { id: e.pointerId, startY: e.clientY, startT: e.timeStamp, content: contentOf(e.target), active: false }
    }
    const move = (e: globalThis.PointerEvent) => {
      const d = drag.current
      if (!d || d.id !== e.pointerId) return
      const dy = offset(e)
      if (!d.active) {
        if (dy < THRESHOLD) return
        if (!atEdge(d.content)) { drag.current = null; return } // the content scrolls instead
        d.active = true
        sheet.setPointerCapture(e.pointerId)
      }
      setDragY(Math.max(0, dy) * dir)
    }
    const up = (e: globalThis.PointerEvent) => {
      const d = drag.current
      if (!d || d.id !== e.pointerId) return
      drag.current = null
      if (!d.active) return
      const moved = Math.max(0, (e.clientY - d.startY) * dir)
      const velocity = moved / Math.max(1, e.timeStamp - d.startT)
      if (moved > sheet.offsetHeight * 0.3 || velocity > 0.5) onCloseRef.current()
      else setDragY(0)
    }
    const cancel = () => {
      drag.current = null
      setDragY(0)
    }
    // Stop the content from scrolling (and the browser from cancelling the pointer) while the sheet is dragged.
    let touchY = 0
    const touchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? 0 }
    const touchMove = (e: TouchEvent) => {
      const dy = ((e.touches[0]?.clientY ?? 0) - touchY) * dir
      if (drag.current?.active || (dy > 0 && atEdge(contentOf(e.target)))) e.preventDefault()
    }

    sheet.addEventListener('pointerdown', down)
    sheet.addEventListener('pointermove', move)
    sheet.addEventListener('pointerup', up)
    sheet.addEventListener('pointercancel', cancel)
    sheet.addEventListener('touchstart', touchStart, { passive: true })
    sheet.addEventListener('touchmove', touchMove, { passive: false })
    return () => {
      sheet.removeEventListener('pointerdown', down)
      sheet.removeEventListener('pointermove', move)
      sheet.removeEventListener('pointerup', up)
      sheet.removeEventListener('pointercancel', cancel)
      sheet.removeEventListener('touchstart', touchStart)
      sheet.removeEventListener('touchmove', touchMove)
    }
  }, [open, mounted, placement])

  if (!mounted) return null

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    // Keep Tab inside the sheet.
    const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === sheetRef.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return createPortal(
    <div
      ref={rootRef}
      className={styles.root}
      data-contained={container ? '' : undefined}
      data-state={open ? 'open' : 'closed'}
      data-placement={placement}
      data-dragging={dragY !== 0 ? '' : undefined}
    >
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={label}
        tabIndex={-1}
        className={styles.dialog}
        onKeyDown={onKeyDown}
        style={dragY ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        <SheetDepthContext.Provider value={depth}>
          <BottomSheetSurface {...surface} placement={placement} />
        </SheetDepthContext.Provider>
        {/* No visible ✕: this button is for screen-reader and keyboard users (tap-outside and drag aren't available to them). */}
        <button type="button" className={styles.srClose} onClick={onClose}>{closeLabel}</button>
      </div>
    </div>,
    container ?? document.body,
  )
}
