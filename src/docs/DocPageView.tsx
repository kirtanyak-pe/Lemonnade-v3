import type { ReactNode } from 'react'
import { Tag } from '../components/Tag'
import { Guidelines } from './GuidelinesView'
import { guidelines } from './guidelineData'
import { figmaUrl } from './pages'
import { Playground } from './Playground'
import { playgrounds } from './playgrounds'
import { PropsTable } from './PropsTable'
import { ThemesGrid } from './ThemesGrid'
import { tokenHref, useTokenHighlight } from './tokenLinks'
import type { DocPage } from './types'
import { href } from './useHashRoute'
import styles from './Docs.module.css'

type Tab = { id: string; label: string; content: ReactNode }

function tabsFor(page: DocPage): Tab[] {
  if (page.content) return []
  const tabs: Tab[] = []
  const playground = playgrounds[page.id]
  const rules = guidelines[page.id]
  if (page.overview) tabs.push({ id: 'overview', label: 'Overview', content: <>{page.overview}{rules && <Guidelines items={rules} />}</> })
  if (playground) tabs.push({ id: 'playground', label: 'Playground', content: <Playground key={page.id} def={playground} /> })
  if (page.variants) tabs.push({ id: 'variants', label: 'Variants', content: page.variants })
  if (playground) {
    const initial = Object.fromEntries(playground.controls.map((c) => [c.name, c.default]))
    tabs.push({
      id: 'themes',
      label: 'Themes',
      content: (
        <>
          <p className={styles.tabIntro}>The playground's default example in every product and mode, side by side.</p>
          <ThemesGrid render={() => playground.render(initial)} />
        </>
      ),
    })
  }
  if (page.props) tabs.push({ id: 'api', label: 'API', content: <PropsTable rows={page.props} /> })
  tabs.push({ id: 'resources', label: 'Resources', content: <Resources page={page} /> })
  return tabs
}

export function DocPageView({ page, tabId, highlightToken }: { page: DocPage; tabId: string; highlightToken?: string | null }) {
  const tabs = tabsFor(page)
  const active = tabs.find((t) => t.id === tabId) ?? tabs[0]
  useTokenHighlight(highlightToken ?? null, page.id)

  // The home page brings its own hero and layout.
  if (page.id === 'home') return <article className={styles.article}>{page.content}</article>

  return (
    <article className={styles.article}>
      <div className={styles.breadcrumb}>
        {page.group} / {page.title}
      </div>
      <div className={styles.titleRow}>
        <h1>{page.title}</h1>
        {page.status && <Tag variant="secondary" color="green" size="lg">{page.status}</Tag>}
        {page.figmaNodeId && (
          <a className={styles.figmaLink} href={figmaUrl(page.figmaNodeId)} target="_blank" rel="noreferrer">
            <span className={styles.figmaMark} aria-hidden="true" />
            Open in Figma
            <span className={styles.visuallyHidden}> (opens in a new tab)</span>
          </a>
        )}
      </div>
      <p className={styles.lede}>{page.description}</p>

      {tabs.length > 0 && (
        <nav className={styles.pageTabs} aria-label={`${page.title} sections`}>
          {tabs.map((t) => (
            <a key={t.id} href={href(page.id, t.id)} aria-current={t === active ? 'page' : undefined}>
              {t.label}
            </a>
          ))}
        </nav>
      )}

      <div className={styles.tabBody}>
        {active ? active.content : page.content}
        {active?.id === 'overview' && page.altNames && (
          <section className={styles.section}>
            <h2>Common alternative names</h2>
            <p>{page.altNames}</p>
          </section>
        )}
      </div>
    </article>
  )
}

function Resources({ page }: { page: DocPage }) {
  return (
    <dl className={styles.resources}>
      {page.figmaNodeId && (
        <div>
          <dt>Figma</dt>
          <dd>
            <a href={figmaUrl(page.figmaNodeId)} target="_blank" rel="noreferrer">
              Lemonnade V3 · node {page.figmaNodeId}
            </a>
          </dd>
        </div>
      )}
      {page.source && (
        <div>
          <dt>Source</dt>
          <dd><code>{page.source}</code></dd>
        </div>
      )}
      {page.source && page.exports && (
        <div>
          <dt>Import</dt>
          <dd><code>{`import { ${page.exports.join(', ')} } from './components/${page.source.split('/').pop()}'`}</code></dd>
        </div>
      )}
      {page.tokens && (
        <div>
          <dt>Tokens</dt>
          <dd className={styles.tokenList}>
            {page.tokens.map((t) => {
              const link = tokenHref(t)
              return link ? (
                <a key={t} href={link} className={styles.tokenLink}><code>{t}</code></a>
              ) : (
                <code key={t} title="No foundation page for this token family yet">{t}</code>
              )
            })}
          </dd>
        </div>
      )}
    </dl>
  )
}
