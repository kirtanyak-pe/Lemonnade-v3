import { useEffect, useState, type RefObject } from 'react'
import styles from './Docs.module.css'

// "On this page": the h2 sections of the current page / tab, Material-style. Gives each h2 an id, highlights the
// section being read, scrolls on click, and keeps the section in the URL (#/page/tab/section) so it can be shared.

const slug = (t: string) => t.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'

type Item = { id: string; title: string; el: HTMLElement }

export function OnThisPage({ container, deps, route, section }: { container: RefObject<HTMLElement | null>; deps: unknown[]; route: string; section?: string }) {
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState<string | null>(null)

  // Collect the sections after each render of the page / tab.
  useEffect(() => {
    const root = container.current
    if (!root) return
    const seen = new Set<string>()
    const found: Item[] = []
    root.querySelectorAll<HTMLElement>('h2').forEach((h) => {
      // Only the page's own sections: the first heading of a top-level <section>. Headings inside live demos (a sheet's
      // title) and in a section nested in another (a variant group) aren't sections of the page.
      const section = h.closest('section')
      if (h.closest('[data-toc-skip]') || !section || section.parentElement?.closest('section') || section.querySelector('h2') !== h) return
      let id = h.id || slug(h.textContent || '')
      while (seen.has(id)) id += '-2'
      seen.add(id)
      h.id = id
      found.push({ id, title: h.textContent || '', el: h })
    })
    setItems(found)
    setActive(found[0]?.id ?? null)
    // Deep link: #/page/tab/section scrolls straight to the section.
    if (section) {
      const target = found.find((f) => f.id === section)
      // After the layout's scroll-to-top and once late content (fonts, demos) has settled.
      if (target) {
        const go = () => target.el.scrollIntoView({ block: 'start' })
        const t = window.setTimeout(go, 50)
        document.fonts?.ready.then(go)
        return () => window.clearTimeout(t)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // Scroll spy: the last heading that has passed the top third of the viewport.
  useEffect(() => {
    if (!items.length) return
    const onScroll = () => {
      const line = window.innerHeight * 0.3
      let current = items[0].id
      for (const it of items) if (it.el.getBoundingClientRect().top <= line) current = it.id
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [items])

  if (items.length < 2) return null
  return (
    <nav className={styles.toc} aria-label="On this page">
      <p className={styles.tocTitle}>On this page</p>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a
              href={`${route}/${it.id}`}
              aria-current={active === it.id ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault()
                it.el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
                history.replaceState(null, '', `${route}/${it.id}`)
                setActive(it.id)
              }}
            >
              {it.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
