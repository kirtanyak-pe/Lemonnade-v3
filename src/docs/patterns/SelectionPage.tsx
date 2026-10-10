import { useState } from 'react'
import { Card } from '../../components/Card'
import { Checkbox, Radio } from '../../components/Checkbox'
import { ListCell } from '../../components/ListCell'
import { PriceChange } from '../../components/PriceChange'
import { Tabs } from '../../components/Tabs'
import styles from './SelectionPage.module.css'

// Selection pattern: one framework for how every L3 component shows "chosen" — the cues, strong vs subtle, single vs
// multi-select, which component for which job, and accessibility. Every example is a live L3 component.

const cues = [
  { cue: 'Border', token: 'border/dark', where: 'Clickable card · card list row · secondary pill', note: 'Replaces border/light. Nothing else changes — fill, shadow and padding stay.' },
  { cue: 'Fill', token: 'surface/secondary · surface/inverted', where: 'Flat card · plain list row (secondary) · primary pill (inverted)', note: 'For things with no border. Inverted is the strong fill of a primary pill; its text turns content/inverted.' },
  { cue: 'Mark', token: 'radio dot · checkbox tick', where: 'Radio · Checkbox', note: 'The control’s own state. It always shows, even when the row also changes border.' },
  { cue: 'Indicator', token: 'underline bar', where: 'Underline tabs', note: 'A bar under the selected tab, and its label turns content/primary.' },
]

function Contracts() {
  const options = [
    { id: 'mini', name: 'Gold Mini', price: '₹1,42,557.00' },
    { id: 'guinea', name: 'Gold Guinea', price: '₹1,42,557.00' },
    { id: 'petal', name: 'Gold Petal', price: '₹1,42,557.00' },
  ]
  const [pick, setPick] = useState('guinea')
  return (
    <div className={styles.stack} role="radiogroup" aria-label="Choose a contract">
      {options.map((o) => (
        <ListCell
          key={o.id}
          as="label"
          variant="card"
          size="sm"
          selected={pick === o.id}
          label={o.name}
          description={<>{o.price} <PriceChange value={0.68} size="sm" /></>}
          trailing={<Radio name="contract" checked={pick === o.id} onChange={() => setPick(o.id)} aria-label={o.name} />}
        />
      ))}
    </div>
  )
}

function Addons() {
  const [on, setOn] = useState<Record<string, boolean>>({ sl: true, tp: true, trail: false })
  const items = [
    { id: 'sl', label: 'Stop loss', d: 'Exit if the price falls to ₹1,40,000' },
    { id: 'tp', label: 'Target', d: 'Exit when the price reaches ₹1,48,000' },
    { id: 'trail', label: 'Trailing stop', d: 'Move the stop loss up with the price' },
  ]
  return (
    <div className={styles.stack}>
      {items.map((i) => (
        <ListCell key={i.id} as="label" size="sm" label={i.label} description={i.d} trailing={<Checkbox checked={on[i.id]} onChange={() => setOn((s) => ({ ...s, [i.id]: !s[i.id] }))} aria-label={i.label} />} />
      ))}
    </div>
  )
}

function StrengthDemo() {
  const [a, setA] = useState('gold')
  const [b, setB] = useState('gold')
  const items = [{ value: 'all', label: 'All' }, { value: 'gold', label: 'Gold' }, { value: 'silver', label: 'Silver' }]
  return (
    <div className={styles.strength}>
      <figure className={styles.figure}><figcaption>Strong · primary pill (inverted fill)</figcaption><Tabs appearance="pill" emphasis="primary" items={items} value={a} onChange={setA} aria-label="Commodity, strong" /></figure>
      <figure className={styles.figure}><figcaption>Subtle · secondary pill (border/dark)</figcaption><Tabs appearance="pill" emphasis="secondary" items={items} value={b} onChange={setB} aria-label="Commodity, subtle" /></figure>
    </div>
  )
}

export function SelectionPage() {
  const [tab, setTab] = useState('usage')
  return (
    <>
      <p className={styles.lede}>Selection helps people make a choice and see what is currently active. One shared set of cues makes every L3 component show “chosen” the same way, while each component keeps its own behaviour.</p>

      <Tabs aria-label="Selection guide" value={tab} onChange={setTab} items={[{ value: 'usage', label: 'Usage' }, { value: 'a11y', label: 'Accessibility' }]} />

      {tab === 'usage' ? (
        <>
          <section className={styles.block}>
            <h2>Visual cues</h2>
            <p>Selection uses a small set of cues. Each component uses <strong>one</strong> of them for its surface, plus the control’s own mark if it has one. Don’t stack every cue — a selected card never gets a darker border <em>and</em> a grey fill <em>and</em> a tick. And selection never changes the font weight, so nothing shifts when the choice changes.</p>
            <div className={styles.cues}>
              {cues.map((c) => (
                <div key={c.cue} className={styles.cue}>
                  <div className={styles.cueDemo} data-cue={c.cue.toLowerCase()}>
                    {c.cue === 'Border' && <Card onClick={() => {}} selected aria-label="Selected card"><span className={styles.demoText}>Selected</span></Card>}
                    {c.cue === 'Fill' && <Card variant="flat" onClick={() => {}} selected aria-label="Selected flat card"><span className={styles.demoText}>Selected</span></Card>}
                    {c.cue === 'Mark' && <span className={styles.marks}><Radio checked readOnly aria-label="Selected radio" /><Checkbox checked readOnly aria-label="Selected checkbox" /></span>}
                    {c.cue === 'Indicator' && <Tabs aria-label="Indicator example" value="a" onChange={() => {}} items={[{ value: 'a', label: 'Price' }, { value: 'b', label: 'OI' }]} />}
                  </div>
                  <h3>{c.cue}</h3>
                  <code>{c.token}</code>
                  <p>{c.where}. {c.note}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.block}>
            <h2>Strong vs subtle</h2>
            <p>Strong and subtle show the same choice with different weight. <strong>Strong</strong> (primary pill: inverted fill) is for a choice that changes what the screen shows — filters and segment switches at the top of a list. <strong>Subtle</strong> (border/dark: secondary pill, selected card, card row) is for picking an option among others — contracts, plans, accounts. Use one strength per row; never mix them.</p>
            <StrengthDemo />
          </section>

          <section className={styles.block}>
            <h2>Types of selection</h2>
            <div className={styles.types}>
              <div className={styles.type}>
                <Contracts />
                <div>
                  <h3>Single select</h3>
                  <p>Only one option at a time; choosing a new one replaces the current one. Use for mutually exclusive choices — tabs, segments, contracts, order types. Rows show a radio, and a card row also gets border/dark.</p>
                </div>
              </div>
              <div className={styles.type}>
                <Addons />
                <div>
                  <h3>Multi-select</h3>
                  <p>Several options can be on at once; choosing one doesn’t change the others. Use for additive choices — order add-ons, filters, checklists. Rows show a checkbox and nothing else changes.</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.block}>
            <h2>Which component</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>The choice</th><th>Use</th></tr></thead>
                <tbody>
                  <tr><td>2–4 short options, always visible, that switch what’s shown</td><td>Tabs — pill (filters) or underline (sections)</td></tr>
                  <tr><td>One of many options, or long labels</td><td>Select → bottom sheet of radio rows</td></tr>
                  <tr><td>One of a few rich options (contracts, plans, accounts)</td><td>List cell or Card rows with a radio, <code>selected</code></td></tr>
                  <tr><td>Any number of options</td><td>List cell rows with a checkbox</td></tr>
                  <tr><td>A setting that turns on or off right away</td><td>Switch — that’s a setting, not a selection</td></tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className={styles.block}>
          <h2>Accessibility</h2>
          <ul className={styles.rules}>
            <li><strong>Never colour alone.</strong> Every selected state has a non-colour cue — a mark, a darker border, an inverted fill or an indicator bar — and the selection is announced.</li>
            <li><strong>Announce the state.</strong> Radios and checkboxes are native and announce “checked”; tabs announce “selected”; a selectable card or row is a button announced as “pressed”, or a link announced as “current”.</li>
            <li><strong>Group single choices.</strong> Radio rows sit in one group with a name (“Choose a contract”) and share a name, so arrow keys move the choice.</li>
            <li><strong>Keyboard.</strong> Tabs move with ← → Home End; radios with arrow keys; checkboxes and cards with Space / Enter. The focus ring is always visible.</li>
            <li><strong>Tap targets.</strong> The whole row or card is the target, not just the dot or the box.</li>
            <li><strong>Contrast.</strong> The selected cue must stand out from the unselected one in both themes; the ♿ Accessible themes strengthen borders where needed.</li>
          </ul>
        </section>
      )}
    </>
  )
}
