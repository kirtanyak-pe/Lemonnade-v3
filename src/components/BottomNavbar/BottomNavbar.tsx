import { useLayoutEffect, useRef, type MouseEvent, type ReactNode } from 'react'
import { NavIcon } from './NavIcon.tsx'
import styles from './BottomNavbar.module.css'

export type BottomNavbarItem = {
  value: string
  label: string
  /** 24px icon. Colored content/tertiary; a <NavIcon> or any <Icon>/<MaskIcon>. */
  icon: ReactNode
  /** Shown when selected (e.g. <NavIcon selected />). Falls back to `icon` in content/accent/success. */
  selectedIcon?: ReactNode
  /** Render as a link instead of a button. */
  href?: string
}

/** Figma "L3: Bottom Navbar" (node 4543:61961) + "L3 → base navoption" (node 4543:77042). */
export type BottomNavbarProps = {
  items: BottomNavbarItem[]
  /** The current section. */
  value: string
  onChange?: (value: string) => void
  /**
   * Figma MF / F&O sub-navs: a "Home" item back to the main nav, followed by a separator.
   */
  home?: { label?: string; onClick?: () => void; href?: string }
  'aria-label'?: string
  /** Fix to the bottom of the viewport (adds the home-indicator safe area). */
  fixed?: boolean
  className?: string
}

export function BottomNavbar({ items, value, onChange, home, 'aria-label': ariaLabel = 'Main', fixed = false, className }: BottomNavbarProps) {
  const listRef = useNavSwitchAnimation(items, !!home)

  return (
    <nav aria-label={ariaLabel} className={[styles.navbar, className].filter(Boolean).join(' ')} data-fixed={fixed || undefined}>
      <ul ref={listRef} className={styles.tabs}>
        {home && (
          <li className={styles.homeItem} data-key="home">
            <Option
              label={home.label ?? 'Home'}
              icon={<NavIcon name="backHome" />}
              href={home.href}
              onClick={home.onClick}
            />
          </li>
        )}
        {items.map((item) => {
          const selected = item.value === value
          return (
            <li key={item.value} data-key={item.value}>
              <Option
                label={item.label}
                icon={selected ? (item.selectedIcon ?? item.icon) : item.icon}
                selected={selected}
                href={item.href}
                onClick={() => onChange?.(item.value)}
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * When the set of options changes (main nav ⇄ MF / F&O sub-nav), animate like a page move:
 * options present in both navs (the one you tapped) slide from their old slot to the new one,
 * and the new options slide in, staggered, from the side you're heading (right going into a
 * sub-nav, left going back Home). Timing comes from the motion tokens; skipped for reduced motion.
 */
function useNavSwitchAnimation(items: BottomNavbarItem[], hasHome: boolean) {
  const listRef = useRef<HTMLUListElement>(null)
  const prev = useRef<{ set: string; hasHome: boolean; lefts: Map<string, number> } | null>(null)
  const set = (hasHome ? 'home|' : '') + items.map((i) => i.value).join('|')

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const lis = [...list.children] as HTMLElement[]
    const lefts = new Map(lis.map((li) => [li.dataset.key ?? '', li.offsetLeft]))
    const before = prev.current
    prev.current = { set, hasHome, lefts }
    if (!before || before.set === set || matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const css = getComputedStyle(list)
    const duration = parseFloat(css.getPropertyValue('--l3-motion-duration-medium')) || 0
    const easing = css.getPropertyValue('--l3-motion-easing-standard').trim() || 'ease'
    const distance = parseFloat(css.getPropertyValue('--l3-spacing-24')) || 0
    const direction = !hasHome && before.hasHome ? -1 : 1
    const stagger = duration / (lis.length * 2)

    let entering = 0
    for (const li of lis) {
      const oldLeft = before.lefts.get(li.dataset.key ?? '')
      if (oldLeft !== undefined) {
        const dx = oldLeft - li.offsetLeft
        if (dx) li.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration, easing })
      } else {
        const order = direction > 0 ? entering : lis.length - entering
        li.animate(
          [{ transform: `translateX(${direction * distance}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration, easing, delay: order * stagger, fill: 'backwards' },
        )
        entering++
      }
    }
  })

  return listRef
}

function Option({ label, icon, selected = false, href, onClick }: { label: string; icon: ReactNode; selected?: boolean; href?: string; onClick?: () => void }) {
  const content = (
    <>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.label}>{label}</span>
    </>
  )
  const common = { className: styles.option, 'data-selected': selected || undefined, 'aria-current': selected ? ('page' as const) : undefined }

  if (href) {
    return (
      <a {...common} href={href} onClick={(e: MouseEvent) => { if (onClick) { e.preventDefault(); onClick() } }}>
        {content}
      </a>
    )
  }
  return (
    <button {...common} type="button" onClick={onClick}>
      {content}
    </button>
  )
}
