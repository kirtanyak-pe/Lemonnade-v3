// Reuse-first component finder. Describe the NEED, get the L3 component(s) or recipe to use — before building anything.
//
//   npm run find -- "dropdown to pick the order type"
//   npm run find -- "quantity with plus minus" --json
//
// Searches public/agent-docs/components.json (names, Figma names, alternative names, descriptions, props) and the
// recipes in docs/patterns/recipes.json, with synonyms ("modal" → bottom sheet, "chip" → tabs, "spinner" → skeleton).
// A weak best match prints the reuse ladder (docs/PLAYBOOK.md §2) instead of inviting a new component.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

type Comp = { id: string; title: string; group: string; description: string; altNames: string[]; exports: string[]; source: string; figma: { name?: string; nodeId: string; key?: string; status?: string } | null; props: string[]; tokens: string[]; docs: string }
type Recipe = { id: string; need: string; keywords: string; use: string[]; how: string }

const root = join(import.meta.dirname, '..')
const indexFile = join(root, 'public/agent-docs/components.json')
if (!existsSync(indexFile)) { console.error('Missing public/agent-docs/components.json — run `npm run agent-docs` first.'); process.exit(1) }
const index = JSON.parse(readFileSync(indexFile, 'utf8')) as { components: Comp[]; recipes: Recipe[] }

const args = process.argv.slice(2)
const json = args.includes('--json')
const query = args.filter((a) => !a.startsWith('--')).join(' ').trim()
if (!query) { console.error('Usage: npm run find -- "<what you need>" [--json]'); process.exit(1) }

// Words people use → words the system uses. Expansions score at 0.7.
const SYNONYMS: Record<string, string[]> = {
  dropdown: ['select', 'picker'], picker: ['select'], combobox: ['select'], menu: ['select', 'list'],
  modal: ['sheet', 'bottom sheet', 'overlay'], dialog: ['sheet', 'confirm'], popup: ['sheet'], drawer: ['sheet'], popover: ['sheet'],
  toast: ['aerobar'], snackbar: ['aerobar'], notification: ['aerobar'], banner: ['aerobar'], alert: ['aerobar'], message: ['aerobar'],
  chip: ['tabs', 'pill'], chips: ['tabs', 'pill'], segmented: ['tabs', 'pill-group'], segment: ['tabs'], filter: ['tabs', 'pill'], toggle: ['switch', 'tabs'],
  badge: ['tag'], label: ['tag'], status: ['tag', 'aerobar'], pill: ['tabs', 'tag'],
  spinner: ['skeleton', 'loading'], loader: ['skeleton', 'loading'], loading: ['skeleton'], shimmer: ['skeleton'], placeholder: ['skeleton'],
  counter: ['stepper'], quantity: ['stepper'], qty: ['stepper'], lots: ['stepper'], increment: ['stepper'], decrement: ['stepper'], plus: ['stepper'], minus: ['stepper'],
  calendar: ['date', 'date picker'], date: ['date picker'], period: ['date picker'], range: ['date picker', 'progress'],
  graph: ['chart'], candle: ['chart'], candlestick: ['chart'], trend: ['chart', 'sparkline'], spark: ['sparkline'],
  delta: ['price change'], change: ['price change'], percent: ['price change'], gain: ['price change'], loss: ['price change'], returns: ['price change'], pnl: ['price change'], 'p&l': ['price change'],
  header: ['actionbar'], topbar: ['actionbar'], appbar: ['actionbar'], toolbar: ['actionbar'], navigation: ['navbar', 'bottom navbar'], tabbar: ['bottom navbar'],
  input: ['text field'], textfield: ['text field'], textbox: ['text field'], form: ['text field'], search: ['actionbar', 'text field'],
  checkbox: ['checkbox'], radio: ['radio'], 'on/off': ['switch'],
  row: ['list cell'], item: ['list cell'], cell: ['list cell'], list: ['list cell'],
  tile: ['card'], panel: ['card', 'filled'], container: ['card'], box: ['card'], section: ['card'],
  grey: ['filled', 'card'], gray: ['filled', 'card'], inset: ['filled', 'card'], details: ['card', 'key stats'], stats: ['key stats', 'card'], info: ['card', 'aerobar'],
  ticket: ['order pad'], trade: ['order pad', 'button'], order: ['order pad'],
  empty: ['empty state'], nothing: ['empty state'], zero: ['empty state'],
  logo: ['brand logo'], brand: ['brand logo'],
  progress: ['progress bar'], meter: ['progress bar'], usage: ['progress bar'], limit: ['progress bar'], margin: ['progress bar'],
  scrim: ['overlay'], backdrop: ['overlay'], dim: ['overlay'],
  cta: ['button'], action: ['button'], submit: ['button'], buy: ['button'], sell: ['button'],
  dock: ['button group'], footer: ['button group'], sticky: ['button group'],
}
const STOP = new Set(['a', 'an', 'the', 'for', 'with', 'to', 'of', 'in', 'on', 'and', 'or', 'i', 'need', 'want', 'show', 'shows', 'display', 'screen', 'ui', 'component', 'that', 'this', 'which', 'some', 'my', 'user', 'users', 'can', 'is', 'it', 'be', 'like'])
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9&/+\- ]/g, ' ')
const stem = (w: string) => w.replace(/(ies)$/, 'y').replace(/(ing|es|s)$/, '')
// Generic words describe many components — they count, but less (dogfood: 'grey box grouping' ranked Checkbox first).
const GENERIC = new Set(['box', 'group', 'grouping', 'item', 'section', 'container', 'thing', 'element', 'view', 'area', 'block', 'something'])
const words = norm(query).split(/\s+/).filter((w) => w && !STOP.has(w))
const terms: [string, number][] = []
for (const w of words) { const base = GENERIC.has(w) ? 0.4 : 1; terms.push([w, base]); for (const x of SYNONYMS[w] ?? SYNONYMS[stem(w)] ?? []) terms.push([x, 0.7]) }

const has = (field: string, term: string) => {
  const f = norm(field)
  if (term.includes(' ')) return f.includes(term)
  return f.split(/\s+/).some((t) => t === term || stem(t) === stem(term) || (term.length >= 4 && t.startsWith(term)))
}
function score(fields: [string, number][]) {
  let s = 0
  const why = new Set<string>()
  for (const [term, w] of terms) for (const [field, fw] of fields) if (field && has(field, term)) { s += fw * w; why.add(term); break }
  return { s, why: [...why] }
}

const comps = index.components.map((c) => ({ c, ...score([
  [c.title, 5], [c.figma?.name ?? '', 4], [c.id.replace(/-/g, ' '), 3], [c.altNames.join(' , '), 3], [c.description, 1.5], [c.props.join(' '), 1], [c.group, 0.5],
]) })).filter((r) => r.s > 0).sort((a, b) => b.s - a.s)
const recs = index.recipes.map((r) => ({ r, ...score([[r.need, 4], [r.keywords, 3], [r.use.join(' '), 1.5], [r.how, 1]]) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s)

const STRONG = 4
const best = Math.max(comps[0]?.s ?? 0, recs[0]?.s ?? 0)
if (json) {
  console.log(JSON.stringify({ query, terms, components: comps.slice(0, 5).map(({ c, s, why }) => ({ score: Number(s.toFixed(1)), why, ...c })), recipes: recs.slice(0, 3).map(({ r, s, why }) => ({ score: Number(s.toFixed(1)), why, ...r })), strong: best >= STRONG }, null, 1))
  process.exit(0)
}
const figmaLink = (id: string) => `https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=${id.replace(':', '-')}`
console.log(`\nNeed: "${query}"\n`)
if (comps.length) {
  console.log('Components')
  for (const { c, s, why } of comps.slice(0, 5)) {
    console.log(`  ${c.title.padEnd(16)} ${s.toFixed(1).padStart(5)}  matched: ${why.join(', ')}`)
    console.log(`    ${c.description}`)
    console.log(`    code:  import { ${c.exports.join(', ')} } from '${c.source.replace(/^src\//, '../')}'`)
    if (c.figma) console.log(`    figma: ${c.figma.name ?? ''} ${c.figma.key ? `key ${c.figma.key}` : ''}${c.figma.status === 'UNPUBLISHED' ? ' (publish pending)' : ''} · ${figmaLink(c.figma.nodeId)}`)
    if (c.props.length) console.log(`    props: ${c.props.slice(0, 8).join(' · ')}`)
    console.log(`    docs:  ${c.docs}`)
  }
}
if (recs.length) {
  console.log('\nRecipes (compose existing components)')
  for (const { r, s } of recs.slice(0, 3)) console.log(`  ${r.need} (${s.toFixed(1)})\n    use:  ${r.use.join(' + ')}\n    how:  ${r.how}`)
}
if (best < STRONG) {
  console.log(`\nNo strong match (best ${best.toFixed(1)} < ${STRONG}). Follow the reuse ladder before creating anything (docs/PLAYBOOK.md §2):
  1. Re-describe the need by its JOB ("pick one of 4 order types"), not its look ("grey rounded box") — search again.
  2. Configure: a variant / prop / slot of an existing component.
  3. Compose: a recipe of existing components (add it to docs/patterns/recipes.json).
  4. Extend: a new variant of an existing component — only if it has the same job.
  5. Create: only a genuinely new job, needed in 3+ places. Write the spec first (PLAYBOOK §6).`)
}
console.log('')
