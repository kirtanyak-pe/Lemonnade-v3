import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Card.module.css'

/**
 * L3 Card. Two kinds:
 * - **Clickable** (`onClick` or `href`): the whole card is the tap target — surface/primary, border/light,
 *   elevation-low, and it scales down while pressed. A card with a single action is always a clickable card.
 * - **Static** (neither): decorative or informational — surface/primary + border/light, no shadow, no press.
 */
export type CardProps = {
  children: ReactNode
  /** Makes the whole card a button. */
  onClick?: () => void
  /** Makes the whole card a link. */
  href?: string
  /** Element for a static card. */
  as?: 'div' | 'article' | 'section' | 'li'
  /** `none` for edge-to-edge content (images, lists); default 16px. */
  padding?: 'default' | 'none'
  /** Accessible name for a clickable card when its text alone isn't a good one. */
  'aria-label'?: string
  className?: string
}

export function Card({ children, onClick, href, as = 'div', padding = 'default', 'aria-label': ariaLabel, className }: CardProps) {
  const ref = useRef<HTMLElement>(null)
  const clickable = Boolean(onClick || href)
  const Element = href ? 'a' : onClick ? 'button' : as

  // Dev-only checks for the card rules.
  useEffect(() => {
    // Skip illustrations (e.g. docs Don't examples), which are rendered inert on purpose.
    if (!import.meta.env.DEV || !ref.current || ref.current.closest('[inert]')) return
    const controls = ref.current.querySelectorAll('button, a[href], input, select, textarea')
    if (clickable && controls.length > 0) {
      console.warn('[L3] <Card> is clickable but contains another control. A clickable card has one action: the card itself.', ref.current)
    } else if (!clickable && controls.length === 1) {
      console.warn('[L3] <Card> has a single action inside. Make the whole card clickable (onClick / href) instead of placing one button in it.', ref.current)
    }
  })

  return (
    <Element
      ref={ref as never}
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-interactive={clickable || undefined}
      data-padding={padding}
      {...(Element === 'button' ? { type: 'button' as const, onClick } : {})}
      {...(Element === 'a' ? { href, onClick } : {})}
      aria-label={ariaLabel}
    >
      {children}
    </Element>
  )
}
