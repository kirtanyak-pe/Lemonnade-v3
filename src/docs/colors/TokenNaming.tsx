import { useState } from 'react'
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
  parts: { text: string; kind: PartKind }[]
  figma: string
  ts: string
}

const examples: Example[] = [
  {
    value: 'semantic',
    label: 'Semantic',
    parts: [{ text: 'l3', kind: 'namespace' }, { text: 'surface', kind: 'property' }, { text: 'secondary', kind: 'modifier' }],
    figma: '🔷 L3/color/surface/secondary',
    ts: "token('surface/secondary')",
  },
  {
    value: 'accent',
    label: 'Accent',
    parts: [
      { text: 'l3', kind: 'namespace' },
      { text: 'surface', kind: 'property' },
      { text: 'accent', kind: 'group' },
      { text: 'success', kind: 'intent' },
      { text: 'light', kind: 'modifier' },
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
      { text: 'buy', kind: 'variant' },
      { text: 'surface', kind: 'property' },
      { text: 'disabled', kind: 'state' },
    ],
    figma: '🔷 L3/color/component/button/buy/surface-disabled',
    ts: "token('component/button/buy/surface-disabled')",
  },
  {
    value: 'base',
    label: 'Base palette',
    parts: [
      { text: 'l3', kind: 'namespace' },
      { text: 'base', kind: 'tier' },
      { text: 'hue', kind: 'group' },
      { text: 'green', kind: 'intent' },
      { text: '500', kind: 'modifier' },
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

function Anatomy({ example }: { example: Example }) {
  return (
    <div className={styles.anatomyScroll}>
      <div className={styles.anatomy} role="img" aria-label={`--${example.parts.map((p) => p.text).join('-')}: ${example.parts.map((p) => `${p.text} is the ${partLabels[p.kind].toLowerCase()}`).join(', ')}`}>
        <span className={styles.prefix} aria-hidden="true">--</span>
        {example.parts.map((p, i) => (
          <span key={i} className={styles.partGroup} aria-hidden="true">
            {i > 0 && <span className={styles.sep}>-</span>}
            <span className={styles.part} data-kind={p.kind}>
              <code className={styles.partText}>{p.text}</code>
              <span className={styles.stick} />
              <span className={styles.partLabel}>{partLabels[p.kind]}</span>
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

      <div className={styles.card}>
        <Anatomy example={example} />
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
