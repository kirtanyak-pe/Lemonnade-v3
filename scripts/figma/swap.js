// L3 swap — replaces old components / hand-drawn layers with L3 components WITHOUT moving anything.
// CONFIG: {
//   nodeIds: [...],            roots on ONE page
//   rules: [{ id, match, to, variant, strategy, options }],
//   dryRun: true,              list matches + plan, no layer changes (imports are checked)
//   sandbox: false,            run for real on temporary copies (affected screens; for layers inside local components, a
//                              detached copy of the component), report + screenshot, delete the copies
//   keepSandbox: false,        leave the sandbox copies on the page (ids in report.kept) to inspect them — delete afterwards
//   limit: 150,                max swaps per call (re-run to continue — matches are recomputed, so it's idempotent)
//   onMismatch: 'skip',        'skip' = undo that one swap and report it · 'stop' = throw (the whole call rolls back)
//   groupReserveMs: 15000,     don't start a main-component edit with less time left than this (it continues next call)
// }
// match:    { mainName, mainNameRe, variant: {prop: value}, signature: 'select'|'stepper'|'price-change'|'card'|'list-row'|'section-header'|'chart', nameRe, discontinued: true,
//             textStyles: ['Label/12'], fillRe: 'indicator/(up|down)', height: 20 }   ← extra filters for signature matches
//           (with a signature, variant filters what the classifier found, e.g. { signature: 'card', variant: { Type: 'Filled' } })
// strategy: 'latest' | 'variant-swap' | 'icon-swap' | 'slot-wrap' | 'select' | 'stepper' | 'list-cell' | 'price-change' | 'chart'
// to / toKey: an L3 registry name, or any component key (icons: find keys with search_design_system, in one batched call)
// options:  { keepFills: true, exclude: 'state layer|interaction', tolerance: 0.5, fit: 'pad' }
//
// Every swap: snapshot bounds → build the L3 version next to the old layer → hide the old one → measure →
// same bounds (± tolerance)? remove the old : undo. Layers inside an instance of a LOCAL component are swapped once
// in its main component (all of a component's layers together), then every instance's text overrides are restored by
// order and all instances re-verified; if one changed, that component is reverted.

const RULES = CONFIG.rules || []
if (!RULES.length) throw new Error('CONFIG.rules is empty — get suggested rules from audit.js')
const LIMIT = CONFIG.limit ?? 150
const report = { dryRun: Boolean(CONFIG.dryRun), sandbox: Boolean(CONFIG.sandbox), matched: 0, swapped: 0, skipped: [], byRule: {}, mainEdits: [], remaining: 0 }
const bump = (rule, k) => { const r = (report.byRule[rule.id] = report.byRule[rule.id] || { matched: 0, swapped: 0, skipped: 0 }); r[k]++ }
const skip = (rule, node, reason, extra) => { bump(rule, 'skipped'); if (report.skipped.length < 40) report.skipped.push({ rule: rule.id, id: node.id, name: node.name, reason, ...(extra || {}) }) }

let { roots, page } = await resolveRoots(CONFIG.nodeIds)
mark('roots')

// ---- Find candidates: native searches; owner and main component resolved only for what a rule needs ----------
// Owner = the nearest instance above a node, stopping at a slot (slot content is editable per instance).
// Dogfood (F&O GUI section): a JS walk of every node took 12.4 s and resolving 2,151 mains took 52 s for 13 matches.
function ownerOf(n, root) { // the root counts too: layers of a root instance are edited in its main component
  for (let p = n.parent; p; p = p.parent) {
    if (p.type === 'SLOT') return null
    if (p.type === 'INSTANCE') return p
    if (p === root) return null
  }
  return null
}
async function collect(rootList) {
  const kinds = new Set(RULES.filter((r) => r.match.signature).map((r) => r.match.signature))
  // frames and groups only: an instance is matched by instance rules, and a main component must never be swapped out
  const sigTypes = [...(kinds.has('price-change') ? ['TEXT'] : []), ...([...kinds].some((k) => k !== 'price-change') ? ['FRAME', 'GROUP'] : [])]
  const free = [], insts = []
  for (const root of rootList) {
    if (sigTypes.length) for (const n of root.findAllWithCriteria({ types: sigTypes })) free.push([n, root])
    if (RULES.some((r) => !r.match.signature)) for (const n of root.findAllWithCriteria({ types: ['INSTANCE'] })) insts.push([n, root])
  }
  mark('collect.search')
  if (insts.length) await mainInfosFast(insts.map(([i]) => i))
  mark('collect.mains')
  const ownerOk = new Map()
  const editable = async (owner) => { // inside a library component → change it in its library instead
    if (!owner) return true
    if (!ownerOk.has(owner.id)) { const info = await mainInfo(owner); ownerOk.set(owner.id, Boolean(info && !info.remote)) }
    return ownerOk.get(owner.id)
  }
  const out = [], seen = new Set()
  for (const rule of RULES) {
    const m = rule.match, re = m.mainNameRe ? new RegExp(m.mainNameRe) : null, nameRe = m.nameRe ? new RegExp(m.nameRe, 'i') : null
    for (const [n, root] of m.signature ? free : insts) {
      if (seen.has(n.id)) continue
      if (m.signature) {
        const c = classify(n)
        if (!c || c.kind !== m.signature) continue
        if (m.variant && !Object.entries(m.variant).every(([k, v]) => c.variant && c.variant[k] === String(v))) continue // e.g. card Type=Filled
        if (m.textStyles && !(n.type === 'TEXT' && m.textStyles.includes(l3StyleOfId(n.textStyleId)))) continue // e.g. ['Label/12']
        if (m.fillRe && !new RegExp(m.fillRe).test((await paintToken(n.fills)) || '')) continue // e.g. 'indicator/(up|down)'
        if (m.height && Math.round(n.height) !== m.height) continue // only rows that keep their height
        if (nameRe && !nameRe.test(n.name)) continue
      } else {
        const info = await mainInfo(n)
        if (!info) continue
        if (m.mainName && info.name !== m.mainName) continue
        if (re && !re.test(info.name)) continue
        if (m.variant && !Object.entries(m.variant).every(([k, v]) => info.variant && info.variant[k] === String(v))) continue
        if (m.discontinued && !(info.variant && /Discontinued/.test(info.variant.Version || ''))) continue
        if (nameRe && !nameRe.test(n.name)) continue
      }
      const owner = ownerOf(n, root)
      if (!(await editable(owner))) continue
      if (!m.signature) mainByInst.delete(n.id) // matched: drop the approximate info, resolve exactly before changing it
      seen.add(n.id)
      out.push({ n, owner, rule })
    }
  }
  mark('collect.match')
  return out
}

// ---- Shared bits ---------------------------------------------------------------------------------------
const visibleTexts = (n) => (n.type === 'TEXT' ? [n] : n.findAll((x) => x.type === 'TEXT' && x.visible))
// texts actually drawn: the text and every parent up to root visible (native search, then a short walk up)
const shownTexts = (root) => root.findAllWithCriteria({ types: ['TEXT'] }).filter((t) => { for (let p = t; p && p !== root; p = p.parent) if (!p.visible) return false; return true })
const byKey = new Map()
async function importKey(key) { // any component or set by key (e.g. an icon from 👁️ Lemonnade V3 → Icons found with search_design_system)
  if (!byKey.has(key)) { let n; try { n = await figma.importComponentSetByKeyAsync(key) } catch (e) { n = await figma.importComponentByKeyAsync(key) } byKey.set(key, n) }
  return byKey.get(key)
}
async function target(rule, extra) { const set = rule.toKey ? await importKey(rule.toKey) : await l3Import(rule.to); return pickVariant(set, { ...(rule.variant || {}), ...(extra || {}) }) }
let placed = null // the node a strategy is building — removed by swapOne if the strategy throws
function placeLike(nu, old) {
  placed = nu
  const parent = old.parent
  parent.insertChild(childIndex(old), nu)
  if (parent.layoutMode === 'NONE' || !parent.layoutMode || old.layoutPositioning === 'ABSOLUTE') {
    if (parent.layoutMode && parent.layoutMode !== 'NONE') nu.layoutPositioning = 'ABSOLUTE'
    nu.x = old.x; nu.y = old.y
  }
}
function sizeLike(nu, old) {
  const auto = nu.parent.layoutMode && nu.parent.layoutMode !== 'NONE' && nu.layoutPositioning !== 'ABSOLUTE'
  try { nu.resize(old.width, old.height) } catch (e) {}
  if (auto) {
    try { nu.layoutSizingHorizontal = old.layoutSizingHorizontal === 'HUG' ? 'FIXED' : old.layoutSizingHorizontal } catch (e) {}
    try { nu.layoutSizingVertical = 'FIXED' } catch (e) {}
  }
  if ('primaryAxisAlignItems' in nu && nu.layoutMode === 'VERTICAL') nu.primaryAxisAlignItems = 'CENTER'
}
// Grow a hugging instance to the old size with token padding (never shrink content).
async function padTo(nu, before, opts) {
  if (!nu.layoutMode || nu.layoutMode === 'NONE') return true
  const dw = Math.round(before.w - nu.width), dh = Math.round(before.h - nu.height)
  const ok = []
  if (dw > 0) {
    const half = dw / 2
    if (Number.isInteger(half) && (await spacingVar(half))) { ok.push(await setSpacing(nu, 'paddingLeft', nu.paddingLeft + half)); ok.push(await setSpacing(nu, 'paddingRight', nu.paddingRight + half)) }
    else ok.push(await setSpacing(nu, opts && opts.padSide === 'right' ? 'paddingRight' : 'paddingLeft', (opts && opts.padSide === 'right' ? nu.paddingRight : nu.paddingLeft) + dw))
  }
  if (dh > 0) {
    const half = dh / 2
    if (Number.isInteger(half) && (await spacingVar(half))) { ok.push(await setSpacing(nu, 'paddingTop', nu.paddingTop + half)); ok.push(await setSpacing(nu, 'paddingBottom', nu.paddingBottom + half)) }
    else ok.push(await setSpacing(nu, 'paddingTop', nu.paddingTop + dh))
  }
  return ok.every(Boolean)
}
async function textStyleFor(textNode, table) { // map a text's L3 style (from its style key) or its size to a Size option
  const l3 = l3StyleOfId(textNode.textStyleId)
  if (l3 && table[l3]) return table[l3]
  const size = typeof textNode.fontSize === 'number' ? textNode.fontSize : 12
  const entries = Object.entries(table).map(([k, v]) => [Number(k.split('/')[1]), v])
  return entries.reduce((a, b) => (Math.abs(b[0] - size) < Math.abs(a[0] - size) ? b : a))[1]
}

// ---- Strategies: build the L3 replacement for `old` (already placed next to it). Return the new node. ------
const STRATEGIES = {
  async latest(old) { // in place: switch Version to Latest
    const info = await mainInfo(old)
    const prev = info.variant.Version
    old.setProperties({ Version: 'Latest' })
    return { node: old, inPlace: true, undo: () => old.setProperties({ Version: prev }) }
  },

  async 'variant-swap'(old, rule) {
    const before = box(old), texts = visibleTexts(old).map((t) => t.characters)
    const info = await mainInfo(old)
    const set = rule.toKey ? await importKey(rule.toKey) : await l3Import(rule.to)
    // carry over same-named variant props (e.g. isSmall) unless the rule sets them
    const carry = {}
    if (info && info.variant && set.type === 'COMPONENT_SET') for (const [k, v] of Object.entries(info.variant)) if (set.componentPropertyDefinitions[k] && set.componentPropertyDefinitions[k].variantOptions.includes(v)) carry[k] = v
    const comp = pickVariant(set, { ...carry, ...(rule.variant || {}) })
    old.swapComponent(comp)
    const now = visibleTexts(old)
    if (now.length === texts.length) {
      await loadFonts(now)
      now.forEach((t, i) => { if (t.characters !== texts[i] && !t.hasMissingFont) t.characters = texts[i] })
    }
    if ((rule.options || {}).fit !== 'none') await padTo(old, before, rule.options)
    return { node: old, inPlace: true, undo: () => old.swapComponent(info.comp) }
  },

  // Icons: same as variant-swap, into a component given by key (keeps size; colour overrides carry over by layer name).
  async 'icon-swap'(old, rule) { return STRATEGIES['variant-swap'](old, { ...rule, options: { fit: 'none', ...(rule.options || {}) } }) },

  // Containers → a component with a slot (Card, Button Dock). The content must not move: same direction and same
  // insets → the children go straight into the slot; otherwise (GRID, other padding or direction) a copy of the old
  // container without its chrome (fill, border, shadow, radius) goes into the slot with its padding reduced by the
  // component's own insets. swapOne then checks every text is where it was (the outer box alone can't see a shift).
  async 'slot-wrap'(old, rule) {
    if (!old.layoutMode || old.layoutMode === 'NONE') throw new Error('old layer has no auto-layout — its content would re-flow; swap by hand')
    const opts = rule.options || {}
    const ex = new RegExp(opts.exclude || 'state layer|interaction', 'i')
    const texts = shownTexts(old).map(box)
    const nu = (await target(rule)).createInstance()
    placeLike(nu, old)
    nu.name = rule.to
    if (opts.keepFills !== false) nu.fills = old.fills
    const slot = nu.findOne((x) => x.type === 'SLOT')
    if (!slot) throw new Error(rule.to + ' has no slot')
    for (const c of [...slot.children]) c.remove()
    sizeLike(nu, old)
    nu.primaryAxisAlignItems = 'MIN'
    const ins = { t: slot.paddingTop, r: slot.paddingRight, b: slot.paddingBottom, l: slot.paddingLeft } // component edge → slot content
    for (let p = slot.parent; p && p !== nu.parent; p = p.parent) { ins.t += p.paddingTop || 0; ins.r += p.paddingRight || 0; ins.b += p.paddingBottom || 0; ins.l += p.paddingLeft || 0 }
    const d = { t: old.paddingTop - ins.t, r: old.paddingRight - ins.r, b: old.paddingBottom - ins.b, l: old.paddingLeft - ins.l }
    if (Math.min(d.t, d.r, d.b, d.l) < 0) throw new Error(`padding ${[old.paddingTop, old.paddingRight, old.paddingBottom, old.paddingLeft].join('/')} is tighter than ${rule.to}'s ${[ins.t, ins.r, ins.b, ins.l].join('/')} — content would move`)
    if (old.layoutMode === slot.layoutMode && !d.t && !d.r && !d.b && !d.l) {
      await setSpacing(slot, 'itemSpacing', old.itemSpacing)
      slot.primaryAxisAlignItems = old.primaryAxisAlignItems; slot.counterAxisAlignItems = old.counterAxisAlignItems
      for (const ch of old.children) {
        if (!ch.visible || ex.test(ch.name)) continue
        const cl = ch.clone(); slot.appendChild(cl)
        try { cl.layoutSizingHorizontal = ch.layoutSizingHorizontal; cl.layoutSizingVertical = ch.layoutSizingVertical } catch (e) {}
      }
    } else {
      const host = old.clone()
      host.name = 'content'
      host.fills = []; host.strokes = []; host.effects = []
      if (typeof host.cornerRadius === 'number') host.cornerRadius = 0
      for (const ch of [...host.children]) if (ex.test(ch.name)) ch.remove()
      slot.appendChild(host)
      for (const [k, v] of [['paddingTop', d.t], ['paddingRight', d.r], ['paddingBottom', d.b], ['paddingLeft', d.l]]) await setSpacing(host, k, v)
      host.layoutSizingHorizontal = 'FILL'
      host.resize(host.width, old.height - ins.t - ins.b)
      host.layoutSizingVertical = 'FIXED'
    }
    return { node: nu, texts }
  },

  async select(old, rule) {
    const kids = visibleKids(old)
    const text = kids.find((k) => k.type === 'TEXT'), icon = kids.find((k) => k.type === 'INSTANCE')
    const size = await textStyleFor(text, { 'Label/12': 'Small', 'Label/14': 'Medium', 'Heading/14': 'Large', 'Heading/16': 'Large' })
    const subtle = /secondary|tertiary/.test((await paintToken(text.fills)) || '') ? 'True' : 'False'
    const label = text.characters
    const nu = (await target(rule, { Size: size, isSubtle: subtle })).createInstance()
    placeLike(nu, old)
    nu.name = 'L3: Select switcher'
    const props = { [propKey(nu, '✏️ Label')]: label }
    if (!/Switch arrow toggle|unfold/i.test(icon.name)) { const chev = await figma.importComponentByKeyAsync(DATA.icons.expandMore); props[propKey(nu, '↪ Icon')] = chev.id }
    nu.setProperties(props)
    if (old.layoutSizingHorizontal === 'FILL') nu.layoutSizingHorizontal = 'FILL'
    else await padTo(nu, box(old), { padSide: old.paddingRight > old.paddingLeft ? 'right' : 'left' })
    return { node: nu }
  },

  async stepper(old, rule) {
    const isNum = (c) => c.type === 'TEXT' && /^\d[\d,]*$/.test(c.characters)
    const large = old.height > 30
    const value = old.findAll(isNum)[0].characters
    const subNode = large ? old.findAll((n) => n.type === 'TEXT' && n.visible).find((t) => !isNum(t)) : null
    const subText = subNode ? subNode.characters : null
    const kids = visibleKids(old)
    const disabled = async (k) => { const toks = [await paintToken(k.fills)]; for (const x of k.findAll ? k.findAll((y) => 'fills' in y) : []) toks.push(await paintToken(x.fills)); return toks.some((t) => /disabled/.test(t || '')) ? 'Disabled' : 'Enabled' }
    const dec = await disabled(kids[0]), inc = await disabled(kids[kids.length - 1])
    const nu = (await target(rule, { Size: large ? 'Large' : 'Small' })).createInstance()
    placeLike(nu, old)
    nu.name = 'L3: Stepper'
    const props = { [propKey(nu, '✏️ Value')]: value }
    if (large) { if (subText) props[propKey(nu, '✏️ Sublabel')] = subText; else props[propKey(nu, '👁️ Sublabel')] = false }
    nu.setProperties(props)
    nu.findOne((x) => x.name === 'Decrease').setProperties({ State: dec })
    nu.findOne((x) => x.name === 'Increase').setProperties({ State: inc })
    if (old.layoutSizingHorizontal === 'FILL') { nu.layoutSizingHorizontal = 'FILL'; nu.primaryAxisAlignItems = 'SPACE_BETWEEN' }
    else if (Math.abs(nu.width - old.width) > 0.5 && nu.parent.layoutMode && nu.parent.layoutMode !== 'NONE') { nu.resize(old.width, nu.height); nu.layoutSizingHorizontal = 'FIXED'; nu.primaryAxisAlignItems = 'SPACE_BETWEEN' }
    return { node: nu }
  },

  async 'list-cell'(old, rule) {
    const kids = visibleKids(old)
    const col = kids.find((k) => k.type === 'FRAME' && k.layoutMode === 'VERTICAL')
    if (!col) throw new Error('no text column')
    const lead = kids[0] !== col ? kids[0] : null
    const trailing = kids.slice(kids.indexOf(col) + 1)
    const colTexts = col.findAll((t) => t.type === 'TEXT' && t.visible)
    const title = colTexts[0], rest = colTexts.slice(1)
    await loadFonts(colTexts)
    const nu = (await target(rule)).createInstance()
    placeLike(nu, old)
    nu.name = 'L3: list cell'
    try { nu.layoutSizingHorizontal = old.layoutSizingHorizontal } catch (e) {}
    if (old.layoutSizingHorizontal === 'FIXED') nu.resize(old.width, nu.height)
    nu.fills = old.fills; nu.strokes = old.strokes; nu.strokeWeight = old.strokeWeight; nu.strokeAlign = old.strokeAlign
    for (const k of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing']) await setSpacing(nu, k, old[k])
    const parts = rest.map((t) => t.characters)
    nu.setProperties({ [propKey(nu, '✏️ Label')]: title.characters, ...(parts.length ? { [propKey(nu, '✏️ Description')]: parts.join('  ') } : { [propKey(nu, '👁️ Description')]: false }) })
    const tf = nu.findOne((x) => x.name === 'Text' && x.type === 'FRAME')
    if (tf) await setSpacing(tf, 'itemSpacing', col.itemSpacing)
    const lbl = nu.findOne((x) => x.name === 'Label'), dsc = nu.findOne((x) => x.name === 'Description')
    await loadFonts([lbl, dsc].filter(Boolean))
    if (title.textStyleId && typeof title.textStyleId === 'string') { await applyTextStyle(lbl, title.textStyleId); lbl.fills = title.fills }
    if (dsc && rest.length) {
      if (typeof rest[0].textStyleId === 'string' && rest[0].textStyleId) await applyTextStyle(dsc, rest[0].textStyleId)
      let pos = 0
      rest.forEach((t, i) => { dsc.setRangeFills(pos, pos + parts[i].length, t.fills); pos += parts[i].length + 2 })
    }
    const slots = nu.findAll((x) => x.type === 'SLOT')
    const sl = slots.find((s) => /icon-l/i.test(s.name)), sr = slots.find((s) => /icon-r/i.test(s.name))
    for (const s of [sl, sr]) if (s) for (const c of [...s.children]) c.remove()
    if (lead && sl) sl.appendChild(lead.clone()); else if (sl) nu.setProperties({ [propKey(nu, '👁️ Icon - L')]: false })
    if (sr && trailing.length) { sr.layoutMode = 'HORIZONTAL'; sr.counterAxisAlignItems = 'CENTER'; await setSpacing(sr, 'itemSpacing', old.itemSpacing); for (const t of trailing) sr.appendChild(t.clone()) }
    else if (sr) nu.setProperties({ [propKey(nu, '👁️ Icon - R')]: false })
    return { node: nu }
  },

  // Hand-drawn chart → L3: Chart at the old size (its layers are pinned top-left, so extra height stays empty at the
  // bottom). Carries the y-axis labels (right edge, top → bottom), the x-axis times and the last price; Trend from the
  // marks: the last ones lower than the first → Down.
  async chart(old, rule) {
    const texts = shownTexts(old), rel = (t) => [t.absoluteTransform[0][2] - old.absoluteTransform[0][2], t.absoluteTransform[1][2] - old.absoluteTransform[1][2]]
    // The last-price tag also sits at the right edge: it's the number inside a filled frame (dogfood: it was read as a
    // 7th y label and shifted the axis by one). The axis labels are the rest, top → bottom, at most 6.
    const numeric = (t) => /^[\d,.]+$/.test(t.characters.trim()) && t.characters.trim().length > 1
    const inTag = (t) => { for (let p = t.parent; p && p !== old; p = p.parent) if (solid(p.fills)) return true; return false }
    const last = texts.find((t) => numeric(t) && inTag(t))
    const yLabels = texts.filter((t) => t !== last && rel(t)[0] >= old.width - 64 && numeric(t)).sort((a, b) => rel(a)[1] - rel(b)[1]).slice(0, 6).map((t) => t.characters)
    const times = texts.filter((t) => /^\d{1,2}:\d{2}$/.test(t.characters.trim())).sort((a, b) => rel(a)[0] - rel(b)[0]).map((t) => t.characters)
    const marks = old.findAllWithCriteria({ types: ['RECTANGLE'] }).filter((c) => c.width <= 8 && c.height > 2).sort((a, b) => a.absoluteTransform[0][2] - b.absoluteTransform[0][2])
    const mid = (r) => r.absoluteTransform[1][2] + r.height / 2
    const trend = marks.length > 1 && mid(marks[marks.length - 1]) > mid(marks[0]) ? 'Down' : 'Up'
    const nu = (await target(rule, { Type: 'Candle', Trend: trend })).createInstance()
    placeLike(nu, old)
    nu.name = 'L3: Chart'
    nu.setProperties(last ? { [propKey(nu, '✏️ Last price')]: last.characters.trim() } : { [propKey(nu, '👁️ Last price')]: false }) // never show the sample value
    nu.resize(old.width, old.height)
    try { nu.layoutSizingHorizontal = old.layoutSizingHorizontal === 'FILL' ? 'FILL' : 'FIXED'; nu.layoutSizingVertical = 'FIXED' } catch (e) {}
    const put = async (frameName, values) => {
      const f = nu.findOne((x) => x.name === frameName); if (!f || !values.length) return
      const ts = f.findAllWithCriteria({ types: ['TEXT'] })
      await loadFonts(ts)
      ts.slice(0, values.length).forEach((t, i) => { t.characters = values[i] })
    }
    await put('y-axis', yLabels)
    await put('x-axis', times)
    report.charts = (report.charts || []).concat(`${old.id}: ${trend}, ${yLabels.length} prices, ${times.length} times, last ${last ? last.characters : '—'}`)
    return { node: nu }
  },

  async 'price-change'(old, rule) {
    const s = old.characters.trim()
    const dir = /^\+/.test(s) ? 'Up' : /^[\-−]/.test(s) ? 'Down' : 'Flat'
    const size = await textStyleFor(old, { 'Label/12': 'Small', 'Label/14': 'Medium', 'Label/16': 'Large', 'Heading/16': 'Large' })
    const nu = (await target(rule, { Direction: dir, Size: size })).createInstance()
    placeLike(nu, old)
    nu.name = 'L3: Price change'
    const arrow = propKey(nu, '👁️ Arrow')
    nu.setProperties({ [propKey(nu, '✏️ Value')]: s.replace(/^[+\-−]\s?/, ''), ...(arrow ? { [arrow]: false } : {}) }) // old text had no arrow
    if (old.layoutSizingHorizontal === 'FILL') nu.layoutSizingHorizontal = 'FILL'
    return { node: nu }
  },

  // Hand-built section title row → L3: Section header (title, optional ⓘ, description; CTA only for "View all").
  async 'section-header'(old, rule) {
    const kids = visibleKids(old)
    const title = kids[0]
    const rest = kids.slice(1)
    const info = rest.find((k) => k.type === 'INSTANCE' && /info/i.test(k.name))
    const desc = rest.find((k) => k.type === 'TEXT')
    const other = rest.filter((k) => k !== info && k !== desc)
    const viewAll = other.length === 1 && /view all|see all/i.test(other[0].findAll ? other[0].findAll((t) => t.type === 'TEXT').map((t) => t.characters).join(' ') : '')
    if (other.length && !viewAll) throw new Error('has an action that is not View all — left as is')
    const nu = (await target(rule, { CTA: viewAll ? 'View all' : 'None' })).createInstance()
    placeLike(nu, old)
    nu.name = 'L3: Section header'
    nu.setProperties({ [propKey(nu, '✏️ Heading')]: title.characters, [propKey(nu, '👁️ Info')]: Boolean(info), [propKey(nu, '👁️ Description')]: Boolean(desc), ...(desc ? { [propKey(nu, '✏️ Description')]: desc.characters } : {}) })
    try { nu.layoutSizingHorizontal = old.layoutSizingHorizontal === 'HUG' ? 'FIXED' : old.layoutSizingHorizontal } catch (e) {}
    if (nu.layoutSizingHorizontal === 'FIXED') nu.resize(old.width, nu.height)
    return { node: nu }
  },
}

// ---- One swap with verify + per-item undo -------------------------------------------------------------
async function swapOne(old, rule, opts) { // opts.keepOld: leave the old layer hidden — the caller removes it after its own checks
  const fn = STRATEGIES[rule.strategy]
  if (!fn) throw new Error('Unknown strategy ' + rule.strategy)
  const tol = (rule.options && rule.options.tolerance) ?? (rule.strategy === 'price-change' ? 2 : 0.5)
  const before = box(old)
  const wasVisible = old.visible
  let res
  placed = null
  try { res = await fn(old, rule) } catch (e) {
    if (placed && placed !== old && !placed.removed) placed.remove() // never leave a half-built replacement behind
    return { ok: false, reason: e.message.split('\n')[0].slice(0, 120) }
  }
  if (!res.inPlace) old.visible = false
  const after = box(res.node)
  let moved = null
  if (res.texts) { // content check: every text where it was
    const now = shownTexts(res.node).map(box)
    if (now.length !== res.texts.length) moved = `${res.texts.length}→${now.length} texts`
    else { const k = now.findIndex((b, i) => Math.abs(b.x - res.texts[i].x) > tol || Math.abs(b.y - res.texts[i].y) > tol); if (k >= 0) moved = `text ${k + 1} moved ${Math.round(now[k].x - res.texts[k].x)},${Math.round(now[k].y - res.texts[k].y)}` }
  }
  if (!moved && sameBox(before, after, tol)) {
    if (opts && opts.keepOld) return { ok: true, node: res.node, old, wasVisible, inPlace: res.inPlace, undo: res.undo }
    if (!res.inPlace) old.remove()
    return { ok: true, node: res.node }
  }
  // mismatch → undo this one
  if (res.inPlace) { try { res.undo() } catch (e) {} } else { res.node.remove(); old.visible = wasVisible }
  const reason = moved ? 'content moved (' + moved + ')' : 'bounds changed'
  if (CONFIG.onMismatch === 'stop') throw new Error(`${rule.id}: ${reason} on ${old.name} ${JSON.stringify({ before, after })} — whole call rolled back`)
  return { ok: false, reason, before, after }
}

// ---- Main-component edits (candidates inside instances of a LOCAL component) -------------------------------
// Grouped per component: one page load, one getInstancesAsync, one snapshot and one check for all its layers.
// The old layers stay hidden until every instance checks out, so a failure reverts only that component.
// Per-instance text colour overrides must survive too: the CMD screens had their D2 colours switched to L3 per
// instance, and a main edit (new layers) dropped them — dark-mode text turned dark-on-dark (dogfood 2026-10-09).
const textPaint = (t) => (t.fills === figma.mixed ? t.getStyledTextSegments(['fills']).map((g) => [g.start, g.end, g.fills]) : [[0, t.characters.length, t.fills]])
const paintKey = (segs) => JSON.stringify(segs.map(([a, b, f]) => [a, b, f.map((p) => (p.boundVariables && p.boundVariables.color ? p.boundVariables.color.id : p.type === 'SOLID' ? [p.color.r, p.color.g, p.color.b, p.opacity] : p.type))]))
async function restoreTexts(snap) { // every instance's texts (characters + colours) back by order; reports instances that changed
  let restored = 0
  const bad = []
  for (const s of snap) {
    const now = shownTexts(s.i)
    if (now.length !== s.t.length) { bad.push(`${s.i.id}: ${s.t.length}→${now.length} texts`); continue }
    const diff = now.filter((t, k) => t.characters !== s.t[k] && !t.hasMissingFont)
    if (diff.length) await loadFonts(diff)
    for (let k = 0; k < now.length; k++) if (now[k].characters !== s.t[k] && !now[k].hasMissingFont) { now[k].characters = s.t[k]; restored++ }
    if (s.f) for (let k = 0; k < now.length; k++) {
      if (now[k].hasMissingFont || paintKey(textPaint(now[k])) === paintKey(s.f[k])) continue
      await loadFonts([now[k]])
      for (const [a, b, f] of s.f[k]) if (b <= now[k].characters.length) now[k].setRangeFills(a, b, f)
      restored++
    }
    if (!sameBox(s.b, box(s.i))) bad.push(`${s.i.id} moved`)
  }
  return { restored, bad }
}
async function mainEditGroup(comp, items) {
  if (comp.remote) return items.map(() => ({ ok: false, reason: 'inside a LIBRARY component — change it in its library' }))
  let pg = comp; while (pg.type !== 'PAGE') pg = pg.parent
  if (pg !== figma.currentPage) await pg.loadAsync()
  mark('main.page')
  const insts = await comp.getInstancesAsync()
  mark('main.instances')
  const snap = insts.map((i) => { const ts = shownTexts(i); return { i, b: box(i), t: ts.map((x) => x.characters), f: ts.map(textPaint) } })
  mark('main.snapshot')
  const results = [], done = []
  for (const it of items) {
    const r = await swapOne(it.def, { ...it.rule, options: { ...(it.rule.options || {}), tolerance: (it.rule.options || {}).tolerance ?? 0.5 } }, { keepOld: true })
    results.push(r)
    if (r.ok) done.push(r)
  }
  mark('main.swap')
  const { restored, bad } = await restoreTexts(snap)
  mark('main.restore')
  if (bad.length) { // revert this component: drop the new layers, show the old ones, put the texts back
    for (const r of done) { if (r.inPlace) { try { r.undo() } catch (e) {} } else { r.node.remove(); r.old.visible = r.wasVisible } }
    await restoreTexts(snap)
    report.mainEdits.push({ component: comp.name, instances: insts.length, reverted: bad.slice(0, 5) })
    return results.map((r) => (r.ok ? { ok: false, reason: 'an instance changed (' + bad[0] + ') — reverted' } : r))
  }
  for (const r of done) if (!r.inPlace) r.old.remove()
  report.mainEdits.push({ component: comp.name, layers: done.length, instances: insts.length, overridesRestored: restored })
  return results
}

// A copy outside its context loses inherited theme modes (an instance's CS PRO → Dark rendered as light on the dark
// canvas — dogfood 2026-10-09). Pin the original's resolved modes on the copy so its screenshot is faithful.
async function keepModes(copy, orig) {
  for (const [colId, modeId] of Object.entries((orig && orig.resolvedVariableModes) || {})) {
    const col = await figma.variables.getVariableCollectionByIdAsync(colId).catch(() => null)
    if (col) try { copy.setExplicitVariableModeForCollection(col, modeId) } catch (e) {}
  }
}

// Sandbox for main edits: the same swaps on a detached copy of the component (an instance, detached, so nothing else
// changes), placed right of the page content, screenshotted, then deleted. Instance propagation is checked by the run.
async function sandboxGroup(comp, items, ctx) {
  const pathOf = (n) => { const path = []; for (let p = n; p !== comp; p = p.parent) path.unshift(p.parent.children.findIndex((c) => c.id === p.id)); return path }
  const at = (root, path) => path.reduce((n, i) => n.children[i], root)
  const copy = comp.createInstance().detachInstance()
  figma.currentPage.appendChild(copy)
  copy.x = Math.max(...figma.currentPage.children.filter((n) => n !== copy).map((n) => n.x + n.width)) + 400; copy.y = 0
  await keepModes(copy, ctx)
  try {
    const results = []
    for (const it of items) results.push(await swapOne(at(copy, pathOf(it.def)), { ...it.rule, options: { ...(it.rule.options || {}), tolerance: (it.rule.options || {}).tolerance ?? 0.5 } }))
    report.mainEdits.push({ component: comp.name, sandbox: true, layers: results.filter((r) => r.ok).length, of: items.length })
    if (!report.shot) { await copy.screenshot({ scale: 0.5 }); report.shot = comp.name }
    return results
  } finally { copy.remove() }
}

// ---- Run ---------------------------------------------------------------------------------------------------
let clones = []
if (CONFIG.sandbox) { // real run on throw-away copies of the affected top-level screens
  const cands = await collect(roots)
  const screensOf = new Map()
  for (const c of cands) { let s = c.n; while (s.parent && s.parent.type !== 'SECTION' && s.parent.type !== 'PAGE' && !isScreen(s)) s = s.parent; screensOf.set(s.id, s) }
  let x = Math.max(...page.children.map((n) => n.x + n.width)) + 400
  for (const s of [...screensOf.values()].slice(0, 6)) { const c = s.clone(); page.appendChild(c); c.x = x; c.y = 0; x += c.width + 100; await keepModes(c, s); clones.push(c) }
  roots = clones
}
try {
  const cands = await collect(roots)
  report.matched = cands.length
  for (const c of cands) bump(c.rule, 'matched')
  if (CONFIG.dryRun) {
    const plan = []
    for (const c of cands.slice(0, 60)) {
      const n = c.n, auto = n.layoutMode && n.layoutMode !== 'NONE'
      plan.push({ rule: c.rule.id, id: n.id, name: n.name, edit: c.owner ? 'main-edit (inside ' + c.owner.name + ')' : editContext(n).kind,
        box: Math.round(n.width) + '×' + Math.round(n.height), layout: auto ? n.layoutMode + ' pad ' + [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].join('/') + ' gap ' + n.itemSpacing : n.layoutMode || n.type })
    }
    mark('dry.plan')
    for (const r of RULES) if (r.strategy !== 'latest') { try { await target(r) } catch (e) { report.skipped.push({ rule: r.id, reason: e.message.split('\n')[0] }) } }
    mark('dry.import')
    report.plan = plan
  } else {
    let n = 0
    const groups = new Map(), seenDef = new Set() // local component → its layers to swap
    for (const c of cands) {
      if (c.n.removed) continue // its container was already swapped (put container rules before inner ones)
      if (c.owner) { // grouped per local component; in sandbox mode tried on a detached copy instead
        const defId = c.n.id.split(';').pop()
        if (seenDef.has(defId)) continue
        seenDef.add(defId)
        const def = await figma.getNodeByIdAsync(defId)
        let comp = def; while (comp && comp.type !== 'COMPONENT') comp = comp.parent
        if (!comp) { skip(c.rule, c.n, def ? 'not inside a component' : 'definition not found'); continue }
        if (!groups.has(comp.id)) groups.set(comp.id, { comp, items: [] })
        groups.get(comp.id).items.push({ def, rule: c.rule, cand: c })
        continue
      }
      if (n >= LIMIT || timeLeft() < 3000) { report.remaining++; continue }
      const r = await swapOne(c.n, c.rule)
      n++
      if (r.ok) { report.swapped++; bump(c.rule, 'swapped') } else skip(c.rule, c.n, r.reason, r.before ? { before: r.before, after: r.after } : null)
    }
    mark('swap.free')
    for (const g of groups.values()) {
      if (n >= LIMIT || timeLeft() < (CONFIG.groupReserveMs ?? 15000)) { report.remaining += g.items.length; continue }
      const rs = CONFIG.sandbox ? await sandboxGroup(g.comp, g.items, g.items[0].cand.owner) : await mainEditGroup(g.comp, g.items)
      n += g.items.length
      rs.forEach((r, k) => { const c = g.items[k].cand; if (r.ok) { report.swapped++; bump(c.rule, 'swapped') } else skip(c.rule, c.n, r.reason, r.before ? { before: r.before, after: r.after } : null) })
    }
  }
  if (CONFIG.sandbox && clones.length && report.swapped && !report.shot) await clones[0].screenshot({ scale: 0.5 })
} finally {
  if (CONFIG.keepSandbox) report.kept = clones.map((c) => c.id) // inspect, then delete them yourself
  else for (const c of clones) c.remove()
}
report.timing = (mark('end'), T)
report.ms = Date.now() - T0
return report
