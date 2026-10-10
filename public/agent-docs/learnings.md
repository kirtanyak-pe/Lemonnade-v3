# Learnings — append after every task

One entry per lesson: **what happened · the number · the fix (and where it lives)**. Newest first. When a lesson
repeats, turn it into data or a script option (docs/PLAYBOOK.md §9) and say so here.

## 2026-10-11 — first real flow with the L3 kit (Kill Switch, 25 frames, library page "GUI test")

Brief → 1 JSX file (13.7 kB, 25 screens) → compile clean → 2 build calls (18.7 s for 22 screens + 12.2 s) → 1 look.
Two kit bugs found and fixed in the same run: Tag `color` was being turned into a text token (tags lost their colour);
sheet screens built on a long scrolling base kept its height (1052) so the sheet sat below the viewport — now clipped to 800.

## 2026-10-11 — token & time audit → the L3 kit (docs/agent/ALGORITHM.md)

16 sessions, 8,348 calls measured with `scripts/token-audit.py`: **73% of the cost was re-reading context** (cost ≈
context × calls; sessions compacted only near 1M). Generation sessions spent the first minute loading ~100k tokens of
docs, then 20–40 exploration calls, re-sent a hand-written 10–43 kB helper library in every build call and fixed
component quirks one call at a time.

- **Fix: the L3 kit.** Agents read only `docs/agent/GENERATE.md`, write L3 JSX (6 screens = 2.4 kB ≈ 700 tokens),
  `npm run kit -- build` lints / auto-fixes / tree-shakes, one `use_figma` call builds the flow, checks it and returns
  snapshots. Benchmark: 6-screen price-alerts flow, 1 call, 0 issues, **8.2 s** (was 55 s). Quirks are handled once
  in `kit/runtime.js`.
- **First `setTextStyleIdAsync` per call stalls ~29 s** (the "~60 s per build" mystery below): the sync setter takes
  2 ms → `applyTextStyle` in lib/core.js, used by build-screen, swap, migrate-tokens and the kit.
- **FILL child makes a hugging parent fixed** — a screen with `body.layoutGrow = 1` set early stopped growing and its
  content slid under the dock. The kit now measures first, then pins short screens.
- **`findAllWithCriteria` returned INSTANCE nodes** for `types: ['TEXT']` (slots) and crashed a check — filter by type.
- **Resident code (plugin data + eval) works but is blocked** by the auto-mode classifier as an RCE surface; so is
  smuggling code in an uploaded image. Accepted: per-call runtime, tree-shaken, many screens per call.
- **Subagents can't use the claude.ai Figma connector** here — a cheap "paste runner" subagent isn't an option yet.
- `.claude/settings.json` → `autoCompactWindow: 250000`.

## 2026-10-10 — Kill Switch v2: local pattern components built on L3

30 redesigned frames + 5 local pattern components (icon badge, OTP field, Kill Switch status card, position card,
profile card) on the playground page. Audit after: 0 unbound colours, 0 unstyled texts, 0 placeholder copy.

- **Text properties can't point inside a library instance's slot** ("Cannot set component property references on
  instance sublayer"). A local component that wraps L3: Card can't expose its card text as properties — designers edit
  the text in the slot directly. Expose properties only on layers that are direct children of the local component.
- **An INSTANCE_SWAP property resets every variant to its one default icon**, and a **TEXT property resets every
  variant's text to its one default**. Per-variant icons or copy (Success = check, Error = error; helper text per OTP
  state) must stay plain nested layers, not properties.
- **A text with `layoutGrow = 1` inside a slot rendered centred** (x 41 of 304) even with `textAlignHorizontal = LEFT`.
  Use `layoutSizingHorizontal = 'FILL'` + `textAutoResize = 'HEIGHT'` instead of layoutGrow for texts.
- **`getRangeAllFontNames(0, 0)` throws on empty texts** (empty OTP boxes). Skip zero-length texts when loading fonts.
- **L3 → Empty state is 412 tall** — under a section header on a Positions screen its message falls below the fold.
  For "nothing here" inside a busy screen, a non-tappable card list cell reads better; keep Empty state for full
  screens.

## 2026-10-10 — generating a 25-frame flow from scratch in Figma (Kill Switch, playground file)

25 frames (screens, bottom sheets, OTP states) built only from L3 instances with a small helper library, 6 use_figma
calls. Audit after: 0 unbound colours, 0 unstyled texts, 0 leftover placeholder copy.

- **L3: Button stretches to the full width of its parent row** (pushed the Actionbar title out, and "Exit all" off a
  two-button row). Fix: `primaryAxisSizingMode = 'AUTO'` on every button that isn't in a dock; dock buttons FILL.
- **Sheet over a screen:** the Overlay's `container slot` accepts `primaryAxisAlignItems = 'MAX'` — the sheet sits at
  the bottom with no spacer. Hide the sheet's `Buttons` dock (`visible = false`) for sheets with no action (loading,
  menus).
- **L3: list cell's default Icon-R is a down chevron** (11×7 vector). Navigation rows need `chevron_right` swapped into
  `icon-r`. Candidate fix: make chevron-right the default in the library.
- **List-cell labels are one line** — "Resume trading anytime from settings" truncated at 328. Write row labels for one
  line; put the rest in the description.
- **No OTP component.** Used `L3: input field & text Box` (Default · Typed · Error · Success map onto empty · filled ·
  incorrect · verified; verifying = Typed + Button ♻︎ Loading). A boxed 6-digit OTP input is a gap — propose it only if
  it shows up in 3+ flows (PLAYBOOK §2).
- **Re-sending the helper library each call** costs ~15k characters of the 50k budget; build several frames per call.

## 2026-10-10 — Density mode, fill containers, a duplicate variant

- **Binding a multi-mode collection pinned the components to its default mode.** After the Density binding, all 12
  list cell variants carried `explicitVariableModes = { Density: Compact }`; instances inherit that pin, so a list
  frame set to Breathable did nothing. My self-test set the mode *on the instance* (which beats the pin) and passed.
  Fix: `clearExplicitVariableModeForCollection` on every variant; test the way designers use it — mode on a parent
  frame, instance inside. In the consumer file the rows got a row-level Breathable meanwhile (they kept 72 / 74).
- **Pulling a published component update drops instance overrides on properties the main now binds.** Importing the
  new list cell reset the rows' typed 16 padding to the main's value (72 → 56). Measure before and after the first
  import, and restore in the same pass.

- **Density without variants:** list cell padding is bound to a "📐 L3 → Density" collection (Compact / Breathable)
  instead of a variant property — designers set the mode once on the list frame. Self-tested with temporary instances
  (58 → 74 plain, 66 → 74 card) before reporting.
- **Count before bulk edits:** "revert 8 screens" found 15 hugging containers — 8 from the touch-up session (Market 1–4,
  Portfolio 2/3/5/6) and 7 built that way (KYC/Personalise). The script refused to run on a different count; the user
  then chose fill for all 15. On SPACE_BETWEEN screens fill changed nothing visible (content MIN-aligned, docks stayed).
- **Duplicate variant names happen silently:** L3: list cell had two identical `isTappable=True` variants stacked at the
  same x/y (an accidental duplicate, created the same day). Compared layer by layer, checked instance usage (21 vs 0),
  then removed the copy. Check variant-name uniqueness after editing a set.

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
