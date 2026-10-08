# Lemonnade V3 (L3) Design System

Rules for composing screens with the L3 React components in `src/components`. Tokens are CSS variables
named `--l3-*`, generated from the Figma "✅ Lemonnade V3" library.

---

## 0. Sources of truth & how to use this file

| What | Where |
|---|---|
| Components (React + CSS Modules) | `src/components/<Name>/` — import from the folder: `import { Button } from './components/Button'` |
| Tokens (source → generated) | `src/tokens/source/*.json` (DTCG, from Figma + `local.*.json`) → `npm run tokens` → `src/tokens/generated/*.css` |
| Icons | `src/icons/material/` (Material Symbols), refreshed with `npm run icons` |
| Figma library | "✅ Lemonnade V3" (`lxQ6QIXGOv5mmx0khh5sJn`); icons: "👁️ Lemonnade V3 → Icons" |
| Live docs (playground + code per component) | https://kirtanyak-pe.github.io/lemonnade-v3-docs/ |
| Component history | `src/docs/changelog.ts` |

Sections marked `PENDING` are undecided: **do not infer rules for them** — ask, or leave a TODO.

<!-- PENDING: precedence when code, this file and Figma disagree -->

---

## 1. Spacing scale

**4px base: 4, 8, 12, 16, 24, 32, 40, 48, 64.**

| Step | Token |
|---|---|
| 4 | `--l3-spacing-04` |
| 8 | `--l3-spacing-08` |
| 12 | `--l3-spacing-12` |
| 16 | `--l3-spacing-16` |
| 24 | `--l3-spacing-24` |
| 32 | `--l3-spacing-32` |
| 40 | `--l3-spacing-40` |
| 48 | `--l3-spacing-48` |
| 64 | `--l3-spacing-64` |

Spacing tokens are used for **padding, gaps and margins only**. Never use arbitrary values: no raw px, and
no off-scale steps. For sizes (width, height, icon boxes), use `--l3-size-*` / `--l3-icon-size-*`, not spacing tokens.

> The token set also contains 02, 06, 10, 14, 20, 28, 36, 56, 72, 80 and 96. These are **not part of the
> scale**. Some components still use them (see 2.4).

---

## 2. Layout primitives

There are no `Stack` / `Row` components in the codebase. These are the **de facto primitives**: the flexbox
patterns that recur across the built components (Actionbar, Aerobar, BottomNavbar, BottomSheet, Button,
ButtonGroup, Checkbox, EmptyState, ListCell, Switch, Tabs, Tag, TextField).

### 2.1 Stack (vertical: `flex-direction: column`)

| Gap | Used for | Seen in |
|---|---|---|
| 4 | Title + supporting text; icon over label | EmptyState content, BottomSheet header text, BottomNavbar option |
| 8 | Label → control → helper; stacked header items | TextField field, BottomSheet large-header centre |
| 24 | Major blocks inside a component | EmptyState (illustration · text · action), BottomSheet large header |

### 2.2 Row (horizontal: `display: flex`, `align-items: center`)

| Gap | Used for | Seen in |
|---|---|---|
| 12 | Leading icon · content · trailing action inside a bar or row | Actionbar row, Aerobar body, TextField control, ListCell (small, card), ButtonGroup |
| 8 | A cluster of sibling controls | Actionbar actions, Tabs (pill) |
| 4 | Inline label + icon/marker | TextField label & helper, BottomSheet heading row, ListCell dots |

**Bar padding:** horizontal bars pad **16 inline** and take their height from a `min-height` size token:
Actionbar row (0 16), inline Aerobar (0 16), ListCell (8 16), ButtonGroup (16), BottomSheet header (16).
This is the de facto **16px screen gutter**.

### 2.3 Screen layout (rule)

| What | Value | Token |
|---|---|---|
| Page padding, left and right | 16 | `spacing/16` |
| Between two sections (default) | 24 | `spacing/24` |
| Between two sections (large spacing: a new topic, or after a hero block) | 32 | `spacing/32` |
| Section heading → its card or list | 16 | `spacing/16` |
| Card padding, every side | 12 | `spacing/12` |

- A **section** is a `SectionHeader` plus its content (card, list, chart). Never hand-build a section title row. Sections stack with 24; use 32 only for a deliberate
  bigger break.
- Gaps belong to the container (the body / section frame's auto-layout gap, bound to the spacing variable) — never
  spacer layers, never margins on components.
- Rounded cards sit inside the 16 page padding; edge-to-edge parts (Actionbar, Tabs, ButtonGroup, plain ListCell, flat
  Card) touch the screen edges.
- Docs: the **Layout** page under Foundations. Seen in the F&O dev-handoff Delivery / Intraday screens.

### 2.4 Inconsistencies found

1. **Title + description gap differs.** It's 2 in Actionbar content and Aerobar content, but 4 in EmptyState and the
   BottomSheet header. 2 is off-scale.
2. **Row gap outlier.** ListCell `md` uses 16 between icon and text, while every other row, including ListCell `sm`
   and `card`, uses 12.
3. **Clustered-control gap differs.** It's 12 in ButtonGroup, but 8 in Actionbar actions and Tabs (pill).
4. **Off-scale spacing inside components** (mostly copied from Figma values):
   - **02** (34 uses): focus-outline width and offset, gaps in Button `sm`, Tag, Tabs, and Actionbar/Aerobar text.
   - **06**: Button `sm` vertical padding, Tabs (pill) side padding, floating Aerobar right padding, and the
     Actionbar back-button focus offset.
   - **10**: Button `md` padding, BottomNavbar option padding and separator inset.
   - **36**: Tabs `sm` height, TextField icon box.
5. **Spacing tokens used as sizes:** the Checkbox tick box (10×10), the TextField icon box (36), and the Tabs `sm` height
   (36). These should be `--l3-size-*`.
6. **Asymmetric padding:** the floating Aerobar body pads 0 6 0 12 (Figma), while inline it's 0 16.
7. **Vertical rhythm is mixed.** Most bars get their height from `min-height`, but ListCell and Aerobar text also add
   vertical padding (8 / 12).
8. **Focus-ring offset varies:** 2 in most controls, 6 on the Actionbar back button.

---

## 3. Semantic token rules

### 3.1 Accent groups

Accent colors (`surface/accent/*`, `content/accent/*`, `border/accent/*`) come in **5 groups**. Pick the group by
**meaning** first, then the color inside it. Never borrow a color from another group because it "looks right".

| Group | Accents | Use for |
|---|---|---|
| **Brand** | `brand` | The product color (Lemonn lime, CS PRO gold, Kuber green): brand moments, the brand button. Kuber's brand green is intentionally the same as the profit green (`#0f9958`) — keep brand surfaces away from P&L so a brand banner never reads as a gain. |
| **Market indicators** | `indicator/up` (profit), `indicator/down` (loss) | Price direction only: price up / down, P&L, buy / sell side. Never for success or error. (The Buy **button** is themed separately: product color in Lemonn and Kuber, `indicator/up` in CS PRO.) |
| **Status** | `success`, `warning`, `error`, `discover` (info), `orange` (processing) | Outcomes and system states: done, needs attention, failed, info / links, in progress. |
| **Sub-brands** | `us-stock`, `zing` | Products or segments with their own identity. Use only inside that product or segment. |
| **Miscellaneous** | `purple`, `indigo`, `teal` | **Exceptional cases only**, e.g. telling categories apart when no other group fits. They carry no meaning. |

- Profit / loss and success / error can look alike (both green / red) but are **not interchangeable**: a price that
  went up is `profit`, an order that went through is `success`.
- Every accent has the same five slots: `surface light` + `border light` + `content` for soft fills (tags,
  banners), `surface default` for solid fills, `border default` for strong outlines.
- Text on solid fills: `static/black` on warning, `static/white` on profit / loss / success / error, `content/inverted` on the rest.

### 3.2 Token naming

Every token name is built from the same parts, **in this order**:

`--l3` · *(component · variant)* · **property** · *(group · intent)* · **modifier** · *(state)*

| Part | Values |
|---|---|
| Namespace | `l3` — always first in CSS (`--l3-…`) |
| Property | `surface` (fills) · `content` (text, icons) · `border` (outlines) |
| Group | `accent` for accent colors; none for neutrals (base palette: `hue` / `neutral`) |
| Intent | `brand` · `indicator-up` · `indicator-down` · `success` · `warning` · `error` · `discover` · `orange` · `us-stock` · `zing` · `purple` · `indigo` · `teal` (see 3.1) |
| Modifier | Neutrals: `default` · `primary` · `secondary` · `tertiary` · `quaternary` · `inverted` · `disabled` · `overlay`. Accents: `light` · `default` |
| Component · Variant | Component tokens only: `button` + `primary` … `sell`; `state-layer` + `light` / `dark` |
| State | Optional: `loading` · `disabled` (state layers: `default` · `hover` · `pressed`). No suffix = default state |

Examples: `--l3-surface-secondary`, `--l3-surface-accent-success-light`, `--l3-button-buy-surface-disabled`,
`--l3-base-hue-green-500`.

- **Lowercase, words joined with dashes.** Figma separates parts with `/` (`L3/color/surface/accent/success-light`),
  CSS with `-` (`--l3-surface-accent-success-light`), TS uses the Figma path (`token('surface/accent/success-light')`).
- **Name by role, never by color** (`content-secondary`, not `grey-60`). Only the base palette names colors.
- **Leave out what's default:** no state = default state; neutrals have no group or intent.

<!-- PENDING: paste verbatim from notes -->
Still waiting for the exact text from your notes on:
- `surface/*` elevation scale
- `static/black`, `static/white`
- `content/tertiary`
- `extra/gold`

---

## 4. Typography

**Facts (from code):**
- One font: **Manrope** (variable, loaded 200–800), applied only through text tokens. Never set `font-family`.
- Style text with one shorthand token: `font: var(--l3-text-<role>-<size>);` e.g. `--l3-text-label-12`.
- Never set `font-size`, `font-weight` or `line-height` on their own. Each style also has parts
  (`-size`, `-weight`, `-line-height`, `-letter-spacing`, `-paragraph-spacing`), and base values are tokens
  (`--l3-font-size-200`, `--l3-line-height-200`, `--l3-font-weight-750` / `-650` / `-500`, `--l3-paragraph-spacing-08`).

| Role (token) | Weight | Sizes | Use (draft) |
|---|---|---|---|
| `heading` | 750 | 10 · 12 · 14 · 16 · 18 · 20 · 24 · 28 · 32 · 36 | The main heading of a page or section, or the most prominent number on the page when it's 18px or larger |
| `label` | 650 | 10 · 12 · 14 · 16 · 18 | A literal label (tab, tag, field label), input field text, or a small number |
| `description` | 500 | 10 · 12 · 14 · 16 · 18 | The description of a heading or a label. **Never shows a number.** Has paragraph spacing (6 · 8 · 10 · 12 · 16) |

- Three roles only — no primary/secondary sub-roles and no separate Section style (a section title is `heading-14`).
- **Role rules** (size-level rules: PENDING):
  - **Heading** — the main heading of a page or section, or the page's most prominent number **if it's 18px or more**.
  - **Label** — a literal label (tab, tag, field label), the text typed into an input field, or a **small number** (under 18px, or not the page's key number).
  - **Description** — describes a heading or a label. **Never use Description for a number** — numbers are Label (or Heading when prominent and ≥ 18px).
- **Figma is the source of truth.** Style weights are bound to `L3/typography/base/weight/heading · label · description`
  (750 · 650 · 500) and render exactly that — same as code. Figma has exactly these 20 styles: `L3/Heading/10…36`,
  `L3/Label/10…18`, `L3/Description/10…18`.
- Local (not part of the scale): `label-08` — 650 8/10, chip tab sub label only.
  <!-- PENDING: final usage rules per role and size -->

**What components use internally (don't override):**

| Component | Text tokens |
|---|---|
| Actionbar | title `heading-14`; description `description-12`; typed search text `label-14` |
| Aerobar | `label-14` · `description-12` |
| BottomNavbar | `label-10` |
| BottomSheet | `heading-16` · `heading-20` · `description-12` · `description-14` |
| Button | `heading-14` · `heading-16` · `label-12` |
| EmptyState | title `heading-16`; description `description-14` |
| ListCell | `label-14` · `label-16` · `description-12` |
| Tabs | `label-08` · `label-10` · `label-12` · `label-14` |
| Tag | `label-10` · `label-12` · `label-14` |
| TextField | field label, required mark and counter `label-12`; typed text and placeholder `label-14`; helper text `description-12` |

---

## 5. Components

Use a component whenever one exists. Don't restyle a component's internals from outside; use its props.
Components have no outer margin, so spacing between them belongs to the parent (section 1).

**Usage rules per component** live next to the code in `src/components/<Name>/USAGE.md` (when to use each variant
and size, labels, placement, states). Read the component's USAGE.md before using it. Written so far: `Button`, `ButtonGroup`, `BottomSheet`.

| Component | Import | Required | Use for |
|---|---|---|---|
| `Button` | `components/Button` | label (or `aria-label` if icon-only) | Actions. `variant`: primary · secondary · tertiary · ghost · brand · buy · sell; `size` sm · md · lg |
| `ButtonGroup` | `components/ButtonGroup` | Buttons as children, `aria-label` | The button dock (Figma "L3: Button Dock"): the main action(s) docked at the bottom of a screen or sheet |
| `Tag` | `components/Tag` | text (also the screen-reader text when `hideLabel`) | A static label or status: 3 variants × 12 colors × 3 sizes. `profit` / `loss` for price moves and P&L, `success` / `error` for outcomes, `processing` for in-progress |
| `Switch` | `components/Switch` | a `<label>` or `aria-label` | An on/off setting that applies immediately |
| `Checkbox` / `Radio` | `components/Checkbox` | a `<label>`; radios share a `name` | Multi-select / pick one |
| `TextField` | `components/TextField` | `label` | Single-line input, or `multiline` text box with a counter |
| `Tabs` | `components/Tabs` | `items`, `value`, `onChange`, `aria-label` | Section switching (`underline`) and segmented choices (`pill`, optional `subLabel`); icon-only tabs via `hideLabel` |
| `Actionbar` + `ActionbarAction` | `components/Actionbar` | action: `icon`, `label`, `onClick` | Top bar: back, title, ≤2 actions, search mode, and a `bottom` slot |
| `BottomNavbar` + `NavIcon` | `components/BottomNavbar` | `items`, `value` | App-level section nav (3–5), including MF / F&O sub-navs with `home` |
| `BottomSheet` + `BottomSheetHeader` | `components/BottomSheet` | `open`, `onClose`, a name (`aria-labelledby` or `aria-label`); header `heading` | A modal panel over the screen. Tabs or search at the top of a sheet go in the header's `bottom` slot |
| `Aerobar` | `components/Aerobar` | — (`heading` in practice) | A status bar (inline) or toast (`floating`) |
| `Card` | `components/Card` | children | A surface grouping related content: clickable (`onClick` / `href`) or static (see 7.1); `variant="filled"` for a grey inset panel of details; `selected` for the chosen card in a list of choices |
| `SectionHeader` | `components/SectionHeader` | `title` | A section's heading row: optional tag, info, description (≤ 2 lines) and one action (View all or a switcher); 48 × 48 touch areas |
| `ListCell` | `components/ListCell` | `label` | Rows: plain (no fill, edge to edge) or card (inside a margin), with icons, trailing content, dots; `selected` for the chosen row |
| `EmptyState` | `components/EmptyState` | `title` | Nothing to show, or no results |
| `Icon` | `components/Icon` | `icon` | Any Material Symbol |
| `BrandLogo` | `components/BrandLogo` | `brand` | Lemonn / Zing / Coinswitch logo, full or mark only |
| `Stepper` | `components/Stepper` | `value`, `onChange`, `label` | Quantity / lots with − / + (`size` sm inline in order pads, lg standalone with `sublabel`); set `min`, `max`, `step` |
| `Select` | `components/Select` | children, `onClick` | An inline label + ↕ / chevron that opens a BottomSheet of Radio rows. There is no boxed dropdown |
| `DatePicker` | `components/DatePicker` | `value`, `onChange`, `label` | A day or a range (`mode="range"`), inside a BottomSheet with a ButtonGroup; disable with `min` / `max` |
| `Skeleton` (+ `SkeletonListRow`, `SkeletonCard`) | `components/Skeleton` | — | Loading placeholders in the real layout; `onGrey` on grey surfaces; region gets `aria-busy` |
| `ProgressBar` | `components/ProgressBar` | `value`, `label` | Used / done (`type="progress"`) or a position in a range (`type="range"`, e.g. 24H low–high); `status` for limits; show the value as text too |
| `PriceChange` | `components/PriceChange` | `value` | Any signed change (price, P&L, returns): sign, colour and arrow come from the value. Never colour a change by hand |
| `Chart` / `Sparkline` | `components/Chart` | `data`, `label` (Chart) | Price charts (`candle`, `line`, `area`); Sparkline for list rows next to price + % change |
| `Overlay` | `components/Overlay` | `open` | The scrim behind a custom modal (BottomSheet already includes it) |

**Use this, not that** (from the component APIs and docs):
- **Tags are not buttons.** Anything tappable is a `Button`, a `ListCell as="button"`, or a Tab.
- **There is no Chip component.** For a segmented or filter choice, use `Tabs appearance="pill"`.
- **There is no boxed dropdown.** Use `Select` (inline trigger) + a `BottomSheet` with `Radio` rows.
- **Up / down colour comes from the data:** `Chart` / `Sparkline` `trend` and price changes use the indicator tokens (green up, red down); never colour a negative change green.
- **Cards:** use `Card` (rules in 7.1). For a simple one-line row, `ListCell variant="card"` also exists.
- **Status:**
  - A message that belongs to the page is an inline `Aerobar`.
  - The result of an action (e.g. "order placed") is `Aerobar floating`.
  - Danger announces as an alert, everything else as a status.
- **Controls inside rows:** a row holding a Switch or Checkbox is `ListCell as="label"`, never `as="button"`. Button rows can't contain controls.
- **Actionbar:** `surface-default` with a 1px `border-light` bottom line. When content scrolls under it, it gets
  `shadow-elevation-low` (automatic with `sticky`, or set `elevated`).
- **If flat tabs are used at the top, they go inside the Actionbar's content-bottom slot** (`bottom` prop), never as
  a separate layer below the Actionbar.
- **Don't use `MaskIcon` directly** in screens. Use `Icon` (it's the internal helper for icons and assets).

---

## 6. Screen anatomy

### 6.1 Layering (elevation), bottom → top

| # | Layer | What lives there | Surface | Shadow (Figma effect style) |
|---|---|---|---|---|
| 0 | Screen | page background | `surface-default` | none |
| 1 | Inset | filled cards (grey detail panels) | `surface-secondary` | none |
| 2 | Content | static cards, list rows, text, charts | `surface-default` + `border-light` | none |
| 3 | Raised | clickable cards, chip tabs, text fields | `surface-primary` + `border-light` | `elevation-low` |
| 4 | Bars | Actionbar (sticky), BottomNavbar, ButtonGroup dock | `surface-default` / `surface-primary` | low (Actionbar, once scrolled) · medium (navbar) · high (dock) |
| 5 | Floating | toast (`Aerobar floating`) | `surface-inverted` | `elevation-medium` |
| 6 | Scrim | `Overlay` | `surface-overlay` | none |
| 7 | Sheet | `BottomSheet` | `surface-primary` | `elevation-high` |
| 8 | Second sheet | a sheet on a sheet (max 2; only it has a back button) | `surface-primary` | `elevation-high` |

- Higher layer = heavier shadow; never give a lower layer a heavier shadow than one above it.
- Lifted means tappable: on the page only raised things get a shadow; information stays flat with a border.
- Inset sinks: no border, no shadow, nothing grey inside it.
- Light mode: `surface-default` = `surface-primary` (white), so border + shadow separate layers; dark mode also lightens
  higher surfaces.
- Only the scrim dims, and only a sheet sits above it. Content scrolls under the bars, never over them.
- Docs: Foundations → **Layering**.

<!-- PENDING: screen structure (top bar, body, dock vs bottom navbar, toast and sheet placement) -->

---

## 7. Composition patterns

### 7.1 Card

- **Clickable cards, and other tappable elements like chip tabs,** use `surface-primary`, because they sit on the
  screen background `surface-default`. In the light theme both are the same color (#FFFFFF), so a clickable
  surface **must** also have a 1px `border-light` and `shadow-elevation-low`.
- **Card spec** (Figma Order card): padding `spacing-12`, radius `radius-12`, rows `spacing-08` apart; cards in a list
  are `spacing-16` apart.
- **Press interaction:** on press, a clickable surface scales down (`--l3-motion-scale-press-default`, 0.98).
  Other steps exist for different text sizes (see 11), but which element uses which step is not defined yet.
- **Non-clickable cards** are for decoration or information. **A card with a border radius and a 1px `border-light`
  uses `surface-default`**, with no shadow and no press.
- **Flat cards:** if a card is not rounded and has no border (`variant="flat"`), it has **no background** unless one
  is set manually (`surface`) — transparent, no border, no shadow. It can still be clickable.
  <!-- PENDING: confirm whether flat cards carry a border-light (e.g. as a divider) — currently: no border -->
- **A card with only one button is a clickable card:** the whole card is the tap target instead of the button.
  So a clickable card never contains other buttons or links.
- **Padding & placement:** rounded cards (clickable, static, filled) are **always padded** and **always sit inside a
  margin** — never touching their container's edges (16 from the screen edge, 16 between cards). Only a **flat** card
  may drop its padding (`padding="none"`, Figma isPadded = False), and a flat card **always runs edge to edge** in its
  container. The margin comes from the parent (padding / gap) — cards have no outer margin of their own.
- **List cell follows the Card rules** (it is a card with specific content — dropdown options, settings, lists):
  - plain row = Flat card: no fill, runs edge to edge;
  - card row, **not tappable** = Static card: **no fill** (takes the colour it sits on) + `border-light`, no shadow;
  - card row, **tappable** = Clickable card: `surface-primary` + `border-light` + `elevation-low`, press 0.98;
  - selected (tappable only): plain → `surface-secondary`, card → `border-dark`. Figma: isPlain · isTappable · isSelected.
- **Selected cards** (the chosen option in a list of choices — a contract, a plan, an account): only clickable cards
  can be selected (`selected`, Figma `isSelected = True`).
  - **Bordered** (rounded + border) card: swap `border-light` for **`border-dark`**. Nothing else changes — same
    surface, shadow, radius and padding.
  - **Flat** card: it has no border, so selection is a **`surface-secondary`** background. Unselected, a flat card has
    **no fill** and takes the colour of whatever it sits on (another card or the screen).
  - Static and filled cards are never selected. Don't show selection with a coloured border, a tint or a tick alone.

### 7.2 Containers & grey fills

- **Large containers** (a hero, a section panel, a showcase, a preview stage) use **`surface-default` + a 1px
  `border-light`** — never a grey fill over the whole block.
- **Small informative cards inside a container** (stats, key-value tiles, hints, inner panels) may use
  **`surface-secondary`** (grey), so they read as grouped content inside the container.
- Don't nest grey in grey: a grey card goes on `surface-default`, not on another grey surface.

### 7.3 Other patterns

<!-- PENDING: form, list and other patterns not yet defined, do not infer -->

---

## 8. Trading semantics

<!-- PENDING: buy/sell usage, price up/down vs success/error, order-status colors, number and currency formatting -->

---

## 9. Content & voice

<!-- PENDING: casing, button verbs, error and empty-state copy, allowed abbreviations -->

---

## 10. States

**Which component handles each state (from code):**

| State | Use |
|---|---|
| Empty / no results | `EmptyState` (illustration + title + description + action) |
| Loading content | `Skeleton` / `SkeletonListRow` / `SkeletonCard` in the same layout (region `aria-busy`) |
| Loading an action | `Button loading` (keeps its width, shows the loader) |
| Field error / success | `TextField status="error" \| "success"` + `helperText` (announced while typing) |
| Page or result message | `Aerobar` (`danger`, `success`, `warning`, `discover`) |
| Disabled | The component's own `disabled` prop, which uses the `*-disabled` tokens |

There is **no spinner** — use `Skeleton` for loading content and `Button loading` for actions.

<!-- PENDING: which states every screen must cover -->

---

## 11. Interaction

- **Tap targets are at least 32px** (`--l3-size-tap-target`). Components grow their tap area with an invisible `::after`, so the visual size doesn't change.
- **Hover styles only inside `@media (hover: hover)`**, so taps don't leave elements stuck highlighted. Add `touch-action: manipulation`.
- **Hover and press use state layers:** `--l3-state-layer-dark-*` on light fills and `--l3-state-layer-light-*` on dark ones, painted as a background image, not an overlay element.
- **Focus:** `:focus-visible` outline `var(--l3-spacing-02) solid var(--l3-border-dark)`.
- **Press scale** (clickable cards, chip tabs): `transform: scale(var(--l3-motion-scale-press-*))` while pressed,
  with steps 0.01 apart: `xl` 1.00 · `l` 0.99 · `default` 0.98 · `m` 0.97 · `sm` 0.96 (local tokens).
  <!-- PENDING: which step each element / text size uses; everything uses `default` today -->
- **Motion:** only `--l3-motion-duration-short` (150ms), `--l3-motion-duration-medium` (250ms) and `--l3-motion-easing-standard`. Always add a `prefers-reduced-motion: reduce` rule that removes it.
- **Toasts** with an action don't auto-dismiss; they stay until acted on or replaced.
- **Bottom sheets** have no drag handle and no visible close button: they close on a backdrop tap or by dragging the sheet down (anywhere on it; the content first scrolls to the top), plus Esc and a visually hidden Close button for screen readers. At most two sheets stack: the first has no back button, a second one on top of it has a back button, never a third. Focus is trapped inside while one is open, and the page behind is inert.
- **Keyboard:** Tabs move with ← → Home End; the selected tab scrolls into view.

---

## 12. Accessibility

- **Every control needs a name.** A visible `<label>` or `aria-label`; icon-only buttons need `aria-label`. `Switch`, `Checkbox` and `Radio` log a development warning when unnamed.
- **Headings:** `Actionbar` renders the screen title as `h1` (`headingLevel={2}` inside sheets). `EmptyState` uses `h2` / `h3`. Keep heading order.
- **Icons are decorative** (`aria-hidden`) unless given a `label`. `BrandLogo` is named by default; use `decorative` when the brand name is written next to it.
- **Announcements:**
  - `Aerobar` is `role="status"` (danger: `role="alert"`).
  - `TextField` helper and error text is live.
  - `BottomSheet` is `role="dialog"`.
- **Current location:** `BottomNavbar` marks the current section with `aria-current="page"`. `Tabs` use `role="tablist"` / `tab` with `aria-selected`.
- **Dots and badges** carry screen-reader text (`ListCell dotLabel`, default "New").
- **Contrast:** failures in the default themes are accepted; the **♿ Accessible** themes (`data-contrast="accessible"`, see 13) handle high contrast. Check new UI in both.

---

## 13. Theming

- **5 themes:** Lemonn light and dark, CS PRO dark (dark only), Kuber light and dark. They're selected by `data-product` + `data-mode` on `<html>`, or on any wrapper to theme just that part.
- **♿ Accessible contrast:** each of the 5 has an Accessible version (Figma "♿ Accessible" modes — 10 theme modes in total), turned on with `data-contrast="accessible"` next to `data-product` / `data-mode` (`useTheme().setContrast('accessible')`, saved with the theme). Until someone picks a contrast, it follows the OS **Increase contrast** setting (`prefers-contrast: more` → ♿ Accessible); an explicit choice always wins. It raises secondary/tertiary text opacity, strengthens dark-mode borders and moves accents one step for contrast. Components need no changes — they use the same semantic tokens.
- `ThemeProvider` applies the theme, and `useTheme()` reads or changes it (`product`, `mode`, `contrast`). The saved theme (`localStorage` key `l3-theme`) is applied before the first paint. Asking CS PRO for light mode falls back to dark.
- Style with **semantic** tokens (`surface`, `content`, `border`, `component`). **Never use `--l3-base-*`** except in brand artwork: `BrandLogo` keeps the Lemonn and honey ramps in every theme.
- Check every screen in light and dark.

---

## 14. Icons & brand assets

- **Only Material Symbols Rounded,** weight 400, grade 0, **optical size 24dp.** Never the 48px set, and never another icon family.
- Import one icon at a time: `import { msWallet, msWalletFill } from './icons/material'`, then render `<Icon icon={msWallet} size={24} />`.
- **Sizes:** `--l3-icon-size-*` 12–24. Default 24; 16 inside small buttons and tabs. The icon takes the text color.
- **Filled variants** exist for every icon (`ms<Name>Fill`).
  <!-- PENDING: when to use filled vs outlined -->
- **Not Material:** the bottom-nav icons (`NavIcon`), brand logos (`BrandLogo`), and the Empty state illustration are Figma artwork. Don't redraw or recolor them.

---

## 15. Responsive

- **Mobile first.** Build at **360px**, the Figma frame width, and check **392** and **412**.
- **No horizontal page scroll.** Tabs scroll sideways inside themselves.
- **Full-width parts touch the screen edges:** Actionbar, Tabs, BottomNavbar, ButtonGroup, inline Aerobar, plain ListCell, EmptyState. Other content sits inside a 16px gutter.
- **Safe areas:** Actionbar pads for the status bar (`env(safe-area-inset-top)`); BottomNavbar `fixed` and ButtonGroup pad for the home indicator.
- **Long text:** one-line titles and labels truncate with an ellipsis (Actionbar title, nav labels). Body text wraps. Flex children need `min-width: 0`.

---

## 16. Do / Don't

| Component | Do | Don't |
|---|---|---|
| Button | One primary action per screen, paired with secondary actions | Several primary buttons side by side |
| Button | `primary` for every action; `buy` / `sell` only for placing orders (colors follow the product theme) | Buy/Sell for unrelated actions |
| ButtonGroup | Horizontal: primary on the right. Vertical: primary on top | Flip the order between screens |
| Tag | One or two words that label or show status | A tag as a button, or for sentences |
| Switch | Settings that take effect as soon as they flip | Inside a form that needs Save (use a checkbox) |
| Checkbox / Radio | Radios when exactly one option can be chosen | Checkboxes for mutually exclusive options |
| TextField | A visible label that stays while typing | The placeholder as the label |
| TextField | Errors that say what went wrong and how to fix it | A red border with no message |
| Tabs | Two to four short, parallel labels | Long labels that truncate, or tabs that act like buttons |
| Actionbar | One or two of the most useful actions | Crowding it with icons |
| BottomNavbar | Three to five top-level sections, always labelled | Actions (like Buy), or more than five items |
| BottomSheet | Close by backdrop tap or dragging down; tabs in the header's `bottom` slot | A ✕ button or a drag handle |
| Aerobar | Toasts with an action stay until tapped or closed | Important info or undo behind a timer |
| EmptyState | Say what happened and give a way to recover | A blank screen or dead end |
| ListCell | Tappable rows get a chevron or trailing control | Tappable rows with nothing to hint at it |

---

## 17. Known token gaps

**Not yet resolved. Do not rely on these for AI generation.**

| Gap | What's in the tokens today |
|---|---|
| **us-stock and discover have mostly not diverged** | `us-stock` tokens still point to the same blue ramp as `discover`; the only difference so far is `surface/accent/us-stock-default` in Lemonn / Kuber dark (blue-500 vs discover's blue-400). |
| **surface/default = surface/primary in light mode** | In LM Light both are `neutral-white-base`, so a "raised" surface doesn't separate from the page. |
| **extra/gold duplicates the honey ramp** | `extra/gold/*` aliases the `hue/honey` ramp (for example gold-100 → honey-100 in light, honey-800 in dark). It has no values of its own. |

---

## 18. Agent output contract

<!-- PENDING: what an agent must deliver and check before finishing a screen -->
