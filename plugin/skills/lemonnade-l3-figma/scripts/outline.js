// L3 outline — read-only intake for redesigns: turns existing screens (old D2 or L3) into a compact text outline —
// instances with their meaningful props, text, layout (direction · gap · padding), repeats collapsed (×N). Replaces
// screenshots + get_metadata + get_design_context for "what is on this screen" (≈ 0.5–1.5k tokens per screen).
// `npm run kit -- outline <id> [<id> …] [--depth 8]` writes outline.figma.js; paste it as one use_figma call.
const PH = /^(Label|Label goes here|Heading|Description|Type description|Sub label|Value|Headline text|Paragraph text|Title|Placeholder|Helper text|Input text)$/
function props(i) {
  const o = []
  let cp = {}
  try { cp = i.componentProperties } catch {}
  for (const [k, v] of Object.entries(cp)) {
    const n = k.split('#')[0].replace(/^(✏️|👁️|↪|\s)+/u, '').trim()
    if (v.type === 'VARIANT') { if (!/^(Version|Property 1)$/.test(n)) o.push(`${n}=${v.value}`) }
    else if (v.type === 'TEXT') { if (!PH.test(String(v.value).trim())) o.push(`${n}="${String(v.value).replace(/\s+/g, ' ').slice(0, 48)}"`) }
    else if (v.type === 'BOOLEAN' && v.value === false) o.push('-' + n)
  }
  return o.join(' ')
}
const sig = (n) => `${n.type}|${n.name}|${Math.round(n.width)}x${Math.round(n.height)}`
// slots of this instance, including those of its structural nested instances (Actionbar → Content → ✏️ Heading), but
// not slots inside slot content (they're listed when that content is walked)
const ownSlots = (inst) => inst.findAll((x) => x.type === 'SLOT' && (() => { for (let p = x.parent; p; p = p.parent) { if (p.id === inst.id) return true; if (p.type === 'SLOT') return false } return false })())
function walk(n, d, out, opt) {
  if (out.length >= opt.max || !n.visible) return
  const pad = '  '.repeat(d)
  if (n.type === 'TEXT') { const s = n.characters.replace(/\s+/g, ' ').trim(); if (s) out.push(`${pad}"${s.slice(0, 70)}"`); return }
  if (n.type === 'INSTANCE') {
    out.push(`${pad}⧉ ${n.name} ${props(n)}`.trimEnd())
    // texts that aren't component properties (direct overrides) still matter
    if (d < opt.depth) for (const s of ownSlots(n)) if (s.children.length) { out.push(`${pad}  ⌗ ${s.name}`); kids(s.children, d + 2, out, opt) }
    return
  }
  if ('children' in n) {
    const al = n.layoutMode && n.layoutMode !== 'NONE' ? `${n.layoutMode === 'VERTICAL' ? '↓' : '→'}${n.itemSpacing || 0}${n.paddingTop || n.paddingLeft ? ` p${[n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].join('/')}` : ''}` : ''
    out.push(pad + `▢ ${n.name} ${al} ${Math.round(n.width)}×${Math.round(n.height)}`.replace(/\s+/g, ' '))
    if (d < opt.depth) kids(n.children, d + 1, out, opt)
    return
  }
  out.push(`${pad}${n.type.toLowerCase()} ${n.name}`)
}
function kids(list, d, out, opt) {
  let prev = null, rep = 0
  for (const c of list) {
    const g = sig(c)
    if (g === prev) { rep++; continue }
    if (rep) out[out.length - 1] += ` ×${rep + 1}`
    rep = 0; prev = g
    walk(c, d, out, opt)
  }
  if (rep) out[out.length - 1] += ` ×${rep + 1}`
}
// eslint-disable-next-line no-unused-vars -- called by the line kit.ts appends: return await outline()
async function outline() {
  const res = []
  for (const id of IDS) {
    const n = await figma.getNodeByIdAsync(id)
    if (!n) { res.push(`${id}: not found`); continue }
    const out = []
    walk(n, 0, out, { depth: OPT.depth || 9, max: OPT.max || 160 })
    res.push(out.join('\n'))
  }
  return res.join('\n\n')
}
