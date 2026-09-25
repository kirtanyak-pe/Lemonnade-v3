import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import styles from './BottomSheet.module.css'

/** Figma "L3: Bottom sheet" (node 4543:63932). Figma isBottom=False → `placement="top"`. */
export type BottomSheetPlacement = 'bottom' | 'top'

type SurfaceProps = {
  placement?: BottomSheetPlacement
  /** Figma 👁️ Header — usually <BottomSheetHeader />. */
  header?: ReactNode
  /** Figma "content slot". Scrolls when the sheet is taller than the screen allows. */
  children?: ReactNode
  /** Figma "Buttons" — usually <ButtonGroup>. */
  footer?: ReactNode
  /** Figma "Utility slot" (below the buttons). */
  utility?: ReactNode
  /** Figma 👁️ Drag handle (bottom sheets). In the modal it also drags the sheet down to dismiss. */
  dragHandle?: boolean
  className?: string
}

/** The sheet panel on its own — no overlay or portal. Use <BottomSheet> for the modal. */
export function BottomSheetSurface({
  placement = 'bottom',
  header,
  children,
  footer,
  utility,
  dragHandle = false,
  className,
  handleProps,
  style,
}: SurfaceProps & { handleProps?: Record<string, unknown>; style?: CSSProperties }) {
  return (
    <div className={[styles.surface, className].filter(Boolean).join(' ')} data-placement={placement} style={style}>
      {dragHandle && placement === 'bottom' && (
        <div className={styles.handleArea} {...handleProps}>
          <span className={styles.handle} />
        </div>
      )}
      {header}
      <div className={styles.content}>{children}</div>
      {footer}
      {utility}
    </div>
  )
}

export type BottomSheetProps = SurfaceProps & {
  open: boolean
  /** Called on backdrop tap, Escape, the header's close button (wire it), or drag-down. */
  onClose: () => void
  /** Accessible name: point at the header's heading id, or use aria-label. */
  'aria-labelledby'?: string
  'aria-label'?: string
  /** Where to render (default document.body). Pass an element to keep the sheet inside it (e.g. a phone frame). */
  container?: HTMLElement | null
}

const EXIT_MS = 300 // fallback unmount if transitionend doesn't fire (reduced motion, hidden tab)

/**
 * Modal bottom (or top) sheet over the Figma "L3: Overlay" backdrop.
 * Slides in, traps focus, closes on backdrop / Escape / drag-down, restores focus, locks page scroll.
 */
export function BottomSheet({
  open,
  onClose,
  container,
  placement = 'bottom',
  dragHandle = false,
  'aria-labelledby': labelledBy,
  'aria-label': label,
  ...surface
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(open)
  const [dragY, setDragY] = useState(0)
  const [prevOpen, setPrevOpen] = useState(open)
  const sheetRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startY: number; startT: number } | null>(null)

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

  // Make everything behind the sheet inert (screen-reader browse mode can't wander behind it).
  useEffect(() => {
    if (!open || !mounted) return
    const root = rootRef.current
    const siblings = root?.parentElement ? [...root.parentElement.children].filter((el) => el !== root) : []
    const touched = siblings.filter((el): el is HTMLElement => el instanceof HTMLElement && !el.inert)
    touched.forEach((el) => { el.inert = true })
    return () => touched.forEach((el) => { el.inert = false })
  }, [open, mounted])

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

  // Drag the handle down to dismiss: past 30% of the sheet's height, or a quick flick.
  const handleProps = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      drag.current = { startY: e.clientY, startT: e.timeStamp }
      e.currentTarget.setPointerCapture(e.pointerId)
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (drag.current) setDragY(Math.max(0, e.clientY - drag.current.startY))
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => {
      if (!drag.current) return
      const dy = Math.max(0, e.clientY - drag.current.startY)
      const velocity = dy / Math.max(1, e.timeStamp - drag.current.startT)
      const height = sheetRef.current?.offsetHeight ?? Infinity
      drag.current = null
      if (dy > height * 0.3 || velocity > 0.5) onClose()
      else setDragY(0)
    },
    onPointerCancel: () => {
      drag.current = null
      setDragY(0)
    },
  }

  return createPortal(
    <div
      ref={rootRef}
      className={styles.root}
      data-contained={container ? '' : undefined}
      data-state={open ? 'open' : 'closed'}
      data-placement={placement}
      data-dragging={dragY > 0 ? '' : undefined}
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
        <BottomSheetSurface {...surface} placement={placement} dragHandle={dragHandle} handleProps={handleProps} />
      </div>
    </div>,
    container ?? document.body,
  )
}
