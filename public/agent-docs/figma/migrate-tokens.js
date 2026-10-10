// L3 migrate-tokens — bundled 2026-10-10 by scripts/figma/bundle.ts (source: scripts/figma/migrate-tokens.js)
const CONFIG = {"nodeIds":["PUT-NODE-IDS-HERE"]}
const DATA = {"l3ColorPrefix":"🔷 L3/color/","library":{"collections":{"theme":{"key":"74a00b0383b9dcf4ccf633e940e443afce63f150"},"number":{"key":"153c75385bdea4519b7bd77b251f882e703f0a67"},"density":{"key":"57834be47c14055d172ed2ff53157d88d9cc8ded"}},"textStyles":{"Heading/10":"8e2b0479d5702e77fda457a0fe5846b52457e4eb","Heading/12":"e50cc92c287f626e98202ac365ee74f9b676066d","Heading/14":"d94decf9cddcd1f18814a7a6891e1b31f095359a","Heading/16":"7bf0e29fdd8261e0ad919cf314ffd44b62e39b6e","Heading/18":"920ff58f2bb9d7db7534fdd62794d4a3a7cba022","Heading/20":"d3c084cd8be5043e2eeb0c2aa7f3ef39964e4bdd","Heading/24":"350ee6e5d6d0293063d3c1d1194e86f8a6f73a4e","Heading/28":"8a76f39ad42b8b93d513309a91b5bb5381e497bd","Heading/32":"d5688c40049759cf859e4c4350337a0e7620ef94","Heading/36":"621fde7ba2a68a188266385c1dbe4f98ad7140c6","Label/10":"c72e1d813064646a33dd4984d193e884f962d841","Label/12":"be4de0d0749a1b04fac1f7003c3d7d30871e9b86","Label/14":"fca6319f73cd0c719e555ff6211d8eac572391cd","Label/16":"aa326fa70be1b19b8f2f5e2a76c97ca882415d1c","Label/18":"27164b82be42cf5572ea26f9390b0beb84f91b74","Description/10":"41e537ef196e3f6c7a41160bc351a1e828cac6ec","Description/12":"b5ef18cf01de261caf8a098999ef8ca6a856b187","Description/14":"07e9642b31f572c4f7ba260081520cb84ed76639","Description/16":"51c4e42999d8b214be4053f42f7a2a7e14fcbf9a","Description/18":"92febe1c89e02fe70aaa030de67ed58f49eddbad"}},"colors":{"D2/color/text/primary":"content/primary","D2/color/text/secondary":"content/secondary","D2/color/text/tertiary":"content/secondary","D2/color/text/quarternary":"content/secondary","D2/color/text/default":"content/primary","D2/color/text/disabled":"content/disabled","D2/color/text/only-white":"static/white","D2/color/text/light":"content/inverted","D2/color/text/brand":"surface/accent/brand-default","D2/color/text/indicator-up":"content/accent/indicator/up-default","D2/color/text/indicator-down":"content/accent/indicator/down-default","D2/color/text/discover":"content/accent/discover-default","D2/color/text/error":"content/accent/error-default","D2/color/text/success":"content/accent/success-default","D2/color/text/warning":"content/accent/warning-default","D2/color/text/accent/honey":"content/accent/warning-default","D2/color/text/processing":"content/accent/orange-default","D2/color/icon/primary":"content/primary","D2/color/icon/default":"content/primary","D2/color/icon/only-black":"content/primary","D2/color/icon/secondary":"content/secondary","D2/color/icon/tertiary":"content/secondary","D2/color/icon/quarternary":"content/secondary","D2/color/icon/disabled":"content/disabled","D2/color/icon/light":"content/inverted","D2/color/icon/brand":"surface/accent/brand-default","D2/color/icon/enable":"content/accent/success-default","D2/color/icon/sucess":"content/accent/success-default","D2/color/icon/discover":"content/accent/discover-default","D2/color/icon/error":"content/accent/error-default","D2/color/icon/indicator-up":"content/accent/indicator/up-default","D2/color/icon/indicator-down":"content/accent/indicator/down-default","D2/color/icon/accent/teal":"border/accent/teal-light","D2/color/Surface/primary":"surface/primary","D2/color/Surface/default":"surface/default","D2/color/background/primary":"surface/default","D2/color/Surface/secondary":"surface/secondary","D2/color/background/tertiary":"surface/secondary","D2/color/background/Secondary":"surface/secondary","D2/color/Surface/tertiary":"surface/tertiary","D2/color/Surface/quarternary":"surface/quaternary","D2/color/Surface/dark":"surface/inverted","D2/color/Surface/disabled":"surface/disabled","D2/color/Surface/success":"surface/accent/success-default","D2/color/Surface/error":"surface/accent/error-default","D2/color/Surface/discover":"surface/accent/discover-default","D2/color/Surface/warning":"surface/accent/warning-default","D2/color/Surface/accent/blue":"surface/accent/discover-light","D2/color/Surface/accent/honey":"surface/accent/zing-light","D2/color/Surface/accent/brand":"surface/accent/brand-light","D2/color/Surface/accent/green":"#tintGreen","D2/color/Surface/accent/red":"#tintRed","D2/color/tag/secondary/green":"#tintGreen","D2/color/tag/secondary/red":"#tintRed","D2/color/tag/secondary/tangerine":"surface/accent/orange-light","D2/color/border/subtle":"border/light","D2/color/border/moderate":"border/intense","D2/color/border/intense":"border/intense","D2/color/border/dark":"border/dark","🍋 D3/color/border/default":"border/light","D2/color/border/accent/white":"static/white","D2/color/border/accent/green":"#borderGreen","D2/color/border/accent/red":"#borderRed","D2/color/border/accent/blue":"border/accent/discover-light","D2/color/border/accent/honey":"border/accent/zing-light","D2/color/border/accent/honey-intense":"border/accent/warning-default","D2/color/border/accent/brand":"border/accent/brand-default","D2/color/border/accent/purple-intense":"border/accent/purple-default","D2/local/state-layer/dark/default":"component/state-layer/dark/default","color/icon/only-black":"content/primary","color/text/light":"content/inverted","🔷 L3/color/content/primary":"content/primary","color/hue/honey/300":"extra/gold/300","color/hue/honey/400":"extra/gold/400","color/extra/white":"static/white","D2/color/icon/only-white":"static/white","color/hue/honey/200":"extra/gold/200","D2/color/tag/secondary/blue":"surface/accent/discover-light","D2/color/border/accent/teal":"border/accent/teal-light","color/hue/green/500":{"content":"content/accent/indicator/up-default","surface":"surface/accent/indicator/up-default","border":"border/accent/indicator/up-default"},"color/hue/red/500":{"content":"content/accent/indicator/down-default","surface":"surface/accent/indicator/down-default","border":"border/accent/indicator/down-default"},"D2/color/Surface/accent/blue-intense":"surface/accent/discover-default","D2/color/tag/primary/blue":"surface/accent/discover-default","D2/color/text/only-black":"static/black","color/base/black":"static/black","color/Lime/50":"surface/accent/brand-light","color/hue/Lime/100":"surface/accent/brand-light","color/Lime/900":{"content":"content/accent/brand-default","surface":"surface/accent/brand-default","border":"border/accent/brand-default"},"color/hue/green/400":{"content":"content/accent/indicator/up-default","surface":"surface/accent/indicator/up-default","border":"border/accent/indicator/up-default"},"color/hue/red/600":{"content":"content/accent/indicator/down-default","surface":"surface/accent/indicator/down-default","border":"border/accent/indicator/down-default"},"D2/color/Surface/accent/red-intense":"#solidRed","D2/color/border/accent/green-intense":"#borderGreenIntense","D2/color/tag/secondary/honey":"surface/accent/zing-light","color/base/alpha/black":"surface/overlay"},"colorPatterns":[{"re":"^color/❌? ?\\[?Discontinued\\]? ?button/(primary|secondary|tertiary|ghost|brand|buy|sell)/(background|bg|surface)$","to":"component/button/$1/surface"},{"re":"^color/button/(primary|secondary|tertiary|ghost|brand|buy|sell)/(background|bg|surface)$","to":"component/button/$1/surface"},{"re":"^color/button/(primary|secondary|tertiary|ghost|brand|buy|sell)/(label|icon|text|content)$","to":"component/button/$1/content"},{"re":"^color/button/(primary|secondary|tertiary|ghost|brand|buy|sell)/(border|stroke)$","to":"component/button/$1/border"},{"re":"^color/hue/honey/(\\d00)$","to":"extra/gold/$1"}],"contexts":{"tintGreen":["surface/accent/indicator/up-light","surface/accent/success-light"],"tintRed":["surface/accent/indicator/down-light","surface/accent/error-light"],"borderGreen":["border/accent/indicator/up-light","border/accent/success-light"],"borderRed":["border/accent/indicator/down-light","border/accent/error-light"],"solidRed":["surface/accent/indicator/down-default","surface/accent/error-default"],"borderGreenIntense":["border/accent/indicator/up-default","border/accent/success-default"],"statusWords":"\\b(placed|success|successful|executed|completed|failed|rejected|error|cancel+ed|verified|active|done)\\b","indicatorPattern":"[+\\-−]\\s?₹?\\d|%|P&L|\\bprofit\\b|\\bloss\\b|\\bLTP\\b|\\bMTM\\b|\\breturns?\\b|\\bbuy\\b|\\bsell\\b"},"oldCollections":["Dash → UI Colors","Tokens","Semantic tokens","🎨 L3 Theme","Base hex","PrimitiveSize","Spacing","Border radius"],"scales":{"spacing":[0,2,4,6,8,10,12,14,16,20,24,28,32,36,40,48,56,64,72,80,96],"radius":[0,2,4,6,8,12,16,20,24,32],"size":[4,8,12,16,20,24,28,32,40,48,56,64,80,96,128],"text":{"Heading":[10,12,14,16,18,20,24,28,32,36],"Label":[10,12,14,16,18],"Description":[10,12,14,16,18]}},"text":{"oldStylePattern":"(extrabold - Heading|semibold - Label)\\/(\\d+)$","numberLike":"only digits, ₹ $ . , % + − - : / ( ) x × and Cr / L / K / lakh"},"colorsLight":{"surface/default":"#ffffff","surface/primary":"#ffffff","surface/secondary":"#f4f4f4","surface/tertiary":"#e8e8e8","surface/quaternary":"#dbdbdb","surface/inverted":"#161616","surface/accent/indicator/down-light":"#fceeee","surface/accent/indicator/down-default":"#e5505f","surface/accent/indicator/up-light":"#def4ea","surface/accent/indicator/up-default":"#0f9958","surface/accent/brand-light":"#edfbbf","surface/accent/brand-default":"#b1e50e","surface/accent/error-light":"#fceeee","surface/accent/error-default":"#e5505f","surface/accent/success-light":"#def4ea","surface/accent/success-default":"#0f9958","surface/accent/warning-light":"#fdf7dc","surface/accent/warning-default":"#f6c12f","surface/accent/purple-light":"#faf8fe","surface/accent/purple-default":"#6f4ab9","surface/accent/indigo-light":"#f4f6fb","surface/accent/indigo-default":"#2c3875","surface/accent/teal-light":"#f6fcfc","surface/accent/teal-default":"#119199","surface/accent/discover-light":"#eff4fe","surface/accent/discover-default":"#256fef","surface/accent/orange-light":"#fff1e2","surface/accent/orange-default":"#e96400","surface/accent/zing-light":"#fdf2dc","surface/accent/zing-default":"#b97502","surface/accent/us-stock-light":"#eff4fe","surface/accent/us-stock-default":"#256fef","content/primary":"#161616","content/inverted":"#ffffff","content/accent/indicator/down-default":"#e5505f","content/accent/indicator/up-default":"#0f9958","content/accent/brand-default":"#779a0a","content/accent/error-default":"#e5505f","content/accent/success-default":"#0f9958","content/accent/warning-default":"#9f7502","content/accent/discover-default":"#256fef","content/accent/purple-default":"#6f4ab9","content/accent/indigo-default":"#2c3875","content/accent/teal-default":"#119199","content/accent/orange-default":"#e96400","content/accent/zing-default":"#b97502","content/accent/us-stock-default":"#256fef","border/light":"#e8e8e8","border/intense":"#dbdbdb","border/dark":"#161616","border/accent/brand-light":"#d4ed83","border/accent/brand-default":"#b1e50e","border/accent/indicator/down-light":"#f5b9b9","border/accent/indicator/down-default":"#e5505f","border/accent/indicator/up-light":"#9adebe","border/accent/indicator/up-default":"#0f9958","border/accent/success-light":"#9adebe","border/accent/success-default":"#0f9958","border/accent/error-light":"#f5b9b9","border/accent/error-default":"#e5505f","border/accent/warning-light":"#ffdf88","border/accent/warning-default":"#9f7502","border/accent/discover-light":"#cddeff","border/accent/discover-default":"#256fef","border/accent/zing-light":"#ffd688","border/accent/zing-default":"#f6bc2f","border/accent/purple-light":"#dfd2f9","border/accent/purple-default":"#6f4ab9","border/accent/indigo-light":"#b3bada","border/accent/indigo-default":"#2c3875","border/accent/teal-light":"#b6dee0","border/accent/teal-default":"#119199","border/accent/orange-light":"#ffc393","border/accent/orange-default":"#e96400","border/accent/us-stock-default":"#256fef","border/accent/us-stock-light":"#cddeff","static/white":"#ffffff","static/black":"#000000","extra/gold/50":"#fdf2dc","extra/gold/100":"#fbe5b6","extra/gold/200":"#ffd688","extra/gold/300":"#f6bc2f","extra/gold/400":"#d79900","extra/gold/500":"#b97502","extra/gold/600":"#9f6402","extra/gold/700":"#845201","extra/gold/800":"#6b4100","extra/gold/900":"#392300","component/button/buy/surface":"#b1e50e","component/button/buy/content":"#000000","component/button/buy/content-loading":"#161616","component/button/sell/surface":"#e5505f","component/button/sell/content":"#ffffff","component/button/sell/content-loading":"#161616","component/button/brand/surface":"#b1e50e","component/button/brand/content":"#000000","component/button/brand/content-loading":"#161616","component/button/primary/surface":"#161616","component/button/primary/content":"#ffffff","component/button/primary/content-loading":"#161616","component/button/secondary/surface":"#ffffff","component/button/secondary/content":"#161616","component/button/secondary/border":"#161616","component/button/secondary/surface-loading":"#ffffff","component/button/secondary/content-loading":"#161616","component/button/tertiary/surface":"#ffffff","component/button/tertiary/content":"#161616","component/button/tertiary/border":"#dbdbdb","component/button/tertiary/surface-loading":"#ffffff","component/button/tertiary/content-loading":"#161616","component/button/ghost/content":"#161616","component/button/ghost/content-loading":"#161616"}}
const T0 = Date.now()
const timeLeft = () => (CONFIG.budgetMs ?? 50000) - (Date.now() - T0)
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
const normName = (name) => name.replace(/^(D2|D3|🍋 D3|Dash)\//, '').replace(/❌ \[Discontinued\] /, '')
const COLOUR_INDEX = new Map(Object.entries(DATA.colors || {}).map(([k, v]) => [normName(k), v]))
const COLOUR_PATTERNS = ((DATA.colorPatterns || [])).map((p) => [new RegExp(p.re), p.to])
function colourFor(name, role) {
let m = COLOUR_INDEX.get(normName(name))
if (!m) { const n = normName(name); for (const [re, to] of COLOUR_PATTERNS) if (re.test(n)) { m = n.replace(re, to); break } }
if (m && typeof m === 'object') m = m[role] || m.surface || m.content || null
return m || null
}
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
const L3_STYLE_BY_KEY = new Map(Object.entries((DATA.library && DATA.library.textStyles) || {}).map(([name, key]) => [key, name]))
const styleKeyOf = (id) => { const m = typeof id === 'string' && /^S:([0-9a-f]+),/.exec(id); return m ? m[1] : null }
const l3StyleOfId = (id) => L3_STYLE_BY_KEY.get(styleKeyOf(id)) || null // 'Label/12' or null
const fontsLoaded = new Set()
async function loadFonts(texts) {
const need = new Map()
for (const t of texts) if (!t.hasMissingFont) for (const f of t.getRangeAllFontNames(0, t.characters.length)) need.set(f.family + '|' + f.style, f)
await Promise.all([...need].filter(([k]) => !fontsLoaded.has(k)).map(([k, f]) => figma.loadFontAsync(f).then(() => fontsLoaded.add(k)).catch(() => {})))
}
const pad2 = (n) => String(Math.round(n)).padStart(2, '0')
const isScreen = (n) => (n.type === 'FRAME' || n.type === 'INSTANCE' || n.type === 'COMPONENT') && n.width >= 340 && n.width <= 430 && n.height >= 500
const solid = (paints) => (Array.isArray(paints) ? paints.find((p) => p.type === 'SOLID' && p.visible !== false) : null)
const hex = (p) => '#' + [p.color.r, p.color.g, p.color.b].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
const T = {}
let tLast = Date.now()
const mark = (k) => { const now = Date.now(); T[k] = (T[k] || 0) + (now - tLast); tLast = now }
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
const wanted = new Set()
for (const id of ids) { const oi = varInfo.get(id); if (!oi || oi.type !== 'COLOR') continue; for (const role of ['content', 'surface', 'border']) { const m = colourFor(oi.name, role); if (m) (m[0] === '#' ? CTX[m.slice(1)] : [m]).forEach((x) => wanted.add(x)) } }
await Promise.all([...wanted].map(color))
for (const j of propJobs) { const oi = varInfo.get(j.id); if (oi && oi.type === 'FLOAT') { const t = numberTarget(j.prop, oi.value); if (t) await l3Var(t) } }
await loadFonts(paintNodes.filter((n) => n.type === 'TEXT'))
const topScreens = all.filter((n) => isScreen(n) && !inScreen(n))
const before = new Map(topScreens.map((s) => [s.id, [Math.round(s.width), Math.round(s.height)]]))
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
for (const [n, prop] of rawJobs) {
const role = prop === 'strokes' ? 'border' : n.type === 'TEXT' || n.type === 'VECTOR' ? 'content' : 'surface'
const p = solid(n[prop]), tok = lightByHex.get(role) && lightByHex.get(role).get(hex(p))
if (!tok) continue
if (n.type === 'TEXT') { await loadFonts([n]); if (n.hasMissingFont) continue }
const v = await color(tok); if (!v) continue
n[prop] = n[prop].map((q) => (q === p ? figma.variables.setBoundVariableForPaint(q, 'color', v) : q))
R.rawBound++
}
for (const j of propJobs) {
const oi = varInfo.get(j.id); if (!oi || oi.type !== 'FLOAT') continue
const name = numberTarget(j.prop, oi.value), nv = name && (await l3Var(name))
if (!nv) { skip('number without L3 token: ' + Math.round(oi.value) + ' @' + j.prop); continue }
try { j.n.setBoundVariable(j.prop, nv); R.numbers++ } catch (e) { skip('number error @' + j.prop) }
}
mark('colours+numbers')
R.timing = T
R.screens = topScreens.length
R.screensResized = topScreens.filter((s) => { const b = before.get(s.id); return Math.round(s.width) !== b[0] || Math.round(s.height) !== b[1] }).map((s) => ({ id: s.id, name: s.name, before: before.get(s.id), after: [Math.round(s.width), Math.round(s.height)] }))
R.textChanges = widthChanged.slice(0, 15); R.textChangesTotal = widthChanged.length
return R
}
const results = [], remaining = []
for (const r of roots) { if (timeLeft() < 5000) { remaining.push(r.id); continue } results.push(await migrate(r)) }
return { seconds: Math.round((Date.now() - T0) / 1000), results, remaining }