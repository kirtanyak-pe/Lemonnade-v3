// L3 Figma core — shared helpers for scripts/figma/*.js. Plain JavaScript for the Figma MCP `use_figma` tool.
// Not run on its own: `node scripts/figma/bundle.ts <script>` prepends CONFIG, DATA and this file to the script.
//
// Speed rules baked in (see docs/PLAYBOOK.md § Efficiency):
//   · one page per call, one traversal per root, never a query per node
//   · every lookup (main component, variable, style, import) is cached and resolved in parallel
//   · bounds are compared by numbers; screenshots are only for sampling
//   · mutating scripts are idempotent and respect CONFIG.budgetMs, so a re-run finishes an interrupted one

const T0 = Date.now()
const timeLeft = () => (CONFIG.budgetMs ?? 50000) - (Date.now() - T0)
const SKIP = Symbol('skip')

// ---- Pages & roots ----------------------------------------------------------
// The plugin can switch page once per call: resolve every root first, refuse roots on several pages.
async function resolveRoots(ids) {
  if (!ids || !ids.length) throw new Error('CONFIG.nodeIds is empty — pass the section / frame / page ids to work on')
  const nodes = await Promise.all(ids.map((id) => figma.getNodeByIdAsync(id)))
  const missing = ids.filter((id, i) => !nodes[i])
  if (missing.length) throw new Error('Nodes not found: ' + missing.join(', '))
  const pageOf = (n) => { let p = n; while (p && p.type !== 'PAGE') p = p.parent; return p }
  const pages = [...new Set(nodes.map(pageOf))]
  if (pages.length > 1) throw new Error('Roots are on several pages (' + pages.map((p) => p.name).join(' · ') + '). Run one call per page — in parallel.')
  await figma.setCurrentPageAsync(pages[0])
  return { roots: nodes, page: pages[0] }
}

// ---- Traversal ----------------------------------------------------------------
// Visits every node once (iterative, no recursion limits). visit() may return SKIP to not descend.
function walk(root, visit) {
  const stack = [root]
  while (stack.length) {
    const n = stack.pop()
    if (visit(n) === SKIP) continue
    if ('children' in n) for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i])
  }
}

// Where can a node be edited? 'free' (normal layer), 'slot' (slot content — editable per instance) or
// 'instance' (a sublayer of an instance — only its main component can be edited).
function editContext(n) {
  let p = n.parent
  while (p && p.type !== 'PAGE') {
    if (p.type === 'SLOT') return { kind: 'slot' }
    if (p.type === 'INSTANCE') return { kind: 'instance', instance: p }
    p = p.parent
  }
  return { kind: 'free' }
}

// ---- Main components (cached) ---------------------------------------------------
const mainByInst = new Map()
async function mainInfo(inst) {
  if (mainByInst.has(inst.id)) return mainByInst.get(inst.id)
  const m = await inst.getMainComponentAsync().catch(() => null)
  let info = null
  if (m) {
    const set = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : null
    const owner = set || m
    info = {
      comp: m, set, name: owner.name, key: owner.key, remote: m.remote,
      variant: m.name.includes('=') ? Object.fromEntries(m.name.split(', ').map((s) => s.split('='))) : null,
      hasSlots: Object.values(owner.componentPropertyDefinitions || {}).some((d) => d.type === 'SLOT'),
    }
  }
  mainByInst.set(inst.id, info)
  return info
}
async function mainInfos(insts) {
  for (let i = 0; i < insts.length; i += 200) await Promise.all(insts.slice(i, i + 200).map(mainInfo))
}
// Measured on a 21k-node page: one getMainComponentAsync costs ~0.7 s the first time a component is seen (library
// components are fetched), so resolving 1,241 instances took ~37 s. Fast path, in order:
//   1. an instance named exactly like an L3 registry component ('L3: Button') or the icons library ('D2 → add') is
//      trusted from its name + its own variantProperties — no fetch (approx: true);
//   2. other instances are grouped by their component-property ids ('✏️ Label#4630:11' is unique per component),
//      else by name + variant keys; the first and last of each group are resolved, the rest reuse them if both agree.
// Anything you are about to CHANGE must be resolved exactly (mainByInst.delete(id), then mainInfo) — swap.js does.
function trustedInfo(i, vp) {
  const c = REG.get(i.name)
  if (c) return { comp: null, set: null, name: c.name, key: c.key, remote: true, variant: vp, approx: true, trusted: true }
  // icons are small — local components can share the 'D2 → ' prefix (D2 → F&O portfolio), so size decides
  if (/^D2 → /.test(i.name) && i.width <= 48 && i.height <= 48) return { comp: null, set: null, name: i.name, key: 'icon:' + i.name, remote: true, variant: vp, approx: true, trusted: true, icon: true }
  return null
}
async function mainInfosFast(insts, opts) {
  const trust = !opts || opts.trustNames !== false
  const groups = new Map()
  for (const i of insts) {
    if (mainByInst.has(i.id)) continue
    let vp = null, cp = null
    try { vp = i.variantProperties } catch (e) {}
    if (trust) { const t = trustedInfo(i, vp); if (t) { mainByInst.set(i.id, t); continue } }
    try { cp = i.componentProperties } catch (e) {}
    const ids = cp ? Object.keys(cp).filter((k) => k.includes('#')).sort().join(',') : ''
    const sig = (ids || i.name) + '|' + (vp ? Object.keys(vp).sort().join(',') : '')
    if (!groups.has(sig)) groups.set(sig, [])
    groups.get(sig).push([i, vp])
  }
  const reps = []
  for (const g of groups.values()) { reps.push(g[0][0]); if (g.length > 1) reps.push(g[g.length - 1][0]) }
  await mainInfos(reps)
  for (const g of groups.values()) {
    if (g.length <= 2) continue
    const a = mainByInst.get(g[0][0].id), b = mainByInst.get(g[g.length - 1][0].id)
    if (a && b && a.key === b.key) { for (const [i, vp] of g.slice(1, -1)) mainByInst.set(i.id, { ...a, variant: vp || a.variant, approx: true }) }
    else await mainInfos(g.map(([i]) => i))
  }
}

// ---- L3 library (registry in DATA.library) ----------------------------------------
const REG = new Map(((DATA.library && DATA.library.components) || []).map((c) => [c.name, c]))
const L3_KEYS = new Set([...REG.values()].map((c) => c.key))
const isL3Name = (name) => /^\.?L3[\s:→-]/.test(name)
const imported = new Map()
async function l3Import(name) {
  if (imported.has(name)) return imported.get(name)
  const c = REG.get(name)
  if (!c) throw new Error('Not in docs/migration/figma-library.json: ' + name)
  let node = null
  try { node = await figma.importComponentSetByKeyAsync(c.key) } catch (e) {
    try { node = await figma.importComponentByKeyAsync(c.key) } catch (e2) {
      throw new Error(`Can't import "${name}" (registry status ${c.status}). Publish it from the ✅ Lemonnade V3 library, then re-run.`)
    }
  }
  imported.set(name, node)
  return node
}
const parseVariant = (name) => Object.fromEntries(name.split(', ').map((s) => s.split('=')))
function pickVariant(setOrComp, props) {
  if (setOrComp.type !== 'COMPONENT_SET') return setOrComp
  const want = Object.entries(props || {})
  const hit = setOrComp.children.find((k) => { const p = parseVariant(k.name); return want.every(([a, b]) => p[a] === String(b)) })
  if (!hit) throw new Error(`${setOrComp.name} has no variant ${JSON.stringify(props)}`)
  return hit
}
const propKey = (node, label) => Object.keys(node.componentProperties || {}).find((k) => k === label || k.split('#')[0] === label)

// ---- Old colour → L3 token (normalised names, role-aware entries, patterns) -------------------------
// Old files use 'D2/color/text/secondary', 'color/text/secondary' or '❌ [Discontinued] button/…' for the same thing.
const normName = (name) => name.replace(/^(D2|D3|🍋 D3|Dash)\//, '').replace(/❌ \[Discontinued\] /, '')
const COLOUR_INDEX = new Map(Object.entries(DATA.colors || {}).map(([k, v]) => [normName(k), v]))
const COLOUR_PATTERNS = ((DATA.colorPatterns || [])).map((p) => [new RegExp(p.re), p.to])
// role: 'content' (text, icons) | 'surface' (fills) | 'border' (strokes). Returns a token, '#context' or null.
function colourFor(name, role) {
  let m = COLOUR_INDEX.get(normName(name))
  if (!m) { const n = normName(name); for (const [re, to] of COLOUR_PATTERNS) if (re.test(n)) { m = n.replace(re, to); break } }
  if (m && typeof m === 'object') m = m[role] || m.surface || m.content || null
  return m || null
}

// ---- Variables & styles (cached) ---------------------------------------------------
let libVarKeys = null
async function loadLibVarKeys() {
  if (libVarKeys) return libVarKeys
  const cols = DATA.library.collections
  const lists = await Promise.all([cols.theme.key, cols.number.key].map((k) => figma.teamLibrary.getVariablesInLibraryCollectionAsync(k)))
  libVarKeys = new Map(lists.flat().map((v) => [v.name, v.key]))
  return libVarKeys
}
const l3Vars = new Map()
async function l3Var(name) { // '🔷 L3/color/surface/primary' or 'spacing/12'
  if (l3Vars.has(name)) return l3Vars.get(name)
  const keys = await loadLibVarKeys()
  const key = keys.get(name)
  const v = key ? await figma.variables.importVariableByKeyAsync(key) : null
  l3Vars.set(name, v)
  return v
}
const color = (token) => l3Var(DATA.l3ColorPrefix + token)
const varsById = new Map()
async function varById(id) {
  if (!varsById.has(id)) varsById.set(id, await figma.variables.getVariableByIdAsync(id).catch(() => null))
  return varsById.get(id)
}
// Bind a variable to a paint with the RESOLVED colour as its base — a black base renders black in main components.
function boundPaint(paint, variable, consumer) {
  const r = variable.resolveForConsumer(consumer || figma.currentPage).value
  return figma.variables.setBoundVariableForPaint({ ...paint, type: 'SOLID', color: { r: r.r, g: r.g, b: r.b } }, 'color', variable)
}
const styles = new Map()
async function l3TextStyle(name) { // 'Label/12'
  if (styles.has(name)) return styles.get(name)
  const key = DATA.library.textStyles[name]
  const s = key ? await figma.importStyleByKeyAsync(key) : null
  if (s) await figma.loadFontAsync(s.fontName)
  styles.set(name, s)
  return s
}
async function styleName(id) {
  if (!id || typeof id !== 'string') return null
  if (!styles.has('#' + id)) styles.set('#' + id, await figma.getStyleByIdAsync(id).catch(() => null))
  const s = styles.get('#' + id)
  return s ? s.name : null
}
const l3StyleOf = (name) => { const m = name && name.match(/(Heading|Label|Description)\/(\d+)$/); return m && /L3/.test(name) ? m[1] + '/' + m[2] : null }
// Text styles by KEY: a style id is 'S:<key>,<node>', so read the key — never fetch. getStyleByIdAsync cost 44 s on its
// first call (F&O file, 2026-10-09), and names lie: the old library has 'L3/extrabold - Heading/20' (not an L3 style).
// L3 styles are exactly the keys in DATA.library.textStyles; any other style is an old one. Use styleName() only when a
// script really needs an old style's name (migrate-tokens with CONFIG.styleNames).
const L3_STYLE_BY_KEY = new Map(Object.entries((DATA.library && DATA.library.textStyles) || {}).map(([name, key]) => [key, name]))
const styleKeyOf = (id) => { const m = typeof id === 'string' && /^S:([0-9a-f]+),/.exec(id); return m ? m[1] : null }
const l3StyleOfId = (id) => L3_STYLE_BY_KEY.get(styleKeyOf(id)) || null // 'Label/12' or null

// Fonts: never wait on a missing font (it stalls ~40s) — callers skip those texts.
const fontsLoaded = new Set()
async function loadFonts(texts) {
  const need = new Map()
  for (const t of texts) if (!t.hasMissingFont) for (const f of t.getRangeAllFontNames(0, t.characters.length)) need.set(f.family + '|' + f.style, f)
  await Promise.all([...need].filter(([k]) => !fontsLoaded.has(k)).map(([k, f]) => figma.loadFontAsync(f).then(() => fontsLoaded.add(k)).catch(() => {})))
}

// ---- Tokens for numbers ---------------------------------------------------------------
const pad2 = (n) => String(Math.round(n)).padStart(2, '0')
async function spacingVar(px) { return DATA.scales.spacing.includes(px) ? l3Var('spacing/' + pad2(px)) : null }
// Set a padding/gap and bind it to spacing/NN when that token exists. Returns false if the value has no token.
async function setSpacing(node, prop, px) {
  node[prop] = px
  const v = await spacingVar(px)
  if (v) node.setBoundVariable(prop, v)
  return Boolean(v) || px === 0
}

// ---- Geometry ---------------------------------------------------------------------------
const box = (n) => ({ x: n.absoluteTransform[0][2], y: n.absoluteTransform[1][2], w: n.width, h: n.height })
const sameBox = (a, b, tol = 0.5) => ['x', 'y', 'w', 'h'].every((k) => Math.abs(a[k] - b[k]) <= tol)
const isScreen = (n) => (n.type === 'FRAME' || n.type === 'INSTANCE' || n.type === 'COMPONENT') && n.width >= 340 && n.width <= 430 && n.height >= 500
const childIndex = (n) => n.parent.children.findIndex((c) => c.id === n.id) // indexOf fails on instance sublayers

// ---- Paint helpers --------------------------------------------------------------------------
const solid = (paints) => (Array.isArray(paints) ? paints.find((p) => p.type === 'SOLID' && p.visible !== false) : null)
const hex = (p) => '#' + [p.color.r, p.color.g, p.color.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
async function paintToken(paints) { // '🔷 L3/color/surface/secondary' → 'surface/secondary', a raw paint → '#rrggbb', none → null
  const p = solid(paints); if (!p) return null
  const b = p.boundVariables && p.boundVariables.color
  if (!b) return hex(p)
  const v = await varById(b.id)
  return v ? v.name.replace(DATA.l3ColorPrefix, '') : '?'
}

// ---- Structural classifier ----------------------------------------------------------------------
// Recognises hand-drawn (or local-component) versions of L3 components from their structure, not their names.
// Returns { kind, to, confidence, why } or null. Kinds match the swap.js adapters.
const ICON_SWAP = /Switch arrow toggle|unfold_more|expand_more|keyboard_arrow_down|arrow_drop_down/i
const SIGNED = /^[+\-−]\s?₹?\s?[\d,]+(\.\d+)?%?(\s?\([+\-−]?\s?[\d.,]+%\))?$/
const visibleKids = (n) => ('children' in n ? n.children.filter((c) => c.visible && !/state (layer|interaction)/i.test(c.name)) : [])
function classify(n) {
  if (n.type === 'TEXT') {
    const t = n.characters.trim()
    if (SIGNED.test(t)) return { kind: 'price-change', to: 'L3: Price change', confidence: 0.8, why: 'signed number text' }
    return null
  }
  if (!('children' in n) || n.type === 'COMPONENT_SET') return null
  const kids = visibleKids(n)
  const texts = kids.filter((k) => k.type === 'TEXT')
  const horiz = n.layoutMode === 'HORIZONTAL'
  // Select: [text, ↕/⌄ icon]
  if (horiz && kids.length === 2 && kids[0].type === 'TEXT' && kids[1].type === 'INSTANCE' && ICON_SWAP.test(kids[1].name))
    return { kind: 'select', to: 'L3: Select', confidence: 0.9, why: 'text followed by a ↕/⌄ icon' }
  // Stepper: [−] value [+] with a number in the middle
  if (horiz && kids.length >= 3 && kids.length <= 4 && n.width < 160 && n.height <= 48 &&
      n.findOne((c) => c.type === 'TEXT' && /^\d[\d,]*$/.test(c.characters)) &&
      n.findAll((c) => /add|plus|remove|minus/i.test(c.name)).length >= 2)
    return { kind: 'stepper', to: 'L3: Stepper', confidence: 0.9, why: '−/+ buttons around a number' }
  // Count badge: tiny pill/circle with 1–3 digits (no L3 component — a gap)
  if (n.width <= 28 && n.height <= 24 && texts.length === 1 && /^\d{1,3}\+?$/.test(texts[0].characters.trim()) && solid(n.fills))
    return { kind: 'badge', to: null, confidence: 0.7, why: 'tiny filled shape with a count' }
  // Progress / range bar: a thin wide track with a shorter fill or a marker
  if (n.height <= 16 && n.width >= 60 && kids.length >= 2 && kids.length <= 4 && kids.every((k) => k.height <= 16) && kids.some((k) => Math.abs(k.width - n.width) < 2))
    return { kind: 'progress', to: 'L3: Progress bar', confidence: 0.6, why: 'thin full-width track plus a shorter layer' }
  // Chart: many thin bars (candles) or a long stroked polyline — size gate first; native findAllWithCriteria (fast)
  // A real chart has price labels and its marks fill most of its height — so decorative candle art (no labels) and the
  // block around a chart (chart + buttons) don't match (dogfood: F&O "graph" 360×354 vs the chart inside, 360×226).
  if (n.width >= 200 && n.height >= 100 && n.height <= 480 && n.type !== 'INSTANCE') {
    const barNodes = n.findAllWithCriteria({ types: ['RECTANGLE'] }).filter((c) => c.width <= 8 && c.height >= 1)
    const lineNodes = barNodes.length < 15 ? n.findAllWithCriteria({ types: ['VECTOR'] }).filter((c) => c.width >= 150 && c.height >= 30 && solid(c.strokes) && !solid(c.fills)) : []
    const marks = barNodes.length >= 15 ? barNodes : lineNodes
    const labels = n.findAllWithCriteria({ types: ['TEXT'] }).filter((t) => /^[\d,.]+$/.test(t.characters.trim())).length
    if (marks.length && labels >= 3) {
      const ys = marks.map((c) => c.absoluteTransform[1][2]), ye = marks.map((c) => c.absoluteTransform[1][2] + c.height)
      if ((Math.max(...ye) - Math.min(...ys)) / n.height >= 0.6)
        return { kind: 'chart', to: 'L3: Chart', confidence: 0.7, why: barNodes.length >= 15 ? `${barNodes.length} candle-like bars + price labels` : 'stroked polyline + price labels' }
    }
  }
  // Button: single-label filled pill/rect 28–56 tall
  if (n.type !== 'INSTANCE' && n.height >= 28 && n.height <= 56 && texts.length === 1 && kids.length <= 3 && solid(n.fills) && (n.cornerRadius || 0) >= 4 && n.width <= 360)
    return { kind: 'button', to: 'L3: Button', confidence: 0.6, why: 'filled rounded box with one label' }
  // List row: [visual] [text column] [trailing], 40–72 tall, wide
  if (horiz && n.width >= 280 && n.height >= 40 && n.height <= 72 && kids.length >= 2 && kids.length <= 5) {
    const col = kids.find((k) => k.type === 'FRAME' && k.layoutMode === 'VERTICAL' && k.findAllWithCriteria({ types: ['TEXT'] }).length >= 1)
    const lead = kids[0]
    if (col && lead !== col && lead.width <= 40 && lead.height <= 40)
      return { kind: 'list-row', to: 'L3: list cell', confidence: 0.7, why: 'leading visual + text column' }
  }
  // Card: rounded container with padding and content
  const r = typeof n.cornerRadius === 'number' ? n.cornerRadius : 0
  const fill = solid(n.fills), stroke = solid(n.strokes)
  if (n.type !== 'INSTANCE' && n.layoutMode && n.layoutMode !== 'NONE' && r >= 8 && (fill || stroke) && n.width >= 120 && n.findOne((c) => c.type === 'TEXT') && (n.paddingTop || 0) >= 8) {
    const type = n.effects && n.effects.some((e) => e.visible !== false && e.type === 'DROP_SHADOW') ? 'Clickable' : stroke ? 'Static' : 'Filled'
    return { kind: 'card', to: 'L3: Card', variant: { Type: type, isPadded: 'True' }, confidence: 0.6, why: `rounded ${type.toLowerCase()} container` }
  }
  return null
}

// Which swap strategy fits each L3 target (containers wrap their content into the slot; rebuilds read the old content).
const STRATEGY_FOR = {
  'L3: Card': 'slot-wrap', 'L3: Button Dock': 'slot-wrap', 'L3: Select': 'select', 'L3: Stepper': 'stepper',
  'L3: list cell': 'list-cell', 'L3: Price change': 'price-change', 'L3: Chart': 'chart',
}
const strategyFor = (to, kind) => STRATEGY_FOR[to] || ({ card: 'slot-wrap', 'list-row': 'list-cell' })[kind] || kind || 'variant-swap'

// Phase timer: every script reports where its time went, so the next optimisation targets the real hot spot.
const T = {}
let tLast = Date.now()
const mark = (k) => { const now = Date.now(); T[k] = (T[k] || 0) + (now - tLast); tLast = now }
