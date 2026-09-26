import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { setViewportWidth, useViewportWidth, viewportWidths } from './viewport'
import styles from './Docs.module.css'

/**
 * `compact`: no notch or fixed height — a bare phone-width screen for playground previews.
 *
 * Mobile device frame on a patterned stage — these components are built for phone viewports.
 * The screen is exactly the chosen width (360 / 392 / 412, shared across the site); when the stage
 * is narrower than the phone, the whole phone is scaled down to fit instead of squashing the layout.
 */
export function PhoneFrame({ children, label, compact = false }: { children: ReactNode; label?: string; compact?: boolean }) {
  const width = useViewportWidth()
  const stageRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState({ scale: 1, height: 0 })

  useLayoutEffect(() => {
    const stage = stageRef.current
    const phone = phoneRef.current
    if (!stage || !phone) return
    const measure = () => {
      const css = getComputedStyle(stage)
      const available = stage.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight)
      const scale = Math.min(1, available / phone.offsetWidth)
      setFit({ scale, height: phone.offsetHeight * scale })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    observer.observe(phone)
    return () => observer.disconnect()
  }, [width])

  return (
    <div className={styles.stageWrap}>
      <ViewportPicker />
      <div ref={stageRef} className={styles.stage} role="figure" aria-label={label ? `${label} (${width}px wide)` : undefined}>
        <div className={styles.phoneSlot} style={fit.scale < 1 ? { height: fit.height } : undefined}>
          <div
            ref={phoneRef}
            className={styles.phone}
            data-compact={compact || undefined}
            style={{ '--screen-width': `${width}px`, transform: fit.scale < 1 ? `scale(${fit.scale})` : undefined } as CSSProperties}
          >
            {!compact && <div className={styles.phoneNotch} aria-hidden="true" />}
            <div className={styles.phoneScreen}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 360 / 392 / 412 segmented control — changes every phone frame on the site. */
export function ViewportPicker() {
  const width = useViewportWidth()
  return (
    <div className={styles.viewportPicker} role="radiogroup" aria-label="Preview width">
      {viewportWidths.map((w) => (
        <button key={w} type="button" role="radio" aria-checked={w === width} onClick={() => setViewportWidth(w)}>
          {w}px
        </button>
      ))}
    </div>
  )
}
