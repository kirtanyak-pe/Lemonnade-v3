// Verify the registry — run in any CONSUMER file (one that uses the library). Imports every component and text
// style by its key from docs/migration/figma-library.json and checks the names, so a typo in a key can't survive.
// Imports only; no layers change. UNPUBLISHED components fail until the library is published (expected).
const comps = DATA.library.components
const res = await Promise.all(comps.map(async (c) => {
  try {
    let n
    try { n = await figma.importComponentSetByKeyAsync(c.key) } catch { n = await figma.importComponentByKeyAsync(c.key) }
    return n.name === c.name ? { ok: c.name } : { bad: `${c.name}: key imports "${n.name}"` }
  } catch (e) { return c.status === 'PRIVATE' ? { private: c.name } : c.status === 'UNPUBLISHED' ? { pending: c.name } : { bad: `${c.name} (${c.status}): ${String(e).split('\n')[0].slice(0, 80)}` } }
}))
const styleRes = await Promise.all(Object.entries(DATA.library.textStyles).map(async ([name, key]) => {
  try { const s = await figma.importStyleByKeyAsync(key); return s.name.endsWith(name) ? { ok: name } : { bad: `${name}: key imports "${s.name}"` } } catch (e) { return { bad: name + ': ' + String(e).slice(0, 60) } }
}))
return {
  components: { ok: res.filter((r) => r.ok).length, private: res.filter((r) => r.private).length, pendingPublish: res.filter((r) => r.pending).map((r) => r.pending), bad: res.filter((r) => r.bad).map((r) => r.bad) },
  textStyles: { ok: styleRes.filter((r) => r.ok).length, bad: styleRes.filter((r) => r.bad).map((r) => r.bad) },
}
