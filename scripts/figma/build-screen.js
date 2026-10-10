// L3 build-screen — builds a screen spec (the same JSON `npm run screen` turns into React) as real L3 instances.
// CONFIG: { spec: {…}, parentId: '<page or section id>', x: 0, y: 0, state: 'default' | 'loading' | 'empty',
//           sandbox: false }   sandbox = build, screenshot, delete (try a spec without leaving anything behind)
// Every block is built on its own: a block that fails becomes a visible "⚠ <type>: <reason>" note and is reported,
// so a screen always comes out. Unpublished components fall back to plain tokens + text styles (also reported).

const spec = CONFIG.spec
if (!spec || !spec.blocks) throw new Error('CONFIG.spec is missing — pass a screen spec (docs/patterns/archetypes.json)')
const parent = await figma.getNodeByIdAsync(CONFIG.parentId)
if (!parent) throw new Error('CONFIG.parentId not found')
let page = parent; while (page.type !== 'PAGE') page = page.parent
await figma.setCurrentPageAsync(page)
const report = { built: [], fallbacks: [], failed: [] }

// ---- helpers -------------------------------------------------------------------------------------------------
// The Figma plugin runtime has NO Intl — Indian grouping by hand (dogfood: 'Intl is not defined').
const groupIN = (n, d = 2) => { const [i, f] = Math.abs(n).toFixed(d).split('.'); const last3 = i.slice(-3), rest = i.slice(0, -3); return (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + last3 + (f ? '.' + f : '') }
const inr = (n, d = 2) => `${n < 0 ? '−' : ''}₹${groupIN(n, d)}`
const pctS = (n) => `${Math.abs(n).toFixed(2)}%`
async function txt(chars, style, tok, name) {
  const s = await l3TextStyle(style)
  const t = figma.createText()
  t.name = name || chars.slice(0, 24)
  if (s) await t.setTextStyleIdAsync(s.id); else { await figma.loadFontAsync({ family: 'Manrope', style: 'SemiBold' }); t.fontName = { family: 'Manrope', style: 'SemiBold' } }
  t.characters = String(chars)
  const v = await color(tok || 'content/primary')
  if (v) t.fills = [boundPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, v, t)]
  return t
}
// Gaps are set at once and bound to spacing tokens in one awaited batch at the end (no un-awaited promises).
const pendingGaps = []
function frame(name, dir, gap) { const f = figma.createAutoLayout(dir || 'VERTICAL'); f.name = name; f.fills = []; if (gap !== undefined) { f.itemSpacing = gap; pendingGaps.push(f) } return f }
async function fillWith(node, tok) { const v = await color(tok); if (v) node.fills = [boundPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, v, node)] }
async function inst(name, variant) { return pickVariant(await l3Import(name), variant || {}).createInstance() }
async function tryInst(name, variant) { try { return await inst(name, variant) } catch (e) { report.fallbacks.push(`${name}: ${e.message.split('\n')[0].slice(0, 80)}`); return null } }
const fill = (n) => { try { n.layoutSizingHorizontal = 'FILL' } catch (e) {} }
// Tabs: the tab instances are the slot's children, whatever they're called ('Tab 1' in Flat, other names in Pill group —
// dogfood: names missed and the 3-tab Pill group showed 'Label Label Label'). Clone the last tab when more are needed.
async function fillTabs(tg, items) {
  const slot = tg.findOne((n) => n.type === 'SLOT')
  if (!slot) return
  let tabs = slot.children.filter((n) => n.type === 'INSTANCE')
  while (tabs.length < items.length && tabs.length) { const c = tabs[tabs.length - 1].clone(); slot.appendChild(c); tabs = slot.children.filter((n) => n.type === 'INSTANCE') }
  await loadAll(tg)
  tabs.forEach((t, k) => { if (k >= items.length) t.remove(); else { const lk = propKey(t, '✏️ label'); t.setProperties({ ...(lk ? { [lk]: items[k] } : {}), isSelected: k === 0 ? 'True' : 'False' }) } })
}
const setText = (root, name, value) => { const t = root.findOne((n) => n.type === 'TEXT' && n.name === name); if (t) { t.characters = String(value); return true } return false }
async function loadAll(root) { await loadFonts(root.findAll((n) => n.type === 'TEXT')) }
async function priceChange(value, size, opts) { // L3: Price change, or tokens + text if it isn't published yet
  const dir = value > 0 ? 'Up' : value < 0 ? 'Down' : 'Flat'
  const label = (opts && opts.unit === 'currency' ? inr(Math.abs(value)) : opts && opts.unit === 'number' ? groupIN(value) : pctS(value)) + (opts && opts.percent !== undefined ? ` (${pctS(opts.percent)})` : '')
  const i = await tryInst('L3: Price change', { Direction: dir, Size: size || 'Small' })
  if (i) { i.setProperties({ [propKey(i, '✏️ Value')]: label, [propKey(i, '👁️ Arrow')]: Boolean(opts && opts.arrow) }); return i }
  const style = { Small: 'Label/12', Medium: 'Label/14', Large: 'Label/16' }[size || 'Small']
  return txt(`${dir === 'Up' ? '+' : dir === 'Down' ? '−' : ''}${label}`, style, dir === 'Up' ? 'content/accent/indicator/up-default' : dir === 'Down' ? 'content/accent/indicator/down-default' : 'content/secondary', 'Price change')
}
const instruments = (ref) => { // same deterministic data as scripts/screen/data.ts (kept tiny here)
  const BASE = [['NIFTY 50', 'Nifty 50 index', 25312.4], ['SENSEX', 'BSE Sensex', 82890.95], ['BANKNIFTY', 'Nifty Bank', 55420.1], ['RELIANCE', 'Reliance Industries', 2938.55], ['HDFCBANK', 'HDFC Bank', 1712.3], ['TCS', 'Tata Consultancy Services', 4120.75], ['INFY', 'Infosys', 1856.2], ['ICICIBANK', 'ICICI Bank', 1288.45], ['GOLD MINI', 'Gold Mini · 5 Dec Fut', 157500], ['SILVER', 'Silver · 5 Dec Fut', 188420], ['CRUDEOIL', 'Crude Oil · 19 Nov Fut', 6012], ['ITC', 'ITC', 468.9]]
  const [, kind, n] = (ref || 'data:watchlist:5').split(':'); const count = Number(n) || 5
  const [off, seed0] = kind === 'indices' ? [0, 5] : kind === 'commodities' ? [8, 9] : kind === 'holdings' ? [3, 21] : [3, 11]
  let seed = seed0; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: count }, (_, i) => { const [symbol, name, price] = BASE[(off + i) % BASE.length]; const change = Number(((r() - 0.42) * 4).toFixed(2)); const qty = Math.round(1 + r() * 40) * 5; const avg = Number((price * (1 - change / 100 - (r() - 0.5) * 0.04)).toFixed(2)); return { symbol, name, price, change, qty, avg, pnl: Number(((price - avg) * qty).toFixed(2)) } })
}

// ---- preload everything this spec needs, in parallel (dogfood: sequential imports made one build take 66 s) -----------------
const NEEDS = { header: ['L3: Actionbar', 'L3: Tabs group', 'L3: Select switcher', 'L3: Price change', 'L3: Bottom sheet header'], summary: ['L3: Select switcher', 'L3: Price change'], price: ['L3: Price change'], tabs: ['L3: Tabs group'], chart: ['L3: Chart', 'L3: Tabs group'], progress: ['L3: Progress bar'], banner: ['L3: aerobar - toast'], quantity: ['L3: Select switcher', 'L3: Stepper'], field: ['L3: input field & text Box'], stats: ['L3: Card'], filters: ['L3: Select switcher'], empty: ['L3 → Empty state'], rows: ['L3: list cell', 'L3→ Toggle switch'], list: ['L3: list cell', 'L3: Sparkline', 'L3: Tags', 'L3: Price change', 'L3: Skeleton pattern', 'L3 → Empty state'], dock: ['L3: Button Dock', 'L3: Button'], nav: ['L3: Bottom Navbar'] }
const wantComps = new Set([...NEEDS.header, ...spec.blocks.flatMap((b) => NEEDS[b.type] || []), ...(spec.dock ? NEEDS.dock : []), ...(spec.nav ? NEEDS.nav : [])])
await Promise.all([
  ...[...wantComps].map((n) => l3Import(n).catch(() => null)),
  ...['Heading/16', 'Heading/18', 'Heading/24', 'Label/12', 'Label/14', 'Label/16', 'Description/12'].map(l3TextStyle),
  ...['surface/default', 'surface/secondary', 'content/primary', 'content/secondary', 'content/accent/indicator/up-default', 'content/accent/indicator/down-default', 'content/accent/error-default'].map(color),
  ...[0, 2, 4, 12, 16, 24].map(spacingVar),
])
const tPreload = Date.now() - T0

// ---- screen frame ------------------------------------------------------------------------------------------------------
const screen = frame(spec.name || 'Screen', 'VERTICAL', 0)
screen.name = `Screen / ${spec.name}${CONFIG.state && CONFIG.state !== 'default' ? ` — ${CONFIG.state}` : ''}`
await fillWith(screen, 'surface/default')
screen.resize(360, 800); screen.primaryAxisSizingMode = 'AUTO'; screen.counterAxisSizingMode = 'FIXED'; screen.clipsContent = true
if (parent.type === 'PAGE' || parent.type === 'SECTION') parent.appendChild(screen); else page.appendChild(screen)
screen.x = CONFIG.x ?? (parent.type === 'PAGE' ? Math.max(0, ...page.children.filter((n) => n !== screen).map((n) => n.x + n.width)) + 200 : 40)
screen.y = CONFIG.y ?? 40

// ---- header ---------------------------------------------------------------------------------------------------------------
const h = spec.header || {}
try {
  if (h.sheet) {
    const hd = await inst('L3: Bottom sheet header', { isSmall: 'False', Version: 'Latest' })
    screen.appendChild(hd); fill(hd); await loadAll(hd)
    hd.setProperties({ [propKey(hd, '✏️ Heading')]: h.title || spec.name, [propKey(hd, '👁️ Description')]: false })
  } else {
    const ab = await inst('L3: Actionbar', { Version: 'Latest' })
    screen.appendChild(ab); fill(ab); await loadAll(ab)
    ab.setProperties({ [propKey(ab, '👁️ Action - left')]: Boolean(h.back), [propKey(ab, '👁️ → content right')]: Boolean(h.actions && h.actions.length) })
    // Icon actions: Tertiary Small, boxed — the first choice; Ghost only when the spec asks (DESIGN_SYSTEM §6).
    for (const btn of ab.findAll((n) => n.type === 'INSTANCE' && n.variantProperties && ['Type', 'State', 'Size'].every((k) => k in n.variantProperties))) {
      btn.setProperties({ Type: h.actionStyle === 'ghost' ? 'Ghost' : '⬜︎ Tertiary' })
    }
    const content = ab.findOne((n) => n.type === 'INSTANCE' && n.name === 'Content')
    if (content) {
      await loadAll(content)
      if (h.select) { // asset switcher as the title
        const slot = content.findOne((n) => n.type === 'SLOT' && /Heading/.test(n.name))
        const sel = await tryInst('L3: Select switcher', { Size: 'Large', isSubtle: 'False' })
        if (slot && sel) { for (const c of [...slot.children]) c.remove(); slot.appendChild(sel); await loadAll(sel); sel.setProperties({ [propKey(sel, '✏️ Label')]: h.select }) }
      } else {
        setText(content, 'Heading', h.title || spec.name)
        // An L1 screen (no back / ✕) shows its title in Heading/18, named like the designers' "L1 page heading".
        const t = !h.back && content.findOne((n) => n.type === 'TEXT' && n.name === 'Heading')
        if (t) { await t.setTextStyleIdAsync((await l3TextStyle('Heading/18')).id); t.name = 'L1 page heading' }
      }
      const descSlot = content.findOne((n) => n.type === 'SLOT' && /Description/.test(n.name))
      if (h.change !== undefined && descSlot) { content.setProperties({ [propKey(content, '👁️ Description')]: true }); for (const c of [...descSlot.children]) c.remove(); descSlot.appendChild(await priceChange(h.change, 'Small')) }
      else if (h.description) { content.setProperties({ [propKey(content, '👁️ Description')]: true }); setText(content, 'Description', h.description) }
      else content.setProperties({ [propKey(content, '👁️ Description')]: false })
    }
    if (h.tabs && h.tabs.length) {
      ab.setProperties({ [propKey(ab, '👁️ ↓ content bottom')]: true })
      const bottom = ab.findOne((n) => n.type === 'SLOT' && /Content bottom/.test(n.name))
      const tg = await inst('L3: Tabs group', { Type: 'Flat tabs' })
      for (const c of [...bottom.children]) c.remove()
      bottom.appendChild(tg); fill(tg); await loadAll(tg)
      await fillTabs(tg, h.tabs)
    }
  }
  report.built.push('header')
} catch (e) { report.failed.push('header: ' + e.message.split('\n')[0].slice(0, 100)) }

// ---- body ---------------------------------------------------------------------------------------------------------------------
const body = frame('body', 'VERTICAL', 24)
await setSpacing(body, 'paddingTop', 16); await setSpacing(body, 'paddingBottom', 24)
screen.appendChild(body); fill(body)
const section = async (title, bleed) => {
  const s = frame('section', 'VERTICAL', 16) // section heading → card: 16 (DESIGN_SYSTEM.md 2.3)
  if (!bleed) { await setSpacing(s, 'paddingLeft', 16); await setSpacing(s, 'paddingRight', 16) }
  body.appendChild(s); fill(s)
  if (title) s.appendChild(await txt(title, 'Heading/16', 'content/primary', 'title'))
  return s
}
const row = (gap) => { const r = frame('row', 'HORIZONTAL', gap ?? 12); r.counterAxisAlignItems = 'CENTER'; return r }

const BUILD = {
  async summary(b, s) {
    const hero = frame('hero', 'VERTICAL', 4)
    s.appendChild(hero)
    if (b.select) { const sel = await tryInst('L3: Select switcher', { Size: 'Small', isSubtle: 'True' }); if (sel) { hero.appendChild(sel); await loadAll(sel); sel.setProperties({ [propKey(sel, '✏️ Label')]: b.label }) } }
    else hero.appendChild(await txt(b.label, 'Description/12', 'content/secondary'))
    hero.appendChild(await txt(inr(b.value), 'Heading/24', 'content/primary', 'value'))
    if (b.change !== undefined) hero.appendChild(await priceChange(b.change, 'Large', { arrow: true }))
  },
  async price(b, s) {
    const hero = frame('hero', 'VERTICAL', 4); s.appendChild(hero)
    hero.appendChild(await txt(inr(b.value), 'Heading/24', 'content/primary', 'value'))
    hero.appendChild(await priceChange(b.changeAbs ?? b.change, 'Medium', b.changeAbs !== undefined ? { unit: 'number', percent: b.change, arrow: true } : { arrow: true }))
    if (b.note) hero.appendChild(await txt(b.note, 'Description/12', 'content/secondary'))
  },
  async tabs(b, s) {
    const type = b.appearance === 'pill-group' ? 'Pill group' : b.appearance === 'underline' ? 'Flat tabs' : 'Pill tabs'
    const tg = await inst('L3: Tabs group', { Type: type }); s.appendChild(tg); await loadAll(tg)
    if (type === 'Pill group') fill(tg)
    // Pill tabs carry a 16 side inset in their wrapper for edge-to-edge use. Inside a section that already has the 16
    // page padding, drop it — otherwise the first pill sits at 32 (dogfood: F&O "Your Positions").
    if (type === 'Pill tabs' && (s.paddingLeft || 0) >= 16) { const w = tg.findOne((x) => x.type === 'SLOT'); if (w) { w.paddingLeft = 0; w.paddingRight = 0 } }
    await fillTabs(tg, b.items)
  },
  async chart(b, s) {
    const c = await inst('L3: Chart', { Type: { candle: 'Candle', line: 'Line', area: 'Area' }[b.kind || 'candle'], Trend: b.trend === 'down' ? 'Down' : 'Up' })
    s.appendChild(c); await loadAll(c)
    if (b.ranges) await BUILD.tabs({ appearance: 'pill-group', items: b.ranges }, s)
  },
  async progress(b, s) {
    const r = row(12); r.primaryAxisAlignItems = 'SPACE_BETWEEN'; s.appendChild(r); fill(r)
    r.appendChild(await txt(b.kind === 'range' && b.low !== undefined ? `Low ${inr(b.low)}` : b.label, 'Description/12', 'content/secondary'))
    r.appendChild(await txt(b.kind === 'range' && b.high !== undefined ? `${inr(b.high)} High` : (b.valueText || `${b.value}%`), 'Label/14', 'content/primary'))
    const p = await inst('L3: Progress bar', { Type: b.kind === 'range' ? 'Range' : 'Progress', Size: 'Small', Status: { success: 'Success', warning: 'Warning', error: 'Error' }[b.status] || 'Default' })
    s.appendChild(p); fill(p)
    const nested = p.findOne((n) => n.type === 'INSTANCE' && /Progress fill|Range marker/.test(n.name))
    if (nested) nested.setProperties({ Value: String(Math.max(0, Math.min(100, Math.round(b.value / 10) * 10))) })
  },
  async banner(b, s) {
    const a = await inst('L3: aerobar - toast', { isPrimary: 'False', Type: { discover: 'Discover', warning: 'Warning', danger: 'Danger', success: 'Success', primary: 'Primary' }[b.kind] || 'Discover', isFloating: 'False' })
    s.appendChild(a); fill(a); await loadAll(a)
    a.setProperties({ [propKey(a, 'Headline text')]: b.heading, [propKey(a, '👁️ Paragraph')]: Boolean(b.text), ...(b.text ? { [propKey(a, 'Paragraph text')]: b.text } : {}), [propKey(a, '👁️ Action-r')]: false })
  },
  async quantity(b, s) {
    const r = row(12); r.primaryAxisAlignItems = 'SPACE_BETWEEN'; s.appendChild(r); fill(r)
    const left = row(4); r.appendChild(left)
    const sel = await tryInst('L3: Select switcher', { Size: 'Small', isSubtle: 'False' })
    if (sel) { left.appendChild(sel); await loadAll(sel); sel.setProperties({ [propKey(sel, '✏️ Label')]: b.label }) } else left.appendChild(await txt(b.label, 'Label/12'))
    if (b.hint) left.appendChild(await txt(`(${b.hint})`, 'Description/12', 'content/secondary'))
    const st = await inst('L3: Stepper', { Size: 'Small' }); r.appendChild(st); await loadAll(st)
    st.setProperties({ [propKey(st, '✏️ Value')]: groupIN(b.value, 0) })
    if (b.min !== undefined && b.value <= b.min) { const d = st.findOne((n) => n.name === 'Decrease'); if (d) d.setProperties({ State: 'Disabled' }) }
  },
  async field(b, s) {
    const f = await inst('L3: input field & text Box', { State: b.status === 'error' ? 'Error' : b.disabled ? 'Disabled' : b.value ? 'Typed' : 'Default', isInputBox: 'False' })
    s.appendChild(f); fill(f); await loadAll(f)
    const props = { [propKey(f, '✏️ Label')]: b.label, [propKey(f, 'Description')]: Boolean(b.helper), [propKey(f, 'Icon - L')]: false, [propKey(f, 'Icon - R')]: false }
    if (b.helper) props[propKey(f, '✏️ Helper text')] = b.helper
    if (b.value) props[propKey(f, '✏️ Input text')] = b.value
    if (b.placeholder) props[propKey(f, '✏️ Placeholder text')] = b.placeholder
    f.setProperties(props)
  },
  async stats(b, s) {
    // Card Type=Filled; until the library publishes it, Static restyled to the same look (reported as a fallback).
    let card = await tryInst('L3: Card', { Type: 'Filled', isPadded: 'True' })
    if (!card) { card = await inst('L3: Card', { Type: 'Static', isPadded: 'True' }); await fillWith(card, 'surface/secondary'); card.strokes = [] }
    s.appendChild(card); fill(card)
    const slot = card.findOne((n) => n.type === 'SLOT'); for (const c of [...slot.children]) c.remove()
    await setSpacing(slot, 'itemSpacing', 12)
    for (let k = 0; k < b.items.length; k += 2) {
      const r = row(16); r.counterAxisAlignItems = 'MIN'; slot.appendChild(r); fill(r)
      for (const [label, value] of b.items.slice(k, k + 2)) {
        const cell = frame('stat', 'VERTICAL', 2); r.appendChild(cell); cell.layoutGrow = 1
        cell.appendChild(await txt(label, 'Description/12', 'content/secondary', 'label'))
        cell.appendChild(await txt(value, 'Label/14', 'content/primary', 'value'))
      }
    }
  },
  async filters(b, s) {
    const r = row(16); s.appendChild(r)
    for (const f of b.items) {
      const sel = await tryInst('L3: Select switcher', { Size: 'Medium', isSubtle: 'True' })
      if (!sel) { r.appendChild(await txt(f.label, 'Label/14', 'content/secondary')); continue }
      r.appendChild(sel); await loadAll(sel)
      const props = { [propKey(sel, '✏️ Label')]: f.label }
      if (f.icon !== 'swap') { const chev = await figma.importComponentByKeyAsync(DATA.icons.expandMore); props[propKey(sel, '↪ Icon')] = chev.id }
      sel.setProperties(props)
    }
  },
  async empty(b, s) {
    const e = await inst('L3 → Empty state'); s.appendChild(e); fill(e); await loadAll(e)
    e.setProperties({ [propKey(e, '✏️ Heading')]: b.title, [propKey(e, '✏️ Description')]: b.description || '' })
    const cta = e.findOne((n) => n.name === 'Clear CTA'); if (cta) { if (b.action) { await loadAll(cta); const k = propKey(cta, '✏️ Label'); if (k) cta.setProperties({ [k]: b.action }) } else cta.visible = false }
  },
  async rows(b, s) {
    for (const r of b.items) {
      const c = await inst('L3: list cell', { isSelected: 'False', isSmall: 'False', isPlain: 'True' }); s.appendChild(c); fill(c); await loadAll(c)
      c.setProperties({ [propKey(c, '✏️ Label')]: r.label, [propKey(c, '👁️ Description')]: Boolean(r.description), ...(r.description ? { [propKey(c, '✏️ Description')]: r.description } : {}), [propKey(c, '👁️ Icon - L')]: false })
      const sr = c.findAll((n) => n.type === 'SLOT').find((x) => /icon-r/i.test(x.name))
      if (sr) {
        for (const k of [...sr.children]) k.remove()
        if (r.toggle !== undefined) { const t = await inst('L3→ Toggle switch', { '↔ On': r.toggle ? 'True' : 'False', '👆 State': 'Enabled', isSmall: 'False' }); sr.appendChild(t) }
        else if (r.value) sr.appendChild(await txt(r.value, 'Label/14', 'content/secondary'))
        else if (r.chevron) { const ch = await figma.importComponentByKeyAsync(DATA.icons.chevronRight); sr.appendChild(ch.createInstance()) }
        else c.setProperties({ [propKey(c, '👁️ Icon - R')]: false })
      }
    }
  },
  async list(b, s) {
    const state = CONFIG.state || 'default'
    if (state === 'loading') { for (let k = 0; k < 6; k++) { const sk = await inst('L3: Skeleton pattern', { Type: 'List row' }); s.appendChild(sk); fill(sk) } return }
    if (state === 'empty' && b.empty) return BUILD.empty({ type: 'empty', ...b.empty }, s)
    for (const i of instruments(b.data)) {
      const c = await inst('L3: list cell', { isSelected: 'False', isSmall: 'False', isPlain: b.card ? 'False' : 'True' }); s.appendChild(c); fill(c); await loadAll(c)
      // Asset rows are breathable: 16 above and below (74px rows) instead of the compact 8.
      await setSpacing(c, 'paddingTop', 16); await setSpacing(c, 'paddingBottom', 16)
      c.setProperties({ [propKey(c, '✏️ Label')]: i.symbol, [propKey(c, '✏️ Description')]: b.pnl ? `${i.qty} qty · avg ${inr(i.avg)}` : i.name, [propKey(c, '👁️ Icon - L')]: false })
      const sr = c.findAll((n) => n.type === 'SLOT').find((x) => /icon-r/i.test(x.name))
      if (!sr) continue
      for (const k of [...sr.children]) k.remove()
      sr.layoutMode = 'HORIZONTAL'; sr.counterAxisAlignItems = 'CENTER'; await setSpacing(sr, 'itemSpacing', 12)
      if (b.spark) { const sp = await tryInst('L3: Sparkline', { Trend: i.change >= 0 ? 'Up' : 'Down' }); if (sp) sr.appendChild(sp) }
      if (b.status) { const tag = await tryInst('L3: Tags', { Type: 'Secondary', Color: i.change >= 0 ? '✅ Success' : '🟠 Processing', Size: 'Small → 16' }); if (tag) { sr.appendChild(tag); await loadAll(tag); tag.setProperties({ [propKey(tag, '✏️ Label')]: i.change >= 0 ? 'Executed' : 'Open' }) } }
      const col = frame('price', 'VERTICAL', 2); col.counterAxisAlignItems = 'MAX'; sr.appendChild(col)
      if (b.pnl) { col.appendChild(await priceChange(i.pnl, 'Medium', { unit: 'currency' })); col.appendChild(await txt(inr(i.price), 'Description/12', 'content/secondary')) }
      else { col.appendChild(await txt(inr(i.price), 'Label/14', 'content/primary')); col.appendChild(await priceChange(i.change, 'Small')) }
    }
  },
}
report.blockMs = {}
for (const b of spec.blocks) {
  const t0 = Date.now()
  const s = await section(b.type === 'list' || b.type === 'rows' || b.type === 'stats' ? b.title : undefined, b.type === 'chart')
  try { await BUILD[b.type](b, s); report.built.push(b.type); report.blockMs[b.type] = (report.blockMs[b.type] || 0) + Date.now() - t0 }
  catch (e) { report.failed.push(`${b.type}: ${e.message.split('\n')[0].slice(0, 100)}`); s.appendChild(await txt(`⚠ ${b.type}: ${e.message.split('\n')[0].slice(0, 60)}`, 'Label/12', 'content/accent/error-default')) }
}

// ---- dock / nav ------------------------------------------------------------------------------------------------------------------
try {
  if (spec.dock) {
    const reason = spec.dock.buttons.find((b) => b.disabled && b.reason)
    if (reason) { const r = await txt(reason.reason, 'Description/12', 'content/secondary', 'reason'); r.textAlignHorizontal = 'CENTER'; screen.appendChild(r); fill(r) }
    const dock = await inst('L3: Button Dock', { Direction: spec.dock.direction === 'horizontal' ? '→ Horizontal' : '↓ Vertical' })
    screen.appendChild(dock); fill(dock)
    const slot = dock.findOne((n) => n.type === 'SLOT'); for (const c of [...slot.children]) c.remove()
    const TYPE = { primary: '◻️ Primary', secondary: '🔲 Secondary', tertiary: '⬜︎ Tertiary', ghost: 'Ghost', brand: '🟨 Brand', buy: '🟩 Buy', sell: '🟥 Sell' }
    for (const b of spec.dock.buttons) {
      const btn = await inst('L3: Button', { Type: TYPE[b.variant] || '◻️ Primary', State: b.disabled ? '🚫 Disabled' : 'Default', Size: 'Large' })
      slot.appendChild(btn); fill(btn); await loadAll(btn)
      btn.setProperties({ [propKey(btn, '✏️ Label')]: b.label, [propKey(btn, '👁️ Icon-L')]: false, [propKey(btn, '👁️ Icon-R')]: false })
    }
    report.built.push('dock')
  } else if (spec.nav) {
    const TAB = { main: 'Stocks', fno: spec.archetype === 'portfolio' ? 'F&O - Positions' : 'F&O', mf: 'MF' }
    const nav = await inst('L3: Bottom Navbar', { Tab: TAB[spec.nav] || 'Stocks' }); screen.appendChild(nav); fill(nav)
    report.built.push('nav')
  }
} catch (e) { report.failed.push('dock/nav: ' + e.message.split('\n')[0].slice(0, 100)) }

await Promise.all(pendingGaps.map((f) => setSpacing(f, 'itemSpacing', f.itemSpacing)))
// Pin dock / nav to the bottom of an 800-tall phone when the content is shorter.
if (screen.height < 800) { body.layoutGrow = 1; screen.primaryAxisSizingMode = 'FIXED'; screen.resize(360, 800) }
report.size = [Math.round(screen.width), Math.round(screen.height)]
report.preloadMs = tPreload
await screen.screenshot({ scale: 0.6 })
if (CONFIG.sandbox) screen.remove(); else report.frameId = screen.id
report.ms = Date.now() - T0
return report
