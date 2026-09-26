// Realistic mobile screens for each component's Overview hero.
import { useState, type UIEvent } from 'react'
import { Button, PlaceholderIcon } from '../components/Button'
import { ButtonGroup } from '../components/ButtonGroup'
import { BottomSheet, BottomSheetHeader } from '../components/BottomSheet'
import { Aerobar } from '../components/Aerobar'
import { TextField } from '../components/TextField'
import { ListCell } from '../components/ListCell'
import { ChevronDownIcon } from '../components/icons'
import { Icon } from '../components/Icon'
import { Actionbar, ActionbarAction } from '../components/Actionbar'
import { msAccountBalance, msSearch as msSearchIcon, msStar, msStarFill, msFingerprint, msMail, msNotifications, msPerson, msCall, msWorkspacePremium } from '../icons/material'
import { Tag } from '../components/Tag'
import { Checkbox, Radio } from '../components/Checkbox'
import { Switch } from '../components/Switch'
import { Tabs } from '../components/Tabs'
import { BottomNavbar } from '../components/BottomNavbar'
import { fnoNavItems, mainNavItems, mfNavItems } from '../preview/BottomNavbarVariants'
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
      <ButtonGroup direction="horizontal" className={styles.dock} aria-label="Order actions">
        <Button variant="sell" loading={placing === 'sell'} disabled={placing === 'buy'} onClick={() => place('sell')}>Sell</Button>
        <Button variant="buy" loading={placing === 'buy'} disabled={placing === 'sell'} onClick={() => place('buy')}>Buy</Button>
      </ButtonGroup>
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
      <fieldset className={styles.sheetSection}>
        <legend className={styles.sectionLabel}>Segments</legend>
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
      </fieldset>
      <fieldset className={styles.sheetSection}>
        <legend className={styles.sectionLabel}>Order validity</legend>
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
      </fieldset>
      <ButtonGroup direction="horizontal" className={styles.dock} aria-label="Filter actions">
        <Button variant="tertiary" onClick={() => { setPicked([]); setValidity('day') }}>Reset</Button>
        <Button variant="primary">Apply</Button>
      </ButtonGroup>
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

const reviewLines = [
  ['Order type', 'Delivery · Limit'],
  ['Quantity', '12 shares'],
  ['Limit price', '₹2,947.10'],
  ['Order value', '₹35,365.20'],
  ['Brokerage', '₹20.00'],
  ['STT', '₹35.37'],
  ['Exchange charges', '₹1.14'],
  ['SEBI fee', '₹0.04'],
  ['Stamp duty', '₹5.30'],
  ['GST', '₹3.81'],
  ['Total charges', '₹65.66'],
  ['Amount required', '₹35,430.86'],
]

export function OrderReviewDemo() {
  // Scroll indicator on while there is more content below the fold (Figma "Scroll indicator").
  const [moreBelow, setMoreBelow] = useState(true)
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    setMoreBelow(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
  }

  return (
    <div className={`${styles.screen} ${styles.fixedScreen}`}>
      <div className={styles.appBar}>Review order</div>
      <div className={styles.scrollArea} onScroll={onScroll}>
        <div className={styles.quote}>
          <div>
            <div className={styles.symbol}>RELIANCE</div>
            <Tag variant="tertiary" size="sm">NSE</Tag>
          </div>
          <div className={styles.priceBlock}>
            <div className={styles.price}>2,947.10</div>
            <Tag variant="secondary" color="green" size="sm">+1.24%</Tag>
          </div>
        </div>
        <dl className={styles.fields}>
          {reviewLines.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
        </dl>
        <p className={styles.rowHint + ' ' + styles.finePrint}>Charges are estimates. Scroll to the end and the bar's shadow goes away.</p>
      </div>
      <ButtonGroup direction="vertical" scrollIndicator={moreBelow} aria-label="Confirm order">
        <Button variant="buy">Confirm buy</Button>
        <Button variant="secondary">Edit order</Button>
      </ButtonGroup>
    </div>
  )
}

export function SheetsDemo() {
  const [screen, setScreen] = useState<HTMLDivElement | null>(null)
  const [sheet, setSheet] = useState<'order' | 'placed' | 'sort' | null>(null)
  const [qty, setQty] = useState(10)
  const [sort, setSort] = useState('Price change')
  const close = () => setSheet(null)

  return (
    <div ref={setScreen} className={`${styles.screen} ${styles.fixedScreen} ${styles.sheetHost}`}>
      <div className={styles.appBar}>RELIANCE</div>
      <div className={styles.quote}>
        <div>
          <div className={styles.symbol}>2,947.10</div>
          <Tag variant="secondary" color="green" size="sm">+1.24%</Tag>
        </div>
        <Button size="sm" variant="tertiary" onClick={() => setSheet('sort')}>Sort: {sort}</Button>
      </div>
      <p className={`${styles.rowHint} ${styles.finePrint}`}>Tap Buy to open a bottom sheet. Drag its handle down, tap outside, press Esc or use ✕ to close. "Sort" opens a top sheet.</p>
      <ButtonGroup direction="horizontal" className={styles.dock} aria-label="Trade">
        <Button variant="sell" onClick={() => setSheet('order')}>Sell</Button>
        <Button variant="buy" onClick={() => setSheet('order')}>Buy</Button>
      </ButtonGroup>

      <BottomSheet
        open={sheet === 'order'}
        onClose={close}
        container={screen}
        dragHandle
        aria-labelledby="order-sheet-title"
        header={<BottomSheetHeader headingId="order-sheet-title" heading="Buy RELIANCE" info description="NSE · Delivery" onClose={close} />}
        footer={
          <ButtonGroup aria-label="Order actions">
            <Button variant="buy" onClick={() => setSheet('placed')}>Buy {qty} shares</Button>
            <Button variant="ghost" onClick={close}>Cancel</Button>
            <p className={styles.sheetHelper}>Approx. ₹{(qty * 2947.1).toLocaleString('en-IN', { maximumFractionDigits: 0 })} + charges</p>
          </ButtonGroup>
        }
      >
        <div className={styles.qtyRow}>
          <span className={styles.rowTitle}>Quantity</span>
          <span className={styles.qtyStepper}>
            <Button size="sm" variant="tertiary" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</Button>
            <span className={styles.rowValue}>{qty}</span>
            <Button size="sm" variant="tertiary" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">+</Button>
          </span>
        </div>
      </BottomSheet>

      <BottomSheet
        open={sheet === 'placed'}
        onClose={close}
        container={screen}
        aria-labelledby="placed-sheet-title"
        header={<BottomSheetHeader size="lg" headingId="placed-sheet-title" heading="Order placed" description={`${qty} shares of RELIANCE at market price`} icon={<PlaceholderIcon />} tag={<Tag size="sm">EXECUTED</Tag>} />}
        footer={<ButtonGroup aria-label="Done"><Button onClick={close}>Done</Button></ButtonGroup>}
      />

      <BottomSheet
        open={sheet === 'sort'}
        onClose={close}
        container={screen}
        placement="top"
        aria-labelledby="sort-sheet-title"
        header={<BottomSheetHeader headingId="sort-sheet-title" heading="Sort by" onClose={close} />}
      >
        {['Price change', 'Price', 'Name'].map((option) => (
          <label key={option} className={styles.optionRow}>
            <Radio name="sort" checked={sort === option} onChange={() => { setSort(option); close() }} />
            {option}
          </label>
        ))}
      </BottomSheet>
    </div>
  )
}

type ToastState = { key: number; type: 'success' | 'danger'; heading: string; paragraph: string } | null

export function ToastDemo() {
  // Start with a toast on screen (it stays until "View") so the floating toast is visible without tapping.
  const [toast, setToast] = useState<ToastState>({ key: 0, type: 'success', heading: 'Buy order placed', paragraph: '10 × RELIANCE at ₹2,947.10' })
  const [banner, setBanner] = useState(true)

  // Toasts with an action stay until dismissed or replaced (no time limit — WCAG 2.2.1).
  // A new key replays the enter animation.
  const show = (next: Exclude<ToastState, null>) => setToast(next)

  return (
    <div className={`${styles.screen} ${styles.fixedScreen} ${styles.sheetHost}`}>
      <div className={styles.appBar}>RELIANCE</div>
      {banner && (
        <Aerobar
          type="warning"
          heading="Market closes in 15 min"
          paragraph="Orders after 3:30 PM are queued for tomorrow."
          action={{ label: 'Dismiss', onClick: () => setBanner(false) }}
        />
      )}
      <div className={styles.quote}>
        <div>
          <div className={styles.symbol}>2,947.10</div>
          <Tag variant="secondary" color="green" size="sm">+1.24%</Tag>
        </div>
      </div>
      <p className={`${styles.rowHint} ${styles.finePrint}`}>Buy and Sell show a new toast above the buttons. Toasts with an action stay until you tap it, so nobody has to race a timer.</p>
      {/* No extra aria-live here: the toast's own role (status / alert) announces it. */}
      <div className={styles.toastSlot}>
        {toast && (
          <Aerobar
            key={toast.key}
            floating
            emphasis="primary"
            type={toast.type}
            heading={toast.heading}
            paragraph={toast.paragraph}
            action={{ label: 'View', onClick: () => setToast(null) }}
          />
        )}
      </div>
      <ButtonGroup direction="horizontal" className={styles.dock} aria-label="Trade">
        <Button variant="sell" onClick={() => show({ key: Date.now(), type: 'danger', heading: 'Sell order rejected', paragraph: 'You have no RELIANCE shares to sell.' })}>Sell</Button>
        <Button variant="buy" onClick={() => show({ key: Date.now(), type: 'success', heading: 'Buy order placed', paragraph: '10 × RELIANCE at ₹2,947.10' })}>Buy</Button>
      </ButtonGroup>
    </div>
  )
}

export function OrderFormDemo() {
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('2947.10')
  const [note, setNote] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const qtyNum = Number(qty)
  const qtyError = qty !== '' && (!Number.isInteger(qtyNum) || qtyNum < 1) ? 'Enter a whole number of shares' : undefined
  const priceNum = Number(price)
  const band = [2652.39, 3241.81] // ±10% circuit band around the last price
  const priceError = price !== '' && (Number.isNaN(priceNum) || priceNum < band[0] || priceNum > band[1]) ? `Must be between ₹${band[0]} and ₹${band[1]}` : undefined
  const ready = qty !== '' && !qtyError && !priceError

  return (
    <div className={`${styles.screen} ${styles.fixedScreen}`}>
      <div className={styles.appBar}>Buy RELIANCE</div>
      <div className={`${styles.scrollArea} ${styles.formStack}`}>
        <TextField
          label="Quantity"
          required
          inputMode="numeric"
          placeholder="e.g. 10"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          status={qtyError ? 'error' : qty && !qtyError ? 'success' : undefined}
          helperText={qtyError ?? (qty ? `≈ ₹${(qtyNum * priceNum || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : 'Shares to buy at the limit price')}
        />
        <TextField
          label="Limit price"
          inputMode="decimal"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          status={priceError ? 'error' : undefined}
          helperText={priceError ?? 'Within today’s circuit band'}
          helperIcon={!priceError}
        />
        <TextField
          multiline
          label="Note to self"
          placeholder="Why this trade?"
          maxLength={60}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          helperText="Only visible to you"
        />
        <TextField label="Exchange" defaultValue="NSE" disabled helperText="Set by your default exchange" />
      </div>
      <ButtonGroup className={styles.dock} aria-label="Place order">
        <Button variant="buy" disabled={!ready} onClick={() => setSubmitted(true)}>{submitted ? 'Order placed ✓' : 'Place buy order'}</Button>
      </ButtonGroup>
    </div>
  )
}

export function AccountDemo() {
  const [expanded, setExpanded] = useState(false)
  const [biometric, setBiometric] = useState(true)
  const [unread, setUnread] = useState(true)

  return (
    <div className={`${styles.screen} ${styles.fixedScreen}`}>
      <div className={styles.appBar}>Account</div>
      <div className={styles.scrollArea}>
        <ListCell as="button" iconLeft={<Icon icon={msPerson} />} label="Kirtanya K." description="Client ID · LM4821" iconRight={<ChevronDownIcon />} onClick={() => setExpanded((e) => !e)} />
        {expanded && (
          <div className={styles.cardStack}>
            <ListCell variant="card" size="sm" iconLeft={<Icon icon={msMail} />} label="Email" description="k••••@peepal.co" />
            <ListCell variant="card" size="sm" iconLeft={<Icon icon={msCall} />} label="Phone" description="+91 ••••• ••921" />
          </div>
        )}
        <div className={styles.sectionLabel + ' ' + styles.listHeading}>Settings</div>
        <ListCell
          as="button"
          iconLeft={<Icon icon={msNotifications} />}
          dotLeft={unread}
          label="Notifications"
          description={unread ? '2 new alerts' : 'All caught up'}
          iconRight={<ChevronDownIcon />}
          onClick={() => setUnread(false)}
        />
        <ListCell
          as="label"
          iconLeft={<Icon icon={msFingerprint} />}
          label="Biometric login"
          description="Face ID or fingerprint"
          trailing={<Switch checked={biometric} onChange={(e) => setBiometric(e.target.checked)} />}
        />
        <ListCell iconLeft={<Icon icon={msWorkspacePremium} />} label="Plan" description="Renews 26 Oct" trailing={<Tag variant="secondary" color="green" size="md">PRO</Tag>} />
        <div className={styles.sectionLabel + ' ' + styles.listHeading}>Bank accounts</div>
        <div className={styles.cardStack}>
          <ListCell variant="card" as="button" iconLeft={<Icon icon={msAccountBalance} />} label="HDFC Bank ••4821" description="Primary · Savings" iconRight={<ChevronDownIcon />} onClick={() => {}} />
          <ListCell variant="card" as="button" iconLeft={<Icon icon={msAccountBalance} />} label="ICICI Bank ••0937" description="Savings" iconRight={<ChevronDownIcon />} onClick={() => {}} />
        </div>
      </div>
    </div>
  )
}

const companies = ['RELIANCE', 'RELIANCE POWER', 'RELIGARE', 'HDFCBANK', 'HDFCLIFE', 'INFY', 'ITC', 'TCS', 'TATAMOTORS', 'TATASTEEL']

export function StockDetailDemo() {
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState('')
  const [starred, setStarred] = useState(false)
  const [tab, setTab] = useState('overview')
  const [symbol, setSymbol] = useState('RELIANCE')
  const matches = companies.filter((c) => c.includes(query.trim().toUpperCase()))

  return (
    <div className={`${styles.screen} ${styles.fixedScreen} ${styles.noTopPad}`}>
      {searching ? (
        <Actionbar
          onBack={() => { setSearching(false); setQuery('') }}
          backLabel="Close search"
          search={{ value: query, onChange: setQuery, placeholder: 'Search for a company', autoFocus: true }}
        />
      ) : (
        <Actionbar
          title={symbol}
          description="NSE · Equity"
          onBack={() => {}}
          actions={
            <>
              <ActionbarAction icon={msSearchIcon} label="Search" onClick={() => setSearching(true)} />
              <ActionbarAction icon={starred ? msStarFill : msStar} label={starred ? 'Remove from watchlist' : 'Add to watchlist'} pressed={starred} onClick={() => setStarred((s) => !s)} />
            </>
          }
          bottom={<Tabs aria-label="Stock sections" items={[{ value: 'overview', label: 'Overview' }, { value: 'financials', label: 'Financials' }, { value: 'news', label: 'News' }]} value={tab} onChange={setTab} />}
        />
      )}
      <div className={styles.scrollArea}>
        {searching ? (
          <ul className={styles.list}>
            {matches.map((c) => (
              <li key={c}>
                <ListCell size="sm" as="button" label={c} description="NSE" onClick={() => { setSymbol(c); setSearching(false); setQuery('') }} />
              </li>
            ))}
            {matches.length === 0 && <p className={styles.emptyState}>No companies match “{query}”.</p>}
          </ul>
        ) : (
          <div className={styles.quote}>
            <div>
              <div className={styles.symbol}>2,947.10</div>
              <Tag variant="secondary" color="green" size="sm">+1.24%</Tag>
            </div>
            <span className={styles.rowHint}>{tab === 'overview' ? 'Overview' : tab === 'financials' ? 'Financials' : 'News'} for {symbol}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const sectionRows: Record<string, { label: string; description: string }[]> = {
  stocks: [{ label: 'RELIANCE', description: '₹2,947.10 · +1.24%' }, { label: 'HDFCBANK', description: '₹1,642.55 · −0.38%' }, { label: 'INFY', description: '₹1,873.20 · +0.91%' }],
  market: [{ label: 'NIFTY 50', description: '25,104.30 · +0.42%' }, { label: 'SENSEX', description: '82,011.75 · +0.37%' }, { label: 'BANK NIFTY', description: '52,318.60 · −0.12%' }],
  portfolio: [{ label: 'Invested', description: '₹1,48,210' }, { label: 'Current', description: '₹1,55,306 · +4.8%' }],
  mf: [{ label: 'Top rated funds', description: 'Curated by our research team' }, { label: 'Tax saver (ELSS)', description: 'Save up to ₹46,800 a year' }],
  funds: [{ label: 'Parag Parikh Flexi Cap', description: '3Y · 21.4%' }, { label: 'Mirae Asset Large Cap', description: '3Y · 15.2%' }],
  dashboard: [{ label: 'Current value', description: '₹62,480 · +9.1%' }],
  sips: [{ label: 'Next SIP', description: '5 Oct · ₹5,000' }, { label: 'Active SIPs', description: '3' }],
  fno: [{ label: 'NIFTY 26 SEP 25000 CE', description: '₹118.40 · +18.6%' }],
  chain: [{ label: 'NIFTY · 26 SEP', description: 'Strikes 24,500 – 25,500' }],
  positions: [{ label: 'BANKNIFTY 26 SEP 52000 PE', description: '−30 qty · ₹4,215' }],
  scalper: [{ label: 'One-tap scalping', description: 'Buy / sell at market with preset qty' }],
}

/** Home screen with the main bottom nav; Mutual Fund and F&O open their own sub-navs with a Home item. */
export function AppNavDemo() {
  const [nav, setNav] = useState<'main' | 'mf' | 'fno'>('main')
  const [value, setValue] = useState('stocks')
  const items = nav === 'mf' ? mfNavItems : nav === 'fno' ? fnoNavItems : mainNavItems
  const title = items.find((i) => i.value === value)?.label

  const select = (v: string) => {
    if (nav === 'main' && (v === 'mf' || v === 'fno')) setNav(v)
    setValue(v)
  }

  return (
    <div className={`${styles.screen} ${styles.fixedScreen} ${styles.noTopPad}`}>
      <Actionbar title={title} description={nav === 'main' ? undefined : nav === 'mf' ? 'Mutual funds' : 'Futures & options'} />
      <div className={styles.scrollArea}>
        <ul className={styles.list}>
          {sectionRows[value].map((r) => (
            <li key={r.label}>
              <ListCell as="button" label={r.label} description={r.description} onClick={() => {}} />
            </li>
          ))}
        </ul>
      </div>
      <BottomNavbar
        aria-label={nav === 'main' ? 'Main' : nav === 'mf' ? 'Mutual funds' : 'F&O'}
        items={items}
        value={value}
        onChange={select}
        home={nav === 'main' ? undefined : { label: 'Home', onClick: () => { setNav('main'); setValue('stocks') } }}
      />
    </div>
  )
}
