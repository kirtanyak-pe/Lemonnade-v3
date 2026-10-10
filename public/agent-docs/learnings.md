# Learnings — append after every task

One entry per lesson: **what happened · the number · the fix (and where it lives)**. Newest first. When a lesson
repeats, turn it into data or a script option (docs/PLAYBOOK.md §9) and say so here.

## 2026-10-10 — touch areas 48 × 48, ghost hugs its content

- **Rule (user):** controls drawn smaller than 48 keep their drawn size — ghost buttons and Select hug their content,
  no padding, no fixed height — and get an invisible 48 × 48 touch area that never takes layout space. Done by raising
  the local `size/tap-target` token 32 → 48: every component's ::before/::after grew with it.
- **`height: auto` isn't hugging in a flex row:** a ghost beside 40px buttons stretched to 40 (align-items: stretch).
  `height: fit-content` hugs and still lets a vertical dock stretch its width.
- **The docs site used the token as a *visible* height** (toolbar items, tree rows) — those moved to `size/32` before
  the token changed, so the docs UI didn't grow. Check what reads a token before changing its value.
- Docks: a ghost in a vertical dock is now 22 tall (was 48); its touch area overlaps the button above by 1px (gap 12).

## 2026-10-10 — redesigning old Lemonn screens (Navigation, KYC, Market, Portfolio) from scratch in Figma

28 screens rebuilt in a new section next to the old one ("🟨 Lm→ General: Playground", page Account setup), 198 L3
instances, audit after: 0 unbound colours, 0 unstyled texts, 0 raw spacing.

- **Registry drift: "L3: Select" now imports as "L3: Select switcher".** verify-registry flagged it (30/31 OK). Fixed the
  same day (34a13a5): `figma-library.json` and the audit / build-screen / swap / core scripts renamed together.
- **Tabs group has minWidth 328.** In a row next to a button (pills + "Import", pills + "Filters") the button was
  pushed off-screen. Fix: `minWidth = null`, then FILL. Also zero the wrapper slot's 16 inset inside a padded body
  (DESIGN_SYSTEM 2.3), otherwise the first chip sits at 32.
- **A FILL text next to a HUG Button in a row centres itself** (x 103, w 88 of 230) — even after re-creating the text.
  Fix used: fixed width = row − control − button − gaps. Worth checking whether the L3: Button has a min-width.
- **L3: Button defaults to full width (328) and shows both placeholder icons**; L3: Tags too. Every helper must set
  `👁️ Icon-L/R` explicitly and HUG buttons that sit in slots or rows.
- **Brand mascots ("Lemon emotions", 24 expressions) can't be imported by key** ("Component not found") — it's not in
  a library this file can import from by key. Cloning an existing instance and `setProperties({emotions})` works.
  Candidate for the L3 library (empty states, KYC, onboarding all use it).
- **Old illustrations are loose layers, not one group** (coin front/back, gear face/shadow): cloning the "largest node
  in the region" copied half of them. Mascots replaced them; empty-state art should become components.
- **Sheets over a screen:** clone the base screen → absolute L3: Overlay (360×800) → L3: Bottom sheet in the
  overlay's container slot. Plain ListCells inside a sheet's content slot double the 16 inset — set the cell's own
  side padding to 0.
- **The MCP connection dropped mid-call but the script had finished** — always re-read the canvas before retrying.
- **The L3 library itself still used old variables** (found by auditing a consumer screen, not the library): Radio &
  check box, input field (`PrimitiveSize/s-*`), Aerobar (`Spacing/Sapcing-0`, `Spacing-2`), Actionbar (`Base hex/
  radius/full`, a D2 text colour on the bottom-slot placeholder), Radio (`shadow/shadow-sm` effect style), Brand logo
  (`Base hex` honey in gradient stops) and icons nested in Bottom sheet / Checkbox (`🎨 L3 Theme` — a second, older copy
  of the theme collection that comes with the Icons library). 296 bindings rebound to identical-value L3 tokens
  (radius/00·06·12·full, spacing/00·02·04·08, size/16·24, elevation/low, base honey) → 0 non-L3 bindings in all 30 L3
  components. Next: teach `verify-registry` / `audit` to scan the library's own components for non-L3 collections, and
  check the Icons library for the duplicate `🎨 L3 Theme` collection.
- **Artwork can only partly move to L3 without recolouring:** 206 of 408 mascot / logo / illustration colours matched
  an L3 base colour exactly or within 6/255; the mascot's own palette (lemon #fcc21b, blues #e1e9fe / #97b2fd,
  green #048245) has no L3 equivalent. Decide: add them to the base palette, or treat the mascot as brand artwork.

## 2026-10-10 — making the components portable (developers copy them into production)

- **Vite-only code crashed components elsewhere.** 9 files used `import.meta.env.DEV` for dev warnings — undefined in
  Next.js / webpack, so the effect threw. Fix: `isDev` from `src/components/env.ts` (`process.env.NODE_ENV`, replaced
  by every bundler, including Vite in dev).
- **`.svg` imports mean something different per bundler** (URL in Vite, `{ src }` in Next.js, a component with SVGR):
  every icon would have vanished in Next.js. Fix: `scripts/build-glyphs.ts` turns the SVGs the components use into
  `data:` URI strings (`glyphs.ts`); `<Icon>` also accepts `{ src }`. Components use 15 Material icons; the full set is
  6,512 files / 27 MB — developers pick theirs with `npm run -s glyphs -- --pick …`.
- **Audit false positive:** "no default theme" — grepping `^[^ ].*{` missed `:root,` on its own line; the default
  Lemonn-light block was there all along. Read the generated file's head before calling a gap.
- **Locked in:** `npm run check:portable` (source rules + strict TS with a plain app tsconfig + server rendering of every
  playground, a closed/open BottomSheet and ThemeProvider). Other fixes in the same pass: 49 `.tsx` import extensions
  removed, refs passed through Button/Checkbox/Radio/Switch/TextField (react-hook-form), BottomSheet + ThemeProvider
  safe on the server, `-webkit-mask` for Chrome < 120, `rgb(from …)` → `color-mix()`.

## 2026-10-09 — building and dogfooding the playbook tools

- **Gradients hide old colours.** Token migration skipped gradient stops: F&O had 250 gradients, 117 still on D2 or raw
  stops that resolve in LIGHT mode on CS PRO Dark screens (option-chain range bars fading to #def4ea, light-grey edge
  fades, white→lime icon tiles). Fix: rebind each stop to an L3 token, keep positions, and use the matching
  `gradient-stop-0/<token>` for a transparent end (never a raw transparent colour). Result: 161 fully L3; the other 89
  are icon artwork / coin art. Next: teach migrate-tokens to walk `gradientStops`.

- **Inside a hidden layer, a new instance has no sub-layers.** 6 product tiles on the hidden "Introduction sheet"
  failed at "slot is null" (`children` came back empty). Fix: show the hidden ancestor for the swap and hide it again
  in a `finally`. Errors were caught per item and nothing was left half-done (tiles untouched until the retry).
- **Strokes counted in layout shift content by the stroke width.** Strategy cards (`strokesIncludedInLayout`) refused
  with "text Δ−1,−1"; add the stroke weight to the content copy's padding (and keep the old content width when rows
  spread items to the edges). Fourth pass: 12 product tiles, 4 Strategy cards → Card Clickable; 10 Buy/Sell-at-mkt /
  Invest now → L3 Button Small; 12 chips (8 with trending icons) → base tab pills; 4 "Add watchlist" headers →
  Section header with a ghost action (a third CTA kind — not in the rule yet).

- **Pill rows doubled the page margin.** L3 Pill tabs carry a 16 inset (wrapper) for edge-to-edge use; 5 F&O
  instances also got 16 from their container or an instance override → first chip at 32. Fix: measure the first pill
  from the screen edge and remove the extra (instance override first, then the wrapper when the parent gives 16);
  build-screen now zeroes the wrapper inside padded sections. Rule in DESIGN_SYSTEM 2.3 + Tabs docs.

- **Slot content inside nested instances behaves differently.** Swapping 57 price texts that live in a sheet's slot
  inside nested instances worked, but `remove()` then threw "node does not exist" (ids change once a node is placed
  in slot content), and the per-item undo never ran. Nothing was lost (62 Price changes, 0 hidden, 0 duplicates), but
  only a follow-up check proved it. Fix: after any per-item error, re-check the area (hidden originals, duplicates,
  overflow) instead of trusting the error; never leave `old.visible = false` before a step that can throw.
- **Curate before swapping.** A structural guess found 88 "clickable cards" — including 360×536 screen blocks and
  input rows. Grouping by name + size + tokens gave exact matches (90), and the content check still refused 4.
  F&O run 2026-10-09: 14 section headers, 62 price changes, 86 cards (66 Clickable, 18 Filled, 2 Static).
- **Hand the padding to the component, then measure.** Section cards had 0 side padding and rows padded 12; first try
  refused all 8 ("text would move") because the content was fitted to the card BEFORE the full-width rows were found
  (their width had already shrunk). Strip row padding while the copy is still full width, then fit → 8/8 exact.
  Second pass: 8 section cards → Card Static, 90 filter chips → base tab pills (width kept, label centre ±1.5),
  Position card + Position info mains: 34 D2 colours → L3 with all 93 instances unmoved.
  Third pass: 9 hand-drawn steppers (Limit / Trigger rows, value "20.3%" isn't digits-only so the classifier had missed
  them) → L3 Stepper Small; 4 primary cards (r16) → Card Clickable; 4 Heading/16 titles → Section header at the old
  22 height (title centred ±1, nothing below moves; "See all" → View all).

- **A token's display name is not a colour.** The Colors page set swatches to `surface-default` (the copyable name)
  instead of `var(--l3-surface-default)` — twice (accent band, then the whole semantic tree). The browser drops an
  invalid value silently, so every swatch fell back to the text colour (all black). Fix: always `var(${cssVar(token)})`.
  Check that catches it on every page: `CSS.supports(prop, value)` for each inline colour / background / shadow
  (914 checked, 0 invalid after the fix).

- **Chart labels: the last-price tag is also a number at the right edge.** First chart run read it as a 7th y label →
  axis shifted by one and the component's sample last price (157500) stayed on 896.75 / 640.75 charts. Fix: the last
  price is the number inside a filled frame; y labels are the rest, max 6; no last price found → hide the tag, never
  show the sample. Also: a stricter detector (price labels + marks ≥ 60% of the height) found 9 real charts, not the 5
  the old audit counted — the 4 scalper charts were missed before. Report the match count before running.

- **Main edits must restore colour overrides, not just text.** The CMD component kept D2 colours in its main and got
  L3 colours per instance; replacing its panels made new layers, so instances fell back to the main's light-mode D2
  colours (dark text on dark). Fix: `restoreTexts` now snapshots and restores each text's fills (per range) too; and the
  4 cards' D2 colours were rebound to L3 in the main (43 paints + 6 text ranges). Better still: migrate a local
  component's main to L3 before swapping inside it.
- **A page-level theme mode is fragile.** The GUI page's CS PRO → Dark was cleared/changed outside the scripts (twice
  in one session) and every screen flipped to LM Light. Fix: pin the theme on the section that holds the product's
  screens (`Commodities & Equity F&O` → CS PRO → Dark); report the mode a screen resolves before blaming a swap.

- **Cloning a variant drops more than slots.** The 4 new list-cell isSelected variants lost every
  componentPropertyReferences link (Label / Description text and visibility, dots) — instances swapped to them showed
  "Label goes here". Fix: after cloning a variant, copy componentPropertyReferences from the source by layer path, then
  prove it with a temporary instance + setProperties. Caught by the text check on the first real swap (2 of 11 refused).
- **Compare node ids, not node objects.** `s !== n` was true for the same layer reached two ways (parent.children vs
  getNodeByIdAsync), so a "siblings" pass flipped the selected card back. Fix: compare `.id`.
- **getStyleByIdAsync costs ~44 s on its first call** in a big file. A style id is 'S:<key>,<node>': read the key and
  compare with the registry (`l3StyleOfId` in core.js) — also stops old 'L3/extrabold - Heading/20' styles passing as L3.
- **Sandbox copies lose inherited theme modes.** An instance's CS PRO → Dark rendered light on the dark canvas and
  looked like faint text. Fix: `keepModes` pins the original's resolved modes on the copy.
- **The outer box can't see inner shifts.** slot-wrap kept card bounds while content moved 4 px (padding 16 vs 12).
  Fix: nest a chrome-less copy with compensating padding and check every text's position (swapOne `res.texts`).
- **Group main edits per component** (one getInstancesAsync + snapshot + verify) and revert just that component on a
  failure; 13 selects in 5 local components took 12 s instead of ~60 s per call.

- **Compute lazily.** A signature rule resolved all 2,151 instances' mains (52 s) to use 13 candidates. Fix: resolve
  mains only for instance rules; for signature rules check just the candidates' owners, after the cheap structural test.
- **A shortcut must not change meaning.** The fast lookup trusted every 'D2 → …' instance as an icon, but local
  components share the prefix (D2 → F&O portfolio) — nested swaps would have been skipped silently. Fix: trust the
  icon name only for icon-sized instances (≤ 48 px). Caught by reading the bundle before running it.

- **Main-component lookups dominate Figma scans.** KYC page (21,425 nodes, 1,241 instances): `getMainComponentAsync`
  took 37 s of a 48 s audit (~0.7 s per newly seen library component). Grouping by instance name only cut 1,241 → 125
  lookups because designers rename instances. Fix: trust registry / icon names, group the rest by component-property
  ids, resolve exactly only before changing (`mainInfosFast` in `scripts/figma/lib/core.js`).
- **Structural checks with JS callbacks are the second hot spot.** Chart detection ran `findAll(fn)` on every frame →
  54 s audit. Fix: size-gate first, `findAllWithCriteria` (native) — classification dropped to 2.3 s.
- **Sequential imports make builds slow.** First `build-screen` took 66 s. Fix: preload all components / styles /
  variables in one `Promise.all` (4.7 s). Whole build still ~60 s → next target: per-block timing (now reported).
- **The sandbox earns its keep.** A rule mapped the local "D2 → F&O Tabs" (one 85 px tab) to "L3: Tabs group"
  (328 px); the sandbox refused all 6 swaps on bounds. Fix: the audit maps a single tab to `L3: base tab`.
- **Old colour names come with and without the library prefix** (`color/text/secondary` vs
  `D2/color/text/secondary`) and as "❌ [Discontinued] button/…". Fix: normalised lookup + role-aware entries +
  patterns in `docs/migration/d2-to-l3.json`; KYC dry run went to 99.4% mapped (10,263 colours).
- **Raw colours outside screens are annotations.** #4147D5 (368 uses) were red-line notes. Fix: audits count raw colours
  and text only inside phone screens.
- **Nearest-colour bug:** compared a rounded distance with an unrounded one, so ties picked the wrong token (candle
  green → success instead of indicator). Fix: compare raw distances; ties keep the earlier (indicator) token.
- **`arrow_forward` matched "row".** Name hints now use whole words; generic names (Frame, Icon, Group) don't get hints.
- **No `Intl` in the Figma plugin runtime** ("Intl is not defined"). Fix: `groupIN` (Indian grouping by hand), checked
  against `Intl` on 12 cases.
- **Pill-group tabs aren't named "Tab N".** "Label Label Label" in the first detail build. Fix: tabs are found as the
  slot's instance children; extra tabs are cloned.
- **Scorer rules must match product reality.** Buy + Sell side by side is one trade decision, quick-add chips
  ("+₹1,000") aren't price changes, history/search screens don't need a dock, market lists are never empty. Fixed
  in `scripts/screen.ts`; all 11 archetypes now score 100 and a deliberately bad spec still fails with 4 blocking issues.
- **Code audit false positives come from class prefixes.** `tag-grid`, `sheet-placeholder`, a char `counter` were
  flagged. Fix: whole class tokens or `-keyword` suffixes only; role="tablist" around L3 `<Tab>` is composition.
- **Product repos vendor L3.** The kill-switch prototype copies `src/l3/components/*` → 18 noisy line findings. Fix:
  one `duplicate` finding per component folder (warning if it's a vendored token-based copy).
- **Find-component: generic words over-match** ("grey box grouping" → Checkbox). Fix: generic words weigh 0.4;
  synonyms for grey / details / ticket.
- **Publishing is the gate for every Figma swap and build.** Keep `figma-library.json` statuses current and run
  `verify-registry` after each publish (2026-10-09: 37/37 importable keys OK; `.` helpers are private by design).
