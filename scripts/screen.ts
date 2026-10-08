// Screen engine — one small JSON spec → a React screen built only from L3 components + tokens, scored against the
// design language (docs/DESIGN_LANGUAGE.md). The same spec builds the Figma version (scripts/figma/build-screen.js).
//
//   npm run screen -- list                                     # archetypes
//   npm run screen -- new order --name OrderPad --out spec.json  # start from an archetype
//   npm run screen -- score spec.json                          # quality bar (blocking issues + weighted checks)
//   npm run screen -- gen spec.json --out ../app/src/screens     # writes <Name>.tsx + <Name>.module.css, scores, audits
//      --import <path>   where L3 components live (default: relative path to this repo's src/components)
//
// Why a spec: the agent decides WHAT (content, structure) in ~40 lines; the generator decides HOW (exact components,
// props, tokens, states) the same way every time. Fewer tokens, no drift, and the score is objective.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { inr, pnl, source, type Instrument } from './screen/data.ts'

const root = join(import.meta.dirname, '..')
const ARCH = JSON.parse(readFileSync(join(root, 'docs/patterns/archetypes.json'), 'utf8')).archetypes as Record<string, Spec>

// ---- Spec --------------------------------------------------------------------------------------------------
type Action = { icon: string; label: string }
type Header = { title?: string; description?: string; back?: boolean; actions?: Action[]; tabs?: string[]; search?: string; select?: string; change?: number; sheet?: boolean }
type Row = { label: string; description?: string; value?: string; toggle?: boolean; chevron?: boolean }
type Block =
  | { type: 'summary'; label: string; select?: boolean; value: number; change?: number }
  | { type: 'price'; value: number; change: number; changeAbs?: number; note?: string }
  | { type: 'tabs'; appearance?: 'pill' | 'pill-group' | 'underline'; items: string[] }
  | { type: 'list'; title?: string; data?: string; rows?: Row[]; spark?: boolean; pnl?: boolean; card?: boolean; status?: boolean; empty?: { title: string; description?: string; action?: string } }
  | { type: 'stats'; title?: string; items: [string, string][] }
  | { type: 'chart'; kind?: 'candle' | 'line' | 'area'; trend?: 'up' | 'down'; ranges?: string[] }
  | { type: 'progress'; label: string; value: number; status?: 'default' | 'success' | 'warning' | 'error'; valueText?: string; kind?: 'progress' | 'range'; low?: number; high?: number }
  | { type: 'banner'; kind: 'discover' | 'warning' | 'danger' | 'success' | 'primary'; heading: string; text?: string }
  | { type: 'quantity'; label: string; value: number; step?: number; min?: number; hint?: string }
  | { type: 'field'; label: string; value?: string; placeholder?: string; helper?: string; status?: 'error' | 'success'; disabled?: boolean }
  | { type: 'rows'; title?: string; items: Row[] }
  | { type: 'filters'; items: { label: string; icon?: 'chevron' | 'swap' }[] }
  | { type: 'empty'; title: string; description?: string; action?: string; illustration?: string }
type Dock = { direction?: 'vertical' | 'horizontal'; buttons: { label: string; variant: string; disabled?: boolean; reason?: string }[] }
type Spec = { name: string; archetype: string; header: Header; blocks: Block[]; dock?: Dock; nav?: 'main' | 'mf' | 'fno'; states?: ('loading' | 'empty')[]; review?: boolean }

// ---- Score (docs/DESIGN_LANGUAGE.md §9) ----------------------------------------------------------------------
const STRONG = new Set(['primary', 'buy', 'sell', 'brand'])
const VERBS = /^(buy|sell|place|add|review|apply|view|continue|confirm|save|start|pay|withdraw|invest|cancel|clear|done|verify|send|retry|try|exit|modify|create|set|open|close|go|explore|track|search|change|update|remove|delete|log|sign|get|download|share|repeat|square|convert|switch)\b/i
const HEIGHT: Record<string, (b: Block) => number> = {
  summary: () => 128, price: () => 104, tabs: () => 40, chart: () => 248, progress: () => 52, banner: () => 76, quantity: () => 56, field: () => 80, filters: () => 40, empty: () => 300,
  stats: (b) => (b.type === 'stats' ? (b.title ? 36 : 0) + 24 + Math.ceil(b.items.length / 2) * 48 : 0),
  list: (b) => (b.type === 'list' ? (b.title ? 36 : 0) + Math.min(8, b.rows?.length ?? (Number((b.data ?? '::5').split(':')[2]) || 5)) * 58 : 0),
  rows: (b) => (b.type === 'rows' ? (b.title ? 36 : 0) + b.items.length * 52 : 0),
}
export type Score = { score: number; pass: boolean; blocking: string[]; checks: { id: string; points: number; max: number; note?: string }[] }
export function score(spec: Spec, codeErrors = 0): Score {
  const blocking: string[] = []
  const checks: Score['checks'] = []
  const check = (id: string, max: number, ok: boolean | number, note?: string) => checks.push({ id, max, points: typeof ok === 'number' ? Math.max(0, Math.min(max, ok)) : ok ? max : 0, note: (typeof ok === 'number' ? ok < max : !ok) ? note : undefined })
  const buttons = spec.dock?.buttons ?? []
  // One strong action — except a Buy + Sell pair, which is ONE trade decision (asset pages show both).
  const strong = buttons.filter((b) => STRONG.has(b.variant))
  const tradePair = strong.length === 2 && strong.some((b) => b.variant === 'buy') && strong.some((b) => b.variant === 'sell')
  if (strong.length > 1 && !tradePair) blocking.push(`${strong.length} strong buttons in the dock — keep one (others secondary / tertiary)`)
  if (spec.dock && spec.nav) blocking.push('a ButtonGroup dock and a BottomNavbar on the same screen — pick one')
  if (spec.archetype === 'order' && !spec.review && !buttons.some((b) => /^review/i.test(b.label))) blocking.push('an order screen without a review step — money actions are two-step (review sheet)')
  if (codeErrors) blocking.push(`${codeErrors} code-audit errors in the generated files (raw values / hand-rolled UI)`)
  const allText: string[] = []
  const walk = (v: unknown) => { if (typeof v === 'string') allText.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk) }
  walk(spec.blocks); walk(spec.header)
  // Only displayed DATA values can be changes (stats, row values) — '+₹1,000' on a quick-add chip is a label, not a change.
  const dataValues = spec.blocks.flatMap((b) => (b.type === 'stats' ? b.items.map(([, v]) => v) : b.type === 'rows' ? b.items.map((r) => r.value ?? '') : []))
  for (const t of dataValues) if (/^[+\-−]\s?₹?\d[\d,.]*%?$/.test(t.trim())) blocking.push(`"${t}" is a change written as text — use a number field (rendered by PriceChange)`)

  const needsDock = ['order', 'detail', 'form', 'review', 'result'].includes(spec.archetype)
  check('primary action docked', 15, needsDock ? buttons.length > 0 : true, 'add a dock with the one main action')
  let y = 88 + (spec.header.tabs ? 40 : 0), heroAt = -1, inFold = 0
  for (const b of spec.blocks) { if (heroAt < 0 && (b.type === 'summary' || b.type === 'price')) heroAt = y; if (y < 600) inFold++; y += (HEIGHT[b.type]?.(b) ?? 60) + 24 }
  const wantsHero = ['home', 'detail', 'portfolio'].includes(spec.archetype)
  check('hero number above the fold', 10, !wantsHero || (heroAt >= 0 && heroAt < 600), 'put the summary / price block first')
  const lists = spec.blocks.filter((b) => b.type === 'list')
  const states = new Set(spec.states ?? [])
  // Market lists (indices, commodities, movers) are never empty; the user's own lists (watchlist, holdings, orders, search) can be.
  const userLists = lists.some((l) => l.type === 'list' && !/indices|commodities/.test(l.data ?? '')) && ['list', 'portfolio', 'history', 'search'].includes(spec.archetype)
  check('lists have loading + empty states', 10, !lists.length ? 10 : (states.has('loading') ? 5 : 0) + (!userLists || states.has('empty') || lists.some((l) => l.type === 'list' && l.empty) ? 5 : 0), 'add "states": ["loading", "empty"] and an empty block')
  const fields = spec.blocks.filter((b) => b.type === 'field')
  const disabledNoReason = buttons.some((b) => b.disabled && !b.reason)
  check('forms explain errors + disabled buttons', 8, (!fields.length || fields.some((f) => f.type === 'field' && (f.helper || f.status))) && !disabledNoReason, 'add helper / error text; a disabled button needs a reason')
  const titleCase = allText.concat(buttons.map((b) => b.label)).filter((t) => /^[A-Z][a-z]+( [A-Z][a-z]+){1,}$/.test(t) && !/^(Nifty|Sensex|Gold|Silver|Crude|Bank|Market|Stocks|Mutual)/.test(t))
  check('sentence case', 6, 6 - titleCase.length * 2, `Title Case: ${titleCase.slice(0, 3).join(', ')}`)
  const nonVerbs = buttons.filter((b) => !VERBS.test(b.label))
  check('buttons are verbs', 6, 6 - nonVerbs.length * 3, `not verbs: ${nonVerbs.map((b) => b.label).join(', ')}`)
  check('≤ 2 Actionbar actions', 5, (spec.header.actions?.length ?? 0) <= 2, 'move extra actions into a sheet')
  const accents = new Set<string>()
  for (const b of spec.blocks) { if (b.type === 'banner') accents.add(b.kind); if (b.type === 'progress' && b.status && b.status !== 'default') accents.add(b.status) }
  check('≤ 2 accent meanings (besides up/down)', 6, accents.size <= 2, `accents: ${[...accents].join(', ')}`)
  const badNumbers = allText.filter((t) => /\d{5,}/.test(t.replace(/[,.]\d+/g, '')) && !/^\d{1,2}\s/.test(t) || /₹\s\d/.test(t) || /\d,\d{3},\d{3}/.test(t))
  check('numbers formatted (₹, Indian grouping)', 8, 8 - badNumbers.length * 2, `check: ${badNumbers.slice(0, 3).join(', ')}`)
  check('rhythm from tokens', 6, true)
  check('icon-only actions are named', 5, (spec.header.actions ?? []).every((a) => a.label && a.label.length > 1), 'every action needs a label')
  check('≤ 8 blocks above the fold', 5, inFold <= 8, `${inFold} blocks above the fold`)
  const money = ['order', 'review'].includes(spec.archetype)
  const trustInfo = spec.blocks.some((b) => (b.type === 'stats' && b.items.some(([k]) => /charges|margin|total/i.test(k))) || (b.type === 'rows' && b.items.some((r) => /charges|margin|total/i.test(r.label))))
  check('trust info before money actions', 10, !money || trustInfo, 'show margin, charges and the total before the confirm button')
  let total = checks.reduce((s, c) => s + c.points, 0)
  if (blocking.length) total = Math.min(total, 60)
  return { score: total, pass: total >= 85 && !blocking.length, blocking, checks }
}

// ---- Generate React --------------------------------------------------------------------------------------------
const ICONS: Record<string, string> = { search: 'msSearch', notifications: 'msNotifications', bookmark: 'msBookmark', chevron: 'msChevronRight', check: 'msCheckCircle', info: 'msInfo', filter: 'msFilterList', add: 'msAdd' }
const q = (s: string) => JSON.stringify(s)
const ident = (s: string) => s.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c: string) => (c ? c.toUpperCase() : '')).replace(/^./, (c) => c.toLowerCase())

export function generate(spec: Spec, importBase: string) {
  const use = new Set<string>(), icons = new Set<string>(), state: string[] = [], consts: string[] = []
  const C = (name: string) => (use.add(name), name)
  const I = (name: string) => { const ms = ICONS[name] ?? 'msInfo'; icons.add(ms); return ms }
  let tabsN = 0
  const tabsState = (items: string[]) => { const v = `tab${tabsN++ || ''}`; state.push(`const [${v}, set${v[0].toUpperCase()}${v.slice(1)}] = useState(${q(ident(items[0]))})`); return { v, set: `set${v[0].toUpperCase()}${v.slice(1)}` } }
  const tabsJsx = (items: string[], appearance: string, label: string) => { const t = tabsState(items); return `<${C('Tabs')} appearance=${q(appearance)} aria-label=${q(label)} value={${t.v}} onChange={${t.set}} items={[${items.map((i) => `{ value: ${q(ident(i))}, label: ${q(i)} }`).join(', ')}]} />` }
  const h = spec.header
  const out: string[] = []
  const priceCol = (i: Instrument, showPnl: boolean) => showPnl
    ? `<span className={styles.priceCol}><${C('PriceChange')} value={${pnl(i)}} unit="currency" size="md" /><span className={styles.meta}>${inr(i.price)}</span></span>`
    : `<span className={styles.priceCol}><span className={styles.price}>${inr(i.price)}</span><${C('PriceChange')} value={${i.change}} /></span>`

  // header
  if (h.sheet) {
    out.push(`      <${C('BottomSheetHeader')} heading=${q(h.title ?? spec.name)} size="lg" />`)
  } else {
    const props: string[] = []
    if (h.select) {
      props.push(`title={<${C('Select')} size="lg" onClick={openSwitcher}>${h.select}</Select>}`)
      consts.push('const openSwitcher = () => {} // TODO: open a BottomSheet with the choices')
    } else if (h.title) props.push(`title=${q(h.title)}`)
    if (h.change !== undefined) props.push(`description={<${C('PriceChange')} value={${h.change}} />}`)
    else if (h.description) props.push(`description=${q(h.description)}`)
    if (h.back) {
      props.push('onBack={onBack}')
      consts.push('const onBack = () => history.back()')
    }
    if (h.actions?.length) props.push(`actions={<>${h.actions.map((a) => `<${C('ActionbarAction')} icon={${I(a.icon)}} label=${q(a.label)} onClick={() => {}} />`).join('')}</>}`)
    if (h.tabs) props.push(`bottom={${tabsJsx(h.tabs, 'underline', h.title ?? 'Sections')}}`)
    if (h.search !== undefined) { state.push("const [query, setQuery] = useState('')"); props.push(`search={{ value: query, onChange: setQuery, placeholder: ${q(h.search)} }}`) }
    out.push(`      <${C('Actionbar')} sticky ${props.join(' ')} />`)
  }

  // body
  const body: string[] = []
  spec.blocks.forEach((b, k) => {
    const sec = (title: string | undefined, inner: string) => body.push(`        <section className={styles.section}${title ? ` aria-labelledby="s${k}"` : ''}>\n${title ? `          <h2 id="s${k}" className={styles.sectionTitle}>${title}</h2>\n` : ''}${inner}\n        </section>`)
    switch (b.type) {
      case 'summary': sec(undefined, `          <div className={styles.hero}>\n            ${b.select ? `<${C('Select')} size="sm" subtle onClick={() => {}}>${b.label}</Select>` : `<span className={styles.heroLabel}>${b.label}</span>`}\n            <span className={styles.heroValue}>${inr(b.value)}</span>\n            ${b.change !== undefined ? `<${C('PriceChange')} value={${b.change}} size="lg" arrow />` : ''}\n          </div>`); break
      case 'price': sec(undefined, `          <div className={styles.hero}>\n            <span className={styles.heroValue}>${inr(b.value)}</span>\n            <${C('PriceChange')} value={${b.changeAbs ?? b.change}} ${b.changeAbs !== undefined ? `unit="number" percent={${b.change}} ` : ''}size="md" arrow />\n            ${b.note ? `<span className={styles.meta}>${b.note}</span>` : ''}\n          </div>`); break
      case 'tabs': sec(undefined, `          ${tabsJsx(b.items, b.appearance ?? 'pill', 'Filter')}`); break
      case 'chart': {
        consts.push(CHART_DATA)
        use.add('ChartType')
        sec(undefined, `          <${C('Chart')} label=${q((h.select ?? h.title ?? spec.name) + ', today')} type=${q(b.kind ?? 'candle')} data={sampleCandles(${q(b.trend ?? 'up')})} timeLabels={['9:15', '11:15', '1:15', '3:15']} />${b.ranges ? `\n          ${tabsJsx(b.ranges, 'pill-group', 'Chart range')}` : ''}`)
        break
      }
      case 'progress': sec(undefined, `          <div className={styles.labelRow}><span className={styles.meta}>${b.kind === 'range' && b.low !== undefined ? `Low ${inr(b.low)}` : b.label}</span><span className={styles.value}>${b.kind === 'range' && b.high !== undefined ? `${inr(b.high)} High` : (b.valueText ?? `${b.value}%`)}</span></div>\n          <${C('ProgressBar')} label=${q(b.label)} value={${b.value}}${b.kind === 'range' ? ' type="range"' : ''}${b.status && b.status !== 'default' ? ` status=${q(b.status)}` : ''}${b.valueText ? ` valueText=${q(b.valueText)}` : ''} />`); break
      case 'banner': sec(undefined, `          <${C('Aerobar')} type=${q(b.kind)} heading=${q(b.heading)}${b.text ? ` paragraph=${q(b.text)}` : ''} />`); break
      case 'quantity': { state.push(`const [qty, setQty] = useState(${b.value})`); sec(undefined, `          <div className={styles.labelRow}>\n            <span className={styles.qtyLabel}><${C('Select')} onClick={() => {}}>${b.label}</Select>${b.hint ? `<span className={styles.meta}>(${b.hint})</span>` : ''}</span>\n            <${C('Stepper')} label=${q(b.label)} value={qty} onChange={setQty} step={${b.step ?? 1}} min={${b.min ?? 0}} />\n          </div>`); break }
      case 'field': sec(undefined, `          <${C('TextField')} label=${q(b.label)}${b.value ? ` defaultValue=${q(b.value)}` : ''}${b.placeholder ? ` placeholder=${q(b.placeholder)}` : ''}${b.helper ? ` helperText=${q(b.helper)}` : ''}${b.status ? ` status=${q(b.status)}` : ''}${b.disabled ? ' disabled' : ''} />`); break
      case 'stats': sec(b.title, `          <${C('Card')} variant="filled">\n            <dl className={styles.stats}>\n${b.items.map(([l, v]) => `              <div><dt className={styles.statLabel}>${l}</dt><dd className={styles.statValue}>${v}</dd></div>`).join('\n')}\n            </dl>\n          </Card>`); break
      case 'filters': sec(undefined, `          <div className={styles.filters}>${b.items.map((f) => `<${C('Select')} size="md" subtle icon=${q(f.icon === 'swap' ? 'swap' : 'chevron')} onClick={() => {}}>${f.label}</Select>`).join('')}</div>`); break
      case 'empty': sec(undefined, `          <${C('EmptyState')} title=${q(b.title)}${b.description ? ` description=${q(b.description)}` : ''}${b.illustration ? ` illustration={<${C('Icon')} icon={${I(b.illustration)}} size={24} />}` : ''}${b.action ? ` action={<${C('Button')} variant="tertiary">${b.action}</Button>}` : ''} />`); break
      case 'rows': sec(b.title, b.items.map((r) => r.toggle !== undefined
        ? `          <${C('ListCell')} as="label" label=${q(r.label)}${r.description ? ` description=${q(r.description)}` : ''} trailing={<${C('Switch')} defaultChecked={${r.toggle}} />} />`
        : `          <${C('ListCell')} label=${q(r.label)}${r.description ? ` description=${q(r.description)}` : ''}${r.value ? ` trailing={<span className={styles.meta}>${r.value}</span>}` : ''}${r.chevron ? ` as="button" onClick={() => {}} iconRight={<${C('Icon')} icon={${I('chevron')}} size={20} />}` : ''} />`).join('\n')); break
      case 'list': {
        const items = b.rows ? null : source(b.data ?? 'data:watchlist:5')
        const rows = items
          ? items.map((i) => `            <${C('ListCell')} key=${q(i.symbol)}${b.card ? ' variant="card"' : ''} label=${q(i.symbol)} description=${q(b.pnl ? `${i.qty} qty · avg ${inr(i.avg ?? i.price)}` : i.name)} trailing={<span className={styles.trailing}>${b.spark ? `<${C('Sparkline')} data={spark(${q(i.spark)})} />` : ''}${b.status ? `<${C('Tag')} size="sm" variant="secondary" color=${q(i.change >= 0 ? 'success' : 'processing')}>${i.change >= 0 ? 'Executed' : 'Open'}</Tag>` : ''}${priceCol(i, Boolean(b.pnl))}</span>} />`).join('\n')
          : (b.rows ?? []).map((r) => `            <${C('ListCell')} label=${q(r.label)}${r.description ? ` description=${q(r.description)}` : ''} />`).join('\n')
        if (b.spark && !consts.some((c) => c.startsWith('const spark'))) consts.push(SPARK_DATA)
        const empty = b.empty ? `<${C('EmptyState')} title=${q(b.empty.title)}${b.empty.description ? ` description=${q(b.empty.description)}` : ''}${b.empty.action ? ` action={<${C('Button')} variant="tertiary">${b.empty.action}</Button>}` : ''} />` : `<${C('EmptyState')} title="Nothing here yet" />`
        use.add('SkeletonListRow')
        sec(b.title, `          {state === 'loading' ? (\n            <div aria-busy="true" aria-label=${q(`Loading ${(b.title ?? spec.name).toLowerCase()}`)}>{Array.from({ length: ${Math.min(items?.length ?? 5, 8)} }, (_, n) => <SkeletonListRow key={n} />)}</div>\n          ) : state === 'empty' ? (\n            ${empty}\n          ) : (\n            <div className={styles.list}>\n${rows}\n            </div>\n          )}`)
        break
      }
    }
  })

  // dock / nav
  let bottom = ''
  if (spec.dock) {
    const reason = spec.dock.buttons.find((b) => b.disabled && b.reason)?.reason
    bottom = `      ${reason ? `<p className={styles.reason}>${reason}</p>\n      ` : ''}<${C('ButtonGroup')} className={styles.dock} direction=${q(spec.dock.direction ?? 'vertical')} aria-label="Actions">\n${spec.dock.buttons.map((b) => `        <${C('Button')} variant=${q(b.variant)}${b.disabled ? ' disabled' : ''} onClick={() => {}}>${b.label}</Button>`).join('\n')}\n      </ButtonGroup>`
  } else if (spec.nav) {
    use.add('NavIcon')
    const NAV: Record<string, [string, string, string][]> = { main: [['stocks', 'Stocks', 'stocks'], ['market', 'Market', 'market'], ['portfolio', 'Portfolio', 'portfolio'], ['mf', 'Mutual Fund', 'mutualFund'], ['fno', 'F&O', 'fno']], fno: [['fno', 'F&O', 'fno'], ['chain', 'Option Chain', 'fnoOptionChain'], ['positions', 'Positions', 'fnoPositions'], ['scalper', 'Scalper', 'fnoScalper']], mf: [['mf', 'Mutual Fund', 'mutualFund'], ['funds', 'Funds', 'mfFunds'], ['dashboard', 'Dashboard', 'mfDashboard'], ['sips', 'SIPs', 'mfSips']] }
    consts.push(`const navItems = [${NAV[spec.nav].map(([v, l, i]) => `{ value: ${q(v)}, label: ${q(l)}, icon: <NavIcon name=${q(i)} />, selectedIcon: <NavIcon name=${q(i)} selected /> }`).join(', ')}]`)
    bottom = `      <${C('BottomNavbar')} aria-label="Main" items={navItems} value=${q(spec.archetype === 'portfolio' ? 'positions' : NAV[spec.nav][0][0])} />`
  }

  // assemble
  const groups: Record<string, string[]> = {}
  const FROM: Record<string, string> = { Actionbar: 'Actionbar', ActionbarAction: 'Actionbar', Tabs: 'Tabs', Select: 'Select', PriceChange: 'PriceChange', Card: 'Card', ListCell: 'ListCell', Sparkline: 'Chart', Chart: 'Chart', ChartType: 'Chart', ProgressBar: 'ProgressBar', Aerobar: 'Aerobar', TextField: 'TextField', Stepper: 'Stepper', ButtonGroup: 'ButtonGroup', Button: 'Button', BottomNavbar: 'BottomNavbar', NavIcon: 'BottomNavbar', EmptyState: 'EmptyState', SkeletonListRow: 'Skeleton', Switch: 'Switch', Tag: 'Tag', Icon: 'Icon', BottomSheetHeader: 'BottomSheet' }
  for (const n of use) { const f = FROM[n]; if (f) (groups[f] ??= []).push(n === 'ChartType' ? 'type ChartCandle' : n) }
  const needsState = state.length > 0
  const imports = [
    needsState ? "import { useState } from 'react'" : '',
    ...Object.entries(groups).sort().map(([f, names]) => `import { ${[...new Set(names)].sort().join(', ')} } from '${importBase}/${f}'`),
    icons.size ? `import { ${[...icons].sort().join(', ')} } from '${importBase}/../icons/material'` : '',
    `import styles from './${spec.name}.module.css'`,
  ].filter(Boolean)
  const usesState = body.some((b) => b.includes("state === '"))
  const tsx = `// Generated by \`npm run screen -- gen\` from ${spec.name}.spec.json (archetype: ${spec.archetype}). L3 components + tokens only.
// Edit the spec and regenerate for structure; wire real data and handlers here. Score: see ${spec.name}.score.md
${imports.join('\n')}

${consts.join('\n')}

export function ${spec.name}(${usesState ? "{ state = 'default' }: { state?: 'default' | 'loading' | 'empty' }" : ''}) {
${state.map((s) => `  ${s}`).join('\n')}
  return (
    <div className={styles.screen}>
${out.join('\n')}
      <main className={styles.body}>
${body.join('\n')}
      </main>
${bottom}
    </div>
  )
}
`.replace(/\n{3,}/g, '\n\n')
  return { tsx, css: CSS }
}

const SPARK_DATA = `const spark = (trend: 'up' | 'down') => Array.from({ length: 20 }, (_, i) => 100 + (trend === 'up' ? i : -i) * 0.6 + Math.sin(i * 1.7) * 1.4) // TODO: real intraday closes`
const CHART_DATA = `function sampleCandles(trend: 'up' | 'down'): ChartCandle[] { // TODO: real candles
  let p = 100, seed = trend === 'up' ? 7 : 11
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: 40 }, () => { const open = p, close = p + (trend === 'up' ? 0.4 : -0.4) + (r() - 0.5) * 3; p = close; return { open, close, high: Math.max(open, close) + r(), low: Math.min(open, close) - r(), volume: 200 + r() * 800 } })
}`
const CSS = `/* Generated by \`npm run screen -- gen\` — every value is an --l3-* token (docs/DESIGN_LANGUAGE.md §2). */
.screen { display: flex; flex-direction: column; min-height: 100%; background: var(--l3-surface-default); color: var(--l3-content-primary); }
.body { display: flex; flex: 1; flex-direction: column; gap: var(--l3-spacing-24); padding: var(--l3-spacing-16) var(--l3-spacing-16) var(--l3-spacing-24); }
.section { display: flex; flex-direction: column; gap: var(--l3-spacing-16); } /* section heading → card: 16 (DESIGN_SYSTEM 2.3) */
.sectionTitle { margin: 0; font: var(--l3-text-heading-16); }
.hero { display: flex; flex-direction: column; align-items: flex-start; gap: var(--l3-spacing-04); }
.heroLabel, .meta, .statLabel { font: var(--l3-text-description-12); color: var(--l3-content-secondary); }
.heroValue { font: var(--l3-text-heading-24); font-variant-numeric: tabular-nums; }
.labelRow { display: flex; align-items: center; justify-content: space-between; gap: var(--l3-spacing-12); }
.qtyLabel { display: inline-flex; align-items: center; gap: var(--l3-spacing-04); }
.value, .price, .statValue { font: var(--l3-text-label-14); font-variant-numeric: tabular-nums; }
.stats { display: grid; grid-template-columns: 1fr 1fr; gap: var(--l3-spacing-12) var(--l3-spacing-16); margin: 0; }
.stats dd { margin: 0; }
.list { display: flex; flex-direction: column; }
.trailing { display: flex; align-items: center; gap: var(--l3-spacing-12); }
.priceCol { display: flex; flex-direction: column; align-items: flex-end; gap: var(--l3-spacing-02); }
.filters { display: flex; gap: var(--l3-spacing-16); }
.reason { margin: 0; padding: 0 var(--l3-spacing-16); font: var(--l3-text-description-12); color: var(--l3-content-secondary); text-align: center; }
.dock { position: sticky; bottom: 0; }
`

// ---- CLI ----------------------------------------------------------------------------------------------------------
const args = process.argv.slice(2)
const cmd = args[0]
const opt = (f: string) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined }
const printScore = (s: Score) => {
  console.log(`\nScore ${s.score}/100 — ${s.pass ? 'PASS' : 'NOT YET'} (needs ≥ 85 and no blocking issues)`)
  for (const b of s.blocking) console.log(`  ✖ blocking: ${b}`)
  for (const c of s.checks.filter((c) => c.points < c.max)) console.log(`  − ${c.id} (${c.points}/${c.max})${c.note ? `: ${c.note}` : ''}`)
}
if (cmd === 'list' || !cmd) {
  console.log('Archetypes (docs/patterns/archetypes.json):')
  for (const [k, v] of Object.entries(ARCH)) console.log(`  ${k.padEnd(10)} ${v.name}: ${v.blocks.map((b) => b.type).join(' · ')}${v.dock ? ' · dock' : ''}${v.nav ? ' · nav' : ''}`)
} else if (cmd === 'new') {
  const a = ARCH[args[1]]
  if (!a) { console.error(`Unknown archetype "${args[1]}". Run: npm run screen -- list`); process.exit(1) }
  const spec = { ...structuredClone(a), name: opt('--name') ?? a.name }
  const out = opt('--out') ?? `${spec.name}.spec.json`
  writeFileSync(out, JSON.stringify(spec, null, 2) + '\n')
  console.log(`Wrote ${out} — edit the content, then: npm run screen -- gen ${out} --out <dir>`)
} else if (cmd === 'score') {
  const s = score(JSON.parse(readFileSync(args[1], 'utf8')))
  printScore(s)
  if (!s.pass) process.exitCode = 1
} else if (cmd === 'gen') {
  const spec = JSON.parse(readFileSync(args[1], 'utf8')) as Spec
  const outDir = resolve(opt('--out') ?? '.')
  if (outDir.startsWith(join(root, 'src'))) { console.error('Refusing to write screens into the design-system repo (it is DS-only). Pass --out <product repo dir>.'); process.exit(1) }
  mkdirSync(outDir, { recursive: true })
  const base = opt('--import') ?? relative(outDir, join(root, 'src/components')).replace(/\\/g, '/')
  const { tsx, css } = generate(spec, base.startsWith('.') ? base : base.startsWith('@') ? base : `./${base}`)
  writeFileSync(join(outDir, `${spec.name}.tsx`), tsx)
  writeFileSync(join(outDir, `${spec.name}.module.css`), css)
  writeFileSync(join(outDir, `${spec.name}.spec.json`), JSON.stringify(spec, null, 2) + '\n')
  // audit the generated files with the same code audit agents use (blocking if it finds errors)
  let codeErrors = 0
  try { execFileSync(process.execPath, [join(root, 'scripts/audit-ui.ts'), join(outDir, `${spec.name}.tsx`), join(outDir, `${spec.name}.module.css`), '--ci'], { stdio: 'pipe' }) } catch { codeErrors = JSON.parse(execFileSync(process.execPath, [join(root, 'scripts/audit-ui.ts'), join(outDir, `${spec.name}.tsx`), join(outDir, `${spec.name}.module.css`), '--json']).toString()).errors }
  const s = score(spec, codeErrors)
  writeFileSync(join(outDir, `${spec.name}.score.md`), `# ${spec.name} — ${s.score}/100 ${s.pass ? 'PASS' : 'NOT YET'}\n\n${s.blocking.map((b) => `- ✖ ${b}`).join('\n')}\n${s.checks.map((c) => `- ${c.points === c.max ? '✓' : '−'} ${c.id} (${c.points}/${c.max})${c.note ? `: ${c.note}` : ''}`).join('\n')}\n`)
  console.log(`Wrote ${relative(process.cwd(), join(outDir, spec.name))}.tsx / .module.css / .spec.json / .score.md (imports from ${base})`)
  printScore(s)
  if (!existsSync(dirname(join(outDir, 'x')))) process.exitCode = 1
} else {
  console.error('Commands: list · new <archetype> [--name N] [--out f] · score <spec> · gen <spec> --out <dir> [--import path]')
  process.exitCode = 1
}
