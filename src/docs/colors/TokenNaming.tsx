import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { Tabs } from '../../components/Tabs'
import styles from './TokenNaming.module.css'

// Token naming anatomy for the Colors page. Parts are colored with the Miscellaneous accents
// (categorical use is exactly what that group is for).

type PartKind = 'namespace' | 'tier' | 'property' | 'group' | 'intent' | 'modifier' | 'component' | 'variant' | 'state'

const partLabels: Record<PartKind, string> = {
  namespace: 'Namespace',
  tier: 'Tier',
  property: 'Property',
  group: 'Group',
  intent: 'Intent',
  modifier: 'Modifier',
  component: 'Component',
  variant: 'Variant',
  state: 'State',
}

type Example = {
  value: string
  label: string
  /** `alts`: other values the part can take, shown faded above it (nearest first; up to 4 — fewer when that's all there is). */
  parts: { text: string; kind: PartKind; alts?: string[] }[]
  figma: string
  ts: string
}

const examples: Example[] = [
  {
    value: 'semantic',
    label: 'Semantic',
    parts: [{ text: 'l3', kind: 'namespace' }, { text: 'surface', kind: 'property', alts: ['content', 'border'] }, { text: 'secondary', kind: 'modifier', alts: ['primary', 'tertiary', 'default', 'inverted'] }],
    figma: '🔷 L3/color/surface/secondary',
    ts: "token('surface/secondary')",
  },
  {
    value: 'accent',
    label: 'Accent',
    parts: [
      { text: 'l3', kind: 'namespace' },
      { text: 'surface', kind: 'property', alts: ['content', 'border'] },
      { text: 'accent', kind: 'group' },
      { text: 'success', kind: 'intent', alts: ['error', 'warning', 'discover', 'brand'] },
      { text: 'light', kind: 'modifier', alts: ['default'] },
    ],
    figma: '🔷 L3/color/surface/accent/success-light',
    ts: "token('surface/accent/success-light')",
  },
  {
    value: 'component',
    label: 'Component',
    parts: [
      { text: 'l3', kind: 'namespace' },
      { text: 'button', kind: 'component' },
      { text: 'primary', kind: 'variant', alts: ['buy', 'sell', 'brand', 'ghost'] },
      { text: 'surface', kind: 'property', alts: ['content', 'border'] },
      { text: 'disabled', kind: 'state', alts: ['loading'] },
    ],
    figma: '🔷 L3/color/component/button/primary/surface-disabled',
    ts: "token('component/button/primary/surface-disabled')",
  },
  {
    value: 'base',
    label: 'Base palette',
    parts: [
      { text: 'l3', kind: 'namespace' },
      { text: 'base', kind: 'tier' },
      { text: 'hue', kind: 'group' },
      { text: 'green', kind: 'intent', alts: ['red', 'blue', 'yellow', 'orange'] },
      { text: '500', kind: 'modifier', alts: ['400', '600', '100', '900'] },
    ],
    figma: 'L3-color-base/hue/green/500',
    ts: "baseColorVars['hue/green/500']",
  },
]

/** What each part can be. */
const glossary: { kind: PartKind; values: string; note: string }[] = [
  { kind: 'namespace', values: 'l3', note: 'Every Lemonnade V3 token starts with it (--l3-…), so it never clashes with other CSS.' },
  { kind: 'property', values: 'surface · content · border', note: 'What it paints: a fill, text and icons, or an outline.' },
  { kind: 'group', values: 'accent (semantic) · hue / neutral (base)', note: 'Optional. Marks a color family; neutrals have none.' },
  { kind: 'intent', values: 'brand · indicator-up · indicator-down · success · warning · error · discover · orange · us-stock · zing · purple · indigo · teal', note: 'The meaning — see Accent groups.' },
  { kind: 'modifier', values: 'neutrals: default · primary · secondary · tertiary · quaternary · inverted · disabled · overlay — accents: light · default', note: 'Level or emphasis within the property.' },
  { kind: 'component', values: 'button · state-layer', note: 'Component tokens only.' },
  { kind: 'variant', values: 'primary · secondary · tertiary · ghost · brand · buy · sell (state-layer: light · dark)', note: 'Matches the component’s variant prop.' },
  { kind: 'state', values: 'loading · disabled (state-layer: default · hover · pressed)', note: 'Optional. No suffix = the default state.' },
  { kind: 'tier', values: 'base', note: 'Primitives. Never used in UI.' },
]

/**
 * Labels never widen their part (so every gap between parts is the same). When two labels would touch,
 * the wider one drops to the next row on a longer stick.
 */
function useLabelRows(count: number, key: string) {
  const ref = useRef<HTMLDivElement>(null)
  const [rows, setRows] = useState<number[]>([])
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const place = () => {
      const labels = [...el.querySelectorAll<HTMLElement>('[data-label]')]
      const gap = parseFloat(getComputedStyle(el).getPropertyValue('--label-gap')) || 0
      // Narrowest labels claim the top row first, so when two collide the wider one drops down.
      const rects = labels.map((l) => l.getBoundingClientRect())
      const order = rects.map((_, i) => i).sort((x, y) => rects[x].width - rects[y].width || x - y)
      const placed: { left: number; right: number }[][] = []
      const next: number[] = []
      for (const i of order) {
        const { left, right } = rects[i]
        let row = placed.findIndex((r) => r.every((o) => right + gap <= o.left || left >= o.right + gap))
        if (row < 0) row = placed.push([]) - 1
        placed[row].push({ left, right })
        next[i] = row
      }
      setRows(next)
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(el)
    return () => ro.disconnect()
  }, [count, key])
  return [ref, rows] as const
}

/** Room above the row for the tallest stack of faded values in any example, so the tags sit on the same line in all of them. */
const altRows = Math.max(...examples.flatMap((e) => e.parts.map((p) => p.alts?.length ?? 0)))

function Anatomy({ example }: { example: Example }) {
  const [ref, rows] = useLabelRows(example.parts.length, example.parts.map((p) => p.text).join('-'))
  const maxRow = Math.max(0, ...rows)
  return (
    <div className={styles.anatomyScroll}>
      <div ref={ref} className={styles.anatomy} style={{ '--rows': maxRow, '--alt-rows': altRows } as CSSProperties} role="img" aria-label={`--${example.parts.map((p) => p.text).join('-')}: ${example.parts.map((p) => `${p.text} is the ${partLabels[p.kind].toLowerCase()}`).join(', ')}`}>
        <span className={styles.prefix} aria-hidden="true">--</span>
        {example.parts.map((p, i) => (
          <span key={i} className={styles.partGroup} aria-hidden="true">
            {i > 0 && <span className={styles.sep}>-</span>}
            <span className={styles.part} data-kind={p.kind} style={{ '--row': rows[i] ?? 0 } as CSSProperties}>
              <span className={styles.partTextWrap}>
                {p.alts && (
                  <span className={styles.alts}>
                    {p.alts.map((alt) => <span key={alt} className={styles.alt}>{alt}</span>)}
                  </span>
                )}
                <code className={styles.partText}>{p.text}</code>
              </span>
              <span className={styles.stick}>
                <span className={styles.partLabel} data-label>{partLabels[p.kind]}</span>
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function TokenNaming() {
  const [value, setValue] = useState('accent')
  const example = examples.find((e) => e.value === value) ?? examples[0]

  return (
    <div className={styles.wrap}>
      <Tabs aria-label="Token type" appearance="pill" size="md" items={examples.map(({ value, label }) => ({ value, label }))} value={value} onChange={setValue} />

      {/* Every example is laid out in the same grid cell (only the chosen one visible), so the card keeps the tallest one's height. */}
      <div className={`${styles.card} ${styles.stack}`}>
        {examples.map((e) => (
          <div key={e.value} className={styles.stackItem} data-active={e === example || undefined} aria-hidden={e !== example || undefined}>
            <Anatomy example={e} />
          </div>
        ))}
      </div>

      <dl className={styles.forms}>
        <div><dt>Figma</dt><dd><code>{example.figma}</code></dd></div>
        <div><dt>CSS</dt><dd><code>var(--{example.parts.map((p) => p.text).join('-')})</code></dd></div>
        <div><dt>TS</dt><dd><code>{example.ts}</code></dd></div>
      </dl>

      <ul className={styles.rules}>
        <li><strong>Order is fixed:</strong> namespace · (component · variant) · property · (group · intent) · modifier · (state).</li>
        <li><strong>Lowercase, words joined by dashes.</strong> Figma separates parts with “/”, CSS with “-”.</li>
        <li><strong>Name by role, never by color:</strong> <code>content-secondary</code>, not <code>grey-60</code>. Only the base palette names colors.</li>
        <li><strong>Leave out what's default:</strong> no state = default state; neutrals have no group or intent.</li>
      </ul>

      <details className={styles.details}>
        <summary>What each part can be</summary>
        <table className={styles.glossary}>
          <thead>
            <tr><th scope="col">Part</th><th scope="col">Values</th><th scope="col">Notes</th></tr>
          </thead>
          <tbody>
            {glossary.map((g) => (
              <tr key={g.kind}>
                <th scope="row"><span className={styles.dot} data-kind={g.kind} aria-hidden="true" />{partLabels[g.kind]}</th>
                <td><code>{g.values}</code></td>
                <td>{g.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
