# L3 playbook — migrate, audit, extend and generate (for agents and people)

How to move old designs and old code onto Lemonnade V3, how to find out what's missing, when (rarely) to create a new
component, and how to generate new screens — as algorithms with tools, not advice. Every tool below was run on real
files while it was written; the numbers quoted are measured. Read with: `AGENTS.md` (rules), `DESIGN_SYSTEM.md`
(tokens, layout), `docs/DESIGN_LANGUAGE.md` (how screens look), `docs/figma-code-map.md` (Figma ↔ code).

---

## 0. The 60-second version

```
NEED SOMETHING?   npm run find -- "<the job, in words>"          → component, recipe, or the ladder (§2)
OLD FIGMA FILE?   audit → migrate-tokens (dry → run) → swap (dry → sandbox → run) → audit again     (§4)
OLD CODE?         npm run audit:ui -- <src> → fix errors → fix warnings → tsc + build + look          (§5)
MISSING PIECE?    ladder (§2) → only then spec → Figma → code → docs → registry                       (§6)
NEW SCREEN?       npm run screen -- new <archetype> → edit spec → score ≥ 85 → gen (code) / build-screen (Figma) (§7)
AFTER ANY TASK    add what slowed you down or was wrong to docs/LEARNINGS.md, then fix the data/script (§9)
```

---

## 1. Tools

| Tool | Does | Changes things? |
|---|---|---|
| `npm run find -- "<need>"` | Ranks components + recipes for a need (synonyms: modal→sheet, chip→tabs, spinner→skeleton…). Weak match → prints the ladder. `--json` | no |
| `npm run audit:ui -- <dirs>` | Code audit: raw colour → nearest token **by role**, raw px / fonts / shadows → tokens, hand-rolled controls → L3 component, sign coloured by hand → PriceChange, hover outside `(hover: hover)`, vendored/duplicate component folders. `--json`, `--ci` | no |
| `npm run screen -- list · new · score · gen` | Screen specs → React (L3 only, token CSS, loading/empty states) + quality score | `gen` writes files outside this repo |
| `npm run figma -- <script> --config '{…}'` | Bundles a Figma script (CONFIG + DATA + core) for the Figma MCP `use_figma` tool. `--list` | — |
| Figma `registry` | Exports the library registry (run on the **library** file) | no |
| Figma `verify-registry` | Imports every key, checks names (run in a consumer file) | no (imports only) |
| Figma `audit` | Inventory + phased plan + ready swap rules for a section/page | no |
| Figma `migrate-tokens` | Old colour/number variables + text → L3 (`dryRun`, `bindRawExact`) | yes (idempotent) |
| Figma `swap` | Rule-based component swaps that keep layout (`dryRun`, `sandbox`, per-swap undo) | yes |
| Figma `build-screen` | Builds a screen spec from L3 instances (`sandbox`) | yes (or nothing in sandbox) |

Data the tools share (edit these, never one-off scripts): `docs/migration/figma-library.json` (component / style /
collection keys), `docs/migration/d2-to-l3.json` (old → L3 colours, contexts, number + text rules, component map),
`docs/patterns/recipes.json` (compositions), `docs/patterns/archetypes.json` (screen starters),
`public/agent-docs/components.json` (generated index).

---

## 2. Reuse first — the ladder

Work down the ladder and **stop at the first step that solves the job**. Most needs end at step 1–3.

1. **Use** — a component does this job. `npm run find -- "<job>"` (describe the *job* — "pick one order type" — not
   the look — "grey rounded box").
2. **Configure** — a variant, prop or slot of an existing component does it (Card `variant="filled"`, Tabs `pill-group`,
   ListCell `trailing`, Select `icon="chevron"`).
3. **Compose** — existing components together do it. Use or add a recipe in `docs/patterns/recipes.json`
   (dropdown = Select + BottomSheet + Radio rows; confirm = BottomSheet + ButtonGroup).
4. **Extend** — a new *variant* of an existing component, only if it has **the same job and semantics** (Card Filled
   was added for grey detail panels: same job as Card, new look).
5. **Create** — only when all of these are true (the "new job" test):
   - no component has this **job** (what the user does with it), **interaction** (tap → sheet, toggle, input) or
     **semantics** (button, meter, grid);
   - the difference can't be expressed as **content** (slot / text / icon) or a **variant**;
   - it is needed in **3+ places or 2+ products** (count with the Figma audit and `audit:ui`).
   Otherwise compose it in the screen and add a recipe.

Worked examples from the F&O migration: bordered asset rows → **Card Static** (use) · plain asset rows → **list cell**,
not Card Flat (use the right one) · grey detail panels → **Card Filled** (extend) · "Quantity − 100 +" → **Stepper**
(create: new job, 20 uses) · "Filters ②" count badge → **Tag sm** for now (gap logged; create only at 3+ uses).

---

## 3. Research fast — efficiency rules

**Lookup order (cheapest first):** `npm run find` / `components.json` (instant) → `docs/figma-code-map.md` →
the component's agent doc → `figma-library.json` for keys → only then Figma tools (`search_design_system` for icon
keys, batched in one call) → reading source.

**Figma performance facts (measured on 16–21k-node pages):**
- `getMainComponentAsync` costs ~0.7 s per *new* library component (it is fetched). The core trusts registry/icon
  names first and groups the rest by component-property ids — resolve exactly only what you will change.
- A full traversal reading fills/strokes/bindings: ~6 s per 20k nodes. Keep each call ≤ ~10k nodes: pass sections
  or frames, not whole pages.
- `findAll(fn)` with a JS callback inside a loop is the classic hot spot; use `findAllWithCriteria` (native) and
  size-gate expensive checks.
- Imports are slow one-by-one: preload every component / style / variable a script needs with one `Promise.all`
  (build-screen preload: 4.7 s for 10 components + 6 styles + 7 colours + 6 spacings).
- Every script returns a `timing` object — read it before optimising; optimise the biggest number.
- One page per call; run independent *read-only* calls for different pages in parallel; keep *mutating* calls
  sequential.
- Respect `budgetMs` (default 50 s); scripts stop between roots and are idempotent — just re-run to continue.

**Pattern for every change: dry-run → sandbox → run → verify.** Dry-run lists matches and checks imports;
sandbox runs for real on throw-away copies and deletes them; run changes the file; verify re-audits and compares
numbers. Screenshots are for sampling (one per pattern), numbers are for proof.

---

## 4. Migrate a Figma file to L3 (old D2 / Dash / local components → L3)

**Goal:** same layout, L3 tokens, L3 components. **Invariant:** no screen moves or resizes.

**Phase 0 — check the library.** `npm run figma -- verify-registry` in the file: all CURRENT keys must import
(private `.L3: …` helpers never import on their own — expected). Missing? Ask the owner to publish.

**Phase 1 — audit (read-only).**
`npm run figma -- audit --config '{"nodeIds":["<section id>"]}'` → paste into `use_figma`. You get: old colour /
number bindings, unmapped old names, raw colours with nearest tokens, text-style status, components by source
(L3 / ❌ Discontinued / other libraries / local), hand-drawn look-alikes by structure, sign/colour mismatches, and
**ready swap rules**. Unmapped names → add them to `d2-to-l3.json` (role-aware objects or patterns allowed) *before*
phase 2.

**Phase 2 — tokens + text.** `migrate-tokens` with `dryRun: true` first (expect ≥ 99% mapped; the KYC page dry run:
10,263 colours, 1,498 numbers, 2,688 texts), then for real, one section per call. It applies text styles first (fonts),
then colours (brand text keeps exact lime; green/red tints decided by context: indicator vs status), then numbers.
Guards keep layout: wrapping text → hug → lighter role → exact restore; hidden texts ignored; screens verified.
`bindRawExact: true` additionally binds raw colours that exactly equal a token for their role.

**Phase 3 — latest variants.** `swap` rule `{ "match": { "discontinued": true }, "strategy": "latest" }`.

**Phase 4 — other libraries.** `variant-swap` (same structure, e.g. D2 Actionbar → L3: Actionbar) and `icon-swap`
(icons → `👁️ Lemonnade V3 → Icons`, keys from one batched `search_design_system` call, passed as `toKey`).

**Phase 5 — local components + hand-drawn → L3** with the audit's rules. Order **containers before contents**
(card / list row before the price text inside). Use `dryRun`, then `sandbox`, then run.

**Phase 6 — verify.** Run the audit again (expect ~0 old bindings, ~0 mismatches); spot-check one screenshot per
swapped pattern; report numbers.

### Swap rules

```json
{ "id": "bordered asset rows",
  "match": { "mainName": "❌ Asset list card", "variant": { "isPlain": "False" } },
  "to": "L3: Card", "variant": { "Type": "Static", "isPadded": "True" },
  "strategy": "slot-wrap", "options": { "keepFills": true } }
```
- `match`: `mainName` · `mainNameRe` · `variant` · `discontinued` (instances) — or `signature`
  (`select` · `stepper` · `price-change` · `card` · `list-row`, structural, for hand-drawn layers) · `nameRe`.
- `to` (registry name) or `toKey` (any key) · `variant` · `strategy` · `options` (`keepFills`, `exclude`,
  `tolerance`, `fit`, `padSide`).

| Strategy | For | How it keeps the layout |
|---|---|---|
| `latest` | ❌ Discontinued → Latest | in place; undo if bounds change |
| `variant-swap` | same-structure components | `swapComponent`, same-named variant props carried, texts restored by order, size made up with **token** padding |
| `icon-swap` | icons from other libraries | variant-swap by key, no padding fit |
| `slot-wrap` | containers (Card, Button Dock) | same direction + insets → old children go straight into the slot; otherwise a chrome-less copy of the old container goes in with compensating padding (works for GRID too). Every text must stay put (checked) |
| `select` · `stepper` · `list-cell` · `price-change` | hand-drawn controls | rebuilt from the old content (label, value, states from disabled tokens, icons, colours) |
| main-edit (automatic) | layers inside instances of a **local** component | the swap runs once in the main; every instance's text overrides restored by order; all instances re-verified |

**Every swap:** snapshot bounds → build next to the old layer → hide the old one → measure → same (± tolerance)?
remove the old one : undo. `onMismatch: "stop"` makes the whole call roll back instead.
Proven: 45 asset cards, 15 order bars, 20 steppers, 52 selects, 10 quick-access rows (main-edit) — 0 layout changes;
the sandbox refused 6 wrong "Tabs group" swaps (85 px tab → 328 px group) before they touched the file.

---

## 5. Migrate code to L3

1. `npm run audit:ui -- <src> > audit.txt` (product repo). Vendored L3 copies are reported once per folder.
2. **Errors first**, in this order: hand-rolled controls → the named L3 component (`npm run find` if unsure);
   sign coloured by hand → `PriceChange`; raw colours → the suggested token **for that role** (check the meaning,
   not just the Δ); deprecated props.
3. **Warnings:** raw px → spacing/radius/size tokens; font declarations → one `font: var(--l3-text-…)`; shadows →
   elevation tokens; `:hover` → inside `@media (hover: hover)`.
4. Re-run until clean (`--ci` in CI). Then `tsc`, build, and look at 360 / 392 / 412, light + dark.

---

## 6. Audit for missing components — and create one (rarely)

**Find gaps:** Figma `audit` (hand-drawn look-alikes, local components without a suggestion, `badge`-type gaps),
`audit:ui` (hand-rolled elements without an L3 match), and `npm run find` misses. Count uses. Run the ladder (§2).

**If step 5 is reached, write the spec first** (in the PR or a doc): job · why existing ones don't fit (ladder notes)
· uses counted · anatomy · variants (Figma names) · props (code names) · tokens · states · a11y · Figma ↔ code map.

**Figma (library file):**
1. Page `      ↪  <Name>` after related pages. Set name `L3: <Name>`; properties `✏️ Text`, `👁️ Toggle`,
   `↪ Swap`, variants `Prop=Value`; private building blocks start with `.` (`.L3: Stepper button`).
2. Tokens only: colours bound with the **resolved colour as the paint base**; spacing / radius / size bound to
   variables; text styles `🔷 L3/…`.
3. Values a designer must change on an instance (a percentage, a position) can't be nested-resize overrides — make
   them a variant on an exposed nested helper (`.L3: Progress fill` Value 0–100).
4. Description (what it's for + rules) and an examples frame with the real use cases.
5. Run `registry` → update `figma-library.json` → owner publishes → `verify-registry`.

**Code (this repo):** `src/components/<Name>/` (`<Name>.tsx`, `<Name>.module.css` tokens only, `index.ts`
named exports) · data-attributes for variants · 48 × 48 touch areas (invisible) · hover inside `(hover: hover)` · reduced motion ·
names / roles / dev warnings for misuse · then the docs set: `src/docs/pages.tsx` (designer overview + `DevOnly`
dev notes + props), `src/preview/<Name>Variants.tsx`, playground, `changelog.ts`, `docs/figma-code-map.md`,
`docs/figma-descriptions.md`, the table in `DESIGN_SYSTEM.md` §5, recipes if it replaces one. Verify:
`npx tsc -b --noEmit`, `npm run build`, `npm run audit:ui -- src/components/<Name>`, look at it in the docs.

---

## 7. Generate new screens

**The algorithm:**
1. **Brief → archetype.** Pick from `npm run screen -- list` (home · list · detail · order · review · result ·
   portfolio · history · form · settings · search). Multi-screen flows: one spec per screen; money flows always
   include `review` (+ a `result` toast).
2. **Spec.** `npm run screen -- new <archetype> --name <Name> --out <Name>.spec.json`, then edit *content only*:
   real-looking text, data sources (`data:watchlist:6`, `data:holdings:4`, `data:indices:3`, `data:commodities:3`),
   states. Keep the block order: hero first, main action docked.
3. **Score.** `npm run screen -- score <spec>` → fix until **≥ 85 with no blocking issue** (rules: docs/DESIGN_LANGUAGE.md §9).
4. **Code.** `npm run screen -- gen <spec> --out <product repo dir> [--import <L3 path>]` → `<Name>.tsx`,
   `.module.css`, `.spec.json`, `.score.md`. The generated files are audited automatically (an audit error blocks
   the score). Wire real data and handlers where the `TODO`s are.
5. **Figma.** `npm run figma -- build-screen --config '{"spec": <spec>, "parentId": "<page or section>", "sandbox": true}'`
   to preview, then without `sandbox` to keep it. Blocks that can't be built become a visible ⚠ note + report entry.
6. **Human look (2 min):** squint test, thumb test, dark mode, 412 px, "would I trust this with my money?".

**Blocks:** `summary` (label/Select + hero value + PriceChange lg) · `price` · `tabs` (pill · pill-group · underline)
· `list` (`data`, `spark`, `pnl`, `card`, `status`, `empty`) · `stats` (Card filled grid) · `chart` (candle · line ·
area, `ranges`) · `progress` (progress · range, `status`) · `banner` (Aerobar) · `quantity` (Select + Stepper) ·
`field` (TextField) · `rows` (settings: toggle · value · chevron) · `filters` (Select chevrons) · `empty`.
Header: `title` · `description` · `back` · `actions` (≤ 2) · `tabs` · `search` · `select` (switcher) · `change` ·
`sheet`. Bottom: `dock` (buttons, direction; one strong button — a Buy + Sell pair counts as one) **or** `nav`.

---

## 8. Gotchas (Figma Plugin API + MCP) — each one cost real time

- No `Intl` in the plugin runtime → format numbers by hand (`groupIN` in build-screen).
- Nested layers inside an instance can't be resized or moved (resize is silently ignored; `x` / `minWidth` throw)
  → expose a variant on a nested helper instead.
- `indexOf` on instance sublayers returns −1 → `findIndex((c) => c.id === node.id)`.
- Read `characters` (and anything else) **before** `remove()` — the node is gone after.
- Cloning a component that has a SLOT turns the slot into a frame → `createSlot()` (it adds its own SLOT property:
  delete that duplicate) and reference the existing one via `componentPropertyReferences.slotContentId`.
- Cloning a variant also drops the componentPropertyReferences of its other layers (text characters / visibility) →
  copy them from the source by layer path, then prove with a temporary instance + `setProperties`.
- `getStyleByIdAsync` ~44 s on first call → read the key from the style id (`S:<key>,…`), see `l3StyleOfId`.
- Compare nodes by `.id` — the same layer reached two ways is two different JS objects.
- `get_screenshot` can return a stale render right after an edit; `node.screenshot()` inside use_figma is live.
- Copies outside their context lose inherited variable modes → pin `resolvedVariableModes` on the copy (`keepModes`).
- `addComponentProperty(name, 'SLOT', '')` needs `''` as the default.
- Binding a variable to a paint: pass the resolved colour as the base (`resolveForConsumer`) — a black base renders
  black in main components until refreshed.
- `gradient-stop-0/…` colour tokens are the **transparent** end of a gradient; pair them with the matching
  `surface/accent/…` token at the opaque end.
- Loading a missing font stalls ~40 s → check `hasMissingFont` and skip.
- Bottom-anchored stacks move siblings while you insert → measure **after** hiding/removing the old layer.
- Library components import only once **published** (`getPublishStatusAsync` in the library file tells you); private
  `.` components never import on their own.
- `keyboard_arrow_down` from older icon libraries isn't importable → `expand_more` from the Icons library.
- `setCurrentPageAsync` once per call; `page.loadAsync()` to touch another page's nodes (main-edit).
- `use_figma` code is limited to 50,000 characters — `bundle.ts` warns; trim DATA per script there.
- `figma.notify` throws; `console.log` is invisible — return everything.

---

## 9. Getting better every time (the improvement loop)

1. **Measure:** every script returns `timing`; every audit returns counts. Write them down.
2. **Log:** after each task add an entry to `docs/LEARNINGS.md`: what was slow, wrong or surprising, the number,
   the fix.
3. **Fix at the source, not in a one-off:** a missing colour → `d2-to-l3.json`; a false positive → the rule in
   `lib/core.js` / `audit-ui.ts`; a new composition → `recipes.json`; a scorer rule that fights reality → `screen.ts`
   (with the reason). Re-run the dogfood case that exposed it.
4. **Promote repeats:** the same manual step twice → a script option; the same composition 3× → a recipe; the same
   recipe in 3+ places with a new job → a component proposal (§6).

---

## 10. Where things live

```
docs/PLAYBOOK.md                 this file
docs/DESIGN_LANGUAGE.md          principles, numbers, colour meaning, archetypes, quality bar
docs/LEARNINGS.md                dated lessons (append after every task)
docs/migration/figma-library.json  keys (components, text/effect styles, collections, icons)
docs/migration/d2-to-l3.json       old → L3 colours, contexts, numbers, text rules, component map
docs/patterns/recipes.json         compositions        docs/patterns/archetypes.json   screen starters
scripts/find-component.ts        npm run find         scripts/audit-ui.ts            npm run audit:ui
scripts/screen.ts (+ screen/data.ts)  npm run screen
scripts/figma/                   bundle.ts (npm run figma) · lib/core.js · registry · verify-registry · audit ·
                                 migrate-tokens · swap · build-screen
public/agent-docs/components.json   generated index    public/agent-docs/figma/*.js   pre-bundled scripts
```
