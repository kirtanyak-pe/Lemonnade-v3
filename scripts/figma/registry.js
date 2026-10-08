// L3 registry export — run on the ✅ Lemonnade V3 LIBRARY file (lxQ6QIXGOv5mmx0khh5sJn) through use_figma.
// Lists every component set / component on the "↪ …" component pages: name, node id, key, publish status and
// properties, one compact line each. Save the lines into docs/migration/figma-library.json ("components"), then run
// `node scripts/figma/bundle.ts verify-registry` in a CONSUMER file to prove every key imports (catches copy errors).
// Read-only.

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
