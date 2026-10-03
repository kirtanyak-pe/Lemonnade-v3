import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Tag } from '../components/Tag'
import { productModes, products } from '../tokens'
import { msDevices, msEmojiSymbols, msPalette, msWidgets } from '../icons/material'
import { recentReleases } from './changelog'
import { CodeBlock, defaults } from './Playground'
import { pages } from './pages'
import { playgrounds } from './playgrounds'
import { href } from './useHashRoute'
import { foundationThumbs } from './FoundationThumbs'
import styles from './Docs.module.css'


const quickStart = `// main.tsx — themes follow the product / mode chosen by the app
import './tokens'
import { ThemeProvider } from './theme'

<ThemeProvider>
  <App />
</ThemeProvider>

// Any screen
import { Button } from './components/Button'

<Button variant="buy" size="lg" fullWidth>Buy</Button>`

export function HomePage() {
  const components = pages.filter((p) => p.group !== 'Foundations' && p.group !== 'Start')
  const foundations = pages.filter((p) => p.group === 'Foundations')
  const themeCount = products.reduce((n, p) => n + productModes[p].length, 0)
  const latest = recentReleases(3)
  const lastUpdated = latest[0] && new Date(latest[0].date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <div className={styles.home}>
      {latest.length > 0 && (
        <aside className={styles.updates} aria-label="Latest updates">
          <Tag size="sm" variant="secondary" color="discover">What’s new</Tag>
          <span className={styles.updatesDate}>Updated {lastUpdated}</span>
          <ul className={styles.updatesList}>
            {latest.map((r) => (
              <li key={r.pageId}>
                <a href={href(r.pageId, 'whats-new')}>
                  <strong>{pages.find((p) => p.id === r.pageId)?.title}</strong> {r.summary}
                </a>
              </li>
            ))}
          </ul>
          <a className={styles.updatesAll} href="#home-whats-new" onClick={(e) => { e.preventDefault(); document.getElementById('home-whats-new')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }}>
            See all
          </a>
        </aside>
      )}

      {/* Intro on the left, the four stats in a 2×2 grid on the right (stacked below on narrow screens). */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroMain}>
            <p className={styles.heroEyebrow}>Lemonnade V3 · L3 design system</p>
            <h1 className={styles.heroTitle}>Simplifying investment</h1>
            <p className={styles.heroLede}>
              React components built from the Figma library, themed with L3 tokens for Lemonn, CS Pro and Kuber, and made for phones first.
            </p>
            <div className={styles.heroActions}>
              <Button size="lg" onClick={() => { window.location.hash = href('button') }}>Browse components</Button>
              <Button size="lg" variant="secondary" onClick={() => { window.location.hash = href('colors') }}>Foundations</Button>
            </div>
          </div>
          <dl className={styles.stats}>
            {[
              { icon: msWidgets, label: 'Components', value: String(components.length) },
              { icon: msPalette, label: 'Themes', value: `${themeCount} + ${themeCount} ♿` },
              { icon: msEmojiSymbols, label: 'Icons', value: '3,900+' },
              { icon: msDevices, label: 'Preview widths', value: '360 · 392 · 412' },
            ].map((s) => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statIcon}><Icon icon={s.icon} size={20} /></span>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Foundations</h2>
        <ul className={styles.cardGrid}>
          {foundations.map((p) => (
            <li key={p.id}>
              <a className={styles.componentCard} href={href(p.id)}>
                <div className={styles.cardThumb} aria-hidden="true">{foundationThumbs[p.id]?.thumb}</div>
                <div className={styles.cardBody}>
                  <span className={styles.cardTitle}>{p.title}</span>
                  <span className={styles.cardGroup}>{foundationThumbs[p.id]?.meta ?? p.group}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Components</h2>
        <ul className={styles.cardGrid}>
          {components.map((p) => {
            const def = playgrounds[p.id]
            return (
              <li key={p.id}>
                <a className={styles.componentCard} href={href(p.id)}>
                  <div className={styles.cardThumb} inert aria-hidden="true">
                    <div className={styles.cardThumbInner}>{def ? def.render({ ...defaults(def), ...def.thumbnail }) : null}</div>
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.cardTitle}>{p.title}</span>
                    <span className={styles.cardGroup}>{p.group}</span>
                  </div>
                  {p.status && <Tag className={styles.cardStatus} variant="secondary" color="success" size="sm">{p.status}</Tag>}
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Quick start</h2>
        <CodeBlock code={quickStart} />
        <p>
          Use only <code>--l3-*</code> tokens in styles. Search anything with <kbd>⌘K</kbd> or <kbd>/</kbd>, and use the 360 · 392 · 412 switch above any phone preview to check layouts.
        </p>
      </section>

      <section className={styles.section} id="home-whats-new">
        <h2>What’s new</h2>
        <ul className={styles.whatsNew}>
          {recentReleases().map((r) => (
            <li key={r.pageId}>
              <a href={href(r.pageId, 'whats-new')}>{pages.find((p) => p.id === r.pageId)?.title} v{r.version}</a>
              <span>{r.summary}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
