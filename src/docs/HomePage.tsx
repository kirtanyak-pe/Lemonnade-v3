import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Tag } from '../components/Tag'
import { productModes, products } from '../tokens'
import { msDevices, msEmojiSymbols, msPalette, msWidgets } from '../icons/material'
import { recentReleases } from './changelog'
import { defaults } from './Playground'
import { figmaUrl, pages } from './pages'
import { playgrounds } from './playgrounds'
import { href } from './useHashRoute'
import { foundationThumbs } from './FoundationThumbs'
import styles from './Docs.module.css'


export function HomePage() {
  const components = pages.filter((p) => p.group !== 'Foundations' && p.group !== 'Start' && p.group !== 'Patterns')
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
              The Figma library, rules and live examples for designing Lemonn, CS PRO and Kuber — one system, every theme, made for phones first.
            </p>
            <div className={styles.heroActions}>
              <Button size="lg" onClick={() => { window.location.hash = href('button') }}>Browse components</Button>
              <Button size="lg" variant="secondary" onClick={() => window.open(figmaUrl('0:1'), '_blank', 'noopener')}>Open Figma library</Button>
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
        <h2>Designing with Lemonnade</h2>
        <ol className={styles.steps}>
          <li><strong>Turn on the library.</strong> In your Figma file, open Assets → Libraries and enable <strong>✅ Lemonnade V3</strong> and <strong>👁️ Lemonnade V3 → Icons</strong>.</li>
          <li><strong>Start from a 360 × 800 frame</strong> and set its variable mode to your product: 🍋 LM, CS PRO or 🐲 Kuber, light or dark.</li>
          <li><strong>Use library components, not copies.</strong> Change them through their properties and fill their slots — never detach.</li>
          <li><strong>Only library styles and variables:</strong> L3 text styles for text, L3 color and spacing variables for everything else.</li>
          <li><strong>Check the rules</strong> on each component's Overview tab before handing off, and look at the screen in light and dark.</li>
        </ol>
        <p>
          Search anything with <kbd>⌘K</kbd> or <kbd>/</kbd>, and use the 360 · 392 · 412 switch above any phone preview to check layouts.
          AI design tools read the same rules as text: <a href="llms.txt">llms.txt</a>.
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
