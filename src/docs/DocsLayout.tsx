import { useEffect, useRef, useState } from 'react'
import { defaultPageId, navGroups, pages } from './pages'
import { DocPageView } from './DocPageView'
import { BrandLogo } from '../components/BrandLogo'
import { BuildPage } from '../build/BuildPage'
import { Search } from './Search'
import { ThemeControls } from './ThemeControls'
import { ProductChooser } from './ProductChooser'
import { href, useHashRoute } from './useHashRoute'
import styles from './Docs.module.css'

export function DocsLayout() {
  const { page: pageId, tab, query } = useHashRoute()
  const page = pages.find((p) => p.id === pageId) ?? pages.find((p) => p.id === defaultPageId)!
  const isBuild = pageId === 'build'
  // The mobile drawer is open "for" the page it was opened on, so navigating closes it.
  const [railOpenOn, setRailOpenOn] = useState<string | null>(null)
  const railOpen = railOpenOn === page.id
  const setRailOpen = (open: boolean) => setRailOpenOn(open ? page.id : null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const menuRef = useRef<HTMLButtonElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  // Mobile drawer behaves like a modal: focus moves in, Esc closes (focus back to the menu button),
  // and the page behind is inert while it's open.
  useEffect(() => {
    if (!railOpen) return
    const main = mainRef.current
    const rail = railRef.current
    ;(rail?.querySelector<HTMLElement>('a[aria-current="page"]') ?? rail?.querySelector<HTMLElement>('a'))?.focus()
    if (main) main.inert = true
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setRailOpenOn(null)
      menuRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (main) main.inert = false
    }
  }, [railOpen])

  // New page: jump to top, update the tab title, and keep the current page visible in the sidebar.
  useEffect(() => {
    window.scrollTo(0, 0)
    // Desktop only: on small screens the sidebar is a closed drawer.
    if (matchMedia('(min-width: 901px)').matches) {
      const rail = railRef.current
      const current = rail?.querySelector<HTMLElement>('a[aria-current="page"]')
      if (rail && current) {
        const top = current.offsetTop - rail.offsetTop
        if (top < rail.scrollTop || top + current.offsetHeight > rail.scrollTop + rail.clientHeight) rail.scrollTo({ top: top - rail.clientHeight / 3 })
      }
    }
    document.title = isBuild ? 'Build · L3 Design System' : `${page.title} · L3 Design System`
  }, [page, isBuild])

  const section = page.group === 'Foundations' ? 'foundations' : page.group === 'Start' ? 'home' : 'components'

  return (
    <div className={styles.layout}>
      {!isBuild && (
        <a className={styles.skipLink} href="#docs-main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
          Skip to content
        </a>
      )}
      <ProductChooser />
      <header className={styles.header}>
        <button
          ref={menuRef}
          type="button"
          className={styles.menuButton}
          aria-label={railOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={railOpen}
          aria-controls="docs-rail"
          onClick={() => setRailOpen(!railOpen)}
        >
          <span className={styles.menuIcon} aria-hidden="true" />
        </button>

        <a className={styles.brand} href={href(defaultPageId)}>
          <BrandLogo brand="lemonn" variant="icon" decorative />
          Lemonnade V3
        </a>

        <Search />

        <ThemeControls />

        <nav className={styles.topNav} aria-label="Sections">
          <a href={href('colors')} aria-current={section === 'foundations' ? 'page' : undefined}>Foundations</a>
          <a href={href('button')} aria-current={section === 'components' ? 'page' : undefined}>Components</a>
          <a href={href('build')} aria-current={isBuild ? 'page' : undefined}>Build</a>
        </nav>
      </header>

      {isBuild ? (
        <BuildPage />
      ) : (
      <div className={styles.body}>
        <nav ref={railRef} id="docs-rail" className={styles.rail} data-open={railOpen || undefined} aria-label="Pages">
          {navGroups.map(({ group, pages: groupPages }) => {
            const isCollapsed = collapsed[group] && !groupPages.includes(page)
            return (
              <div key={group} className={styles.navGroup}>
                <button
                  type="button"
                  className={styles.navGroupButton}
                  aria-expanded={!isCollapsed}
                  onClick={() => setCollapsed((c) => ({ ...c, [group]: !isCollapsed }))}
                >
                  {group}
                  <span className={styles.chevron} aria-hidden="true" />
                </button>
                {!isCollapsed && (
                  <ul>
                    {groupPages.map((p) => (
                      <li key={p.id}>
                        <a
                          className={styles.navItem}
                          href={href(p.id)}
                          aria-current={p === page ? 'page' : undefined}
                          onClick={() => setRailOpen(false)}
                        >
                          {p.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </nav>
        {railOpen && <div className={styles.scrim} onClick={() => setRailOpen(false)} aria-hidden="true" />}

        <main ref={mainRef} id="docs-main" tabIndex={-1} className={styles.main}>
          <DocPageView page={page} tabId={tab} highlightToken={query.get('token')} />
        </main>
      </div>
      )}
    </div>
  )
}
