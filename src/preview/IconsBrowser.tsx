// Browse / search the full Material Symbols set (like Google's picker). Loaded lazily by the docs.
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Button } from '../components/Button'
import { Icon, type IconSize } from '../components/Icon'
import { Tabs } from '../components/Tabs'
import { TextField } from '../components/TextField'
import icons from '../icons/material/icons.json'

// URLs only (not inlined), so the browser fetches just the icons on screen.
const urls = import.meta.glob<string>('../icons/material/rounded/*.svg', { query: '?url&no-inline', import: 'default', eager: true })
const urlFor = (name: string, fill: boolean) => urls[`../icons/material/rounded/${name}${fill ? '-fill' : ''}.svg`]

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
  const [done, setDone] = useState<string | null>(null)
  const [svg, setSvg] = useState<{ url: string; text: string } | null>(null)
  const q = useDeferredValue(query.trim().toLowerCase())

  const results = useMemo(() => {
    const list = icons.filter((i) =>
      (category === 'All' || i.categories.includes(category)) &&
      (!q || i.name.includes(q.replaceAll(' ', '_')) || i.tags.some((t) => t.toLowerCase().includes(q))),
    )
    return list.sort((a, b) => b.popularity - a.popularity)
  }, [q, category])

  const isFill = fill === 'fill'
  const fileName = picked && `${picked.name}${isFill && picked.hasFill ? '-fill' : ''}.svg`

  const svgUrl = picked && urlFor(picked.name, isFill && picked.hasFill)

  // Load the picked icon's SVG up front, so Copy runs straight from the click (Safari drops clipboard access after an await).
  useEffect(() => {
    if (!svgUrl) return
    let live = true
    fetch(svgUrl).then((r) => r.text()).then((text) => { if (live) setSvg({ url: svgUrl, text }) })
    return () => { live = false }
  }, [svgUrl])
  const svgText = svg?.url === svgUrl ? svg.text : null

  // Brief feedback on the button that was used. SVG markup on the clipboard pastes into Figma as an editable vector.
  const flash = (action: string) => { setDone(action); setTimeout(() => setDone((d) => (d === action ? null : d)), 1500) }
  const copyText = (action: string, text: string) => {
    if (!navigator.clipboard) return flash(`${action}-failed`)
    navigator.clipboard.writeText(text).then(() => flash(action), () => flash(`${action}-failed`))
  }
  const label = (action: string, idle: string, ok = 'Copied') =>
    done === action ? ok : done === `${action}-failed` ? 'Copy blocked' : idle
  const downloadSvg = () => {
    const href = URL.createObjectURL(new Blob([svgText!], { type: 'image/svg+xml' }))
    Object.assign(document.createElement('a'), { href, download: fileName! }).click()
    setTimeout(() => URL.revokeObjectURL(href))
    flash('download')
  }

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
        <Tabs aria-label="Fill" appearance="pill" size="md" value={fill} onChange={setFill} items={[{ value: 'outline', label: 'Fill off' }, { value: 'fill', label: 'Fill on' }]} />
      </div>
      <Tabs
        aria-label="Category"
        appearance="pill"
        size="md"
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
            {!picked.hasFill && isFill && <span className="grid-note">No separate filled version — the outline is used.</span>}
            <span className="grid-note">Copy SVG, then paste in Figma to get an editable vector (24 × 24).</span>
          </div>
          <div className="icons-detail-actions">
            <Button size="sm" variant="tertiary" disabled={!svgText} onClick={() => copyText('svg', svgText!)}>{label('svg', 'Copy SVG')}</Button>
            <Button size="sm" variant="tertiary" disabled={!svgText} onClick={downloadSvg}>{label('download', 'Download SVG', 'Downloaded')}</Button>
            <Button size="sm" variant="tertiary" onClick={() => copyText('name', picked.name)}>{label('name', 'Copy name')}</Button>
          </div>
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
        <Button variant="tertiary" size="md" onClick={() => setLimit((l) => l + PAGE)}>
          Show more ({results.length - limit} left)
        </Button>
      )}
    </div>
  )
}
