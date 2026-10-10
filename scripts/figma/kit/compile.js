// L3 compile — the local half of the L3 kit (Node, zero tokens): parse L3 JSX, apply the design rules (errors,
// warnings, certain auto-fixes), and produce the compact build plan the Figma runtime executes.
// Used by scripts/figma/kit.ts (npm run kit -- build | lint). Language + rules: docs/agent/GENERATE.md.

export function createCompiler() {
  const R = { warnings: [], fixes: [], errors: [] }
  const warn = (m) => { if (!R.warnings.includes(m)) R.warnings.push(m) }
  const fix = (m) => { if (!R.fixes.includes(m)) R.fixes.push(m) }

  // ---- 1. Parser: a static JSX subset → { t, p, c, src } ------------------------------------------------------------
  const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rarr: '→', larr: '←', middot: '·', ndash: '–', mdash: '—', times: '×', rupee: '₹' }
  function parse(s) {
    let i = 0
    const line = () => s.slice(0, i).split('\n').length
    const err = (m) => { throw new Error(`JSX line ${line()}: ${m}`) }
    const ws = () => {
      for (;;) {
        while (i < s.length && /\s/.test(s[i])) i++
        if (s.startsWith('{/*', i)) { const e = s.indexOf('*/}', i); i = e < 0 ? s.length : e + 3; continue }
        if (s.startsWith('<!--', i)) { const e = s.indexOf('-->', i); i = e < 0 ? s.length : e + 3; continue }
        return
      }
    }
    const name = () => { const m = /^[A-Za-z_][\w.-]*/.exec(s.slice(i, i + 80)); if (!m) err('expected a name, found ' + JSON.stringify(s.slice(i, i + 10))); i += m[0].length; return m[0] }
    const str = () => { const q = s[i++]; let o = ''; while (i < s.length && s[i] !== q) { if (s[i] === '\\') { i++; const e = s[i++]; o += e === 'n' ? '\n' : e === 't' ? '\t' : e } else o += s[i++] } if (s[i] !== q) err('unclosed string'); i++; return o }
    function value() {
      ws()
      const c = s[i]
      if (c === '<') return el()
      if (c === '"' || c === "'" || c === '`') return str()
      if (c === '[') { i++; const a = []; ws(); while (s[i] !== ']') { if (i >= s.length) err('unclosed ['); a.push(value()); ws(); if (s[i] === ',') { i++; ws() } } i++; return a }
      if (c === '{') { i++; const o = {}; ws(); while (s[i] !== '}') { if (i >= s.length) err('unclosed {'); const k = s[i] === '"' || s[i] === "'" ? str() : name(); ws(); if (s[i] !== ':') err('expected : after ' + k); i++; o[k] = value(); ws(); if (s[i] === ',') { i++; ws() } } i++; return o }
      const m = /^(-?\d+(\.\d+)?|true|false|null|undefined)/.exec(s.slice(i, i + 32))
      if (m) { i += m[0].length; return m[0] === 'undefined' ? undefined : JSON.parse(m[0]) }
      err('unexpected ' + JSON.stringify(s.slice(i, i + 16)) + ' — props take "text", {number}, {true}, {[…]}, {{…}} or {<Element/>}')
    }
    function el() {
      const start = i
      i++ // <
      if (s[i] === '>') { i++; return { t: '#', p: {}, c: kids('') } }
      const t = name(), p = {}
      for (;;) {
        ws()
        if (s.startsWith('/>', i)) { i += 2; return { t, p, c: [], src: s.slice(start, i), line: line() } }
        if (s[i] === '>') { i++; const c = kids(t); return { t, p, c, src: s.slice(start, i), line: line() } }
        if (i >= s.length) err(`<${t}> is not closed`)
        const k = name(); ws()
        if (s[i] === '=') { i++; ws(); if (s[i] === '{') { i++; p[k] = value(); ws(); if (s[i] !== '}') err(`expected } after ${k}={…`); i++ } else if (s[i] === '"' || s[i] === "'") p[k] = str(); else err(`${k}= needs "text" or {value}`) }
        else p[k] = true
      }
    }
    function kids(t) {
      const out = []
      let txt = ''
      const flush = () => { const x = txt.replace(/\s+/g, ' ').trim(); if (x) out.push(x.replace(/&(#\d+|[a-z]+);/g, (m, e) => (e[0] === '#' ? String.fromCharCode(+e.slice(1)) : ENT[e] ?? m))); txt = '' }
      while (i < s.length) {
        if (s.startsWith('{/*', i) || s.startsWith('<!--', i)) { flush(); ws(); continue }
        if (s.startsWith('</', i)) { flush(); i += 2; ws(); const n = s[i] === '>' ? '' : name(); ws(); if (n !== t) err(`expected </${t || '…'}>, found </${n}>`); i++; return out }
        if (s[i] === '<') { flush(); out.push(el()); continue }
        if (s[i] === '{') { flush(); i++; const v = value(); ws(); if (s[i] !== '}') err('expected }'); i++; for (const x of [].concat(v)) if (x !== null && x !== undefined && x !== false) out.push(typeof x === 'object' ? x : String(x)); continue }
        txt += s[i++]
      }
      if (t) err(`missing </${t}>`)
      flush()
      return out
    }
    const top = kids('')
    const els = []
    for (const n of top) { if (typeof n === 'string') err('text outside an element: ' + JSON.stringify(n.slice(0, 30))); else if (n.t === '#') els.push(...n.c.filter((x) => typeof x !== 'string')); else els.push(n) }
    return els
  }
  const isEl = (x) => x && typeof x === 'object' && x.t
  const textOf = (c) => c.filter((x) => typeof x === 'string').join(' ').trim()
  const walk = (n, f, d = 0) => { if (!isEl(n)) return; f(n, d); for (const k of n.c) walk(k, f, d + 1); for (const v of Object.values(n.p)) for (const x of [].concat(v)) if (isEl(x)) walk(x, f, d + 1) }

  // ---- 2. The vocabulary: elements, props, Figma names ----------------------------------------------------------------
  const BTN = { primary: '◻️ Primary', secondary: '🔲 Secondary', tertiary: '⬜︎ Tertiary', ghost: 'Ghost', brand: '🟨 Brand', buy: '🟩 Buy', sell: '🟥 Sell' }
  const STRONG = ['primary', 'buy', 'sell', 'brand']
  const SIZE = { lg: 'Large', md: 'Medium', sm: 'Small' }
  const TAG_C = { neutral: 'Neutral', profit: '🟩 Profit', loss: '🟥  Loss', success: '✅ Success', error: '🚨 Error', warning: '⚠️ Warning', discover: '🔷 Discover', processing: '🟠 Processing', indigo: 'indigo', teal: 'teal', purple: 'purple', zing: '⚡ Zing' }
  const TAG_OLD = { green: 'profit or success', red: 'loss or error', yellow: 'warning', orange: 'processing' }
  const TAG_V = { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiory', disabled: 'Disabled' }
  const TAG_S = { sm: 'Small → 16', md: 'Medium → 20', lg: 'Large → 24' }
  const TABS = { underline: 'Flat tabs', pill: 'Pill tabs', 'pill-group': 'Pill group' }
  const AERO = { primary: 'Primary', discover: 'Discover', danger: 'Danger', success: 'Success', warning: 'Warning' }
  const NAV = { stocks: 'Stocks', market: 'Market', portfolio: 'Portfolio', mf: 'MF', fno: 'F&O', 'mf-funds': 'MF - Funds', 'mf-dashboard': 'MF - Dashboard', 'mf-sips': 'MF - SIPs', 'fno-option-chain': 'F&O - Option Chain', 'fno-positions': 'F&O - Positions', 'fno-scalper': 'F&O - Scalper' }
  // element → { c: Figma component(s), e: enum props, b: block (fills the column width) }
  const EL = {
    Flow: {}, Screen: {}, Section: { b: 1, c: ['L3: Section header', 'L3: Button', 'L3: Select switcher', 'L3: Tags'] }, Stack: { b: 1 }, Row: { b: 1 }, List: { b: 1 }, Text: { b: 1 }, Icon: {}, Divider: { b: 1 }, KeyValue: { c: ['L3: Price change'] }, Stats: { b: 1, c: ['L3: Card', 'L3: Price change'] }, Placeholder: { b: 1 },
    Actionbar: { b: 1, c: ['L3: Actionbar', 'L3: Button', 'L3: Tabs group', 'L3: Select switcher'] }, ActionbarAction: {},
    Button: { c: ['L3: Button'], e: { variant: Object.keys(BTN), size: Object.keys(SIZE) } },
    ButtonGroup: { b: 1, c: ['L3: Button Dock', 'L3: Button'], e: { direction: ['vertical', 'horizontal'] } },
    Tabs: { b: 1, c: ['L3: Tabs group'], e: { appearance: Object.keys(TABS), emphasis: ['primary', 'secondary', 'tertiary'], size: ['md', 'sm'] } }, Tab: {},
    Tag: { c: ['L3: Tags'], e: { variant: Object.keys(TAG_V), color: Object.keys(TAG_C), size: Object.keys(TAG_S) } },
    PriceChange: { c: ['L3: Price change'], e: { unit: ['percent', 'currency', 'number'], size: Object.keys(SIZE) } },
    ListCell: { b: 1, c: ['L3: list cell'], e: { size: ['md', 'sm'], variant: ['plain', 'card'], density: ['compact', 'breathable'] } },
    Card: { b: 1, c: ['L3: Card', 'L3: Button'], e: { variant: ['static', 'clickable', 'flat', 'filled'], padding: ['default', 'none'] } },
    SectionHeader: { b: 1, c: ['L3: Section header', 'L3: Tags'] },
    TextField: { b: 1, c: ['L3: input field & text Box'], e: { status: ['error', 'success'] } },
    Select: { c: ['L3: Select switcher'], e: { size: Object.keys(SIZE), icon: ['swap', 'chevron'] } },
    Stepper: { c: ['L3: Stepper'], e: { size: ['sm', 'lg'] } },
    Switch: { c: ['L3→ Toggle switch'], e: { size: ['md', 'sm'] } }, Checkbox: { c: ['L3: Radio button & check box'] }, Radio: { c: ['L3: Radio button & check box'] },
    Aerobar: { b: 1, c: ['L3: aerobar - toast'], e: { type: Object.keys(AERO), emphasis: ['primary', 'secondary'] } },
    EmptyState: { b: 1, c: ['L3 → Empty state'] },
    ProgressBar: { b: 1, c: ['L3: Progress bar'], e: { type: ['progress', 'range'], size: ['sm', 'md'], status: ['default', 'success', 'warning', 'error'] } },
    Skeleton: { c: ['L3: Skeleton'], e: { shape: ['line', 'circle', 'box'] } }, SkeletonListRow: { b: 1, c: ['L3: Skeleton pattern'] }, SkeletonCard: { b: 1, c: ['L3: Skeleton pattern'] },
    Chart: { b: 1, c: ['L3: Chart', 'L3: Tabs group'], e: { type: ['candle', 'line', 'area'], trend: ['up', 'down'] } }, Sparkline: { c: ['L3: Sparkline'], e: { trend: ['up', 'down'] } },
    BottomNavbar: { b: 1, c: ['L3: Bottom Navbar'], e: { value: Object.keys(NAV) } },
    BottomSheet: { c: ['L3: Overlay', 'L3: Bottom sheet', 'L3: Button'], e: { size: ['sm', 'lg'] } }, BottomSheetHeader: {},
    BrandLogo: { c: ['L3 → Brand logo'], e: { brand: ['lemonn', 'zing', 'coinswitch'], variant: ['full', 'icon'] } },
    Keyboard: { b: 1, c: ['L3: System keyboard'] }, SystemStatusbar: { b: 1, c: ['L3: System statusbar'] },
    DatePicker: { c: ['L3: Date picker'], e: { mode: ['single', 'range'] } },
  }

  // ---- 3. Lint: the rules a spec must follow (auto-fixes where the fix is certain) ------------------------------------
  const dist = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length] }
  const near = (x, list) => list.map((k) => [k, dist(x.toLowerCase(), k.toLowerCase())]).sort((a, b) => a[1] - b[1]).filter(([, d]) => d <= 3).slice(0, 2).map(([k]) => k)
  const btnText = (b) => b.p.children || b.p.label || textOf(b.c)
  function lintScreen(sc) {
    const where = `"${sc.p.name || '?'}"`
    const E = (m) => R.errors.push(`${where}: ${m}`), W = (m) => warn(`${where}: ${m}`)
    walk(sc, (n) => {
      const def = EL[n.t]
      if (!def) { E(`<${n.t}> isn't an L3 element${near(n.t, Object.keys(EL)).length ? ' — did you mean ' + near(n.t, Object.keys(EL)).join(' / ') + '?' : ''} (missing pieces: say so, don't fake them)`); return }
      for (const [k, allowed] of Object.entries(def.e || {})) { const v = n.p[k]; if (v !== undefined && typeof v === 'string' && !allowed.includes(v)) E(`<${n.t} ${k}="${v}"> — use ${allowed.join(' | ')}`) }
      if (n.t === 'Tag' && TAG_OLD[n.p.color]) E(`Tag color "${n.p.color}" is deprecated — use ${TAG_OLD[n.p.color]}`)
      if (n.t === 'Button' && !btnText(n) && !n.p.icon && !n.p.iconLeft) E('<Button> needs a label (children) or an icon')
      if (n.t === 'Button' && !btnText(n) && !n.p.label) W(`icon-only <Button icon="${n.p.icon || n.p.iconLeft}"> needs label="…" (its accessible name)`)
      if (n.t === 'ListCell') { const l = String(n.p.label || ''); const max = n.p.size === 'sm' ? 40 : 32; if (!l) E('<ListCell> needs label'); else if (l.length > max) W(`ListCell label "${l.slice(0, 24)}…" is ${l.length} chars — labels are one line (~${max}); move the rest to description`) }
      if (n.t === 'SectionHeader' && !n.p.title) E('<SectionHeader> needs title')
      if (n.t === 'TextField' && !n.p.label) E('<TextField> needs label')
      if (n.t === 'Card' && (n.p.clickable || n.p.variant === 'clickable')) { let inner = 0; for (const k of n.c) walk(k, (x) => { if (x.t === 'Button') inner++ }); if (inner) W('a clickable Card has buttons in its content — the whole card is the tap target; put quick actions in footer={…}') }
      if (n.t === 'Text' && /^Heading\/(1[6-9]|2\d)/.test(n.p.style || '') && n.d === 1) W(`big heading "${textOf(n.c).slice(0, 20)}" in the body — section titles are <Section title> / <SectionHeader>`)
      for (const s of [].concat(n.c).filter((x) => typeof x === 'string')) {
        if (/\b(Rs\.?|INR)\s?\d/.test(s)) W(`"${s.slice(0, 24)}" — write money as ₹1,23,456.00`)
        if (/₹\s?\d{1,3}(,\d{3}){2,}/.test(s)) W(`"${s.slice(0, 24)}" uses Western grouping — Indian: ₹12,34,567`)
        if (/₹\s?\d{5,}(?![\d,])/.test(s)) W(`"${s.slice(0, 24)}" — group digits: ₹12,345`)
      }
    })
    const kids = sc.c.filter(isEl)
    const docks = kids.filter((k) => k.t === 'ButtonGroup'), navs = kids.filter((k) => k.t === 'BottomNavbar'), sheets = kids.filter((k) => k.t === 'BottomSheet')
    if (docks.length > 1) E('one ButtonGroup (dock) per screen')
    if (docks.length && navs.length) E('a screen has a dock OR a bottom navbar, not both')
    if (sheets.length > 2) E('at most 2 stacked sheets')
    // layers: the screen and each sheet are judged on their own (a sheet's primary sits above the scrim)
    const layers = [kids.filter((k) => k.t !== 'BottomSheet'), ...sheets.map((s) => [s])]
    layers.forEach((layer, li) => {
      const btns = []
      for (const k of layer) walk(k, (x) => { if (x.t === 'Button') btns.push(x) })
      const prim = btns.filter((b) => (b.p.variant || 'primary') === 'primary' && !b.p.icon)
      if (prim.length > 1) E(`${prim.length} primary buttons ${li ? 'in the sheet' : 'on the screen'} (${prim.map(btnText).join(', ')}) — one primary; the rest secondary/tertiary`)
    })
    const ab = kids.find((k) => k.t === 'Actionbar')
    if (ab) { const acts = [].concat(ab.p.actions || []).concat(ab.c.filter((k) => k.t === 'ActionbarAction')); if (acts.length > 2) E(`Actionbar has ${acts.length} actions — at most 2`) }
    // auto-fix: flat tabs at the top of the body belong in the Actionbar's bottom slot
    const firstBody = kids.find((k) => !['Actionbar', 'SystemStatusbar'].includes(k.t))
    if (ab && firstBody && firstBody.t === 'Tabs' && (firstBody.p.appearance || 'pill') === 'underline' && !ab.p.bottom) { ab.p.bottom = firstBody; sc.c.splice(sc.c.indexOf(firstBody), 1); fix(`${where}: underline Tabs moved into the Actionbar's bottom slot`) }
    // docks: buttons are lg, one strong button, strong on the right (horizontal) / on top (vertical)
    const dockLike = [...docks, ...sheets.map((s) => (isEl(s.p.footer) && s.p.footer.t === 'ButtonGroup' ? s.p.footer : null)).filter(Boolean)]
    for (const d of dockLike) {
      const bs = d.c.filter((x) => x.t === 'Button')
      if (!bs.length) { E('ButtonGroup without Buttons'); continue }
      for (const b of bs) if (b.p.size && b.p.size !== 'lg') { b.p.size = 'lg'; fix(`${where}: dock button "${btnText(b)}" → lg`) }
      const strong = bs.filter((b) => STRONG.includes(b.p.variant || 'primary'))
      if (!strong.length) E('a ButtonGroup needs one strong button (primary / buy / sell / brand)')
      for (const b of bs) if (b.p.variant === 'secondary' && !strong.length) W(`secondary "${btnText(b)}" without a stronger button next to it`)
      const horiz = d.p.direction === 'horizontal'
      const want = horiz ? [...bs.filter((b) => !strong.includes(b)), ...strong] : [...strong, ...bs.filter((b) => !strong.includes(b))]
      if (strong.length === 1 && want.some((b, k) => b !== bs[k])) { const others = d.c.filter((x) => x.t !== 'Button'); d.c.splice(0, d.c.length, ...others, ...want); fix(`${where}: dock order — strong button ${horiz ? 'on the right' : 'on top'}`) }
    }
    // standalone secondary buttons
    for (const k of kids) walk(k, (x) => { if (x.t === 'Row') { const bs = x.c.filter((y) => y.t === 'Button'); if (bs.some((b) => b.p.variant === 'secondary') && !bs.some((b) => STRONG.includes(b.p.variant || 'primary'))) W('secondary button without a stronger button beside it — standalone actions are tertiary') } })
  }
  function lint(src) {
    const els = typeof src === 'string' ? parse(src) : src
    const screens = []
    for (const e of els) { if (e.t === 'Flow') screens.push(...e.c.filter((x) => x.t === 'Screen')); else if (e.t === 'Screen') screens.push(e); else R.errors.push(`top level: <${e.t}> — put content in <Screen> (or <Flow><Screen/>…)`) }
    // depth marks (for the "heading in the body" rule): direct children of a screen are depth 1
    for (const sc of screens) { sc.c.filter(isEl).forEach((k) => { k.d = 1 }); lintScreen(sc) }
    const names = screens.map((s) => s.p.name)
    names.forEach((n, k) => { if (!n) R.errors.push(`screen #${k + 1} has no name`); else if (names.indexOf(n) !== k) R.errors.push(`two screens named "${n}"`) })
    return { screens, errors: R.errors, warnings: R.warnings, fixes: R.fixes }
  }


  // ---- 4. Plan: the compact tree the runtime executes + what it needs (elements, components, icons, text styles) -------
  // plan node: [type, props, children]; element-valued props become { $: node }; colour aliases become tokens
  const CA = { primary: 'content/primary', secondary: 'content/secondary', tertiary: 'content/tertiary', disabled: 'content/disabled', inverted: 'content/inverted', up: 'content/accent/indicator/up-default', profit: 'content/accent/indicator/up-default', down: 'content/accent/indicator/down-default', loss: 'content/accent/indicator/down-default', success: 'content/accent/success-default', error: 'content/accent/error-default', warning: 'content/accent/warning-default', discover: 'content/accent/discover-default', brand: 'content/accent/brand-default', zing: 'content/accent/zing-default' }
  const P = (n) => (typeof n === 'string' ? n : [n.t, compactProps(n.p), ...(n.c.length ? [n.c.map(P)] : [])])
  const pv = (k, v) => (isEl(v) ? { $: P(v) } : Array.isArray(v) ? v.map((x) => (isEl(x) ? { $: P(x) } : x)) : (k === 'color' || k === 'iconColor') && CA[v] ? CA[v] : v)
  function compactProps(p) { const o = {}; for (const [k, v] of Object.entries(p)) o[k] = pv(k, v); return Object.keys(o).length ? o : 0 }
  // Consecutive ListCells become one List (rows touch, density decided once): asset rows (a PriceChange or Sparkline
  // trailing) are Breathable, settings / menus / options stay Compact (ListCell USAGE).
  function group(n) {
    if (!isEl(n)) return n
    for (const v of Object.values(n.p)) { if (isEl(v)) group(v); else if (Array.isArray(v)) v.forEach(group) }
    const out = []
    for (const k of n.c) {
      group(k)
      const last = out[out.length - 1]
      if (n.t !== 'List' && isEl(k) && k.t === 'ListCell') {
        if (isEl(last) && last.auto && (last.p.variant === 'card') === (k.p.variant === 'card')) last.c.push(k)
        else out.push({ t: 'List', p: k.p.variant === 'card' ? { variant: 'card' } : {}, c: [k], auto: true })
      } else out.push(k)
    }
    n.c = out
    if (n.t === 'List' && !n.p.density && n.p.variant !== 'card' && n.c.some((r) => isEl(r) && [].concat(r.p.trailing ?? []).some((t) => isEl(t) && (t.t === 'PriceChange' || t.t === 'Sparkline')))) { n.p.density = 'breathable'; fix(`list "${n.c[0].p.label}…": Density → Breathable (asset rows)`) }
    return n
  }
  function plan(src, opts = {}) {
    const els = parse(src)
    const { screens } = lint(els)
    screens.forEach(group)
    const flow = els.find((e) => e.t === 'Flow')
    const only = opts.only ? new Set(opts.only) : null
    const chosen = screens.filter((s) => !only || only.has(s.p.name))
    // a screen built on a base needs the base in the same call unless the base already exists in Figma
    const used = { el: new Set(['Screen']), comp: new Set(['L3: Button']), icons: new Set(), styles: new Set(['Label/14', 'Description/14', 'Label/12', 'Description/12', 'Heading/18']) }
    for (const s of chosen) walk(s, (n) => {
      used.el.add(n.t)
      for (const c of (EL[n.t] || {}).c || []) used.comp.add(c)
      for (const k of ['icon', 'iconLeft', 'iconRight']) if (typeof n.p[k] === 'string') used.icons.add(n.p[k])
      if (n.t === 'Icon') used.icons.add(n.p.name)
      if (n.t === 'Select' && n.p.icon === 'chevron') used.icons.add('expand_more')
      if (n.t === 'ListCell' && (n.p.iconRight || n.p.trailing === 'chevron')) used.icons.add('chevron_right')
      if (n.t === 'ListCell') for (const t of [].concat(n.p.trailing ?? [])) { const k = typeof t === 'string' && t.split(':')[0]; if (k === 'switch') used.comp.add('L3→ Toggle switch'); if (k === 'radio' || k === 'check') used.comp.add('L3: Radio button & check box') }
      if (n.t === 'Text' && n.p.style) used.styles.add(n.p.style)
      if (n.t === 'KeyValue' || n.t === 'Stats') { used.styles.add(n.p.labelStyle || 'Description/12'); if (n.p.valueStyle) used.styles.add(n.p.valueStyle) }
      if (n.t === 'Actionbar') for (const a of [].concat(n.p.actions || [])) used.icons.add(typeof a === 'string' ? a : a.icon)
      if (n.t === 'BottomSheet' && typeof n.p.icon === 'string') used.icons.add(n.p.icon)
      if (n.t === 'Tabs') for (const it of [].concat(n.p.items || [])) if (it && it.icon) used.icons.add(it.icon)
      if ((n.t === 'List' || n.t === 'ListCell') && n.p.density) used.el.add('density')
      if (n.t === 'Screen' && n.p.theme) used.el.add('theme')
    })
    if (flow && flow.p.theme) used.el.add('theme')
    return { flow: flow ? flow.p : {}, screens: chosen.map((s) => P(s)), names: chosen.map((s) => s.p.name), used, errors: R.errors, warnings: R.warnings, fixes: R.fixes }
  }

  // ---- 5. Plan → JSX (to turn a screen stored in Figma back into an editable file) ----------------------------------------
  const q = (v) => (typeof v === 'string' ? (v.includes('"') ? `{${JSON.stringify(v)}}` : `"${v}"`) : `{${JSON.stringify(v, (k, x) => x)}}`)
  function toJsx(n, ind = '') {
    if (typeof n === 'string') return ind + n
    const [t, p, c] = n
    const val = (v) => (v && v.$ ? toJsx(v.$).trim() : JSON.stringify(v, (k, x) => (x && x.$ ? '<' + x.$[0] + '…/>' : x)))
    const props = Object.entries(p || {}).map(([k, v]) => (v === true ? k : typeof v === 'string' ? `${k}=${q(v)}` : `${k}={${val(v)}}`)).join(' ')
    const open = `<${t}${props ? ' ' + props : ''}`
    if (!c || !c.length) return `${ind}${open} />`
    if (c.length === 1 && typeof c[0] === 'string') return `${ind}${open}>${c[0]}</${t}>`
    return `${ind}${open}>\n${c.map((k) => toJsx(k, ind + '  ')).join('\n')}\n${ind}</${t}>`
  }

  return { parse, lint, plan, toJsx, EL }
}
