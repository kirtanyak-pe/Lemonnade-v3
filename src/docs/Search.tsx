import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { MaskIcon } from '../components/MaskIcon'
import { msSearch } from '../icons/material'
import { numberVars, textStyles, themeTokenVars } from '../tokens'
import { pages } from './pages'
import { tokenHref } from './tokenLinks'
import { href } from './useHashRoute'
import styles from './Docs.module.css'

type Entry = { kind: 'Page' | 'Prop' | 'Token'; title: string; detail: string; href: string; keywords: string }

function buildIndex(): Entry[] {
  const entries: Entry[] = []
  for (const p of pages) {
    entries.push({ kind: 'Page', title: p.title, detail: p.group, href: href(p.id), keywords: `${p.altNames ?? ''} ${p.description}`.toLowerCase() })
    for (const prop of p.props ?? []) {
      entries.push({ kind: 'Prop', title: prop.name, detail: `${p.title} · ${prop.type}`, href: href(p.id, 'api'), keywords: prop.description.toLowerCase() })
    }
  }
  const tokens: [string, string][] = [
    ...Object.entries(themeTokenVars),
    ...Object.entries(numberVars),
    ...textStyles.map((t) => [t.cssVar.replace('--l3-', ''), `${t.figmaName} · ${t.cssVar}`] as [string, string]),
  ]
  for (const [name, detail] of tokens) {
    const link = tokenHref(name)
    if (link) entries.push({ kind: 'Token', title: name, detail, href: link, keywords: '' })
  }
  return entries
}

const kindOrder: Entry['kind'][] = ['Page', 'Prop', 'Token']

function search(index: Entry[], query: string): Entry[] {
  const q = query.trim().toLowerCase()
  if (!q) return index.filter((e) => e.kind === 'Page')
  const scored: [number, Entry][] = []
  for (const e of index) {
    const t = e.title.toLowerCase()
    const score = t === q ? 0 : t.startsWith(q) ? 1 : t.includes(q) ? 2 : e.keywords.includes(q) ? 3 : e.detail.toLowerCase().includes(q) ? 4 : -1
    if (score >= 0) scored.push([score, e])
  }
  return scored
    .sort((a, b) => kindOrder.indexOf(a[1].kind) - kindOrder.indexOf(b[1].kind) || a[0] - b[0])
    .slice(0, 40)
    .map(([, e]) => e)
}

/** ⌘K / Ctrl K / "/" search over pages (incl. alternative names), props and tokens. */
export function Search() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const index = useMemo(buildIndex, [])
  const results = useMemo(() => search(index, query), [index, query])

  const open = () => {
    setQuery('')
    setActive(0)
    dialogRef.current?.showModal()
  }
  const close = () => dialogRef.current?.close()
  const go = (entry: Entry | undefined) => {
    if (!entry) return
    close()
    window.location.hash = entry.href
  }

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        if (dialogRef.current?.open) close()
        else open()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Keep the highlighted result in view while arrowing.
  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })
  }, [active, listId])

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[active]) }
  }

  const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|ad)/.test(navigator.platform)

  return (
    <>
      <button type="button" className={styles.searchButton} onClick={open} aria-keyshortcuts="Meta+K Control+K /">
        <span className={styles.searchIcon} aria-hidden="true"><MaskIcon src={msSearch} /></span>
        <span className={styles.searchLabel}>Search</span>
        <kbd className={styles.searchKbd}>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>
      <dialog
        ref={dialogRef}
        className={styles.searchDialog}
        aria-label="Search the docs"
        onClick={(e) => { if (e.target === dialogRef.current) close() }}
      >
        <div className={styles.searchPanel}>
          <input
            ref={inputRef}
            className={styles.searchInput}
            type="search"
            placeholder="Search components, props, tokens…"
            value={query}
            autoFocus
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={onInputKey}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
          />
          <ul id={listId} role="listbox" className={styles.searchResults} aria-label="Results">
            {results.map((r, i) => (
              <li
                key={r.kind + r.title + r.detail}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={styles.searchResult}
                onMouseMove={() => setActive(i)}
                onClick={() => go(r)}
              >
                <span className={styles.searchKind}>{r.kind}</span>
                <span className={styles.searchTitle}>{r.title}</span>
                <span className={styles.searchDetail}>{r.detail}</span>
              </li>
            ))}
          </ul>
          {results.length === 0 && <p className={styles.searchEmpty}>No matches for “{query}”.</p>}
          <p className={styles.searchHint} aria-hidden="true">↑↓ to move · Enter to open · Esc to close</p>
        </div>
      </dialog>
    </>
  )
}
