import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import styles from './Card.module.css'

/**
 * L3 Card. Two kinds:
 * - **Clickable** (`onClick` or `href`): the whole card is the tap target — surface/primary, border/light,
 *   elevation-low, and it scales down while pressed. A card with a single action is always a clickable card.
 * - **Static** (neither): decorative or informational — rounded, border/light, surface/default, no shadow, no press.
 * - **Flat** (`variant="flat"`): no radius, no border, no shadow, transparent background unless `surface` is set.
 *   Can still be clickable (keeps the press scale, hover and focus).
 * - **Filled** (`variant="filled"`): grey inset panel — rounded, surface/secondary, no border, no shadow. Groups details
 *   (contract info, stats, market depth) on a white screen. Things inside that need their own fill use surface/tertiary.
 *
 * **Selected** (`selected`, clickable cards only — the chosen option in a list of choices): a bordered card swaps
 * border/light for border/dark; a flat card gets a surface/secondary background (by default it has none and takes the
 * colour of whatever it sits on).
 */
export type CardSurface = 'default' | 'primary' | 'secondary' | 'tertiary' | 'inverted'

/**
 * Padding & placement: cards sit inside a margin — never touching their container's edges (the parent provides it: 16
 * from the screen edge, 16 between cards). Padding is 12 by default. `padding="none"` is for a card whose content
 * brings its own padding — sections stacked inside it, like a 12-padded body and a full-width footer strip — and the
 * content must still sit 12 from the card edge. Filled cards are always padded; flat cards run edge to edge.
 */
type CardLayout =
  | { /** Rounded card (clickable / static). `none`: the content's sections bring their own 12 padding. */ variant?: 'default'; padding?: 'default' | 'none' }
  | { /** Filled cards are always padded. */ variant: 'filled'; padding?: 'default' }
  | { /** `flat`: not rounded, no border, no shadow, transparent background (unless `surface` is set); edge to edge. */ variant: 'flat'; /** `none` for edge-to-edge content (images, lists) — flat cards only. */ padding?: 'default' | 'none' }

export type CardProps = CardLayout & {
  children: ReactNode
  /** Makes the whole card a button. */
  onClick?: () => void
  /** Makes the whole card a link. */
  href?: string
  /** Element for a static card. */
  as?: 'div' | 'article' | 'section' | 'li'
  /** Set the background yourself (a surface token). Flat cards are transparent without it. */
  surface?: CardSurface
  /**
   * The chosen option in a list of choices (clickable cards only). Bordered → border/dark; flat → surface/secondary.
   * Announced as pressed (button) or current (link).
   */
  selected?: boolean
  /** Accessible name for a clickable card when its text alone isn't a good one. */
  'aria-label'?: string
  className?: string
}

export function Card({ children, onClick, href, as = 'div', padding = 'default', variant = 'default', surface, selected = false, 'aria-label': ariaLabel, className }: CardProps) {
  const ref = useRef<HTMLElement>(null)
  const clickable = Boolean(onClick || href)
  const Element = href ? 'a' : onClick ? 'button' : as

  // Dev-only checks for the card rules.
  useEffect(() => {
    // Skip illustrations (e.g. docs Don't examples), which are rendered inert on purpose.
    if (!import.meta.env.DEV || !ref.current || ref.current.closest('[inert]')) return
    const controls = ref.current.querySelectorAll('button, a[href], input, select, textarea')
    // "One action" means one button or link — a card holding just a switch or a field is a settings card.
    const actions = ref.current.querySelectorAll('button, a[href]')
    if (selected && !clickable) {
      console.warn('[L3] <Card selected> needs onClick or href — only clickable cards can be selected.', ref.current)
    }
    if (clickable && controls.length > 0) {
      console.warn('[L3] <Card> is clickable but contains another control. A clickable card has one action: the card itself.', ref.current)
    } else if (!clickable && controls.length === 1 && actions.length === 1) {
      console.warn('[L3] <Card> has a single action inside. Make the whole card clickable (onClick / href) instead of placing one button in it.', ref.current)
    }
  })

  return (
    <Element
      ref={ref as never}
      className={[styles.card, className].filter(Boolean).join(' ')}
      data-interactive={clickable || undefined}
      data-padding={padding}
      data-variant={variant}
      data-selected={(clickable && selected) || undefined}
      style={surface ? ({ '--card-surface': `var(--l3-surface-${surface})` } as CSSProperties) : undefined}
      {...(Element === 'button' ? { type: 'button' as const, onClick, 'aria-pressed': selected } : {})}
      {...(Element === 'a' ? { href, onClick, 'aria-current': selected ? ('true' as const) : undefined } : {})}
      aria-label={ariaLabel}
    >
      {children}
    </Element>
  )
}
