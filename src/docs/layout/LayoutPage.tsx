import { Card } from '../../components/Card'
import { PriceChange } from '../../components/PriceChange'
import styles from './LayoutPage.module.css'

// Layout foundation page: how a screen's content is spaced — page padding, sections, section headings.
// Rules from the F&O dev-handoff screens (Delivery / Intraday): page padding 16, sections 24 apart (32 for a bigger
// break), section heading → its card 16, card padding 12. Every value is a spacing variable.

const rules = [
  { kind: 'margin', value: '16', token: 'spacing/16', title: 'Page padding (screen margin)', text: 'Content sits 16 in from the left and right edges of the screen. Only edge-to-edge parts — the action bar, tabs, the button dock, plain list rows, flat cards — touch the edges.' },
  { kind: 'gap', value: '24', token: 'spacing/24', title: 'Between sections', text: 'The default gap between two sections, and between the first card and the next section.' },
  { kind: 'gap', value: '32', token: 'spacing/32', title: 'Large section gap', text: 'The second version, for a bigger break: when the next section starts a new topic or follows a hero block.' },
  { kind: 'gap', value: '16', token: 'spacing/16', title: 'Section heading → card', text: 'A section title sits 16 above its card or list.' },
  { kind: 'padding', value: '12', token: 'spacing/12', title: 'Card padding', text: 'A card is padded 12 on every side (rows inside it 8 apart). Only a flat card may drop its padding.' },
]

// One colour per kind of space, as in Figma's spacing overlays: margin (teal) · padding (blue) · gap (orange).
const legend = [
  { kind: 'margin', title: 'Margin', text: 'Space between the screen edge and the content.' },
  { kind: 'padding', title: 'Padding', text: 'Space inside a container, between its edge and its content.' },
  { kind: 'gap', title: 'Gap', text: 'Space between two items: sections, or a heading and its card.' },
] as const

function Gap({ size, label }: { size: '16' | '24' | '32'; label: string }) {
  return (
    <div className={styles.gap} style={{ height: `var(--l3-spacing-${size})` }}>
      <span className={styles.gapLabel}>{label}</span>
    </div>
  )
}

function Diagram() {
  return (
    <div className={styles.phone} aria-label="A screen showing a 16 margin from the screen edge (teal), a summary card, sections 24 and 32 apart, 16 between each section heading and its card, and 12 padding inside cards">
      <div className={styles.margin} aria-hidden="true"><span>16</span></div>
      <div className={styles.content}>
        <Card>
          <span className={styles.cardLabel}>Required margin</span>
          <span className={styles.cardValue}>₹1,57,500.00</span>
        </Card>
        <Gap size="24" label="24 · between sections" />
        <section>
          <h3 className={styles.heading}>Buy</h3>
          <Gap size="16" label="16 · heading → card" />
          <Card className={styles.padded}>
            <span className={styles.padLabel} aria-hidden="true">12 · padding</span>
            <span className={styles.row}><span>Quantity</span><span>1 lot</span></span>
            <span className={styles.row}><span>Price</span><span>₹1,57,500.00</span></span>
          </Card>
        </section>
        <Gap size="32" label="32 · large gap" />
        <section>
          <h3 className={styles.heading}>Returns</h3>
          <Gap size="16" label="16 · heading → card" />
          <Card variant="filled">
            <span className={styles.row}><span>Today</span><PriceChange value={0.68} unit="percent" size="sm" /></span>
          </Card>
        </section>
      </div>
      <div className={styles.margin} aria-hidden="true"><span>16</span></div>
    </div>
  )
}

export function LayoutPage() {
  return (
    <>
      <ul className={styles.legend} aria-label="Colour key">
        {legend.map((l) => (
          <li key={l.kind}><span className={styles.swatch} data-kind={l.kind} /> <strong>{l.title}</strong> — {l.text}</li>
        ))}
      </ul>
      <section className={styles.intro}>
        <Diagram />
        <dl className={styles.rules}>
          {rules.map((r) => (
            <div key={r.title} className={styles.rule}>
              <dt><span className={styles.value} data-kind={r.kind}>{r.value}</span>{r.title}</dt>
              <dd>{r.text} <code>{r.token}</code></dd>
            </div>
          ))}
        </dl>
      </section>
      <section className={styles.notes}>
        <h2>How it fits together</h2>
        <ul>
          <li><strong>A section</strong> is a heading plus its content (a card, a list, a chart). Sections stack with 24 between them; use 32 only for a deliberate bigger break, not to fill space.</li>
          <li><strong>Gaps belong to the container,</strong> not the components: set them as the frame's auto-layout gap (bound to the spacing variable), never as empty spacer layers or padding on a card.</li>
          <li><strong>Separate with space, not lines.</strong> A divider goes only between rows of the same list.</li>
          <li><strong>Rounded cards never touch the edges</strong> — they sit inside the 16 page padding. Flat cards and plain list rows run edge to edge.</li>
        </ul>
      </section>
    </>
  )
}
