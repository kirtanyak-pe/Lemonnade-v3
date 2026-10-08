// L3 audit — READ-ONLY. Inventories a section / frame / page and returns a phased migration plan.
// CONFIG: { nodeIds: ['10874:19460'], examples: 3 }        (all roots on ONE page; run pages in parallel)
//
// One traversal per root, tracking which instance (if any) owns each layer:
//   · tokens:      every bound variable → old (D2/Dash/…) vs L3; raw colours by role with the nearest L3 token
//   · text:        L3 style / old style / no style; fonts that aren't Manrope
//   · components:  instances grouped by main: L3 (ok / ❌ Discontinued), current icons, other libraries, local
//   · hand-drawn:  layers whose structure matches an L3 component (classify() in lib/core.js)
//   · mismatches:  signed numbers whose colour contradicts the sign (e.g. "−0.68%" in green)
// Output: summary + phases + ready-to-edit swap rules for scripts/figma/swap.js.

const { roots, page } = await resolveRoots(CONFIG.nodeIds)
const EX = CONFIG.examples ?? 3
const OLD_COLS = new Set(DATA.oldCollections)

const top = [], nested = [], freeLayers = [], texts = [], screens = []
const boundCount = new Map() // variable id → uses
const raw = new Map()         // 'role|#hex' → uses
let nodes = 0
const roleOf = (n, prop) => (prop === 'strokes' ? 'border' : n.type === 'TEXT' || (n.parent && /icon|vector/i.test(n.parent.name) && n.type === 'VECTOR') ? 'content' : 'surface')
const boundRole = new Map() // variable id → role it is used as (first seen)
const countPaints = (n, prop, inScreen) => {
  const ps = n[prop]
  if (!Array.isArray(ps)) return
  for (const p of ps) {
    if (p.visible === false) continue
    const b = p.boundVariables && p.boundVariables.color
    if (b) { boundCount.set(b.id, (boundCount.get(b.id) || 0) + 1); if (!boundRole.has(b.id)) boundRole.set(b.id, roleOf(n, prop)) }
    else if (p.type === 'SOLID' && n.visible && inScreen) { const k = roleOf(n, prop) + '|' + hex(p); raw.set(k, (raw.get(k) || 0) + 1) } // annotations outside screens don't count
  }
}

mark('start')
for (const root of roots) {
  const stack = [[root, null, false]]
  while (stack.length) {
    const [n, owner, inScr] = stack.pop()
    nodes++
    const here = inScr || isScreen(n)
    if ('fills' in n) countPaints(n, 'fills', here)
    if ('strokes' in n) countPaints(n, 'strokes', here)
    if (n.boundVariables) for (const [prop, b] of Object.entries(n.boundVariables)) if (b && b.id && prop !== 'fills' && prop !== 'strokes') boundCount.set(b.id, (boundCount.get(b.id) || 0) + 1)
    if (n.type === 'TEXT' && here) texts.push(n) // text stats only for product UI, not annotations
    if (isScreen(n) && !owner && !inScr) screens.push(n)
    if (n.type === 'INSTANCE') (owner ? nested : top).push([n, owner])
    else if (!owner && n.type !== 'SECTION' && n.type !== 'PAGE' && n !== root && here) freeLayers.push(n)
    if ('children' in n) {
      const childOwner = n.type === 'SLOT' ? null : n.type === 'INSTANCE' ? n : owner
      for (let i = n.children.length - 1; i >= 0; i--) stack.push([n.children[i], childOwner, here])
    }
  }
}

mark('traverse')
// ---- Components -------------------------------------------------------------------------
await mainInfosFast([...top, ...nested].map(([i]) => i))
mark('mains')
const groups = new Map()
for (const [inst, owner] of [...top, ...nested]) {
  const m = await mainInfo(inst)
  const key = m ? m.key : 'missing'
  if (!groups.has(key)) groups.set(key, { name: m ? m.name : '(missing main)', key, remote: m ? m.remote : null, top: 0, nested: 0, owners: new Set(), discontinued: 0, examples: [], main: m })
  const g = groups.get(key)
  owner ? (g.nested++, g.owners.add(owner.name)) : g.top++
  if (m && m.variant && /Discontinued/.test(m.variant.Version || '')) g.discontinued++
  if (g.examples.length < EX) g.examples.push(inst.id)
}
// Name hints win over structure when the name is explicit; order matters (specific before generic).
// Whole words only: 'arrow_forward' must not match 'row'.
const NAME_HINTS = [
  [/\b(button ?group|button ?dock|cta ?bar|ctas?)\b/i, 'L3: Button Dock'], [/\b(action ?bar|app ?bar|header|top ?bar)\b/i, 'L3: Actionbar'],
  [/\b(bottom ?nav(bar)?|tab ?bar|navbar)\b/i, 'L3: Bottom Navbar'], [/\b(pills?|chips?)\b/i, 'L3: base tab', { isPill: 'True' }],
  [/\b(tabs?|segment(ed)?)\b/i, 'L3: Tabs group'], [/\bbuttons?\b/i, 'L3: Button'], [/\b(toast|snack ?bar|aerobar|banner|alert)\b/i, 'L3: aerobar - toast'],
  [/\b(bottom ?sheet|sheet|modal|dialog)\b/i, 'L3: Bottom sheet'], [/\b(tags?|badges?)\b/i, 'L3: Tags'], [/\b(input|text ?field|search)\b/i, 'L3: input field & text Box'],
  [/\b(toggle|switch)\b/i, 'L3→ Toggle switch'], [/\b(check ?box|radio)\b/i, 'L3: Radio button & check box'], [/\b(list|row|cell)\b/i, 'L3: list cell'],
  [/\b(card|tile|panel)\b/i, 'L3: Card'], [/\bempty\b/i, 'L3 → Empty state'], [/\blogos?\b/i, 'L3 → Brand logo'], [/\b(stepper|quantity|qty)\b/i, 'L3: Stepper'],
  [/\b(select|dropdown|picker)\b/i, 'L3: Select'], [/\b(skeleton|shimmer|loader|loading)\b/i, 'L3: Skeleton'], [/\b(progress|meter)\b/i, 'L3: Progress bar'],
  [/\b(chart|graph|candles?|sparkline)\b/i, 'L3: Chart'], [/\b(date|calendar)\b/i, 'L3: Date picker'], [/\b(overlay|scrim|backdrop)\b/i, 'L3: Overlay'],
  [/\b(price ?change|delta|returns?)\b/i, 'L3: Price change'], [/\bstatus ?bar\b/i, 'L3: System statusbar'],
]
const GENERIC = /^(frame|group|component|rectangle|instance|icon|vector)\b/i
const hint = (name) => { if (GENERIC.test(name)) return null; const h = NAME_HINTS.find(([re]) => re.test(name)); return h ? { to: h[1], variant: h[2] } : null }
// A small vector-only component from another library is an icon → the 👁️ Lemonnade V3 → Icons twin ('D2 → <name>').
const isIconComp = (c) => c && c.width <= 32 && c.height <= 32 && !c.findOne((x) => x.type === 'TEXT')
const iconName = (name) => name.toLowerCase().replace(/^.*[→/]\s*/, '').trim().replace(/[\s-]+/g, '_')

const l3 = [], icons = [], foreign = [], local = [], missing = []
for (const g of groups.values()) {
  const row = { name: g.name, uses: g.top + g.nested, nestedInInstances: g.nested, insideOf: [...g.owners].slice(0, 3), examples: g.examples }
  if (!g.main) { missing.push(row); continue }
  if (L3_KEYS.has(g.key) || (g.remote && isL3Name(g.name))) { if (g.discontinued) row.discontinued = g.discontinued; l3.push(row) }
  else if (g.remote && (g.main.icon || /^D2 → /.test(g.name) || (g.main.comp && /^D2 → /.test(g.main.comp.name)))) icons.push(row) // icons library (sets too, e.g. Switch arrow toggle)
  else {
    const comp = g.main.comp || (await (async () => { const inst = [...top, ...nested].find(([x]) => mainByInst.get(x.id) === g.main); return inst ? (await inst[0].getMainComponentAsync()) : null })())
    let h = hint(g.name)
    // a single tab / pill is a base tab, not a whole Tabs group (sandbox caught 85×40 → 328×56)
    if (h && h.to === 'L3: Tabs group' && comp && comp.width < 200) h = { to: 'L3: base tab', variant: { isPill: comp.cornerRadius >= 12 ? 'True' : 'False' } }
    const c = h ? null : comp && classify(comp)
    if (g.remote && !h && isIconComp(comp)) { row.suggest = 'Icons: D2 → ' + iconName(g.name); row.strategy = 'icon-swap'; row.why = 'small vector-only component — find its key with search_design_system, then swap with toKey' }
    else {
      row.suggest = h ? h.to : c ? c.to : null
      if (h && h.variant) row.variant = h.variant
      if (c) { row.why = c.why; if (c.variant) row.variant = c.variant }
      row.strategy = strategyFor(row.suggest, c && c.kind)
    }
    row.local = !g.remote
    ;(g.remote ? foreign : local).push(row)
  }
}

mark('group')
// ---- Hand-drawn look-alikes and sign/colour mismatches ------------------------------------
const hand = new Map(), mismatches = []
for (const n of freeLayers) {
  if (isScreen(n) || n.width > 430) continue // screens and canvases are containers, not components
  const c = classify(n)
  if (!c) continue
  if (!hand.has(c.kind)) hand.set(c.kind, { kind: c.kind, to: c.to, count: 0, examples: [], why: c.why })
  const h = hand.get(c.kind); h.count++; if (h.examples.length < EX) h.examples.push(n.id)
}
for (const t of texts) {
  const s = t.characters.trim()
  if (!SIGNED.test(s)) continue
  const tok = await paintToken(t.fills)
  if (!tok || tok[0] === '#') continue
  const neg = /^[\-−]/.test(s), pos = /^\+/.test(s)
  if ((neg && /up|success|profit/.test(tok)) || (pos && /down|error|loss/.test(tok))) mismatches.push({ id: t.id, text: s, colour: tok })
}

mark('classify')
// ---- Tokens -----------------------------------------------------------------------------------
const ids = [...boundCount.keys()]
const vs = []
for (let i = 0; i < ids.length; i += 200) vs.push(...(await Promise.all(ids.slice(i, i + 200).map(varById))))
const colIds = [...new Set(vs.filter(Boolean).map((v) => v.variableCollectionId))]
const cols = await Promise.all(colIds.map((id) => figma.variables.getVariableCollectionByIdAsync(id).catch(() => null)))
const colName = new Map(colIds.map((id, i) => [id, cols[i] ? cols[i].name : '?']))
let oldColour = 0, oldNumber = 0, l3Bound = 0
const unmapped = new Map()
vs.forEach((v, i) => {
  if (!v) return
  const uses = boundCount.get(ids[i]), cn = colName.get(v.variableCollectionId)
  if (OLD_COLS.has(cn) || /^(D2|Dash|D3|🍋 D3)\//.test(v.name) || (!/L3/.test(cn || '') && /^color\//.test(v.name))) {
    if (v.resolvedType === 'COLOR') { oldColour += uses; if (!colourFor(v.name, boundRole.get(ids[i]) || 'surface')) unmapped.set(v.name, (unmapped.get(v.name) || 0) + uses) } else oldNumber += uses
  } else l3Bound += uses
})
const nearest = (role, h) => {
  const toRgb = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16))
  const [r, g, b] = toRgb(h)
  let best = null
  for (const [tok, val] of Object.entries(DATA.colorsLight || {})) {
    if (!tok.startsWith(role) && !(role === 'content' && tok.startsWith('surface/accent'))) continue
    if (val.length !== 7) continue
    const [r2, g2, b2] = toRgb(val), d = Math.hypot(r - r2, g - g2, b - b2)
    if (!best || d < best.d) best = { tok, d } // compare unrounded; ties keep the earlier (indicator before status)
  }
  return best ? `${best.tok}${best.d === 0 ? ' (exact)' : ` (Δ${Math.round(best.d)})`}` : null
}
const rawTop = [...raw].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, uses]) => { const [role, h] = k.split('|'); return { role, colour: h, uses, nearest: nearest(role, h) } })

mark('tokens')
// ---- Text -----------------------------------------------------------------------------------------
let l3Text = 0, oldText = 0, noStyle = 0, mixed = 0, nonManrope = 0
for (const t of texts) { // L3 or not from the style key in the id — no style fetches
  if (typeof t.textStyleId !== 'string') { mixed++; continue }
  if (l3StyleOfId(t.textStyleId)) l3Text++; else if (t.textStyleId) oldText++; else noStyle++
  if (t.fontName !== figma.mixed && t.fontName.family !== 'Manrope') nonManrope++
}

// ---- Plan -------------------------------------------------------------------------------------------
const rules = []
for (const r of local.concat(foreign)) if (r.suggest) rules.push({ id: r.name, match: { mainName: r.name }, to: r.suggest, ...(r.variant ? { variant: r.variant } : {}), strategy: r.strategy || 'variant-swap', note: `${r.uses} uses${r.nestedInInstances ? `, ${r.nestedInInstances} inside instances → main-edit` : ''} — check the target variant before running` })
// containers first, inner layers last (a list row is swapped before the price text inside it)
const ORDER = ['card', 'list-row', 'stepper', 'select', 'price-change']
for (const k of ORDER) { const h = hand.get(k); if (h && h.to) rules.push({ id: 'hand-drawn ' + h.kind, match: { signature: h.kind }, to: h.to, ...(h.kind === 'card' ? { variant: { Type: 'Static', isPadded: 'True' } } : {}), strategy: strategyFor(h.to, h.kind), note: `${h.count} found — dry-run first; check the Card Type per example` }) }
const discontinued = l3.reduce((s, r) => s + (r.discontinued || 0), 0)

return {
  page: page.name,
  summary: { nodes, screens: screens.length, instances: top.length + nested.length, texts: texts.length },
  phases: [
    { phase: 1, step: 'Tokens + text styles → scripts/figma/migrate-tokens.js', oldColourBindings: oldColour, oldNumberBindings: oldNumber, l3Bindings: l3Bound, unmappedOldColours: [...unmapped].slice(0, 15), rawColours: rawTop, text: { l3: l3Text, oldStyle: oldText, noStyle, mixedStyles: mixed, nonManrope } },
    { phase: 2, step: 'Latest variants → swap.js strategy "latest"', discontinuedInstances: discontinued },
    { phase: 3, step: 'Other libraries → L3 (variant-swap)', components: foreign },
    { phase: 4, step: 'Local components + hand-drawn → L3 (swap.js rules below; dry-run, then sandbox, then run)', local, handDrawn: [...hand.values()] },
    { phase: 5, step: 'Gaps — no L3 component: follow the reuse ladder (PLAYBOOK §2) before creating anything', gaps: [...hand.values()].filter((h) => !h.to), noSuggestion: local.concat(foreign).filter((r) => !r.suggest).map((r) => r.name) },
  ],
  mismatches,
  l3Components: l3.sort((a, b) => b.uses - a.uses).slice(0, 25),
  currentIcons: icons.reduce((s, r) => s + r.uses, 0),
  missingMains: missing.length,
  suggestedRules: rules,
  ms: Date.now() - T0,
  timing: (mark('text'), T),
}
