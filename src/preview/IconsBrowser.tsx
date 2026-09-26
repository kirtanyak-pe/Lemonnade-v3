// Browse / search the full Material Symbols set (like Google's picker). Loaded lazily by the docs.
import { useDeferredValue, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Icon, type IconSize } from '../components/Icon'
import { Tabs } from '../components/Tabs'
import { TextField } from '../components/TextField'
import icons from '../icons/material/icons.json'

// URLs only (not inlined), so the browser fetches just the icons on screen.
const urls = import.meta.glob<string>('../icons/material/rounded/*.svg', { query: '?url&no-inline', import: 'default', eager: true })
const urlFor = (name: string, fill: boolean) => urls[`../icons/material/rounded/${name}${fill ? '-fill' : ''}.svg`]
const ident = (name: string) => 'ms' + name.split('_').map((p) => p[0].toUpperCase() + p.slice(1)).join('')

type Entry = (typeof icons)[number]
const categories = ['All', ...[...new Set(icons.flatMap((i) => i.categories))].sort()]
const PAGE = 240
const sizes: IconSize[] = [16, 20, 24]

export function IconsBrowser() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [fill, setFill] = useState<'outline' | 'fill'>('outline')
  const [limit, setLimit] = useState(PAGE)
  const [picked, setPicked] = useState<Entry | null>(null)
  const [copied, setCopied] = useState(false)
  const q = useDeferredValue(query.trim().toLowerCase())

  const results = useMemo(() => {
    const list = icons.filter((i) =>
      (category === 'All' || i.categories.includes(category)) &&
      (!q || i.name.includes(q.replaceAll(' ', '_')) || i.tags.some((t) => t.toLowerCase().includes(q))),
    )
    return list.sort((a, b) => b.popularity - a.popularity)
  }, [q, category])

  const isFill = fill === 'fill'
  const importLine = picked && `import { ${ident(picked.name)}${isFill && picked.hasFill ? 'Fill' : ''} } from '../icons/material'`

  return (
    <div className="icons-browser">
      <div className="icons-toolbar">
        <TextField
          label="Search icons"
          placeholder="e.g. wallet, arrow, chart"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setLimit(PAGE) }}
          helperText={`${results.length} of ${icons.length} icons · Rounded · weight 400 · grade 0 · 24dp`}
          helperIcon={false}
        />
        <Tabs aria-label="Fill" appearance="pill" size="sm" value={fill} onChange={setFill} items={[{ value: 'outline', label: 'Fill off' }, { value: 'fill', label: 'Fill on' }]} />
      </div>
      <Tabs
        aria-label="Category"
        appearance="pill"
        size="sm"
        value={category}
        onChange={(c) => { setCategory(c); setLimit(PAGE) }}
        items={categories.map((c) => ({ value: c, label: c.replace('&', ' & ') }))}
      />

      {picked && (
        <div className="icons-detail" aria-live="polite">
          <div className="icons-detail-preview">
            {sizes.map((s) => <Icon key={s} icon={urlFor(picked.name, isFill && picked.hasFill)} size={s} label={`${picked.name} at ${s}px`} />)}
          </div>
          <div className="icons-detail-text">
            <strong>{picked.name}</strong>
            <code>{importLine}</code>
            {!picked.hasFill && isFill && <span className="grid-note">No separate filled version — the outline is used.</span>}
          </div>
          <Button size="sm" variant="tertiary" onClick={() => { navigator.clipboard?.writeText(importLine!); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
            {copied ? 'Copied' : 'Copy import'}
          </Button>
        </div>
      )}

      <ul className="icons-grid">
        {results.slice(0, limit).map((i) => (
          <li key={i.name}>
            <button type="button" className="icons-cell" aria-pressed={picked?.name === i.name} onClick={() => setPicked(i)}>
              <Icon icon={urlFor(i.name, isFill && i.hasFill)} size={24} />
              <span>{i.name}</span>
            </button>
          </li>
        ))}
      </ul>
      {results.length > limit && (
        <Button variant="secondary" size="md" onClick={() => setLimit((l) => l + PAGE)}>
          Show more ({results.length - limit} left)
        </Button>
      )}
    </div>
  )
}
