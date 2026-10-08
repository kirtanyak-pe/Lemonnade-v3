// L3 token migration — colours, numbers and text styles from the old libraries to L3, without changing layout.
// CONFIG: { nodeIds: [...], dryRun: false, text: true, bindRawExact: false, budgetMs: 50000, styleNames: false }
//   styleNames: true reads old text-style names (slow first fetch, ~44 s) — the default uses weight + size, same result
//   nodeIds       sections / frames on ONE page (run pages in parallel; split big pages by section)
//   dryRun        count what would change, change nothing
//   text          restyle texts to the 20 L3 text styles (inside phone screens only, ≤ 40px)
//   bindRawExact  also bind RAW colours that exactly equal an L3 token's light value, by role
//                 (text/icon → content/*, fills → surface/*, strokes → border/*)
// Proven on the F&O file: ~7.5k colours, ~1.1k numbers, ~1.6k texts, 0 screens resized. Dry run on a 21k-node page:
// 10,263 colours (99.4% mapped), 1,498 numbers, 2,688 texts in 44 s → keep each call ≤ ~10k nodes (pass sections/frames).
//
// Algorithm (one pass per root, idempotent — only what is still old is touched, so a re-run finishes a cut-off run):
//   1. Scan once: every paint/number bound to a variable, every text.
//   2. Resolve once, in parallel: old variable → L3 variable (DATA.colors / contexts / number rules), text styles, fonts.
//   3. Apply: text styles first (fonts!), then colours, then numbers.
//   4. Guards: brand text keeps exact lime; a text that would wrap is set to hug, else the lighter role, else restored;
//      hidden texts (width ≤ 2) are ignored; texts in missing fonts are skipped (loading them stalls ~40s).
//   5. Verify by numbers: screen sizes before = after; texts whose width changed > 4px are listed.

const { roots } = await resolveRoots(CONFIG.nodeIds)
const DRY = Boolean(CONFIG.dryRun)
const CTX = DATA.contexts, OLD = new Set(DATA.oldCollections), P = DATA.l3ColorPrefix
const statusRe = new RegExp(CTX.statusWords, 'i'), indicatorRe = new RegExp(CTX.indicatorPattern, 'i')
const oldStyleRe = new RegExp(DATA.text.oldStylePattern)
const SIZES = DATA.scales.text

const varInfo = new Map() // old variable id → { name, type, value } (null = not old)
async function resolveOld(ids) {
  const todo = [...ids].filter((id) => !varInfo.has(id))
  const vs = await Promise.all(todo.map(varById))
  const colIds = [...new Set(vs.filter(Boolean).map((v) => v.variableCollectionId))]
  const cols = await Promise.all(colIds.map((id) => figma.variables.getVariableCollectionByIdAsync(id).catch(() => null)))
  const colName = new Map(colIds.map((id, i) => [id, cols[i] ? cols[i].name : null]))
  for (let i = 0; i < todo.length; i++) {
    const v = vs[i], cn = v && colName.get(v.variableCollectionId)
    const old = v && (OLD.has(cn) || /^(D2|D3|🍋 D3|Dash)\//.test(v.name) || (/^color\//.test(v.name) && !/L3/.test(cn || '')) || (v.resolvedType === 'COLOR' && colourFor(v.name, 'surface')))
    if (!old) { varInfo.set(todo[i], null); continue }
    let val = v.valuesByMode[Object.keys(v.valuesByMode)[0]], hops = 0
    while (val && val.type === 'VARIABLE_ALIAS' && hops++ < 6) { const a = await varById(val.id); if (!a) break; val = a.valuesByMode[Object.keys(a.valuesByMode)[0]] }
    varInfo.set(todo[i], { name: v.name, type: v.resolvedType, value: val })
  }
}
const nearestSize = (role, s) => SIZES[role].reduce((a, b) => (Math.abs(b - s) < Math.abs(a - s) ? b : a))
const isNumber = (t) => /\d/.test(t) && t.replace(/[\d₹$.,%+\-−–:/()x×\s]|cr|lakh|L|K|Cr/gi, '').length <= 3
const numberTarget = (prop, v) => {
  v = Math.round(v)
  if (/Radius/.test(prop)) return v >= 999 ? 'radius/full' : DATA.scales.radius.includes(v) ? 'radius/' + pad2(v) : null
  if (/padding|itemSpacing|counterAxisSpacing/.test(prop)) return DATA.scales.spacing.includes(v) ? 'spacing/' + pad2(v) : null
  if (/^(width|height|minWidth|minHeight|maxWidth|maxHeight)$/.test(prop)) return DATA.scales.size.includes(v) ? 'size/' + pad2(v) : null
  return null
}
const lightByHex = new Map() // role → hex → token (first wins: surface/default before surface/primary)
for (const [tok, val] of Object.entries(DATA.colorsLight || {})) {
  const role = tok.split('/')[0]
  if (!['content', 'surface', 'border'].includes(role) || val.length !== 7) continue
  if (!lightByHex.has(role)) lightByHex.set(role, new Map())
  if (!lightByHex.get(role).has(val)) lightByHex.get(role).set(val, tok)
}

async function migrate(root) {
  const R = { root: root.name, id: root.id, colours: 0, rawBound: 0, numbers: 0, textStyled: 0, skipped: {}, notes: {} }
  const note = (k) => (R.notes[k] = (R.notes[k] || 0) + 1), skip = (k) => (R.skipped[k] = (R.skipped[k] || 0) + 1)
  const inMemo = new Map()
  const inScreen = (n) => {
    const chain = []; let p = n.parent, r = false
    while (p && p.type !== 'SECTION' && p.type !== 'PAGE') { if (inMemo.has(p.id)) { r = inMemo.get(p.id); break } chain.push(p); if (isScreen(p)) { r = true; break } p = p.parent }
    chain.forEach((c) => inMemo.set(c.id, r)); return r
  }
  const ctxMemo = new Map()
  const isStatus = (n) => {
    let a = n; for (let i = 0; i < 4 && a.parent && a.parent.type !== 'SECTION' && a.parent.type !== 'PAGE'; i++) a = a.parent
    if (ctxMemo.has(a.id)) return ctxMemo.get(a.id)
    const text = ('findAllWithCriteria' in a ? a.findAllWithCriteria({ types: ['TEXT'] }) : []).slice(0, 40).map((t) => t.characters).join(' ')
    const r = statusRe.test(text) && !indicatorRe.test(text); ctxMemo.set(a.id, r); return r
  }

  // 1. Scan once
  const all = [root, ...root.findAll(() => true)]
  const ids = new Set(), paintNodes = [], propJobs = [], texts = [], rawJobs = []
  const scanPaints = (paints) => { let has = false; for (const p of paints) if (p.boundVariables && p.boundVariables.color) { ids.add(p.boundVariables.color.id); has = true } return has }
  for (const n of all) {
    let hasPaint = false
    if ('fills' in n) {
      const f = n.fills
      if (f === figma.mixed) { if (n.type === 'TEXT') for (const s of n.getStyledTextSegments(['fills'])) if (scanPaints(s.fills)) hasPaint = true }
      else if (Array.isArray(f)) { if (scanPaints(f)) hasPaint = true; else if (CONFIG.bindRawExact && solid(f) && n.visible) rawJobs.push([n, 'fills']) }
    }
    if ('strokes' in n && Array.isArray(n.strokes)) { if (scanPaints(n.strokes)) hasPaint = true; else if (CONFIG.bindRawExact && solid(n.strokes) && n.visible) rawJobs.push([n, 'strokes']) }
    if (hasPaint) paintNodes.push(n)
    if (n.boundVariables) for (const [prop, b] of Object.entries(n.boundVariables)) {
      if (Array.isArray(b) || !b || !b.id || prop === 'fills' || prop === 'strokes' || prop === 'componentProperties') continue
      ids.add(b.id); propJobs.push({ n, prop, id: b.id })
    }
    if (n.type === 'TEXT') texts.push(n)
  }

  mark('scan')
  // 2. Resolve once
  await resolveOld(ids)
  mark('resolve')
  const roleOf = (n, prop) => (prop === 'strokes' ? 'border' : n.type === 'TEXT' || n.type === 'VECTOR' || n.type === 'BOOLEAN_OPERATION' ? 'content' : 'surface')
  const colourTarget = (n, oi, role) => {
    let m = colourFor(oi.name, role); if (!m) return null
    if (m[0] === '#') { const st = isStatus(n); note(st ? 'tint→status' : 'tint→indicator'); m = CTX[m.slice(1)][st ? 1 : 0] }
    return P + m
  }
  const textJobs = []
  if (CONFIG.text !== false) for (const t of texts) {
    const sid = t.textStyleId
    if (typeof sid !== 'string') { skip('text with mixed styles'); continue }
    if (l3StyleOfId(sid)) continue // already L3 (by style key)
    const cur = CONFIG.styleNames ? await styleName(sid) : null // old style names cost a slow first fetch; weight + size give the same role
    if (!inScreen(t)) { note('text outside screens (left as is)'); continue }
    if (t.fontSize === figma.mixed || t.fontWeight === figma.mixed) { skip('text with mixed sizes/weights'); continue }
    if (t.fontSize > 40) { note('display text > 40px (left as is)'); continue }
    let role, size
    const m = cur && cur.match(oldStyleRe)
    if (m) { role = m[1].includes('Heading') ? 'Heading' : 'Label'; size = +m[2] }
    else { const w = t.fontWeight; role = w >= 700 ? 'Heading' : w >= 600 ? 'Label' : isNumber(t.characters) ? 'Label' : 'Description'; size = t.fontSize }
    const snapped = nearestSize(role, size); if (snapped !== size) note('size snapped to scale')
    const alt = role === 'Heading' ? 'Label/' + nearestSize('Label', snapped) : role === 'Label' ? 'Description/' + nearestSize('Description', snapped) : null
    textJobs.push({ t, key: role + '/' + snapped, alt, w: t.width, h: t.height, orig: { styleId: sid, font: t.fontName, size: t.fontSize, lh: t.lineHeight, ls: t.letterSpacing, missing: t.hasMissingFont } })
  }
  if (DRY) {
    let colours = 0, numbers = 0, unmapped = new Map()
    for (const n of paintNodes) for (const prop of ['fills', 'strokes']) { const ps = n[prop]; if (!Array.isArray(ps)) continue; for (const p of ps) { const oi = p.boundVariables && p.boundVariables.color && varInfo.get(p.boundVariables.color.id); if (oi && oi.type === 'COLOR') colourFor(oi.name, roleOf(n, prop)) ? colours++ : unmapped.set(oi.name, (unmapped.get(oi.name) || 0) + 1) } }
    for (const j of propJobs) { const oi = varInfo.get(j.id); if (oi && oi.type === 'FLOAT') numberTarget(j.prop, oi.value) ? numbers++ : skip('number without L3 token: ' + Math.round(oi.value) + ' @' + j.prop) }
    let raw = 0
    for (const [n, prop] of rawJobs) { const role = prop === 'strokes' ? 'border' : n.type === 'TEXT' || n.type === 'VECTOR' ? 'content' : 'surface'; if (lightByHex.get(role) && lightByHex.get(role).has(hex(solid(n[prop])))) raw++ }
    mark('plan')
    return { ...R, dryRun: true, nodes: all.length, colours, numbers, texts: textJobs.length, rawExact: raw, unmapped: [...unmapped].sort((a, b) => b[1] - a[1]).slice(0, 20), timing: T }
  }
  await Promise.all([...new Set(textJobs.map((j) => j.key))].map(l3TextStyle))
  // Preload every possible target in parallel (all roles, both context choices) — later lookups hit the cache.
  const wanted = new Set()
  for (const id of ids) { const oi = varInfo.get(id); if (!oi || oi.type !== 'COLOR') continue; for (const role of ['content', 'surface', 'border']) { const m = colourFor(oi.name, role); if (m) (m[0] === '#' ? CTX[m.slice(1)] : [m]).forEach((x) => wanted.add(x)) } }
  await Promise.all([...wanted].map(color))
  for (const j of propJobs) { const oi = varInfo.get(j.id); if (oi && oi.type === 'FLOAT') { const t = numberTarget(j.prop, oi.value); if (t) await l3Var(t) } }
  await loadFonts(paintNodes.filter((n) => n.type === 'TEXT'))

  const topScreens = all.filter((n) => isScreen(n) && !inScreen(n))
  const before = new Map(topScreens.map((s) => [s.id, [Math.round(s.width), Math.round(s.height)]]))

  // 3a. Text styles (parallel), with the wrap guard
  const done = await Promise.allSettled(textJobs.map(async (j) => j.t.setTextStyleIdAsync((await l3TextStyle(j.key)).id)))
  const widthChanged = [], fallback = []
  const wraps = (j, st) => { const lh = st.lineHeight.unit === 'PIXELS' ? st.lineHeight.value : st.fontSize * 1.3; return j.w > 2 && j.t.height > j.h + 2 && j.h < lh * 1.6 && j.t.height >= lh * 1.8 }
  for (let i = 0; i < textJobs.length; i++) {
    const j = textJobs[i]
    if (done[i].status !== 'fulfilled') { skip('text style failed'); continue }
    R.textStyled++
    if (wraps(j, await l3TextStyle(j.key))) {
      if (j.t.textAutoResize === 'HEIGHT' && j.t.layoutSizingHorizontal !== 'FILL') { j.t.textAutoResize = 'WIDTH_AND_HEIGHT'; note('wrapping text set to hug') } else fallback.push(j)
    }
  }
  for (const j of fallback) {
    if (j.alt) { const st = await l3TextStyle(j.alt); await j.t.setTextStyleIdAsync(st.id); if (!wraps(j, st)) { note('wrapping text set to lighter style'); continue } }
    try {
      if (j.orig.missing && !j.orig.styleId) throw new Error('missing font')
      if (j.orig.styleId) await j.t.setTextStyleIdAsync(j.orig.styleId)
      else { await figma.loadFontAsync(j.orig.font); await j.t.setTextStyleIdAsync(''); Object.assign(j.t, { fontName: j.orig.font, fontSize: j.orig.size, lineHeight: j.orig.lh, letterSpacing: j.orig.ls }) }
      R.textStyled--; widthChanged.push({ id: j.t.id, text: j.t.characters.slice(0, 24), issue: 'kept old style: no L3 style fits' })
    } catch (e) { widthChanged.push({ id: j.t.id, text: j.t.characters.slice(0, 24), issue: 'wraps; could not restore (missing font)' }) }
  }
  for (const j of textJobs) { if (j.w <= 2) continue; const dw = Math.round(j.t.width - j.w); if (Math.abs(dw) > 4) widthChanged.push({ id: j.t.id, text: j.t.characters.slice(0, 24), dw }) }

  mark('text')
  // 3b. Colours
  const remap = async (n, paints, prop) => {
    let changed = false
    const out = []
    for (const p of paints) {
      const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id
      const oi = id && varInfo.get(id)
      if (!oi || oi.type !== 'COLOR') { out.push(p); continue }
      const name = colourTarget(n, oi, roleOf(n, prop)), nv = name && (await l3Var(name))
      if (!nv) { skip('colour without L3 match: ' + oi.name); out.push(p); continue }
      changed = true; R.colours++; out.push(figma.variables.setBoundVariableForPaint(p, 'color', nv))
    }
    return changed ? out : null
  }
  for (const n of paintNodes) {
    try {
      if (n.type === 'TEXT' && (n.hasMissingFont || !n.getRangeAllFontNames(0, n.characters.length).every((f) => fontsLoaded.has(f.family + '|' + f.style)))) { skip('text in a missing font (colour not changed)'); continue }
      if ('fills' in n) {
        if (n.fills === figma.mixed) { if (n.type === 'TEXT') for (const s of n.getStyledTextSegments(['fills'])) { const o = await remap(n, s.fills, 'fills'); if (o) n.setRangeFills(s.start, s.end, o) } }
        else if (Array.isArray(n.fills)) { const o = await remap(n, n.fills, 'fills'); if (o) n.fills = o }
      }
      if ('strokes' in n && Array.isArray(n.strokes)) { const o = await remap(n, n.strokes, 'strokes'); if (o) n.strokes = o }
    } catch (e) { skip('colour error: ' + e.message.split('\n')[0].slice(0, 60)) }
  }
  // 3b'. Raw colours that exactly equal an L3 token (opt-in)
  for (const [n, prop] of rawJobs) {
    const role = prop === 'strokes' ? 'border' : n.type === 'TEXT' || n.type === 'VECTOR' ? 'content' : 'surface'
    const p = solid(n[prop]), tok = lightByHex.get(role) && lightByHex.get(role).get(hex(p))
    if (!tok) continue
    if (n.type === 'TEXT') { await loadFonts([n]); if (n.hasMissingFont) continue }
    const v = await color(tok); if (!v) continue
    n[prop] = n[prop].map((q) => (q === p ? figma.variables.setBoundVariableForPaint(q, 'color', v) : q))
    R.rawBound++
  }

  // 3c. Numbers
  for (const j of propJobs) {
    const oi = varInfo.get(j.id); if (!oi || oi.type !== 'FLOAT') continue
    const name = numberTarget(j.prop, oi.value), nv = name && (await l3Var(name))
    if (!nv) { skip('number without L3 token: ' + Math.round(oi.value) + ' @' + j.prop); continue }
    try { j.n.setBoundVariable(j.prop, nv); R.numbers++ } catch (e) { skip('number error @' + j.prop) }
  }

  mark('colours+numbers')
  // 4. Verify by numbers
  R.timing = T
  R.screens = topScreens.length
  R.screensResized = topScreens.filter((s) => { const b = before.get(s.id); return Math.round(s.width) !== b[0] || Math.round(s.height) !== b[1] }).map((s) => ({ id: s.id, name: s.name, before: before.get(s.id), after: [Math.round(s.width), Math.round(s.height)] }))
  R.textChanges = widthChanged.slice(0, 15); R.textChangesTotal = widthChanged.length
  return R
}

const results = [], remaining = []
for (const r of roots) { if (timeLeft() < 5000) { remaining.push(r.id); continue } results.push(await migrate(r)) }
return { seconds: Math.round((Date.now() - T0) / 1000), results, remaining }
