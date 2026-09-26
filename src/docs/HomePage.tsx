import { Button } from '../components/Button'
import { Tag } from '../components/Tag'
import { productModes, products } from '../tokens'
import { CodeBlock, defaults } from './Playground'
import { pages } from './pages'
import { playgrounds } from './playgrounds'
import { href } from './useHashRoute'
import styles from './Docs.module.css'

const whatsNew = [
  { title: 'Empty state', id: 'empty-state', note: 'No-results illustration in theme colours, with a Clear action.' },
  { title: 'Bottom navbar', id: 'bottom-navbar', note: 'Main nav plus Mutual Fund and F&O sub-navs, with an animated switch.' },
  { title: 'Actionbar', id: 'actionbar', note: 'Top app bar with a title or search, actions and tabs below.' },
  { title: 'Icons', id: 'icons', note: 'The full Material Symbols Rounded library, 24dp.' },
]

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

  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Lemonnade V3 · L3 design system</p>
        <h1 className={styles.heroTitle}>Build trading screens that look and behave the same everywhere.</h1>
        <p className={styles.heroLede}>
          React components built from the Figma library, themed with L3 tokens for Lemonn, CS Pro and Kuber, and made for phones first.
        </p>
        <div className={styles.heroActions}>
          <Button size="lg" onClick={() => { window.location.hash = href('button') }}>Browse components</Button>
          <Button size="lg" variant="secondary" onClick={() => { window.location.hash = href('colors') }}>Foundations</Button>
        </div>
        <dl className={styles.stats}>
          <div><dt>Components</dt><dd>{components.length}</dd></div>
          <div><dt>Themes</dt><dd>{themeCount}</dd></div>
          <div><dt>Icons</dt><dd>3,900+</dd></div>
          <div><dt>Preview widths</dt><dd>360 · 392 · 412</dd></div>
        </dl>
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
                    <div className={styles.cardThumbInner}>{def ? def.render(defaults(def)) : null}</div>
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.cardTitle}>{p.title}</span>
                    <span className={styles.cardGroup}>{p.group}</span>
                  </div>
                  {p.status && <Tag className={styles.cardStatus} variant="secondary" color="green" size="sm">{p.status}</Tag>}
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Foundations</h2>
        <ul className={styles.foundationGrid}>
          {foundations.map((p) => (
            <li key={p.id}>
              <a className={styles.foundationCard} href={href(p.id)}>
                <span className={styles.cardTitle}>{p.title}</span>
                <span className={styles.cardGroup}>{p.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Quick start</h2>
        <CodeBlock code={quickStart} />
        <p>
          Use only <code>--l3-*</code> tokens in styles. Search anything with <kbd>⌘K</kbd> or <kbd>/</kbd>, and use the 360 · 392 · 412 switch above any phone preview to check layouts.
        </p>
      </section>

      <section className={styles.section}>
        <h2>What’s new</h2>
        <ul className={styles.whatsNew}>
          {whatsNew.map((w) => (
            <li key={w.id}>
              <a href={href(w.id)}>{w.title}</a>
              <span>{w.note}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
