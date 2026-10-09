// L3 registry — bundled 2026-10-09 by scripts/figma/bundle.ts (source: scripts/figma/registry.js)
const CONFIG = {"nodeIds":["PUT-NODE-IDS-HERE"]}
const DATA = {"l3ColorPrefix":"🔷 L3/color/","library":{}}
const lines = []
for (const page of figma.root.children.filter((p) => p.name.trim().startsWith('↪'))) {
await page.loadAsync()
const nodes = page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] }).filter((n) => n.type === 'COMPONENT_SET' || n.parent.type !== 'COMPONENT_SET')
for (const n of nodes) {
const props = Object.entries(n.componentPropertyDefinitions).map(([k, v]) =>
v.type === 'VARIANT' ? `${k}=[${v.variantOptions.join('|')}]` : `${k.split('#')[0]}:${v.type}`)
lines.push([n.name, n.id, n.key, page.name.trim().replace(/^↪\s+/, ''), await n.getPublishStatusAsync(), props.join('; ')].join(' ¦ '))
}
}
const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => `${s.name} ¦ ${s.key}`)
const effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => `${s.name} ¦ ${s.key}`)
const collections = (await figma.variables.getLocalVariableCollectionsAsync()).map((c) => `${c.name} ¦ ${c.key} ¦ ${c.modes.map((m) => m.name).join(', ')}`)
return { components: lines, textStyles, effectStyles, collections }