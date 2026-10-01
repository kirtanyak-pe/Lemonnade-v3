import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Aerobar, type AerobarType } from '../../components/Aerobar'
import { Button, type ButtonVariant } from '../../components/Button'
import { Tabs } from '../../components/Tabs'
import { Tag, type TagColor } from '../../components/Tag'
import { TextField } from '../../components/TextField'
import { ListCell } from '../../components/ListCell'
import { baseColorVars, themeTokenVars, type ThemeToken } from '../../tokens'
import { defaults } from '../Playground'
import { playgrounds } from '../playgrounds'
import { aliasOf, allTokens, baseVar, cssVar, displayName, isToken } from './colorData'
import styles from './TokenFlow.module.css'

// "How colors are mapped": pick a base color and see, for the current theme, every semantic token that
// resolves to it (gradient-stop-0 skipped), the components whose styles use those tokens (found by scanning
// src/components/**/*.module.css), and a live preview. Base → Semantic → Component → UI.

type Col = 'base' | 'semantic' | 'component' | 'ui'
type Node = { id: string; col: Col; label: string; note?: string; title?: string; swatch?: string; kind?: 'fill' | 'border'; ui?: ReactNode }
type Edge = { from: string; to: string }

const columns: { id: Col; label: string }[] = [
  { id: 'base', label: 'Base' },
  { id: 'semantic', label: 'Semantic' },
  { id: 'component', label: 'Component' },
  { id: 'ui', label: 'UI' },
]

// ---- Which tokens each component's CSS reads -------------------------------------------------------------

const cssSources = import.meta.glob<string>('../../components/**/*.module.css', { query: '?raw', import: 'default', eager: true })
const varToToken = new Map<string, ThemeToken>(Object.entries(themeTokenVars).map(([t, v]) => [v as string, t as ThemeToken]))
const componentPages: Record<string, { label: string; page: string }> = {
  Actionbar: { label: 'Actionbar', page: 'actionbar' },
  Aerobar: { label: 'Aerobar', page: 'aerobar' },
  BottomNavbar: { label: 'Bottom navbar', page: 'bottom-navbar' },
  BottomSheet: { label: 'Bottom sheet', page: 'bottom-sheet' },
  Button: { label: 'Button', page: 'button' },
  ButtonGroup: { label: 'Button dock', page: 'button-group' },
  Card: { label: 'Card', page: 'card' },
  Checkbox: { label: 'Checkbox & radio', page: 'checkbox' },
  EmptyState: { label: 'Empty state', page: 'empty-state' },
  ListCell: { label: 'List cell', page: 'list-cell' },
  Switch: { label: 'Toggle switch', page: 'switch' },
  Tabs: { label: 'Tabs', page: 'tabs' },
  Tag: { label: 'Tag', page: 'tag' },
  TextField: { label: 'Input field', page: 'text-field' },
}
/** What a CSS property does, in plain words (custom props like --tf-caret use their last word). */
const propWord = (prop: string) => {
  if (prop.startsWith('--')) {
    const last = prop.split('-').filter(Boolean).slice(1).join(' ')
    return last.replace(/^(tag|ab|tf|tab|btn|card|sheet|nav|lc|cb|sw) /, '')
  }
  if (prop === 'color') return 'text / icon'
  if (prop.startsWith('background')) return 'fill'
  if (prop === 'fill') return 'illustration fill'
  if (prop === 'caret-color') return 'caret'
  if (prop.startsWith('outline')) return 'focus ring'
  if (prop.startsWith('border') || prop === 'box-shadow') return 'border'
  return prop
}
/** `.tag[data-color='success'][data-variant='secondary']:hover` → "color=success · variant=secondary". */
const selectorWords = (sel: string) => {
  const first = sel.split(',')[0].trim()
  const attrs = [...first.matchAll(/\[data-([a-z-]+)(?:='([^']*)')?\]/g)].map((m) => (m[2] ? `${m[1]}=${m[2]}` : m[1]))
  const cls = /^\.([a-zA-Z]+)/.exec(first)?.[1]
  const state = /:(hover|active|focus-visible|checked|disabled)/.exec(first)?.[1]
  return [cls, ...attrs, state].filter(Boolean).join(' · ')
}

const componentUses: { folder: string; tokens: Set<ThemeToken>; usage: Map<ThemeToken, string[]> }[] = Object.entries(cssSources).flatMap(([path, css]) => {
  const folder = path.split('/').slice(-2, -1)[0]
  if (!componentPages[folder]) return []
  const tokens = new Set<ThemeToken>()
  const usage = new Map<ThemeToken, string[]>()
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '') // comments mention token names; skip them
  for (const rule of clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const where = selectorWords(rule[1])
    for (const decl of rule[2].split(';')) {
      const [prop, ...rest] = decl.split(':')
      const value = rest.join(':')
      for (const m of value.matchAll(/--l3-[a-z0-9-]+/g)) {
        const t = varToToken.get(m[0])
        if (!t) continue
        tokens.add(t)
        const label = `${propWord(prop.trim())}${where ? ` (${where})` : ''}`
        const list = usage.get(t) ?? []
        if (!list.includes(label)) list.push(label)
        usage.set(t, list)
      }
    }
  }
  return [{ folder, tokens, usage }]
})

// ---- Resolving a token down to its base color ----------------------------------------------------------------

/** Follows aliases (e.g. surface/disabled → surface/inverted → charcoal/900) to the base color path. */
function resolveBase(token: ThemeToken, theme: string): string | null {
  let current: string = token
  for (let i = 0; i < 6; i++) {
    const next = aliasOf(current, theme).split(' ')[0]
    if (!next) return null
    if (isToken(next)) { current = next; continue }
    return next
  }
  return null
}
const hueOf = (base: string) => (base.startsWith('brand/') ? base.split('/').slice(0, 2).join('/') : base.split('/')[0])

const baseCss = (base: string) =>
  baseVar(/^(charcoal|slate|sage|white|black)\//.test(base) ? `neutral/${base}` : `hue/${base}`)

// ---- Color choices -----------------------------------------------------------------------------------------

const hueLabels: Record<string, string> = {
  'brand/lemonn': 'Lemonn', 'brand/cspro': 'CS PRO', 'brand/cskuber': 'Kuber',
  green: 'Green', red: 'Red', blue: 'Blue', yellow: 'Yellow', honey: 'Honey', tangerine: 'Orange',
  purple: 'Purple', indigo: 'Indigo', teal: 'Teal',
  charcoal: 'Charcoal', slate: 'Slate', sage: 'Sage', white: 'White', black: 'Black',
}
const allHues = Object.keys(hueLabels)

/** A representative swatch for the picker (step 500, or the single step). */
const hueSwatch = (hue: string) => {
  const name = Object.keys(baseColorVars).find((n) => n.replace(/^(hue|neutral)\//, '').startsWith(hue + '/') && /\/(500|base)$/.test(n))
  return name ? `var(${(baseColorVars as Record<string, string>)[name]})` : undefined
}

// ---- Previews ------------------------------------------------------------------------------------------------

const familyOf = (token: string) => /\/accent\/(.+)-(light|default)$/.exec(token)?.[1]
const tagColorOf: Record<string, TagColor> = {
  'indicator/up': 'profit', 'indicator/down': 'loss', success: 'success', error: 'error', warning: 'warning',
  discover: 'discover', orange: 'processing', zing: 'zing', purple: 'purple', indigo: 'indigo', teal: 'teal',
}
const aerobarTypeOf: Record<string, AerobarType> = { success: 'success', error: 'danger', warning: 'warning', discover: 'discover' }

function preview(folder: string, tokens: ThemeToken[], buttonVariants: string[]): ReactNode {
  const families = [...new Set(tokens.map(familyOf).filter(Boolean))] as string[]
  const has = (t: string) => tokens.includes(t as ThemeToken)
  if (folder === 'Tag') {
    // Solid tag when the color reaches it as a solid fill (or its text), soft when only light tokens do.
    const list = families.map((f) => tagColorOf[f]).filter(Boolean).slice(0, 3)
    if (!list.length) {
      const solid = has('surface/inverted') || has('content/inverted')
      return <Tag size="md" variant={solid ? 'primary' : 'secondary'} color="neutral">{solid ? 'Solid' : 'Soft'}</Tag>
    }
    return (
      <span className={styles.pair}>
        {families.filter((f) => tagColorOf[f]).slice(0, 2).flatMap((f) => [
          has(`surface/accent/${f}-default`) && <Tag key={`${f}-solid`} size="md" variant="primary" color={tagColorOf[f]}>{tagColorOf[f]}</Tag>,
          (has(`surface/accent/${f}-light`) || has(`border/accent/${f}-light`)) && <Tag key={`${f}-soft`} size="md" variant="secondary" color={tagColorOf[f]}>{tagColorOf[f]}</Tag>,
        ].filter(Boolean))}
      </span>
    )
  }
  if (folder === 'Button' && buttonVariants.length) {
    return <span className={styles.pair}>{buttonVariants.slice(0, 3).map((v) => <Button key={v} size="sm" variant={v as ButtonVariant} tabIndex={-1}>{v[0].toUpperCase() + v.slice(1)}</Button>)}</span>
  }
  if (folder === 'Aerobar') {
    const f = families.find((x) => aerobarTypeOf[x])
    const type = f ? aerobarTypeOf[f] : 'primary'
    const solid = f ? has(`surface/accent/${f}-default`) : true
    return <span className={styles.toast}><Aerobar type={type} emphasis={solid ? 'primary' : 'secondary'} heading="Order placed" /></span>
  }
  if (folder === 'TextField') {
    const status = families.includes('success') ? 'success' : families.includes('error') ? 'error' : undefined
    return (
      <span className={styles.field}>
        <TextField
          label="PAN"
          defaultValue={status === 'error' ? 'ABCDE123' : 'ABCDE1234F'}
          status={status}
          helperText={status === 'success' ? 'PAN verified' : status === 'error' ? 'Enter a valid 10-character PAN' : 'As on your PAN card'}
          readOnly
          tabIndex={-1}
        />
      </span>
    )
  }
  if (folder === 'ListCell' && has('content/accent/discover-default')) {
    return <span className={styles.field}><ListCell label="Price alerts" description="2 new" dotRight dotLabel="New" /></span>
  }
  const def = playgrounds[componentPages[folder].page]
  if (!def) return componentPages[folder].label
  return <span className={styles.thumb} inert><span className={styles.thumbInner}>{def.render({ ...defaults(def), ...def.thumbnail })}</span></span>
}

// ---- Graph -------------------------------------------------------------------------------------------------

function buildGraph(themeId: string, hue: string) {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const add = (n: Node) => { if (!nodes.some((x) => x.id === n.id)) nodes.push(n) }

  // Semantic tokens (and component tokens, kept for the Button) that resolve to this hue.
  const semantic: ThemeToken[] = []
  const componentTokens: ThemeToken[] = []
  for (const t of allTokens) {
    if (t.startsWith('gradient-stop-0/')) continue
    const base = resolveBase(t, themeId)
    if (!base || hueOf(base) !== hue) continue
    if (t.startsWith('component/')) componentTokens.push(t)
    else semantic.push(t)
  }
  const order = ['surface/', 'content/', 'border/', 'static/', 'extra/']
  semantic.sort((a, b) => order.findIndex((p) => a.startsWith(p)) - order.findIndex((p) => b.startsWith(p)))

  for (const t of semantic) {
    const base = resolveBase(t, themeId)!
    const alias = aliasOf(t, themeId)
    const direct = alias.split(' ')[0]
    const via = isToken(direct) ? `via ${displayName(direct)}` : alias.includes('·') ? alias.split(' · ')[1] : undefined
    add({ id: `base:${base}`, col: 'base', label: base.replaceAll('/', '-'), swatch: `var(${baseCss(base)})` })
    add({ id: t, col: 'semantic', label: displayName(t), note: via, swatch: `var(${cssVar(t)})`, kind: t.startsWith('border/') ? 'border' : 'fill' })
    edges.push({ from: `base:${base}`, to: t })
  }

  // Components that read those tokens directly, or (Button) through its component tokens.
  const semanticSet = new Set(semantic)
  for (const { folder, tokens, usage } of componentUses) {
    const used = [...tokens].filter((t) => semanticSet.has(t))
    const viaComponent = [...tokens].filter((t) => componentTokens.includes(t))
    const sources = new Set<ThemeToken>(used)
    for (const ct of viaComponent) {
      const target = aliasOf(ct, themeId).split(' ')[0]
      if (isToken(target) && semanticSet.has(target)) sources.add(target)
    }
    if (!sources.size) continue
    const variants = [...new Set(viaComponent.filter((t) => t.startsWith('component/button/')).map((t) => t.split('/')[2]))]
    // Where in the component this color shows up, read from its stylesheet.
    const uses = [...new Set([...used, ...viaComponent].flatMap((t) => usage.get(t) ?? []))]
    const id = `cmp:${folder}`
    add({
      id, col: 'component', label: componentPages[folder].label,
      note: folder === 'Button' && variants.length ? `variants: ${variants.join(' · ')}` : uses.slice(0, 2).join(' · ') + (uses.length > 2 ? ` · +${uses.length - 2}` : ''),
      title: uses.join('\n'),
    })
    for (const s of sources) edges.push({ from: s, to: id })
    const ui = `ui:${folder}`
    add({
      id: ui, col: 'ui', label: componentPages[folder].label,
      ui: (
        <span className={styles.uiWrap}>
          {preview(folder, [...sources], variants)}
          <span className={styles.uiCaption}>{uses.slice(0, 2).join(' · ')}{uses.length > 2 ? ` · +${uses.length - 2} more` : ''}</span>
        </span>
      ),
    })
    edges.push({ from: id, to: ui })
  }

  return { nodes, edges, count: semantic.length }
}

/** Hues that appear in the current theme (so the picker only offers colors that are actually mapped). */
function usedHues(themeId: string) {
  const used = new Set<string>()
  for (const t of allTokens) {
    if (t.startsWith('gradient-stop-0/')) continue
    const base = resolveBase(t, themeId)
    if (base) used.add(hueOf(base))
  }
  return allHues.filter((h) => used.has(h))
}

type Path = { d: string; from: string; to: string; ui: boolean }

export function TokenFlow({ themeId, themeKey }: { themeId: string; themeKey: string }) {
  const hues = useMemo(() => usedHues(themeId), [themeId])
  const [picked, setPicked] = useState('green')
  const hue = hues.includes(picked) ? picked : hues[0]
  const { nodes, edges, count } = useMemo(() => buildGraph(themeId, hue), [themeId, hue])
  const wrap = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<Path[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [active, setActive] = useState<string | null>(null)

  const measure = useCallback(() => {
    const root = wrap.current
    if (!root) return
    const box = root.getBoundingClientRect()
    const rect = (id: string) => root.querySelector<HTMLElement>(`[data-node="${CSS.escape(id)}"]`)?.getBoundingClientRect()
    setSize({ w: box.width, h: box.height })
    setPaths(edges.flatMap((e) => {
      const a = rect(e.from)
      const b = rect(e.to)
      if (!a || !b) return []
      const x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top
      const x2 = b.left - box.left, y2 = b.top + b.height / 2 - box.top
      const mid = (x1 + x2) / 2
      return [{ d: `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`, from: e.from, to: e.to, ui: e.to.startsWith('ui:') }]
    }))
  }, [edges])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [measure, themeKey])

  // The hovered node, everything it comes from (upstream) and everything built on it (downstream).
  const lit = useMemo(() => {
    if (!active) return null
    const set = new Set([active])
    const walk = (id: string, dir: 'up' | 'down') => {
      for (const e of edges) {
        const next = dir === 'up' ? (e.to === id ? e.from : null) : (e.from === id ? e.to : null)
        if (next && !set.has(next)) { set.add(next); walk(next, dir) }
      }
    }
    walk(active, 'up')
    walk(active, 'down')
    return set
  }, [active, edges])

  return (
    <div className={styles.wrapAll}>
      <div className={styles.picker}>
        <span className={styles.pickerLabel}>Color</span>
        <Tabs
          aria-label="Base color"
          appearance="pill"
          size="md"
          items={hues.map((h) => ({ value: h, label: hueLabels[h], iconLeft: <span className={styles.pickerDot} style={{ background: hueSwatch(h) }} /> }))}
          value={hue}
          onChange={setPicked}
        />
        <span className={styles.pickerCount}>{count} semantic token{count === 1 ? '' : 's'} · {nodes.filter((n) => n.col === 'component').length} components</span>
      </div>

      <div className={styles.scroll}>
        <div ref={wrap} className={styles.flow} data-has-active={lit ? '' : undefined}>
          <svg className={styles.lines} width={size.w} height={size.h} aria-hidden="true">
            {paths.map((p, i) => (
              <path key={i} d={p.d} className={styles.line} data-ui={p.ui || undefined} data-lit={lit && lit.has(p.from) && lit.has(p.to) ? '' : undefined} />
            ))}
          </svg>
          {columns.map((c) => (
            <div key={c.id} className={styles.column}>
              <span className={styles.colLabel}>{c.label}</span>
              <ul className={styles.nodes}>
                {nodes.filter((n) => n.col === c.id).map((n) => (
                  <li
                    key={n.id}
                    data-node={n.id}
                    className={c.id === 'ui' ? styles.uiNode : styles.node}
                    data-lit={lit?.has(n.id) ? '' : undefined}
                    onPointerEnter={() => setActive(n.id)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(n.id)}
                    onBlur={() => setActive(null)}
                    tabIndex={0}
                    aria-label={n.label}
                    title={n.title}
                  >
                    {n.ui ?? (
                      <>
                        {n.swatch && <span className={styles.swatch} data-kind={n.kind ?? 'fill'} style={{ color: n.swatch }} aria-hidden="true" />}
                        <span className={styles.nodeText}>
                          <code className={styles.nodeLabel}>{n.label}</code>
                          {n.note && <span className={styles.nodeNote}>{n.note}</span>}
                        </span>
                      </>
                    )}
                  </li>
                ))}
                {c.id === 'component' && !nodes.some((n) => n.col === 'component') && <li className={styles.emptyNote}>No component uses these tokens yet.</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
