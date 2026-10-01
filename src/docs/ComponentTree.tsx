import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import styles from './ComponentTree.module.css'

// A component's options as a top-to-bottom tree: the component at the top, one branch per property
// (Variant, Size, State…), then optional groups and the leaves — each leaf a live example with a one-line rule.
// Same dashed-connector language as the Color roles tree.

export type TreeLeaf = { id: string; label: string; note?: string; preview: ReactNode }
export type TreeGroup = { id: string; label: string; note?: string; leaves: TreeLeaf[] }
export type TreeBranch = { id: string; label: string; note?: string; groups?: TreeGroup[]; leaves?: TreeLeaf[] }
export type ComponentTreeSpec = { title: string; note?: string; branches: TreeBranch[] }

type Link = { from: string; to: string; kind: 'top' | 'indent' }

/** A full-width (360px) component — Actionbar, nav bar, sheet — scaled down to fit a tree leaf. */
export function Mini({ children }: { children: ReactNode }) {
  return <span className={styles.mini}><span className={styles.miniInner}>{children}</span></span>
}

export function ComponentTree({ spec }: { spec: ComponentTreeSpec }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<{ d: string; from: string; to: string }[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [active, setActive] = useState<string | null>(null)

  const links = useMemo(() => {
    const out: Link[] = []
    for (const b of spec.branches) {
      out.push({ from: 'root', to: b.id, kind: 'top' })
      for (const g of b.groups ?? []) {
        out.push({ from: b.id, to: g.id, kind: 'indent' })
        for (const l of g.leaves) out.push({ from: g.id, to: l.id, kind: 'indent' })
      }
      for (const l of b.leaves ?? []) out.push({ from: b.id, to: l.id, kind: 'indent' })
    }
    return out
  }, [spec])

  const measure = useCallback(() => {
    const root = wrap.current
    if (!root) return
    const box = root.getBoundingClientRect()
    const rect = (id: string) => root.querySelector<HTMLElement>(`[data-node="${CSS.escape(id)}"]`)?.getBoundingClientRect()
    setSize({ w: box.width, h: box.height })
    setPaths(links.flatMap((l) => {
      const a = rect(l.from)
      const b = rect(l.to)
      if (!a || !b) return []
      if (l.kind === 'top') {
        // Root → branch: elbow from the root's bottom centre to the branch's top centre.
        const x1 = a.left + a.width / 2 - box.left, y1 = a.bottom - box.top
        const x2 = b.left + b.width / 2 - box.left, y2 = b.top - box.top
        const ym = (y1 + y2) / 2
        return [{ d: `M${x1},${y1} V${ym} H${x2} V${y2}`, from: l.from, to: l.to }]
      }
      // Indented tree: a spine down from the parent's left side, a branch into each child.
      const sx = a.left - box.left + 16
      const y1 = a.bottom - box.top
      const yc = b.top + b.height / 2 - box.top
      return [{ d: `M${sx},${y1} V${yc} H${b.left - box.left}`, from: l.from, to: l.to }]
    }))
  }, [links])

  useLayoutEffect(() => {
    measure()
    const ro = new ResizeObserver(measure)
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [measure])

  // Hovered node, its ancestors and its descendants.
  const lit = useMemo(() => {
    if (!active) return null
    const set = new Set([active])
    const up = (id: string) => links.filter((l) => l.to === id).forEach((l) => { if (!set.has(l.from)) { set.add(l.from); up(l.from) } })
    const down = (id: string) => links.filter((l) => l.from === id).forEach((l) => { if (!set.has(l.to)) { set.add(l.to); down(l.to) } })
    up(active)
    if (active !== 'root') down(active)
    return set
  }, [active, links])

  const hover = (id: string) => ({
    'data-node': id,
    'data-lit': lit?.has(id) ? '' : undefined,
    onPointerEnter: () => setActive(id),
    onPointerLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
    tabIndex: 0,
  })

  const leaf = (l: TreeLeaf) => (
    <li key={l.id}>
      <div className={styles.leaf} {...hover(l.id)} aria-label={`${l.label}${l.note ? ': ' + l.note : ''}`}>
        <div className={styles.preview} inert>{l.preview}</div>
        <div className={styles.leafText}>
          <code className={styles.leafLabel}>{l.label}</code>
          {l.note && <span className={styles.leafNote}>{l.note}</span>}
        </div>
      </div>
    </li>
  )

  return (
    <div className={styles.scroll}>
      <div ref={wrap} className={styles.tree} data-has-active={lit ? '' : undefined} style={{ gridTemplateColumns: `repeat(${spec.branches.length}, minmax(0, 1fr))` }}>
        <svg className={styles.lines} width={size.w} height={size.h} aria-hidden="true">
          {paths.map((p, i) => (
            <path key={i} d={p.d} className={styles.line} data-lit={lit && lit.has(p.from) && lit.has(p.to) ? '' : undefined} />
          ))}
        </svg>

        <div className={styles.rootRow}>
          <div className={styles.root} {...hover('root')}>
            <span className={styles.rootTitle}>{spec.title}</span>
            {spec.note && <span className={styles.rootNote}>{spec.note}</span>}
          </div>
        </div>

        {spec.branches.map((b) => (
          <div key={b.id} className={styles.column}>
            <div className={styles.branch} {...hover(b.id)}>
              <span className={styles.branchTitle}>{b.label}</span>
              {b.note && <span className={styles.branchNote}>{b.note}</span>}
            </div>
            <ul className={styles.children}>
              {(b.groups ?? []).map((g) => (
                <li key={g.id}>
                  <div className={styles.group} {...hover(g.id)}>
                    <span className={styles.groupTitle}>{g.label}</span>
                    {g.note && <span className={styles.groupNote}>{g.note}</span>}
                  </div>
                  <ul className={styles.children}>{g.leaves.map(leaf)}</ul>
                </li>
              ))}
              {(b.leaves ?? []).map(leaf)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
