import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { msStar } from '../../icons/material'
import { accentGroups, accents, borders, contents, cssVar, displayName, statics, surfaces, type Role } from './colorData'
import type { ThemeToken } from '../../tokens'
import styles from './SemanticTree.module.css'

// Top-to-bottom tree of the semantic color roles: Colors → Surface · Icon · Text · Border →
// (Icon + Text merge into Content) → the tokens of each role. Same dashed-connector language as TokenFlow.

type Node = { id: string; title: ReactNode; note?: string; parents: string[] }

const isBorder = (token: string) => token.startsWith('border/')

export function SemanticTree({ filter, copied, onCopy }: { filter: string; copied: string | null; onCopy: (text: string) => void }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<{ d: string; from: string; to: string; accent?: boolean }[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [active, setActive] = useState<string | null>(null)

  const lists = useMemo(() => {
    const show = (r: Role) => !filter || [r.token, displayName(r.token), r.role, r.use].some((t) => t.toLowerCase().includes(filter))
    const groupShown = (g: (typeof accentGroups)[number]) =>
      accents.filter((a) => a.group === g.id && (!filter || [a.label, a.id, a.use, g.label].some((t) => t.toLowerCase().includes(filter))))
    return {
      surface: surfaces.filter(show),
      content: contents.filter(show),
      border: borders.filter(show),
      static: statics.filter(show),
      accent: accentGroups.map((g) => ({ group: g, families: groupShown(g) })).filter((x) => x.families.length),
    }
  }, [filter])

  // Parent links for every node (tokens hang off their role; Icon and Text both feed Content).
  const nodes = useMemo(() => {
    const n: Node[] = [
      { id: 'root', title: 'Colors', note: 'Semantic tokens', parents: [] },
      { id: 'surface', title: 'Surface', note: 'Fills', parents: ['root'] },
      { id: 'icon', title: <><Icon icon={msStar} size={16} /> Icon</>, note: 'Icons', parents: ['root'] },
      { id: 'text', title: <><span className={styles.aa}>Aa</span> Text</>, note: 'Text', parents: ['root'] },
      { id: 'border', title: 'Border', note: 'Outlines', parents: ['root'] },
      { id: 'content', title: 'Content', note: 'One set for text and icons', parents: ['icon', 'text'] },
    ]
    for (const r of lists.surface) n.push({ id: r.token, title: r.token, parents: ['surface'] })
    for (const r of lists.content) n.push({ id: r.token, title: r.token, parents: ['content'] })
    for (const r of lists.border) n.push({ id: r.token, title: r.token, parents: ['border'] })
    // Accent: a separate limb off the root, then its 5 groups, then each group's colors.
    // Static: always the same color in every theme — its own limb off the root (left side).
    if (lists.static.length) n.push({ id: 'static', title: 'Static', note: 'Same in every theme', parents: ['root'] })
    for (const r of lists.static) n.push({ id: r.token, title: r.token, parents: ['static'] })
    if (lists.accent.length) n.push({ id: 'accent', title: 'Accent', note: 'Color with meaning · 5 groups', parents: ['root'] })
    for (const { group, families } of lists.accent) {
      n.push({ id: `ag:${group.id}`, title: group.label, parents: ['accent'] })
      for (const f of families) n.push({ id: `af:${f.id}`, title: f.label, parents: [`ag:${group.id}`] })
    }
    return n
  }, [lists])

  const measure = useCallback(() => {
    const root = wrap.current
    if (!root) return
    const box = root.getBoundingClientRect()
    const rect = (id: string) => root.querySelector<HTMLElement>(`[data-node="${CSS.escape(id)}"]`)?.getBoundingClientRect()
    setSize({ w: box.width, h: box.height })
    const out: { d: string; from: string; to: string; accent?: boolean }[] = []
    for (const node of nodes) {
      for (const parent of node.parents) {
        const a = rect(parent)
        const b = rect(node.id)
        if (!a || !b) continue
        const x1 = a.left + a.width / 2 - box.left
        const y1 = a.bottom - box.top
        const isLeaf = parent === 'surface' || parent === 'content' || parent === 'border' || parent === 'static' || parent.startsWith('ag:')
        if (parent === 'root' && node.id === 'static') {
          // Mirror of the accent limb: leaves the root on the left and runs down the left edge.
          const xl = a.left - box.left
          const yr = a.top + a.height / 2 - box.top
          const edge = 12
          const x2 = b.left + b.width / 2 - box.left
          const y2 = b.top - box.top
          out.push({ d: `M${xl},${yr} H${edge + 12} Q${edge},${yr} ${edge},${yr + 12} V${y2 - 32} Q${edge},${y2 - 20} ${edge + 12},${y2 - 20} H${x2} V${y2}`, from: parent, to: node.id, accent: true })
          continue
        }
        if (parent === 'root' && node.id === 'accent') {
          // The accent limb leaves the root sideways and runs down the right edge — a different direction.
          const xr = a.right - box.left
          const yr = a.top + a.height / 2 - box.top
          const edge = box.width - 12
          const x2 = b.left + b.width / 2 - box.left
          const y2 = b.top - box.top
          out.push({ d: `M${xr},${yr} H${edge - 12} Q${edge},${yr} ${edge},${yr + 12} V${y2 - 32} Q${edge},${y2 - 20} ${edge - 12},${y2 - 20} H${x2} V${y2}`, from: parent, to: node.id, accent: true })
        } else if (isLeaf) {
          // Tree spine down the left of the token list, a branch into each token.
          const spine = b.left - box.left - 16
          const yMid = y1 + 12
          const yi = b.top + b.height / 2 - box.top
          out.push({ d: `M${x1},${y1} V${yMid} H${spine} V${yi} H${b.left - box.left}`, from: parent, to: node.id, accent: parent.startsWith('ag:') || parent === 'static' })
        } else {
          // Elbow from the parent's bottom to the child's top.
          const x2 = b.left + b.width / 2 - box.left
          const y2 = b.top - box.top
          const yMid = (y1 + y2) / 2
          out.push({ d: `M${x1},${y1} V${yMid} H${x2} V${y2}`, from: parent, to: node.id, accent: parent === 'accent' })
        }
      }
    }
    setPaths(out)
  }, [nodes])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [measure])

  // Hovered node + all its ancestors and descendants.
  const lit = useMemo(() => {
    if (!active) return null
    const set = new Set([active])
    const up = (id: string) => nodes.find((n) => n.id === id)?.parents.forEach((p) => { if (!set.has(p)) { set.add(p); up(p) } })
    const down = (id: string) => nodes.filter((n) => n.parents.includes(id)).forEach((c) => { if (!set.has(c.id)) { set.add(c.id); down(c.id) } })
    up(active)
    if (active !== 'root') down(active)
    return set
  }, [active, nodes])

  const hover = (id: string) => ({
    'data-node': id,
    'data-lit': lit?.has(id) ? '' : undefined,
    onPointerEnter: () => setActive(id),
    onPointerLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
  })

  // Render helpers (plain functions, not components, so nodes aren't remounted on hover).
  const group = (id: string) => {
    const n = nodes.find((x) => x.id === id)
    if (!n) return null
    const level = id === 'root' ? 'root' : id === 'content' ? 'merge' : id === 'accent' || id === 'static' ? 'accent' : id.startsWith('ag:') ? 'accentGroup' : 'role'
    return (
      <div key={id} className={styles.group} data-level={level} tabIndex={0} {...hover(id)}>
        <span className={styles.groupTitle}>{n.title}</span>
        {n.note && <span className={styles.groupNote}>{n.note}</span>}
      </div>
    )
  }

  const leaves = (roles: Role[]) =>
    roles.length === 0 ? <p className={styles.empty}>No tokens match.</p> : (
      <ul className={styles.leaves}>
        {roles.map((r) => {
          const v = `var(${cssVar(r.token)})`
          return (
            <li key={r.token}>
              <button type="button" className={styles.leaf} onClick={() => onCopy(v)} aria-label={`${displayName(r.token)} (${r.role}). Copy ${v}`} title={`${r.use}\nClick to copy ${v}`} {...hover(r.token)}>
                <span className={styles.swatch} data-kind={isBorder(r.token) ? 'border' : 'fill'} style={{ color: v }} aria-hidden="true" />
                <span className={styles.leafText}>
                  <code className={styles.leafName}>{copied === v ? 'Copied' : displayName(r.token)}</code>
                  <span className={styles.leafRole}>{r.role}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    )

  return (
    <div className={styles.scroll}>
      <div ref={wrap} className={styles.tree} data-has-active={lit ? '' : undefined}>
        <svg className={styles.lines} width={size.w} height={size.h} aria-hidden="true">
          {paths.map((p, i) => (
            <path key={i} d={p.d} className={styles.line} data-accent={p.accent || undefined} data-lit={lit && lit.has(p.from) && lit.has(p.to) ? '' : undefined} />
          ))}
        </svg>

        <div className={styles.rowRoot}>{group('root')}</div>

        <div className={styles.rowRoles}>
          {group('surface')}
          {group('icon')}
          {group('text')}
          {group('border')}
        </div>

        <div className={styles.rowMerge}>{group('content')}</div>

        <div className={styles.rowLeaves}>
          <div className={styles.colSurface}>{leaves(lists.surface)}</div>
          <div className={styles.colContent}>{leaves(lists.content)}</div>
          <div className={styles.colBorder}>{leaves(lists.border)}</div>
        </div>

        {lists.accent.length > 0 && (
          <div className={styles.accentBand}>
            <div className={styles.accentHead}>{group('accent')}</div>
            <div className={styles.accentGroups} style={{ gridTemplateColumns: `repeat(${lists.accent.length}, minmax(0, 1fr))` }}>
              {lists.accent.map(({ group: g, families }) => (
                <div key={g.id} className={styles.accentCol}>
                  {group(`ag:${g.id}`)}
                  <ul className={styles.leaves}>
                    {families.map((f) => {
                      const v = `var(${cssVar(`surface/accent/${f.path}-default` as ThemeToken)})`
                      const soft = `var(${cssVar(`surface/accent/${f.path}-light` as ThemeToken)})`
                      return (
                        <li key={f.id}>
                          <button type="button" className={styles.leaf} onClick={() => onCopy(v)} aria-label={`${f.label}: solid and soft. Copy ${v}`} title={`${f.use}\nSolid: surface-accent-${f.path.replace('/', '-')}-default · Soft: …-light\nClick to copy the solid color`} {...hover(`af:${f.id}`)}>
                            {/* Split swatch: solid (top-left) · soft (bottom-right). */}
                            <span className={styles.swatch} data-kind="split" style={{ background: `linear-gradient(135deg, ${v} 50%, ${soft} 50%)` }} aria-hidden="true" />
                            <span className={styles.leafText}>
                              <code className={styles.leafName}>{copied === v ? 'Copied' : f.label}</code>
                              <span className={styles.leafRole}>solid · soft</span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {lists.static.length > 0 && (
          <div className={styles.accentBand} data-band="static">
            <div className={styles.accentHead}>{group('static')}</div>
            <div className={styles.staticRow}>{leaves(lists.static)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
