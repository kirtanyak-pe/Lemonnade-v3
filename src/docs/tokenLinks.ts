import { useEffect } from 'react'
import { href } from './useHashRoute'

/**
 * Turns a token name — or a Resources chip like "content/primary · secondary",
 * "text-semibold-12 · 14", "state-layer/*" — into a link to the foundation page that shows it,
 * with ?token= so that page scrolls to and highlights it. Returns null for families without a page
 * (shadow, motion, opacity).
 */
export function tokenHref(label: string): string | null {
  const name = label.trim().split(/\s/)[0]
  if (/^(surface|content|border|component|static)\//.test(name)) return href('colors', undefined, { token: name })
  if (name.startsWith('state-layer/')) return href('colors', undefined, { token: `component/${name}` })
  if (name.startsWith('text-')) return href('typography', undefined, { token: name })
  if (/^(spacing|radius|size|icon-size)\//.test(name)) return href('spacing', undefined, { token: name })
  return null
}

/** On a foundation page: scroll to the element whose data-token matches, and flash it. */
export function useTokenHighlight(token: string | null, pageId: string) {
  useEffect(() => {
    if (!token) return
    const prefix = token.replace(/\*$/, '')
    // Wait a frame so the page (and a newly switched page) has rendered.
    const raf = requestAnimationFrame(() => {
      const all = [...document.querySelectorAll<HTMLElement>('[data-token]')]
      const el = all.find((e) => e.dataset.token === token) ?? all.find((e) => e.dataset.token?.startsWith(prefix))
      if (!el) return
      el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      el.setAttribute('data-highlight', '')
      setTimeout(() => el.removeAttribute('data-highlight'), 2400)
    })
    return () => cancelAnimationFrame(raf)
  }, [token, pageId])
}
