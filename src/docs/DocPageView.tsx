import type { ReactNode } from 'react'
import { Tag } from '../components/Tag'
import { figmaUrl } from './pages'
import { PropsTable } from './PropsTable'
import type { DocPage } from './types'
import { href } from './useHashRoute'
import styles from './Docs.module.css'

type Tab = { id: string; label: string; content: ReactNode }

function tabsFor(page: DocPage): Tab[] {
  if (page.content) return []
  const tabs: Tab[] = []
  if (page.overview) tabs.push({ id: 'overview', label: 'Overview', content: page.overview })
  if (page.variants) tabs.push({ id: 'variants', label: 'Variants', content: page.variants })
  if (page.props) tabs.push({ id: 'api', label: 'API', content: <PropsTable rows={page.props} /> })
  tabs.push({ id: 'resources', label: 'Resources', content: <Resources page={page} /> })
  return tabs
}

export function DocPageView({ page, tabId }: { page: DocPage; tabId: string }) {
  const tabs = tabsFor(page)
  const active = tabs.find((t) => t.id === tabId) ?? tabs[0]

  return (
    <article className={styles.article}>
      <div className={styles.breadcrumb}>
        {page.group} / {page.title}
      </div>
      <div className={styles.titleRow}>
        <h1>{page.title}</h1>
        {page.status && <Tag variant="secondary" color="green" size="lg">{page.status}</Tag>}
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
            {page.tokens.map((t) => <code key={t}>{t}</code>)}
          </dd>
        </div>
      )}
    </dl>
  )
}
