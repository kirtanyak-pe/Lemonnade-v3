import { useEffect, useRef, type ReactNode } from 'react'
import { Tag } from '../components/Tag'
import { changelog, currentVersion } from './changelog'
import { Guidelines } from './GuidelinesView'
import { guidelines } from './guidelineData'
import { figmaUrl, navGroups } from './pages'
import { Playground } from './Playground'
import { playgrounds } from './playgrounds'
import { PropsTable } from './PropsTable'
import { ReleaseTimeline } from './ReleaseTimeline'
import { ThemesGrid } from './ThemesGrid'
import { tokenHref, useTokenHighlight } from './tokenLinks'
import { ComponentTree } from './ComponentTree'
import { componentTrees } from './trees/componentTrees'
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
  const tree = page.tree ?? componentTrees[page.id]
  if (tree) {
    tabs.push({
      id: 'tree',
      label: 'Tree',
      content: (
        <>
          <p className={styles.tabIntro}>Every option of {page.title}, as a tree: pick a branch, then the option that fits. Hover a box to trace it.</p>
          <ComponentTree spec={tree} />
        </>
      ),
    })
  }
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
  if (changelog[page.id]) tabs.push({ id: 'whats-new', label: 'What’s new', content: <ReleaseTimeline releases={changelog[page.id]} /> })
  tabs.push({ id: 'resources', label: 'Resources', content: <Resources page={page} /> })
  return tabs
}

/** Previous / next page in sidebar order (skips Home). */
function neighbours(page: DocPage) {
  const order = navGroups.flatMap((g) => g.pages).filter((p) => p.id !== 'home')
  const i = order.findIndex((p) => p.id === page.id)
  return { prev: i > 0 ? order[i - 1] : undefined, next: i >= 0 && i < order.length - 1 ? order[i + 1] : undefined }
}

export function DocPageView({ page, tabId, highlightToken }: { page: DocPage; tabId: string; highlightToken?: string | null }) {
  const tabs = tabsFor(page)
  const active = tabs.find((t) => t.id === tabId) ?? tabs[0]
  const tabsRef = useRef<HTMLElement>(null)
  useTokenHighlight(highlightToken ?? null, page.id)

  // Keep the current section tab visible in the (horizontally scrolling) tab row.
  useEffect(() => {
    const row = tabsRef.current
    const current = row?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!row || !current) return
    const left = current.offsetLeft - row.offsetLeft
    if (left < row.scrollLeft || left + current.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: Math.max(0, left - 16) })
    }
  }, [page.id, active?.id])

  const { prev, next } = neighbours(page)
  const groupFirst = navGroups.find((g) => g.group === page.group)?.pages[0]

  // The home page brings its own hero and layout.
  if (page.id === 'home') return <article className={styles.article}>{page.content}</article>

  return (
    <article className={styles.article}>
      {/* Inverted header card: focuses the page on its title. */}
      <header className={styles.pageHeader}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          {groupFirst && groupFirst.id !== page.id ? <a href={href(groupFirst.id)}>{page.group}</a> : page.group} / <span aria-current="page">{page.title}</span>
        </nav>
        <div className={styles.titleRow}>
          <h1>{page.title}</h1>
          {page.status && <Tag variant="secondary" color="success" size="lg">{page.status}</Tag>}
          {currentVersion(page.id) && (
            <a className={styles.versionLink} href={href(page.id, 'whats-new')} aria-label={`Version ${currentVersion(page.id)} — see what’s new`}>
              <Tag variant="secondary" color="neutral" size="lg">v{currentVersion(page.id)}</Tag>
            </a>
          )}
          {page.figmaNodeId && (
            <a className={styles.figmaLink} href={figmaUrl(page.figmaNodeId)} target="_blank" rel="noreferrer">
              <span className={styles.figmaMark} aria-hidden="true" />
              Open in Figma
              <span className={styles.visuallyHidden}> (opens in a new tab)</span>
            </a>
          )}
        </div>
        <p className={styles.lede}>{page.description}</p>
      </header>

      {tabs.length > 0 && (
        <nav ref={tabsRef} className={styles.pageTabs} aria-label={`${page.title} sections`}>
          {tabs.map((t) => (
            <a key={t.id} href={href(page.id, t.id)} aria-current={t === active ? 'page' : undefined}>
              {t.label}
            </a>
          ))}
        </nav>
      )}

      <div className={styles.tabBody}>
        {active ? active.content : page.content}
        {!active && changelog[page.id] && (
          <section className={styles.section}>
            <h2>What’s new</h2>
            <ReleaseTimeline releases={changelog[page.id]} />
          </section>
        )}
        {active?.id === 'overview' && page.altNames && (
          <section className={styles.section}>
            <h2>Common alternative names</h2>
            <p>{page.altNames}</p>
          </section>
        )}
      </div>

      {(prev || next) && (
        <nav className={styles.pager} aria-label="More pages">
          {prev ? (
            <a className={styles.pagerLink} href={href(prev.id)} data-dir="prev">
              <span className={styles.pagerHint}>← Previous</span>
              <span className={styles.pagerTitle}>{prev.title}</span>
            </a>
          ) : <span />}
          {next && (
            <a className={styles.pagerLink} href={href(next.id)} data-dir="next">
              <span className={styles.pagerHint}>Next →</span>
              <span className={styles.pagerTitle}>{next.title}</span>
            </a>
          )}
        </nav>
      )}
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
