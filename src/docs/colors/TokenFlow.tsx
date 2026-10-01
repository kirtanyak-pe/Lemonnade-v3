import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Tag } from '../../components/Tag'
import { msCheckCircle } from '../../icons/material'
import type { ThemeToken } from '../../tokens'
import { aliasOf, baseVar, cssVar, displayName } from './colorData'
import styles from './TokenFlow.module.css'

// Token flow: base → semantic → component → UI, live for the current theme. Built around green, which
// both the market indicator (profit) and the status (success) accents use.

type Col = 'base' | 'semantic' | 'component' | 'ui'
type Node = { id: string; col: Col; label: string; note?: string; swatch?: string; kind?: 'fill' | 'border'; ui?: ReactNode; group?: string }
type Edge = { from: string; to: string }

const columns: { id: Col; label: string }[] = [
  { id: 'base', label: 'Base' },
  { id: 'semantic', label: 'Semantic' },
  { id: 'component', label: 'Component' },
  { id: 'ui', label: 'UI' },
]

/** Semantic tokens in the example — surface, content and border for profit (indicator up) and success. */
const semanticTokens: { token: ThemeToken; group: string }[] = [
  { token: 'surface/accent/indicator/up-default', group: 'Market indicator' },
  { token: 'content/accent/indicator/up-default', group: 'Market indicator' },
  { token: 'surface/accent/success-light', group: 'Status' },
  { token: 'content/accent/success-default', group: 'Status' },
  { token: 'border/accent/success-light', group: 'Status' },
]

const baseCss = (alias: string) => {
  const name = alias.split(' ')[0]
  return baseVar(/^(charcoal|slate|sage|white|black)\//.test(name) ? `neutral/${name}` : `hue/${name}`)
}

function buildGraph(themeId: string) {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const add = (n: Node) => { if (!nodes.some((x) => x.id === n.id)) nodes.push(n) }

  // The Buy button's surface points at a semantic token that differs per brand (Lemonn: brand lime).
  const buyToken = 'component/button/buy/surface' as ThemeToken
  const buySemantic = aliasOf(buyToken, themeId).split(' ')[0] as ThemeToken
  const semantics = [...semanticTokens]
  if (!semantics.some((s) => s.token === buySemantic)) semantics.unshift({ token: buySemantic, group: 'Brand' })

  for (const { token, group } of semantics) {
    const base = aliasOf(token, themeId).split(' ')[0]
    const baseId = `base:${base}`
    add({ id: baseId, col: 'base', label: base.replaceAll('/', '-'), swatch: `var(${baseCss(base)})` })
    add({ id: token, col: 'semantic', label: displayName(token), note: group, swatch: `var(${cssVar(token)})`, kind: token.startsWith('border/') ? 'border' : 'fill' })
    edges.push({ from: baseId, to: token })
  }

  // Component layer
  add({ id: 'cmp:buy', col: 'component', label: 'button-buy-surface', note: 'Button · buy', swatch: `var(${cssVar(buyToken)})` })
  edges.push({ from: buySemantic, to: 'cmp:buy' })
  add({ id: 'cmp:tag-profit', col: 'component', label: 'Tag · profit (solid)', note: 'Tag', swatch: `var(${cssVar('surface/accent/indicator/up-default')})` })
  edges.push({ from: 'surface/accent/indicator/up-default', to: 'cmp:tag-profit' })
  add({ id: 'cmp:tag-success', col: 'component', label: 'Tag · success (soft)', note: 'Tag', swatch: `var(${cssVar('surface/accent/success-light')})` })
  for (const t of ['surface/accent/success-light', 'content/accent/success-default', 'border/accent/success-light']) edges.push({ from: t, to: 'cmp:tag-success' })

  // UI layer — components, plus text that uses a semantic token directly (no component in between).
  add({ id: 'ui:buy', col: 'ui', label: 'Buy button', ui: <Button size="sm" variant="buy" tabIndex={-1}>Buy</Button> })
  edges.push({ from: 'cmp:buy', to: 'ui:buy' })
  add({ id: 'ui:tag-profit', col: 'ui', label: 'Profit tag', ui: <Tag size="md" variant="primary" color="profit">+2.4%</Tag> })
  edges.push({ from: 'cmp:tag-profit', to: 'ui:tag-profit' })
  add({ id: 'ui:tag-success', col: 'ui', label: 'Success tag', ui: <Tag size="md" variant="secondary" color="success">Placed</Tag> })
  edges.push({ from: 'cmp:tag-success', to: 'ui:tag-success' })
  add({ id: 'ui:price', col: 'ui', label: 'Price change text', ui: <span className={styles.priceText}>+₹1,240.50</span> })
  edges.push({ from: 'content/accent/indicator/up-default', to: 'ui:price' })
  add({ id: 'ui:done', col: 'ui', label: 'Success message', ui: <span className={styles.doneText}><Icon icon={msCheckCircle} size={16} /> Order placed</span> })
  edges.push({ from: 'content/accent/success-default', to: 'ui:done' })

  return { nodes, edges }
}

type Path = { d: string; from: string; to: string; ui: boolean }

export function TokenFlow({ themeId, themeKey }: { themeId: string; themeKey: string }) {
  const { nodes, edges } = useMemo(() => buildGraph(themeId), [themeId])
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

  // Everything upstream and downstream of the hovered node.
  const lit = useMemo(() => {
    if (!active) return null
    const set = new Set([active])
    let grew = true
    while (grew) {
      grew = false
      for (const e of edges) {
        if (set.has(e.from) && !set.has(e.to) && !e.from.startsWith('base:')) { set.add(e.to); grew = true }
        if (set.has(e.to) && !set.has(e.from) && !e.to.startsWith('ui:')) { set.add(e.from); grew = true }
      }
    }
    // From a base node, follow everything downstream.
    if (active.startsWith('base:')) {
      grew = true
      while (grew) {
        grew = false
        for (const e of edges) if (set.has(e.from) && !set.has(e.to)) { set.add(e.to); grew = true }
      }
    }
    return set
  }, [active, edges])

  return (
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
                >
                  {n.ui ?? (
                    <>
                      <span className={styles.swatch} data-kind={n.kind ?? 'fill'} style={{ color: n.swatch }} aria-hidden="true" />
                      <span className={styles.nodeText}>
                        <code className={styles.nodeLabel}>{n.label}</code>
                        {n.note && <span className={styles.nodeNote}>{n.note}</span>}
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
