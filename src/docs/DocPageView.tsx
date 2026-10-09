import { useEffect, useRef, type ReactNode } from 'react'
import { OnThisPage } from './OnThisPage'
import { Tag } from '../components/Tag'
import { changelog, currentVersion } from './changelog'
import { Guidelines } from './GuidelinesView'
import { guidelines } from './guidelineData'
import { figmaUrl, navGroups, pages, progressOf, progressTags } from './pages'
import figmaLogo from './assets/figma-logo.svg'
import { Playground } from './Playground'
import { playgrounds } from './playgrounds'
import { ReleaseTimeline } from './ReleaseTimeline'
import { ThemesGrid } from './ThemesGrid'
import { tokenHref, useTokenHighlight } from './tokenLinks'
import { ComponentTree } from './ComponentTree'
import { componentTrees } from './trees/componentTrees'
import type { DocPage } from './types'
import { docName } from './names'
import { href } from './useHashRoute'
import styles from './Docs.module.css'

type Tab = { id: string; label: string; content: ReactNode }

/** One long page per tab (Material-style); the right-hand index lists its sections. */
function Section({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      {intro && <p className={styles.tabIntro}>{intro}</p>}
      {children}
    </section>
  )
}

// Old per-topic tabs now live as sections inside the three tabs; old links still land on the right section.
export const LEGACY_TABS: Record<string, [tab: string, section: string]> = {
  playground: ['overview', 'try-it'],
  variants: ['specs', 'variants'],
  tree: ['specs', 'anatomy'],
  themes: ['specs', 'in-every-theme'],
  resources: ['specs', 'figma-variables-and-styles'],
}

function tabsFor(page: DocPage): Tab[] {
  if (page.content) return []
  const tabs: Tab[] = []
  const playground = playgrounds[page.id]
  const rules = guidelines[page.id]
  const tree = page.tree ?? componentTrees[page.id]

  // Overview: try it, then how to use it (the page's guideline sections), do & don't, other names.
  tabs.push({
    id: 'overview',
    label: 'Overview',
    content: (
      <>
        {playground && <Section title="Try it"><Playground key={page.id} def={playground} /></Section>}
        {page.overview}
        {rules && <Guidelines items={rules} />}
        {page.altNames && <Section title="Common alternative names"><p>{page.altNames}</p></Section>}
      </>
    ),
  })

  // Specs: every variant, the anatomy as a tree, every theme, and the Figma pieces.
  const specs: ReactNode[] = []
  if (page.variants) specs.push(<Section key="v" title="Variants">{page.variants}</Section>)
  if (tree) specs.push(<Section key="a" title="Anatomy" intro={<>Every option of {page.title}, as a tree: pick a branch, then the option that fits. Hover a box to trace it.</>}><ComponentTree spec={tree} /></Section>)
  if (playground) {
    const initial = Object.fromEntries(playground.controls.map((c) => [c.name, c.default]))
    specs.push(<Section key="t" title="In every theme" intro="The default example in every product and mode, side by side."><ThemesGrid render={() => playground.render(initial)} /></Section>)
  }
  if (page.figmaNodeId || page.tokens) specs.push(<Section key="r" title="Figma, variables and styles"><Resources page={page} /></Section>)
  // Props (page.props), source and import paths are for code: they live in the AI-agent docs (llms.txt), not on the site.
  if (specs.length) tabs.push({ id: 'specs', label: 'Specs', content: <>{specs}</> })

  if (changelog[page.id]) tabs.push({ id: 'whats-new', label: 'What’s new', content: <ReleaseTimeline releases={changelog[page.id]} /> })
  return tabs
}

/** Previous / next page in sidebar order (skips Home). */
function neighbours(page: DocPage) {
  const order = navGroups.flatMap((g) => g.pages).filter((p) => p.id !== 'home')
  const i = order.findIndex((p) => p.id === page.id)
  return { prev: i > 0 ? order[i - 1] : undefined, next: i >= 0 && i < order.length - 1 ? order[i + 1] : undefined }
}

export function DocPageView({ page, tabId, sectionId, highlightToken }: { page: DocPage; tabId: string; sectionId?: string; highlightToken?: string | null }) {
  const tabs = tabsFor(page)
  const legacy = LEGACY_TABS[tabId]
  const active = tabs.find((t) => t.id === (legacy ? legacy[0] : tabId)) ?? tabs[0]
  const section = legacy ? legacy[1] : sectionId
  const tabsRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
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
  const lifecycle = progressOf(page)
  const replacement = page.replacedBy ? pages.find((p) => p.id === page.replacedBy) : undefined

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
          {lifecycle && <Tag variant="secondary" color={progressTags[lifecycle].color} size="lg">{progressTags[lifecycle].label}</Tag>}
          {lifecycle === 'replaced' && replacement && (
            <a className={styles.replacedLink} href={href(replacement.id)}>by {replacement.title} →</a>
          )}
          {currentVersion(page.id) && (
            <a className={styles.versionLink} href={href(page.id, 'whats-new')} aria-label={`Version ${currentVersion(page.id)} — see what’s new`}>
              <Tag variant="secondary" color="neutral" size="lg">v{currentVersion(page.id)}</Tag>
            </a>
          )}
          {page.figmaNodeId && (
            <a className={styles.figmaLink} href={figmaUrl(page.figmaNodeId)} target="_blank" rel="noreferrer">
              <img className={styles.figmaMark} src={figmaLogo} alt="" />
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

      <div className={styles.tabLayout}>
        <div ref={bodyRef} className={styles.tabBody}>
          {active ? active.content : page.content}
          {!active && changelog[page.id] && (
            <section className={styles.section}>
              <h2>What’s new</h2>
              <ReleaseTimeline releases={changelog[page.id]} />
            </section>
          )}
        </div>
        <aside className={styles.tocColumn}>
          <OnThisPage container={bodyRef} deps={[page.id, active?.id]} route={active ? href(page.id, active.id) : href(page.id, 'page')} section={section} />
        </aside>
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
      {page.tokens && (
        <div>
          <dt>Figma variables &amp; styles</dt>
          <dd className={styles.tokenList}>
            {page.tokens.map((t) => {
              const link = tokenHref(t)
              return link ? (
                <a key={t} href={link} className={styles.tokenLink}><code>{docName(t)}</code></a>
              ) : (
                <code key={t} title="No foundation page for this token family yet">{docName(t)}</code>
              )
            })}
          </dd>
        </div>
      )}
    </dl>
  )
}
