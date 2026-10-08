import styles from './Overlay.module.css'

export type OverlayProps = {
  /** Fades in when true. */
  open: boolean
  /** Tap on the scrim — usually closes the sheet or dialog above it. */
  onClick?: () => void
  className?: string
}

/**
 * L3 Overlay (Figma L3: Overlay): the dimmed scrim behind modal content — surface/overlay.
 * Fills its positioned parent; render the modal panel after it. Decorative (aria-hidden): the panel above it
 * owns the dialog semantics and its own keyboard close.
 */
export function Overlay({ open, onClick, className }: OverlayProps) {
  return <div className={[styles.overlay, className].filter(Boolean).join(' ')} data-open={open || undefined} onClick={onClick} aria-hidden="true" />
}
