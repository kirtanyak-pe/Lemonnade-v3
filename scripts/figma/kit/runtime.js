// L3 runtime — the Figma half of the L3 kit. `npm run kit -- build <flow.jsx>` bundles the core + only the regions a
// flow uses (`//#el Name uses Dep …`) with DATA (keys) and PLAN (the compiled screens) into one use_figma script.
// Rules and messages live in compile.js (local); this file only draws, places and checks. No eval.

//#core
const E = [], W = []
const TM = { make: 0, vars: 0, check: 0 }
const timed = (k, f) => async (...a) => { const t = Date.now(); try { return await f(...a) } finally { TM[k] += Date.now() - t } }
let RUN_ID = ''
const T0 = Date.now()
const isEl = (x) => x && typeof x === 'object' && !Array.isArray(x) && x.t
// plan nodes: [type, props, children]; element-valued props arrive as { $: node }
const obj = (n) => (Array.isArray(n) ? { t: n[0], p: unpack(n[1] || {}), c: (n[2] || []).map(obj) } : n)
const el$ = (v) => (v && v.$ ? obj(v.$) : v)
const unpack = (p) => { const o = {}; for (const [k, v] of Object.entries(p)) o[k] = Array.isArray(v) ? v.map(el$) : el$(v); return o }
const textOf = (c) => c.filter((x) => typeof x === 'string').join(' ').trim()
const kidsOf = (c) => c.filter((x) => isEl(x) || (typeof x === 'string' && x.trim()))
const elems = (v) => [].concat(v ?? []).filter(isEl)
const memo = (f) => { const m = new Map(); return (k) => { if (!m.has(k)) m.set(k, f(k)); return m.get(k) } }
const comp = memo(async (n) => { const k = DATA.c[n]; if (!k) throw new Error('not in registry: ' + n); try { return await figma.importComponentSetByKeyAsync(k) } catch { return figma.importComponentByKeyAsync(k) } })
const iconComp = memo(async (n) => { const k = DATA.i[n]; if (!k) throw new Error('icon ' + n + ': no key (npm run kit -- icons ' + n + ')'); return figma.importComponentByKeyAsync(k) })
const fonts = new Set()
const loadFont = async (f) => { const k = f.family + '|' + f.style; if (!fonts.has(k)) { fonts.add(k); await figma.loadFontAsync(f).catch(() => {}) } }
const tstyle = memo(async (n) => { const s = await figma.importStyleByKeyAsync(DATA.s[n]); await loadFont(s.fontName); return s })
// the sync setter takes ~2 ms; the first setTextStyleIdAsync of a call stalls ~29 s (measured) — async only as a fallback
async function applyStyle(t, id) { try { t.textStyleId = id; if (t.textStyleId === id) return } catch {} await t.setTextStyleIdAsync(id) }
const textsIn = (node) => node.findAllWithCriteria({ types: ['TEXT'] }).filter((t) => t.type === 'TEXT') // can return instances (slots)
async function fontsIn(node) { const fs = []; for (const t of textsIn(node)) if (!t.hasMissingFont) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fs.push(f); await Promise.all(fs.map(loadFont)) }
const norm = (s) => s.replace(/^🔷 L3\/color\//, '').replace(/[/\s]+/g, '-').toLowerCase()
let varKeys = null
const libVars = () => (varKeys = varKeys || (async () => { const ls = await Promise.all([DATA.k.theme, DATA.k.number].map((k) => figma.teamLibrary.getVariablesInLibraryCollectionAsync(k))); const m = new Map(); for (const v of ls.flat()) { m.set(v.name, v.key); m.set(norm(v.name), v.key) } return m })())
const libVar = memo(timed('vars', async (n) => { const m = await libVars(); const k = m.get(n) || m.get(norm(n)); return k ? figma.variables.importVariableByKeyAsync(k) : null }))
const COLOR = { primary: 'content/primary', secondary: 'content/secondary', tertiary: 'content/tertiary', inverted: 'content/inverted', error: 'content/accent/error-default' } // the compiler resolves the rest
async function colorVar(t) { const v = await libVar(DATA.p + (COLOR[t] || t)); if (!v) throw new Error('no colour token ' + t); return v }
const bound = (v, node) => { const r = v.resolveForConsumer(node || figma.currentPage).value; return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: r.r, g: r.g, b: r.b } }, 'color', v) }
async function paint(t, node) { return bound(await colorVar(t), node) }
async function sp(node, prop, px) { node[prop] = px; if (!px) return; const v = await libVar('spacing/' + String(px).padStart(2, '0')); if (v) node.setBoundVariable(prop, v); else W.push(`${node.name}: ${prop} ${px} has no token`) }
async function radius(node, px) { const v = await libVar('radius/' + String(px).padStart(2, '0')); for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) { node[c] = px; if (v) node.setBoundVariable(c, v) } }
const pad4 = (p) => { if (typeof p === 'number') return [p, p, p, p]; if (p === 'page') return [0, 16, 0, 16]; const a = Array.isArray(p) ? p : String(p).trim().split(/\s+/).map(Number); return a.length === 1 ? [a[0], a[0], a[0], a[0]] : a.length === 2 ? [a[0], a[1], a[0], a[1]] : a.length === 3 ? [a[0], a[1], a[2], a[1]] : a }
async function box(name, dir, o = {}) {
  const f = figma.createAutoLayout(dir === 'row' ? 'HORIZONTAL' : 'VERTICAL')
  f.name = name; f.fills = []
  await sp(f, 'itemSpacing', o.gap ?? 0)
  if (o.pad !== undefined) { const [t, r, b, l] = pad4(o.pad); await sp(f, 'paddingTop', t); await sp(f, 'paddingRight', r); await sp(f, 'paddingBottom', b); await sp(f, 'paddingLeft', l) }
  if (o.bg) f.fills = [await paint(o.bg, f)]
  if (o.radius) await radius(f, o.radius)
  if (o.border) { f.strokes = [await paint(o.border === true ? 'border/light' : o.border, f)]; f.strokeWeight = 1 }
  return f
}
async function text(chars, style, color, o = {}) {
  const t = figma.createText()
  await applyStyle(t, (await tstyle(style || 'Label/14')).id)
  t.characters = String(chars)
  t.fills = [await paint(color || 'primary', t)]
  t.name = o.name || String(chars).slice(0, 32)
  if (o.align) t.textAlignHorizontal = { left: 'LEFT', center: 'CENTER', right: 'RIGHT' }[o.align] || 'LEFT'
  if (o.lines) { t.textTruncation = 'ENDING'; t.maxLines = o.lines }
  return t
}
async function icon(n, size, color) {
  const i = (await iconComp(n)).createInstance()
  i.name = n
  if (size && Math.abs(i.width - size) > 0.5) i.rescale(size / i.width)
  const v = await colorVar(color || 'primary')
  for (const x of i.findAll((k) => (k.type === 'VECTOR' || k.type === 'BOOLEAN_OPERATION') && Array.isArray(k.fills) && k.fills.length)) x.fills = [bound(v, x)]
  return i
}
const parseV = (n) => Object.fromEntries(n.split(', ').map((x) => x.split('=')))
const make = timed('make', async (n, variant) => {
  const c = await comp(n)
  let t = c
  if (c.type === 'COMPONENT_SET') {
    const want = Object.entries(variant || {}).filter(([, v]) => v !== undefined)
    t = c.children.find((k) => { const p = parseV(k.name); return want.every(([a, b]) => p[a] === String(b)) })
    if (!t) throw new Error(`${n}: no variant ${JSON.stringify(variant)}`)
  }
  const i = t.createInstance()
  await fontsIn(i)
  return i
})
function setp(inst, o) {
  const cp = inst.componentProperties, set = {}
  for (const [label, v] of Object.entries(o)) {
    if (v === undefined) continue
    const k = Object.keys(cp).find((x) => x === label || x.split('#')[0].trim() === label.trim())
    if (!k) { W.push(`${inst.name}: no property "${label}"`); continue }
    set[k] = cp[k].type === 'BOOLEAN' ? Boolean(v) : cp[k].type === 'VARIANT' ? String(v) : v
  }
  if (Object.keys(set).length) inst.setProperties(set)
  return inst
}
const slot = (n, re) => n.findOne((x) => x.type === 'SLOT' && re.test(x.name))
const clear = (s) => { for (const c of [...s.children]) c.remove(); return s }
const sub = (n, name) => n.findOne((x) => x.type === 'INSTANCE' && (typeof name === 'string' ? x.name === name : name.test(x.name)))
const FILL = (n) => { try { n.layoutSizingHorizontal = 'FILL' } catch {} return n }
async function setText(root, name, value) { const t = root.findOne((x) => x.type === 'TEXT' && x.name === name); if (!t) return false; await fontsIn(t.parent || t); t.characters = String(value); return true }
const groupIN = (n, d = 2) => { const [i, f] = Math.abs(n).toFixed(d).split('.'); const l3 = i.slice(-3), rest = i.slice(0, -3); return (rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' : '') + l3 + (f ? '.' + f : '') }
async function iconOrEl(v, size, color, ctx) { if (!v) return null; if (isEl(v)) return render(v, ctx); return icon(String(v), size, color) }
async function note(m) { return text('⚠ ' + m, 'Label/12', 'error', { name: '⚠ kit note' }) }
const RENDER = {}
const BLOCK = new Set(DATA.block)
const BLEED = (el, ctx) => !ctx.inset && ((el.t === 'ListCell' && el.p.variant !== 'card') || (el.t === 'List' && el.p.variant !== 'card') || (el.t === 'Tabs' && el.p.appearance !== 'pill-group') || el.t === 'Chart' || (el.t === 'Divider' && !el.p.inset) || el.p.bleed === true || (el.t === 'Section' && el.c.some((k) => isEl(k) && BLEED(k, ctx))))
// Page-level columns have no side padding: inset children go into 16-padded groups, bleed children run edge to edge.
async function place(kids, parent, ctx) {
  let wrap = null
  for (const el of kidsOf(kids)) {
    const bleed = isEl(el) && BLEED(el, ctx)
    let target = parent
    if (ctx.page && !bleed) {
      if (!wrap) { wrap = await box(isEl(el) && el.p.name ? el.p.name : 'group', 'col', { gap: parent.itemSpacing, pad: 'page' }); parent.appendChild(wrap); FILL(wrap) }
      target = wrap
    } else wrap = null
    const node = await render(el, { ...ctx, page: false, inset: ctx.page ? !bleed : ctx.inset, row: target.layoutMode === 'HORIZONTAL' })
    if (!node) continue
    target.appendChild(node)
    size(node, el, target)
  }
}
function size(node, el, parent) {
  const p = isEl(el) ? el.p : {}
  if (p.width) { node.resize(p.width, node.height); try { node.layoutSizingHorizontal = 'FIXED' } catch {} }
  else if (parent.layoutMode === 'HORIZONTAL') {
    if (p.grow || p.fill) { node.layoutGrow = 1; try { node.layoutSizingHorizontal = 'FILL' } catch {} if (el.t === 'Tabs') node.minWidth = null }
    if (node.type === 'TEXT') node.textAutoResize = p.grow || p.fill ? 'HEIGHT' : 'WIDTH_AND_HEIGHT'
  } else if (!p.hug && (!isEl(el) || BLOCK.has(el.t) || p.fill || p.full)) { FILL(node); if (node.type === 'TEXT') node.textAutoResize = 'HEIGHT' }
  if (p.height && node.type !== 'TEXT') { try { node.layoutSizingVertical = 'FIXED' } catch {} node.resize(node.width, p.height) }
}
async function render(el, ctx) {
  if (typeof el === 'string') return text(el, 'Description/14', 'secondary')
  const fn = RENDER[el.t]
  if (!fn) return note(el.t + '?')
  try { const n = await fn(el.p, el.c, ctx, el); if (n && el.p.name && el.t !== 'Screen') n.name = el.p.name; return n }
  catch (e) { const m = String(e.message || e).split('\n')[0].slice(0, 140); E.push(`<${el.t}${el.p.label ? ' ' + el.p.label : ''}> ${m}`); return note(el.t + ': ' + m.slice(0, 60)) }
}
const TOP = ['SystemStatusbar', 'Actionbar'], BOTTOM = ['ButtonGroup', 'BottomNavbar', 'Keyboard']
async function screen(el, flow) {
  const p = el.p, Wd = p.width || flow.width || 360, H = p.height || flow.height || 800
  const kids = el.c.filter(isEl)
  const sheets = kids.filter((k) => k.t === 'BottomSheet'), toasts = kids.filter((k) => k.t === 'Aerobar' && k.p.floating)
  let f
  if (p.base) {
    const b = flow.built.get(p.base) || flow.existing.get(p.base)
    if (!b) throw new Error(`base "${p.base}" not found — build it first (same call is fine)`)
    f = b.clone(); f.name = p.name
    for (const n of f.findAll((x) => x.name.startsWith('Sheet · ') || x.name === 'L3: Overlay')) n.remove()
    // a sheet sits on the phone viewport: a long (scrolling) base is clipped to H
    if (sheets.length && f.height > H) { f.primaryAxisSizingMode = 'FIXED'; f.resize(f.width, H); f.clipsContent = true }
  } else {
    f = await box(p.name, 'col', { bg: p.bg || 'surface/default' })
    f.resize(Wd, H); f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; f.clipsContent = true
    if ((p.theme || flow.theme) && RENDER.theme) await RENDER.theme(f, p.theme || flow.theme)
    for (const k of kids.filter((x) => TOP.includes(x.t)).sort((a, b) => TOP.indexOf(a.t) - TOP.indexOf(b.t))) { const n = await render(k, { screen: f }); f.appendChild(n); FILL(n) }
    const body = await box('body', 'col', { gap: p.gap ?? 24, pad: [p.padTop ?? 16, 0, p.padBottom ?? 24, 0] })
    f.appendChild(body); FILL(body)
    await place(el.c.filter((k) => !isEl(k) || (![...TOP, ...BOTTOM, 'BottomSheet'].includes(k.t) && !(k.t === 'Aerobar' && k.p.floating))), body, { screen: f, page: true, inset: false })
    for (const k of kids.filter((x) => BOTTOM.includes(x.t))) {
      if (k.p.note) { const w = await box('note', 'col', { pad: [8, 16, 0, 16] }); const t = await text(k.p.note, 'Description/12', 'secondary', { align: 'center' }); w.appendChild(t); f.appendChild(w); FILL(w); FILL(t); t.textAutoResize = 'HEIGHT' }
      const n = await render(k, { screen: f }); f.appendChild(n); FILL(n)
    }
    // short content: fix the frame at H and let the body fill (dock / navbar pinned to the bottom); long content: the
    // frame grows (setting layoutGrow first would silently turn the hugging frame fixed — content then overlaps the dock)
    if (f.height < H) { f.primaryAxisSizingMode = 'FIXED'; f.resize(Wd, H); body.layoutGrow = 1 }
    else if (sheets.length || p.clip) { f.primaryAxisSizingMode = 'FIXED'; f.resize(Wd, H) }
  }
  for (const t of toasts) { const n = await render(t, { screen: f, inset: true }); f.appendChild(n); n.layoutPositioning = 'ABSOLUTE'; n.resize(f.width - 32, n.height); n.x = 16; const d = f.children.find((x) => /Button Dock|Bottom Navbar/.test(x.name)); n.y = (d ? d.y : f.height) - n.height - 16 }
  for (let k = 0; k < sheets.length; k++) await RENDER.sheetOver(f, sheets[k], { screen: f }, k)
  f.setSharedPluginData('l3kit', 'spec', JSON.stringify(el.raw))
  return f
}
const PH = /^(Label|Label goes here|Heading|Description|Sub label|Value|Headline text|Paragraph text|Title|Button|Placeholder|Helper text|Input text)$/
async function check(f) {
  const out = [], fx = f.absoluteTransform[0][2], fw = f.width
  const shown = (n) => { for (let x = n; x && x.id !== f.id; x = x.parent) if (x.visible === false) return false; return true }
  const texts = textsIn(f).filter(shown)
  const ph = texts.filter((t) => PH.test(t.characters.trim())).map((t) => `${t.parent && t.parent.name}/${t.characters}`)
  if (ph.length) out.push('placeholder: ' + [...new Set(ph)].slice(0, 4).join(', '))
  const over = []
  for (const n of f.findAll((x) => x.visible && x.parent && x.parent.type !== 'INSTANCE')) { if (!shown(n)) continue; const x = n.absoluteTransform[0][2] - fx; if (x + n.width > fw + 0.5 || x < -0.5) over.push(`${n.name} ${Math.round(x)}→${Math.round(x + n.width)}`) }
  if (over.length) out.push('off-screen: ' + over.slice(0, 3).join(', '))
  const cut = []
  for (const t of texts) {
    if (t.textTruncation !== 'ENDING' || t.fontName === figma.mixed || t.fontSize === figma.mixed) continue
    const m = figma.createText(); await loadFont(t.fontName); m.fontName = t.fontName; m.fontSize = t.fontSize
    if (t.letterSpacing !== figma.mixed) m.letterSpacing = t.letterSpacing
    m.characters = t.characters
    if (m.width > t.width + 1) cut.push(`"${t.characters.slice(0, 28)}"`)
    m.remove()
  }
  if (cut.length) out.push('truncated: ' + cut.slice(0, 4).join(', '))
  let raw = 0, unstyled = 0
  for (const n of f.findAll((x) => (x.type === 'FRAME' || x.type === 'TEXT' || x.type === 'RECTANGLE') && x.visible)) {
    let ins = false; for (let q = n.parent; q && q.id !== f.id; q = q.parent) if (q.type === 'INSTANCE') { ins = true; break }
    if (ins) continue
    if (Array.isArray(n.fills) && n.fills.some((x) => x.type === 'SOLID' && x.visible !== false && !(x.boundVariables && x.boundVariables.color))) raw++
    if (n.type === 'TEXT' && !n.textStyleId) unstyled++
  }
  if (raw) out.push(raw + ' raw fills')
  if (unstyled) out.push(unstyled + ' unstyled texts')
  return out
}
// eslint-disable-next-line no-unused-vars -- called by the line kit.ts appends: return await run()
async function run() {
  PLAN.screens = PLAN.screens.map((r) => ({ ...obj(r), raw: r }))
  const o = PLAN.opt
  let parent = await figma.getNodeByIdAsync(o.parent)
  if (!parent) throw new Error('parent ' + o.parent + ' not found')
  let page = parent; while (page.type !== 'PAGE') page = page.parent
  await figma.setCurrentPageAsync(page)
  const probe = figma.createFrame(); RUN_ID = probe.id.split(':')[0]; probe.remove()
  const sets = await Promise.all(Object.keys(DATA.c).map((c) => comp(c).catch(() => null)))
  await Promise.all([...Object.keys(DATA.i).map((i) => iconComp(i).catch(() => null)), ...Object.keys(DATA.s).map((s) => tstyle(s).catch(() => null)), libVars()])
  await Promise.all([...['spacing/04', 'spacing/08', 'spacing/12', 'spacing/16', 'spacing/24'], ...['content/primary', 'content/secondary', 'surface/default', 'border/light'].map((t) => DATA.p + t)].map((n) => libVar(n).catch(() => null)))
  // warm every font the components use, in parallel (first-use font loads made the first screen take ~34 s)
  const fs = new Map()
  for (const c of sets.filter(Boolean)) for (const t of textsIn(c.type === 'COMPONENT_SET' ? c.defaultVariant : c)) if (!t.hasMissingFont) for (const f of t.getRangeAllFontNames(0, t.characters.length)) fs.set(f.family + '|' + f.style, f)
  await Promise.all([...fs.values()].map(loadFont))
  const preMs = Date.now() - T0
  const fl = o.flow || {}
  if (fl.name && parent.type === 'PAGE') {
    let sec = parent.children.find((n) => n.type === 'SECTION' && n.name === fl.name)
    if (!sec) { sec = figma.createSection(); sec.name = fl.name; parent.appendChild(sec); sec.x = Math.max(0, ...parent.children.filter((n) => n.id !== sec.id).map((n) => n.x + n.width)) + 400; sec.y = 0 }
    parent = sec
  }
  const existing = new Map(parent.children.filter((n) => n.type === 'FRAME').map((n) => [n.name, n]))
  const flow = { width: fl.width || o.width, height: fl.height || o.height, theme: fl.theme || o.theme, built: new Map(), existing }
  const GAP = fl.gap || 80, out = []
  for (const sc of PLAN.screens) {
    if (Date.now() - T0 > (o.budgetMs || 85000)) { W.push('time budget — not built: ' + sc.p.name); continue }
    const t0 = Date.now()
    let f
    const before = new Set(page.children.map((n) => n.id))
    try { f = await screen(sc, flow) } catch (e) {
      E.push(`"${sc.p.name}": ${String(e.message || e).slice(0, 160)}`)
      // remove what this screen left on the page (only nodes created by this run: same id prefix)
      for (const n of [...page.children]) if (!before.has(n.id) && n.id.split(':')[0] === RUN_ID && n.type !== 'SECTION') n.remove()
      continue
    }
    const old = existing.get(sc.p.name)
    parent.appendChild(f)
    if (old && old.getSharedPluginData('l3kit', 'spec')) { f.x = old.x; f.y = old.y; old.remove() }
    else {
      const others = parent.children.filter((n) => n.id !== f.id && n.type === 'FRAME')
      f.x = (others.length ? Math.max(...others.map((n) => n.x + n.width)) : 0) + GAP; f.y = parent.type === 'SECTION' ? GAP : 0
      if (old) W.push(`"${sc.p.name}": an older frame with this name was kept`)
    }
    existing.set(sc.p.name, f); flow.built.set(sc.p.name, f)
    let issues = []
    if (o.check !== false) try { const tc = Date.now(); issues = await check(f); TM.check += Date.now() - tc } catch (e) { issues = ['check failed: ' + String(e.message || e).slice(0, 100)] }
    out.push({ name: sc.p.name, id: f.id, size: `${Math.round(f.width)}×${Math.round(f.height)}`, ms: Date.now() - t0, ...(issues.length ? { issues } : {}) })
  }
  if (parent.type === 'SECTION') { const fr = parent.children.filter((n) => n.type === 'FRAME'); if (fr.length) parent.resizeWithoutConstraints(Math.max(parent.width, Math.max(...fr.map((n) => n.x + n.width)) + GAP), Math.max(parent.height, Math.max(...fr.map((n) => n.y + n.height)) + GAP)) }
  if (o.snap !== false && out.length) { const scale = typeof o.snap === 'number' ? o.snap : 0.5; for (const s of out.slice(0, o.snapMax || 5)) { const n = await figma.getNodeByIdAsync(s.id); if (n) await n.screenshot({ scale }) } }
  return { ok: !E.length, kit: DATA.v, ms: Date.now() - T0, preloadMs: preMs, timing: TM, parent: parent.id, screens: out, ...(W.length ? { warnings: [...new Set(W)].slice(0, 12) } : {}), ...(E.length ? { errors: E } : {}) }
}
//#end

//#el theme
RENDER.theme = async (node, name) => {
  const v = await libVar(DATA.p + 'surface/default')
  const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId)
  const key = (s) => s.toLowerCase().replace(/[^a-z♿]+/g, '')
  const m = col.modes.find((x) => key(x.name) === key(name)) || col.modes.find((x) => key(x.name).includes(key(name)))
  if (!m) throw new Error(`theme "${name}" — ${col.modes.map((x) => x.name).join(' · ')}`)
  node.setExplicitVariableModeForCollection(col, m.modeId)
}
//#end

//#el density
RENDER.density = async (node, mode) => {
  const vars = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(DATA.k.density)
  const v = await figma.variables.importVariableByKeyAsync(vars[0].key)
  const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId)
  const m = col.modes.find((x) => x.name.toLowerCase().startsWith(mode))
  if (m) node.setExplicitVariableModeForCollection(col, m.modeId)
}
//#end

//#el Button
const BTN = { primary: '◻️ Primary', secondary: '🔲 Secondary', tertiary: '⬜︎ Tertiary', ghost: 'Ghost', brand: '🟨 Brand', buy: '🟩 Buy', sell: '🟥 Sell' }
const SIZE = { lg: 'Large', md: 'Medium', sm: 'Small' }
async function button(p, c, ctx) {
  const label = p.children || textOf(c) || (p.icon || p.iconLeft ? '' : p.label)
  const iconL = p.icon || p.iconLeft, iconR = p.iconRight, variant = p.variant || 'primary'
  const b = await make('L3: Button', { Type: BTN[variant], Size: SIZE[ctx.dock ? 'lg' : p.size || (ctx.inset ? 'md' : 'lg')], State: p.loading ? '♻︎ Loading' : p.disabled ? '🚫 Disabled' : 'Default' })
  const o = { '👁️ Label': Boolean(label), '👁️ Icon-L': Boolean(iconL), '👁️ Icon-R': Boolean(iconR), '✏️ Label': label || undefined }
  if (iconL) o['↪ Icon-L'] = (await iconComp(iconL)).id
  if (iconR) o['↪ Icon-R'] = (await iconComp(iconR)).id
  setp(b, o)
  b.name = label || p.label || iconL || 'Button'
  if (!ctx.dock && !p.full) { b.primaryAxisSizingMode = 'AUTO'; if (variant === 'ghost') b.counterAxisSizingMode = 'AUTO' } // L3 buttons stretch by default; outside docks they hug
  return b
}
RENDER.Button = button
//#end

//#el ButtonGroup uses Button
RENDER.ButtonGroup = async (p, c, ctx) => {
  const h = p.direction === 'horizontal'
  const d = await make('L3: Button Dock', { Direction: h ? '→ Horizontal' : '↓ Vertical' })
  const s = clear(slot(d, /wrapper/i))
  for (const b of c.filter((x) => x.t === 'Button')) { const n = await button({ ...b.p, size: 'lg' }, b.c, { ...ctx, dock: true }); s.appendChild(n); FILL(n); if (h) n.layoutGrow = 1 }
  return d
}
//#end

//#el Tabs
const TABS = { underline: 'Flat tabs', pill: 'Pill tabs', 'pill-group': 'Pill group' }
async function tabs(p, c, ctx) {
  const type = TABS[p.appearance || 'pill'] || 'Pill tabs'
  const g = await make('L3: Tabs group', { Type: type })
  const items = [].concat(p.items || []).concat(c.filter((x) => x.t === 'Tab').map((x) => ({ ...x.p, label: x.p.label || textOf(x.c) }))).map((x) => (typeof x === 'string' ? { label: x } : x))
  const sel = typeof p.value === 'number' ? p.value : Math.max(0, items.findIndex((x) => x.label === p.value || x.value === p.value))
  const w = slot(g, /wrapper/i)
  let ts = w.children.filter((x) => x.type === 'INSTANCE')
  while (ts.length < items.length && ts.length) { w.appendChild(ts[ts.length - 1].clone()); ts = w.children.filter((x) => x.type === 'INSTANCE') }
  await fontsIn(g)
  for (let k = ts.length - 1; k >= items.length; k--) ts[k].remove()
  ts = w.children.filter((x) => x.type === 'INSTANCE')
  for (let k = 0; k < ts.length; k++) {
    const it = items[k]
    const o = { '✏️ label': it.label, isSelected: k === sel ? 'True' : 'False', '👁️ Icon - l': Boolean(it.icon), '👁️ Icon - r': false, '👁️ Sub label': Boolean(it.subLabel), '✏️ Sub label': it.subLabel }
    if (it.icon) o['↪ icon - l'] = (await iconComp(it.icon)).id
    if (p.emphasis && type !== 'Flat tabs') o.Type = p.emphasis[0].toUpperCase() + p.emphasis.slice(1)
    if (p.size === 'sm') o.isSmall = 'True'
    setp(ts[k], o); ts[k].name = it.label
  }
  if (ctx.inset && type === 'Pill tabs') { w.paddingLeft = 0; w.paddingRight = 0 } // inside a 16 margin: first chip at 16, never 32
  if (ctx.row || type === 'Pill group') g.minWidth = null
  return g
}
RENDER.Tabs = tabs
//#end

//#el Select
RENDER.Select = async (p, c) => {
  const s = await make('L3: Select switcher', { Size: { lg: 'Large', md: 'Medium', sm: 'Small' }[p.size || 'sm'], isSubtle: p.subtle ? 'True' : 'False' })
  const label = p.children || p.label || textOf(c)
  setp(s, { '✏️ Label': label, ...(p.icon === 'chevron' ? { '↪ Icon': (await iconComp('expand_more')).id } : {}) })
  s.name = 'Select · ' + label
  return s
}
//#end

//#el Actionbar uses Button Tabs Select
RENDER.Actionbar = async (p, c, ctx) => {
  const acts = [].concat(p.actions || []).concat(c.filter((x) => x.t === 'ActionbarAction').map((x) => x.p)).map((a) => (typeof a === 'string' ? { icon: a } : a))
  const bottom = elems(p.bottom)[0] || c.find((x) => x.t === 'Tabs')
  const back = Boolean(p.back || p.onBack)
  const a = await make('L3: Actionbar', { Version: 'Latest' })
  setp(a, { '👁️ Action - left': back, '👁️ → content right': acts.length > 0, '👁️ ↓ content bottom': Boolean(bottom) })
  const ct = sub(a, 'Content')
  if (ct) {
    await fontsIn(ct)
    setp(ct, { '👁️ Description': Boolean(p.description) })
    if (p.titleSelect && RENDER.Select) { const h = slot(ct, /Heading/); if (h) clear(h).appendChild(await RENDER.Select({ size: 'lg', children: p.titleSelect }, [], ctx)) }
    else { const h = ct.findOne((x) => x.type === 'TEXT' && x.name === 'Heading'); if (h) { h.characters = String(p.title ?? ''); if (!back) { await applyStyle(h, (await tstyle('Heading/18')).id); h.name = 'L1 page heading' } } } // L1 (no back / ✕) → Heading/18
    if (p.description) await setText(ct, 'Description', p.description)
  }
  if (acts.length) { const s = clear(slot(a, /content right/i)); for (const ac of acts) { const b = await button({ variant: ac.variant === 'ghost' ? 'ghost' : 'tertiary', size: 'sm', icon: ac.icon, label: ac.label }, [], { ...ctx, row: true }); setp(b, { '👁️ Label': false }); b.name = ac.label || ac.icon; s.appendChild(b) } }
  if (bottom) { const s = clear(slot(a, /Content bottom/i)); const t = await render(bottom, { ...ctx, inset: false }); s.appendChild(t); FILL(t) }
  return a
}
//#end

//#el Section uses SectionHeader
RENDER.Section = async (p, c, ctx) => {
  const s = await box(p.name || p.title || 'section', 'col', { gap: p.gap ?? 16 })
  const kids = kidsOf(c)
  if (p.title) kids.unshift({ t: 'SectionHeader', p: { title: p.title, description: p.description, tag: p.tag, action: p.action, info: p.info }, c: [] })
  await place(kids, s, { ...ctx, page: !ctx.inset }) // at page level (edge-to-edge rows inside): inset parts get the 16 margin
  return s
}
//#end

//#el SectionHeader
RENDER.SectionHeader = async (p) => {
  const h = await make('L3: Section header', {})
  const act = p.action === true || p.action === 'view-all' ? { label: 'View all' } : typeof p.action === 'string' ? { label: p.action } : p.action
  setp(h, { '✏️ Heading': p.title, '👁️ Description': Boolean(p.description), '✏️ Description': p.description, '👁️ Tag': Boolean(p.tag), '👁️ Info': Boolean(p.info), '👁️ CTA': Boolean(act) })
  if (p.tag) { const t = sub(h, /^tag$/i) || sub(h, /tag/i); if (t) { await fontsIn(t); setp(t, { '✏️ Label': isEl(p.tag) ? p.tag.p.children || textOf(p.tag.c) : String(p.tag) }) } }
  if (act) {
    // The nested parts are all named "CTA" in the library: find the switch by its Type variant, the label holder by its ✏️ Label property
    const hasProp = (x, test) => { try { return Object.entries(x.componentProperties || {}).some(test) } catch { return false } }
    const cta = h.findOne((x) => x.type === 'INSTANCE' && hasProp(x, ([k, v]) => k.split('#')[0] === 'Type' && /^(Button|Time Switcher)$/.test(String(v.value))))
    if (cta) {
      setp(cta, { Type: act.type === 'switcher' ? 'Time Switcher' : 'Button' }); await fontsIn(cta)
      const lab = cta.findOne((x) => x.type === 'INSTANCE' && hasProp(x, ([k]) => k.startsWith('✏️ Label')))
      if (lab) setp(lab, { '✏️ Label': act.label || 'View all' }); else W.push('section header: no label in CTA')
    } else W.push('section header: CTA not found')
  }
  h.name = 'Section header · ' + p.title
  return h
}
//#end

//#el Stack
RENDER.Stack = async (p, c, ctx) => {
  const s = await box(p.name || 'stack', 'col', { gap: p.gap ?? 8, pad: p.pad, bg: p.bg, radius: p.radius, border: p.border })
  if (p.align) s.counterAxisAlignItems = { start: 'MIN', center: 'CENTER', end: 'MAX' }[p.align]
  await place(c, s, { ...ctx, page: false, inset: ctx.inset || p.pad !== undefined })
  return s
}
//#end

//#el Row
RENDER.Row = async (p, c, ctx) => {
  const r = await box(p.name || 'row', 'row', { gap: p.gap ?? 8, pad: p.pad, bg: p.bg, radius: p.radius, border: p.border })
  r.counterAxisAlignItems = { start: 'MIN', center: 'CENTER', end: 'MAX', baseline: 'BASELINE' }[p.align || 'center']
  if (p.justify) r.primaryAxisAlignItems = { start: 'MIN', center: 'CENTER', end: 'MAX', between: 'SPACE_BETWEEN' }[p.justify]
  if (p.wrap) { r.layoutWrap = 'WRAP'; await sp(r, 'counterAxisSpacing', p.gap ?? 8) }
  await place(c, r, { ...ctx, page: false, inset: true, row: true })
  return r
}
//#end

//#el List uses ListCell density
RENDER.List = async (p, c, ctx) => {
  const card = p.variant === 'card'
  const l = await box(p.name || 'list', 'col', { gap: p.gap ?? (card ? 8 : 0) })
  if (p.density && !card) await RENDER.density(l, p.density) // 📐 L3 → Density on the list frame (flat rows only)
  await place(c, l, { ...ctx, page: false })
  return l
}
//#end

//#el ListCell uses density
RENDER.ListCell = async (p, c, ctx) => {
  const small = p.size === 'sm', card = p.variant === 'card'
  const tap = p.tappable ?? Boolean(p.iconRight || p.trailing === 'chevron' || p.selected || p.href || p.onClick)
  const cell = await make('L3: list cell', { isSelected: p.selected ? 'True' : 'False', isSmall: small ? 'True' : 'False', isPlain: card ? 'False' : 'True', isTappable: tap ? 'True' : 'False' })
  const left = p.iconLeft ? await iconOrEl(p.iconLeft, small ? 16 : 24, p.iconColor || 'primary', ctx) : null
  const right = []
  if (p.iconRight || p.trailing === 'chevron') right.push(await icon('chevron_right', small ? 16 : 24, 'secondary')) // the library default is a ⌄ chevron
  else for (const t of [].concat(p.trailing ?? [])) {
    if (isEl(t)) { right.push(await render(t, { ...ctx, row: true })); continue }
    const [kind, st] = String(t).split(':')
    if (kind === 'switch') right.push(await make('L3→ Toggle switch', { '↔ On': st === 'on' ? 'True' : 'False', '👆 State': 'Enabled', isSmall: small ? 'True' : 'False' }))
    else if (kind === 'radio' || kind === 'check') right.push(await make('L3: Radio button & check box', { '👆 State': st === 'on' ? 'selected' : 'default', Disabled: 'False', isRadio: kind === 'radio' ? 'True' : 'False' }))
    else right.push(await text(String(t), small ? 'Label/12' : 'Label/14', 'secondary'))
  }
  setp(cell, { '✏️ Label': String(p.label ?? textOf(c)), '👁️ Description': Boolean(p.description), '✏️ Description': p.description ? String(p.description) : undefined, '👁️ Icon - L': Boolean(left), '👁️ Icon - R': right.length > 0, '👁️ Dot-L': Boolean(p.dotLeft), '👁️ Dot-R': Boolean(p.dotRight) })
  if (left) clear(slot(cell, /^Icon-l$/i)).appendChild(left)
  if (right.length) { const s = clear(slot(cell, /^icon-r$/i)); s.layoutMode = 'HORIZONTAL'; s.counterAxisAlignItems = 'CENTER'; await sp(s, 'itemSpacing', 8); for (const r of right) s.appendChild(r) }
  if (ctx.inset && !card) { cell.paddingLeft = 0; cell.paddingRight = 0 } // plain rows inside a card / sheet / margin: no double inset
  if (p.density) await RENDER.density(cell, p.density)
  cell.name = String(p.label ?? 'List cell')
  return cell
}
//#end

//#el Card uses Button
RENDER.Card = async (p, c, ctx) => {
  const variant = p.variant || (p.clickable || p.onClick || p.href ? 'clickable' : 'static')
  const footer = elems(p.footer)
  const padded = variant === 'filled' || (p.padding !== 'none' && !footer.length)
  const card = await make('L3: Card', { Type: variant[0].toUpperCase() + variant.slice(1), isPadded: padded ? 'True' : 'False', isSelected: p.selected && ['clickable', 'flat'].includes(variant) ? 'True' : 'False' })
  const s = clear(slot(card, /^content$/i))
  const body = await box('card body', p.direction === 'row' ? 'row' : 'col', { gap: p.gap ?? 8, pad: padded ? undefined : footer.length ? 12 : undefined })
  s.appendChild(body); FILL(body)
  if (p.direction === 'row') body.counterAxisAlignItems = 'CENTER'
  await place(c, body, { ...ctx, page: false, inset: true })
  if (footer.length) {
    const f = await box('footer', 'row', { gap: 8, pad: [p.footerFilled ? 12 : 0, 12, 12, 12], bg: p.footerFilled ? 'surface/secondary' : undefined })
    s.appendChild(f); FILL(f)
    for (const b of footer) f.appendChild(await button({ variant: 'tertiary', size: 'sm', ...b.p }, b.c, { ...ctx, row: true }))
  }
  return card
}
//#end

//#el Text
RENDER.Text = async (p, c) => text(p.children ?? textOf(c), p.style || 'Description/14', p.color || 'primary', { align: p.align, lines: p.lines })
//#end

//#el Icon
RENDER.Icon = async (p) => icon(p.name, p.size || 24, p.color || 'primary')
//#end

//#el Divider
RENDER.Divider = async (p) => { const d = figma.createFrame(); d.name = 'divider'; d.resize(100, 1); d.fills = [await paint(p.color || 'border/light', d)]; return d }
//#end

//#el PriceChange
const changeText = (p) => { if (p.text) return p.text; const v = Number(p.value) || 0, d = p.decimals ?? 2, u = p.unit || 'percent'; let s = u === 'currency' ? '₹' + groupIN(v, d) : u === 'number' ? groupIN(v, d) : Math.abs(v).toFixed(d) + '%'; if (p.percent !== undefined) s += ` (${Math.abs(Number(p.percent)).toFixed(2)}%)`; return s }
RENDER.PriceChange = async (p) => {
  const v = Number(p.value) || 0
  const i = await make('L3: Price change', { Direction: v > 0 ? 'Up' : v < 0 ? 'Down' : 'Flat', Size: { lg: 'Large', md: 'Medium', sm: 'Small' }[p.size || 'sm'] })
  setp(i, { '✏️ Value': changeText(p), '👁️ Arrow': Boolean(p.arrow) })
  return i
}
//#end

//#el KeyValue uses PriceChange
RENDER.KeyValue = async (p, c, ctx) => {
  const s = await box(p.name || String(p.label), 'col', { gap: 4 })
  if (p.align === 'end') s.counterAxisAlignItems = 'MAX'
  s.appendChild(await text(p.label, p.labelStyle || 'Description/12', 'secondary'))
  if (isEl(p.value)) s.appendChild(await render(p.value, ctx))
  else { const r = await box('value', 'row', { gap: 4 }); r.counterAxisAlignItems = 'CENTER'; r.appendChild(await text(p.value, p.valueStyle || 'Label/14', p.color || 'primary')); if (p.change !== undefined) r.appendChild(await RENDER.PriceChange(typeof p.change === 'object' ? p.change : { value: p.change })); s.appendChild(r) }
  return s
}
//#end

//#el Stats uses KeyValue
RENDER.Stats = async (p, c, ctx) => {
  const items = [].concat(p.items || []), cols = p.columns || 2
  const inner = await box('stats', 'col', { gap: 12 })
  for (let k = 0; k < items.length; k += cols) {
    const r = await box('row', 'row', { gap: 16 }); r.counterAxisAlignItems = 'MIN'; inner.appendChild(r); FILL(r)
    for (const it of items.slice(k, k + cols)) { const [label, value, change] = Array.isArray(it) ? it : [it.label, it.value, it.change]; const kv = await RENDER.KeyValue({ label, value, change }, [], ctx); r.appendChild(kv); kv.layoutGrow = 1 }
  }
  if (p.card === false) return inner
  const card = await make('L3: Card', { Type: 'Filled', isPadded: 'True', isSelected: 'False' })
  clear(slot(card, /^content$/i)).appendChild(inner); FILL(inner)
  return card
}
//#end

//#el Tag
RENDER.Tag = async (p, c) => {
  const label = p.children || p.label || textOf(c)
  const t = await make('L3: Tags', { Type: { primary: 'Primary', secondary: 'Secondary', tertiary: 'Tertiory' }[p.disabled ? 'x' : p.variant || 'secondary'] || 'Disabled', Color: { neutral: 'Neutral', profit: '🟩 Profit', loss: '🟥  Loss', success: '✅ Success', error: '🚨 Error', warning: '⚠️ Warning', discover: '🔷 Discover', processing: '🟠 Processing', indigo: 'indigo', teal: 'teal', purple: 'purple', zing: '⚡ Zing' }[p.color || 'neutral'], Size: { sm: 'Small → 16', md: 'Medium → 20', lg: 'Large → 24' }[p.size || 'sm'] })
  const ic = p.iconLeft || p.icon
  setp(t, { '✏️ Label': label, '👁️ Label': !p.hideLabel, '👁️ Icon-L': Boolean(ic), '👁️ Icon-R': Boolean(p.iconRight), ...(ic ? { '↪ Icon-L': (await iconComp(ic)).id } : {}), ...(p.iconRight ? { '↪ Icon-R': (await iconComp(p.iconRight)).id } : {}) })
  t.name = 'Tag · ' + label
  return t
}
//#end

//#el TextField
RENDER.TextField = async (p) => {
  const f = await make('L3: input field & text Box', { State: p.status === 'error' ? 'Error' : p.status === 'success' ? 'Success' : p.disabled ? 'Disabled' : p.value ? 'Typed' : 'Default', isInputBox: p.multiline ? 'True' : 'False' })
  setp(f, { '✏️ Label': p.label, '👁️ Label': true, Description: Boolean(p.helperText), '✏️ Helper text': p.helperText, '✏️ Input text': p.value, '✏️ Placeholder text': p.placeholder, 'Icon - L': Boolean(p.iconLeft), 'Icon - R': Boolean(p.iconRight), '👁️ Required': Boolean(p.required), ...(p.iconLeft ? { '↪ Icon-L': (await iconComp(p.iconLeft)).id } : {}), ...(p.iconRight ? { '↪ Icon-R': (await iconComp(p.iconRight)).id } : {}) })
  f.name = 'Field · ' + p.label
  return f
}
//#end

//#el Stepper
RENDER.Stepper = async (p) => {
  const s = await make('L3: Stepper', { Size: p.size === 'lg' ? 'Large' : 'Small' })
  setp(s, { '✏️ Value': p.text || groupIN(Number(p.value) || 0, p.decimals ?? 0), '👁️ Sublabel': Boolean(p.sublabel), '✏️ Sublabel': p.sublabel })
  const v = Number(p.value)
  if (p.min !== undefined && v <= p.min) { const d = sub(s, 'Decrease'); if (d) setp(d, { State: 'Disabled' }) }
  if (p.max !== undefined && v >= p.max) { const d = sub(s, 'Increase'); if (d) setp(d, { State: 'Disabled' }) }
  s.name = 'Stepper · ' + (p.label || '')
  return s
}
//#end

//#el Switch
RENDER.Switch = async (p) => make('L3→ Toggle switch', { '↔ On': p.checked ? 'True' : 'False', '👆 State': 'Enabled', isSmall: p.size === 'sm' ? 'True' : 'False' })
//#end

//#el Checkbox
RENDER.Checkbox = async (p) => make('L3: Radio button & check box', { '👆 State': p.indeterminate ? 'Intermediate' : p.checked ? 'selected' : 'default', Disabled: p.disabled ? 'True' : 'False', isRadio: 'False' })
//#end

//#el Radio
RENDER.Radio = async (p) => make('L3: Radio button & check box', { '👆 State': p.checked ? 'selected' : 'default', Disabled: p.disabled ? 'True' : 'False', isRadio: 'True' })
//#end

//#el Aerobar
RENDER.Aerobar = async (p, c) => {
  const a = await make('L3: aerobar - toast', { isPrimary: p.emphasis === 'primary' ? 'True' : 'False', Type: { primary: 'Primary', discover: 'Discover', danger: 'Danger', success: 'Success', warning: 'Warning' }[p.type || 'discover'], isFloating: p.floating ? 'True' : 'False' })
  const para = p.paragraph || textOf(c)
  setp(a, { '👁️ Heading': Boolean(p.heading), 'Headline text': p.heading, '👁️ Paragraph': Boolean(para), 'Paragraph text': para || undefined, '👁️ Icon-L': p.icon !== false, '👁️ Action-r': Boolean(p.action) })
  if (typeof p.icon === 'string') { const s = slot(a, /icon-L/i); if (s) clear(s).appendChild(await icon(p.icon, 20, p.emphasis === 'primary' ? 'inverted' : 'primary')) }
  if (p.action) { const b = sub(a, /Button|Action/); if (b) { await fontsIn(b); setp(b, { '✏️ Label': p.action.label || p.action }) } }
  a.name = 'Aerobar · ' + String(p.heading || para || '').slice(0, 24)
  return a
}
//#end

//#el EmptyState
RENDER.EmptyState = async (p) => {
  const e = await make('L3 → Empty state', {})
  setp(e, { '✏️ Heading': p.title, '✏️ Description': p.description || '' })
  const cta = sub(e, /CTA|Button/)
  if (cta) { if (p.action) { await fontsIn(cta); setp(cta, { '✏️ Label': p.action.label || p.action, '👁️ Icon-L': false, '👁️ Icon-R': false }) } else cta.visible = false }
  return e
}
//#end

//#el ProgressBar
RENDER.ProgressBar = async (p) => {
  const b = await make('L3: Progress bar', { Type: p.type === 'range' ? 'Range' : 'Progress', Size: p.size === 'md' ? 'Medium' : 'Small', Status: { success: 'Success', warning: 'Warning', error: 'Error' }[p.status] || 'Default' })
  const n = sub(b, /Progress fill|Range marker/)
  if (n) setp(n, { Value: String(Math.max(0, Math.min(100, Math.round((Number(p.value) || 0) / 10) * 10))) })
  return b
}
//#end

//#el Skeleton
RENDER.Skeleton = async (p) => make('L3: Skeleton', { Shape: { line: 'Line', circle: 'Circle', box: 'Box' }[p.shape || 'line'], isOnGrey: p.onGrey ? 'True' : 'False' })
//#end

//#el SkeletonListRow
RENDER.SkeletonListRow = async () => make('L3: Skeleton pattern', { Type: 'List row' })
//#end

//#el SkeletonCard
RENDER.SkeletonCard = async () => make('L3: Skeleton pattern', { Type: 'Card' })
//#end

//#el Chart uses Tabs
RENDER.Chart = async (p, c, ctx) => {
  const ch = await make('L3: Chart', { Type: { candle: 'Candle', line: 'Line', area: 'Area' }[p.type || 'candle'], Trend: p.trend === 'down' ? 'Down' : 'Up' })
  setp(ch, { '👁️ Volume': p.showVolume ?? true, '👁️ Grid': p.showGrid ?? true, '👁️ Axes': p.showAxes ?? true, '👁️ Last price': p.showLastPrice ?? true, '✏️ Last price': p.lastPrice })
  if (!p.ranges) return ch
  const s = await box('chart', 'col', { gap: 12 })
  s.appendChild(ch); FILL(ch)
  const w = await box('ranges', 'col', { pad: 'page' }); s.appendChild(w); FILL(w)
  const t = await tabs({ appearance: 'pill-group', items: p.ranges, value: p.range ?? 0 }, [], { ...ctx, inset: true }); w.appendChild(t); FILL(t)
  return s
}
//#end

//#el Sparkline
RENDER.Sparkline = async (p) => make('L3: Sparkline', { Trend: p.trend === 'down' ? 'Down' : 'Up' })
//#end

//#el BottomNavbar
RENDER.BottomNavbar = async (p) => make('L3: Bottom Navbar', { Tab: { stocks: 'Stocks', market: 'Market', portfolio: 'Portfolio', mf: 'MF', fno: 'F&O', 'mf-funds': 'MF - Funds', 'mf-dashboard': 'MF - Dashboard', 'mf-sips': 'MF - SIPs', 'fno-option-chain': 'F&O - Option Chain', 'fno-positions': 'F&O - Positions', 'fno-scalper': 'F&O - Scalper' }[p.value || 'stocks'] || p.value })
//#end

//#el BrandLogo
RENDER.BrandLogo = async (p) => make('L3 → Brand logo', { Brand: { lemonn: '🍋 Lemonn', zing: '⭐ Zing', coinswitch: 'Coinswitch' }[p.brand || 'lemonn'], isFull: p.variant === 'icon' ? 'False' : 'True' })
//#end

//#el Keyboard
RENDER.Keyboard = async (p) => make('L3: System keyboard', { isNumeric: p.numeric ? 'True' : 'False' })
//#end

//#el SystemStatusbar
RENDER.SystemStatusbar = async (p) => make('L3: System statusbar', { isDark: p.dark ? 'True' : 'False' })
//#end

//#el DatePicker
RENDER.DatePicker = async (p) => { const d = await make('L3: Date picker', { Mode: p.mode === 'range' ? 'Range' : 'Single' }); if (p.month) setp(d, { '✏️ Month': p.month }); return d }
//#end

//#el Placeholder
RENDER.Placeholder = async (p) => { const f = await box(p.label || 'image', 'col', { bg: 'surface/secondary', radius: 12 }); f.resize(100, p.height || 160); f.primaryAxisAlignItems = 'CENTER'; f.counterAxisAlignItems = 'CENTER'; f.appendChild(await text(p.label || 'Image', 'Description/12', 'tertiary')); return f }
//#end

//#el BottomSheet uses Button
// A bottom sheet over the screen: Overlay (scrim) → container slot (bottom-aligned) → L3: Bottom sheet.
RENDER.sheetOver = async (f, el, ctx, level) => {
  const p = el.p
  const ov = await make('L3: Overlay', { Version: 'Latest' })
  f.appendChild(ov); ov.layoutPositioning = 'ABSOLUTE'; ov.x = 0; ov.y = 0; ov.resize(f.width, f.height)
  const cs = slot(ov, /container slot/i); cs.primaryAxisAlignItems = 'MAX'
  const sh = await make('L3: Bottom sheet', { isBottom: p.placement === 'top' ? 'False' : 'True', Version: 'Latest' })
  cs.appendChild(sh); FILL(sh)
  const hp = isEl(p.header) ? p.header.p : p, lg = hp.size === 'lg'
  const hd = sub(sh, 'L3: Bottom sheet header')
  setp(sh, { '👁️ Header': Boolean(hp.heading), '👁️ Content Slot': kidsOf(el.c).length > 0, '👁️ Utility slot': Boolean(p.utility) })
  if (hd && hp.heading) {
    setp(hd, { isSmall: lg ? 'False' : 'True', Version: 'Latest' })
    await fontsIn(hd)
    const o = { '✏️ Heading': hp.heading, '👁️ Description': Boolean(hp.description), '✏️ Description': hp.description, '👁️ Back button': Boolean(hp.back || level > 0) }
    if (lg) { o['👁️ H-Icon'] = Boolean(hp.icon); o['👁️ header tag'] = Boolean(hp.tag) } else { o['👁️ info'] = Boolean(hp.info); o['👁️ Action - rigth'] = Boolean(hp.trailing); o['👁️ Content bottom'] = Boolean(hp.bottom) }
    setp(hd, o)
    if (lg && hp.icon) { const s = slot(hd, /^H-Icon$/i); if (s) clear(s).appendChild(await iconOrEl(hp.icon, 64, hp.iconColor || 'primary', ctx)) }
    if (!lg && hp.trailing) { const s = slot(hd, /right slot/i); if (s) clear(s).appendChild(await render(isEl(hp.trailing) ? hp.trailing : { t: 'Button', p: { variant: 'ghost', size: 'sm' }, c: [String(hp.trailing)] }, ctx)) }
    if (!lg && hp.bottom) { const s = slot(hd, /Content bottom/i); if (s) { const t = await render(hp.bottom, { ...ctx, inset: true }); clear(s).appendChild(t); FILL(t) } }
  }
  const content = slot(sh, /^content slot$/i)
  if (content) { clear(content); await place(el.c, content, { ...ctx, page: false, inset: true }) }
  if (p.utility) { const s = slot(sh, /Utility slot/i); if (s) { clear(s); await place([].concat(p.utility), s, { ...ctx, page: false, inset: true }) } }
  const dock = sub(sh, 'Buttons')
  const foot = isEl(p.footer) && p.footer.t === 'ButtonGroup' ? p.footer : { t: 'ButtonGroup', p: {}, c: elems(p.footer) }
  const btns = foot.c.filter((x) => x.t === 'Button')
  if (dock) {
    if (!btns.length) dock.visible = false
    else {
      setp(dock, { Direction: foot.p.direction === 'horizontal' ? '→ Horizontal' : '↓ Vertical' })
      const w = clear(slot(dock, /wrapper/i))
      for (const b of btns) { const n = await button({ ...b.p, size: 'lg' }, b.c, { ...ctx, dock: true }); w.appendChild(n); FILL(n); if (foot.p.direction === 'horizontal') n.layoutGrow = 1 }
    }
  }
  sh.name = 'Sheet · ' + (hp.heading || '')
  return sh
}
//#end
