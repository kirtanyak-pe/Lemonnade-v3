// Realistic mobile screens for each component's Overview hero.
import { useState } from 'react'
import { Button } from '../components/Button'
import { Tag } from '../components/Tag'
import { Checkbox, Radio } from '../components/Checkbox'
import { Switch } from '../components/Switch'
import { Tabs } from '../components/Tabs'
import styles from './Docs.module.css'

type Holding = { name: string; segment: string; qty: string; value: string; change: string; up: boolean }
type Section = 'holdings' | 'positions' | 'orders'

const portfolio: Record<Section, Holding[]> = {
  holdings: [
    { name: 'RELIANCE', segment: 'equity', qty: '12 shares', value: '₹35,365', change: '+4.2%', up: true },
    { name: 'NIFTY 26 SEP 25000 CE', segment: 'fno', qty: '75 qty', value: '₹8,880', change: '+18.6%', up: true },
    { name: 'HDFCBANK', segment: 'equity', qty: '20 shares', value: '₹32,851', change: '−1.1%', up: false },
    { name: 'GOLD 05 OCT', segment: 'commodity', qty: '1 lot', value: '₹74,210', change: '+0.6%', up: true },
  ],
  positions: [
    { name: 'BANKNIFTY 26 SEP 52000 PE', segment: 'fno', qty: '−30 qty', value: '₹4,215', change: '−7.4%', up: false },
    { name: 'CRUDEOIL 18 OCT', segment: 'commodity', qty: '1 lot', value: '₹6,120', change: '+2.3%', up: true },
  ],
  orders: [],
}
const segmentFilters = [
  { value: 'all', label: 'All' },
  { value: 'equity', label: 'Equity' },
  { value: 'fno', label: 'F&O' },
  { value: 'commodity', label: 'Commodity' },
]

export function PortfolioDemo() {
  const [section, setSection] = useState<Section>('holdings')
  const [segment, setSegment] = useState('all')
  const rows = portfolio[section].filter((r) => segment === 'all' || r.segment === segment)

  return (
    <div className={styles.screen}>
      <div className={styles.appBar}>Portfolio</div>
      <Tabs
        aria-label="Portfolio sections"
        idPrefix="portfolio"
        items={[
          { value: 'holdings', label: 'Holdings' },
          { value: 'positions', label: 'Positions' },
          { value: 'orders', label: 'Orders' },
        ]}
        value={section}
        onChange={setSection}
      />
      <div className={styles.filterRow}>
        <Tabs aria-label="Segment" appearance="pill" size="sm" items={segmentFilters} value={segment} onChange={setSegment} />
      </div>
      <div role="tabpanel" id={`portfolio-panel-${section}`} aria-labelledby={`portfolio-tab-${section}`}>
        {rows.length === 0 ? (
          <p className={styles.emptyState}>Nothing here yet.</p>
        ) : (
          <ul className={styles.list}>
            {rows.map((row) => (
              <li key={row.name} className={styles.listRow}>
                <span className={styles.rowMain}>
                  <span className={styles.rowTitle}>{row.name}</span>
                  <span className={styles.rowHint}>{row.qty}</span>
                </span>
                <span className={styles.rowEnd}>
                  <span className={styles.rowValue}>{row.value}</span>
                  <Tag variant="tertiary" color={row.up ? 'green' : 'red'} size="sm">{row.change}</Tag>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function TradeTicketDemo() {
  const [placing, setPlacing] = useState<'buy' | 'sell' | null>(null)
  const place = (side: 'buy' | 'sell') => {
    setPlacing(side)
    setTimeout(() => setPlacing(null), 1500)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.appBar}>Place order</div>
      <div className={styles.quote}>
        <div>
          <div className={styles.symbol}>NIFTY 50</div>
          <Tag variant="tertiary" size="sm">NSE</Tag>
        </div>
        <div className={styles.priceBlock}>
          <div className={styles.price}>24,812.35</div>
          <Tag variant="secondary" color="green" size="sm">+0.84%</Tag>
        </div>
      </div>
      <dl className={styles.fields}>
        <div><dt>Quantity</dt><dd>25</dd></div>
        <div><dt>Order type</dt><dd>Market</dd></div>
        <div><dt>Margin required</dt><dd>₹6,20,308</dd></div>
      </dl>
      <div className={styles.dock}>
        <Button variant="sell" fullWidth loading={placing === 'sell'} disabled={placing === 'buy'} onClick={() => place('sell')}>Sell</Button>
        <Button variant="buy" fullWidth loading={placing === 'buy'} disabled={placing === 'sell'} onClick={() => place('buy')}>Buy</Button>
      </div>
    </div>
  )
}

const watchlist = [
  { name: 'RELIANCE', exchange: 'NSE', price: '2,947.10', change: '+1.24%', up: true, extra: null },
  { name: 'HDFCBANK', exchange: 'NSE', price: '1,642.55', change: '−0.42%', up: false, extra: null },
  { name: 'NIFTY 26 SEP 25000 CE', exchange: 'NFO', price: '118.40', change: '+6.80%', up: true, extra: 'F&O' },
  { name: 'GOLD', exchange: 'MCX', price: '74,210', change: '+0.15%', up: true, extra: 'Commodity' },
]

export function WatchlistDemo() {
  return (
    <div className={styles.screen}>
      <div className={styles.appBar}>Watchlist</div>
      <ul className={styles.list}>
        {watchlist.map((row) => (
          <li key={row.name} className={styles.listRow}>
            <div className={styles.rowMain}>
              <span className={styles.rowTitle}>{row.name}</span>
              <span className={styles.rowTags}>
                <Tag variant="tertiary" size="sm">{row.exchange}</Tag>
                {row.extra && <Tag variant="secondary" color={row.extra === 'F&O' ? 'purple' : 'yellow'} size="sm">{row.extra}</Tag>}
              </span>
            </div>
            <div className={styles.rowEnd}>
              <span className={styles.rowValue}>{row.price}</span>
              <Tag variant="primary" color={row.up ? 'green' : 'red'} size="sm">{row.change}</Tag>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

const segments = ['Equity', 'F&O', 'Commodity']

export function FiltersDemo() {
  const [picked, setPicked] = useState<string[]>(['Equity'])
  const [validity, setValidity] = useState('day')
  const all = picked.length === segments.length
  const toggle = (s: string) => setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]))

  return (
    <div className={styles.screen}>
      <div className={styles.appBar}>Filters</div>
      <div className={styles.sheetSection}>
        <div className={styles.sectionLabel}>Segments</div>
        <label className={styles.optionRow}>
          <Checkbox checked={all} indeterminate={picked.length > 0 && !all} onChange={() => setPicked(all ? [] : [...segments])} />
          All segments
        </label>
        {segments.map((s) => (
          <label key={s} className={`${styles.optionRow} ${styles.indent}`}>
            <Checkbox checked={picked.includes(s)} onChange={() => toggle(s)} />
            {s}
          </label>
        ))}
      </div>
      <div className={styles.sheetSection}>
        <div className={styles.sectionLabel}>Order validity</div>
        {[['day', 'Day'], ['ioc', 'Immediate or cancel']].map(([value, label]) => (
          <label key={value} className={styles.optionRow}>
            <Radio name="validity" value={value} checked={validity === value} onChange={() => setValidity(value)} />
            {label}
          </label>
        ))}
        <label className={styles.optionRow}>
          <Radio name="validity" value="gtt" disabled />
          Good till triggered (unavailable)
        </label>
      </div>
      <div className={styles.dock}>
        <Button variant="tertiary" fullWidth onClick={() => { setPicked([]); setValidity('day') }}>Reset</Button>
        <Button variant="primary" fullWidth>Apply</Button>
      </div>
    </div>
  )
}

export function SettingsDemo() {
  const [settings, setSettings] = useState({ alerts: true, orders: true, compact: false })
  const rows = [
    { key: 'alerts', title: 'Price alerts', hint: 'When a watched stock crosses your target', size: 'md' },
    { key: 'orders', title: 'Order updates', hint: 'Executions, rejections and expiries', size: 'md' },
    { key: 'compact', title: 'Compact watchlist', hint: 'Small switch variant', size: 'sm' },
  ] as const

  return (
    <div className={styles.screen}>
      <div className={styles.appBar}>Notifications</div>
      <ul className={styles.list}>
        {rows.map((row) => (
          <li key={row.key}>
            <label className={styles.listRow}>
              <span className={styles.rowMain}>
                <span className={styles.rowTitle}>{row.title}</span>
                <span className={styles.rowHint}>{row.hint}</span>
              </span>
              <Switch
                size={row.size}
                checked={settings[row.key]}
                onChange={(e) => setSettings((s) => ({ ...s, [row.key]: e.target.checked }))}
              />
            </label>
          </li>
        ))}
      </ul>
    </div>
  )
}
