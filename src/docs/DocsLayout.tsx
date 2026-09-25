import { useEffect, useState } from 'react'
import { productLabels, products } from '../tokens'
import { useTheme, type ModePreference } from '../theme'
import { defaultPageId, navGroups, pages } from './pages'
import { DocPageView } from './DocPageView'
import { href, useHashRoute } from './useHashRoute'
import styles from './Docs.module.css'

export function DocsLayout() {
  const { page: pageId, tab } = useHashRoute()
  const page = pages.find((p) => p.id === pageId) ?? pages.find((p) => p.id === defaultPageId)!
  // The mobile drawer is open "for" the page it was opened on, so navigating closes it.
  const [railOpenOn, setRailOpenOn] = useState<string | null>(null)
  const railOpen = railOpenOn === page.id
  const setRailOpen = (open: boolean) => setRailOpenOn(open ? page.id : null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // New page: jump to top, update the tab title.
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${page.title} · L3 Design System`
  }, [page])

  const section = page.group === 'Foundations' ? 'foundations' : 'components'

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <button
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
          <span className={styles.brandMark} aria-hidden="true" />
          L3
        </a>

        <ThemeControls />

        <nav className={styles.topNav} aria-label="Sections">
          <a href={href('colors')} aria-current={section === 'foundations' ? 'page' : undefined}>Foundations</a>
          <a href={href('button')} aria-current={section === 'components' ? 'page' : undefined}>Components</a>
        </nav>
      </header>

      <div className={styles.body}>
        <nav id="docs-rail" className={styles.rail} data-open={railOpen || undefined} aria-label="Pages">
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

        <main className={styles.main}>
          <DocPageView page={page} tabId={tab} />
        </main>
      </div>
    </div>
  )
}

function ThemeControls() {
  const { product, modePreference, availableModes, setProduct, setModePreference } = useTheme()
  return (
    <div className={styles.themeControls}>
      <select aria-label="Product" value={product} onChange={(e) => setProduct(e.target.value as typeof product)}>
        {products.map((p) => <option key={p} value={p}>{productLabels[p]}</option>)}
      </select>
      <select aria-label="Mode" value={modePreference} onChange={(e) => setModePreference(e.target.value as ModePreference)}>
        <option value="system">System</option>
        <option value="light" disabled={!availableModes.includes('light')}>Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
