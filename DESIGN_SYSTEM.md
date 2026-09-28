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
> scale**. Some components still use them (see 2.3).

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

### 2.3 Inconsistencies found

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

<!-- PENDING: paste verbatim from notes -->
Waiting for the exact text from your notes on:
- `surface/*` elevation scale
- `static/black`, `static/white`
- `content/tertiary`
- indicator vs success/error
- zing / us-stock / discover
- `extra/gold`
- purple / indigo / teal / orange

---

## 4. Typography

**Facts (from code):**
- One font: **Manrope**, applied only through text tokens. Never set `font-family`.
- Style text with a single shorthand token: `font: var(--l3-text-<weight>-<size>);`
  Weights: `regular`, `medium`, `semibold`, `bold`, `extrabold`. Sizes: 10, 12, 14, 16, 18, 20 (and 24–36 for semibold, bold, extrabold).
  Figma names: extrabold = *Heading*, semibold = *Label*, medium = *Body*.
- Never set `font-size`, `font-weight` or `line-height` on their own.
- What components use internally (don't override):

| Component | Text tokens |
|---|---|
| Actionbar | title `extrabold-14`, description `medium-12`, search `medium-14` |
| Aerobar | heading `semibold-14`, paragraph `medium-12` |
| BottomNavbar | labels `semibold-10` |
| BottomSheet | headings `extrabold-18` / `-20`, text `semibold-12` / `-14` |
| Button | lg `bold-16`, md `bold-14`, sm `semibold-12` |
| EmptyState | title `extrabold-16`, description `semibold-14` |
| ListCell | label `semibold-14` / `-16`, description `medium-12` |
| Tabs | labels `semibold-10`–`-14`, selected `extrabold-12` / `-14` |
| Tag | `semibold-10` / `-12` / `-14` by size |
| TextField | label `semibold-12`, input `medium-14`, helper `medium-12` |

<!-- PENDING: typography roles for screen content (page title, section heading, card title, price, meta) -->

---

## 5. Components

Use a component whenever one exists. Don't restyle a component's internals from outside; use its props.
Components have no outer margin, so spacing between them belongs to the parent (section 1).

| Component | Import | Required | Use for |
|---|---|---|---|
| `Button` | `components/Button` | label (or `aria-label` if icon-only) | Actions. `variant`: primary · secondary · tertiary · ghost · brand · buy · sell; `size` sm · md · lg |
| `ButtonGroup` | `components/ButtonGroup` | Buttons as children, `aria-label` | 1–2 buttons docked at the bottom, or grouped actions |
| `Tag` | `components/Tag` | text | A static label or status: 3 variants × 9 colours × 3 sizes |
| `Switch` | `components/Switch` | a `<label>` or `aria-label` | An on/off setting that applies immediately |
| `Checkbox` / `Radio` | `components/Checkbox` | a `<label>`; radios share a `name` | Multi-select / pick one |
| `TextField` | `components/TextField` | `label` | Single-line input, or `multiline` text box with a counter |
| `Tabs` | `components/Tabs` | `items`, `value`, `onChange`, `aria-label` | Section switching (`underline`) and segmented choices (`pill`) |
| `Actionbar` + `ActionbarAction` | `components/Actionbar` | action: `icon`, `label`, `onClick` | Top bar: back, title, ≤2 actions, search mode, and a `bottom` slot |
| `BottomNavbar` + `NavIcon` | `components/BottomNavbar` | `items`, `value` | App-level section nav (3–5), including MF / F&O sub-navs with `home` |
| `BottomSheet` + `BottomSheetHeader` | `components/BottomSheet` | `open`, `onClose`, a name (`aria-labelledby` or `aria-label`); header `heading` | A modal panel over the screen |
| `Aerobar` | `components/Aerobar` | — (`heading` in practice) | A status bar (inline) or toast (`floating`) |
| `ListCell` | `components/ListCell` | `label` | Rows: plain or card, with icons, trailing content, dots |
| `EmptyState` | `components/EmptyState` | `title` | Nothing to show, or no results |
| `Icon` | `components/Icon` | `icon` | Any Material Symbol |
| `BrandLogo` | `components/BrandLogo` | `brand` | Lemonn / Zing logo, full or mark only |

**Use this, not that** (from the component APIs and docs):
- **Tags are not buttons.** Anything tappable is a `Button`, a `ListCell as="button"`, or a Tab.
- **There is no Chip component.** For a segmented or filter choice, use `Tabs appearance="pill"`.
- **There is no Card component.** For simple rows use `ListCell variant="card"`; anything else is a pending pattern (section 7).
- **Status:**
  - A message that belongs to the page is an inline `Aerobar`.
  - The result of an action (e.g. "order placed") is `Aerobar floating`.
  - Danger announces as an alert, everything else as a status.
- **Controls inside rows:** a row holding a Switch or Checkbox is `ListCell as="label"`, never `as="button"`. Button rows can't contain controls.
- **Tabs that belong to the top bar** go in the `Actionbar` `bottom` slot, not below the Actionbar.
- **Don't use `MaskIcon` directly** in screens. Use `Icon` (it's the internal helper for icons and assets).

---

## 6. Screen anatomy

<!-- PENDING: screen structure (top bar, body, dock vs bottom navbar, toast and sheet placement) -->

---

## 7. Composition patterns

<!-- PENDING: patterns not yet defined, do not infer -->

---

## 8. Trading semantics

<!-- PENDING: buy/sell usage, price up/down vs success/error, order-status colours, number and currency formatting -->

---

## 9. Content & voice

<!-- PENDING: casing, button verbs, error and empty-state copy, allowed abbreviations -->

---

## 10. States

**Which component handles each state (from code):**

| State | Use |
|---|---|
| Empty / no results | `EmptyState` (illustration + title + description + action) |
| Loading an action | `Button loading` (keeps its width, shows the loader) |
| Field error / success | `TextField status="error" \| "success"` + `helperText` (announced while typing) |
| Page or result message | `Aerobar` (`danger`, `success`, `warning`, `discover`) |
| Disabled | The component's own `disabled` prop, which uses the `*-disabled` tokens |

There is **no skeleton or spinner component** yet.

<!-- PENDING: which states every screen must cover -->

---

## 11. Interaction

- **Tap targets are at least 32px** (`--l3-size-tap-target`). Components grow their tap area with an invisible `::after`, so the visual size doesn't change.
- **Hover styles only inside `@media (hover: hover)`**, so taps don't leave elements stuck highlighted. Add `touch-action: manipulation`.
- **Hover and press use state layers:** `--l3-state-layer-dark-*` on light fills and `--l3-state-layer-light-*` on dark ones, painted as a background image, not an overlay element.
- **Focus:** `:focus-visible` outline `var(--l3-spacing-02) solid var(--l3-border-dark)`.
- **Motion:** only `--l3-motion-duration-short` (150ms), `--l3-motion-duration-medium` (250ms) and `--l3-motion-easing-standard`. Always add a `prefers-reduced-motion: reduce` rule that removes it.
- **Toasts** with an action don't auto-dismiss; they stay until acted on or replaced.
- **Bottom sheets** close on Esc, a backdrop tap or dragging down, and must also have a close button. Focus is trapped inside while one is open, and the page behind is inert.
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
- **Contrast:** failures in the default themes are accepted; the "♿ Accessible" theme modes (not yet in the tokens) handle high contrast.

---

## 13. Theming

- **5 themes:** Lemonn light and dark, CS PRO dark (dark only), Kuber light and dark. They're selected by `data-product` + `data-mode` on `<html>`, or on any wrapper to theme just that part.
- `ThemeProvider` applies the theme, and `useTheme()` reads or changes it. The saved theme (`localStorage` key `l3-theme`) is applied before the first paint. Asking CS PRO for light mode falls back to dark.
- Style with **semantic** tokens (`surface`, `content`, `border`, `component`). **Never use `--l3-base-*`** except in brand artwork: `BrandLogo` keeps the Lemonn and honey ramps in every theme.
- Check every screen in light and dark.

---

## 14. Icons & brand assets

- **Only Material Symbols Rounded,** weight 400, grade 0, **optical size 24dp.** Never the 48px set, and never another icon family.
- Import one icon at a time: `import { msWallet, msWalletFill } from './icons/material'`, then render `<Icon icon={msWallet} size={24} />`.
- **Sizes:** `--l3-icon-size-*` 12–24. Default 24; 16 inside small buttons and tabs. The icon takes the text colour.
- **Filled variants** exist for every icon (`ms<Name>Fill`).
  <!-- PENDING: when to use filled vs outlined -->
- **Not Material:** the bottom-nav icons (`NavIcon`), brand logos (`BrandLogo`), and the Empty state illustration are Figma artwork. Don't redraw or recolour them.

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
| Button | Buy (green) and Sell (red) only for placing orders | Buy/Sell colours for unrelated actions |
| ButtonGroup | Horizontal: primary on the right. Vertical: primary on top | Flip the order between screens |
| Tag | One or two words that label or show status | A tag as a button, or for sentences |
| Switch | Settings that take effect as soon as they flip | Inside a form that needs Save (use a checkbox) |
| Checkbox / Radio | Radios when exactly one option can be chosen | Checkboxes for mutually exclusive options |
| TextField | A visible label that stays while typing | The placeholder as the label |
| TextField | Errors that say what went wrong and how to fix it | A red border with no message |
| Tabs | Two to four short, parallel labels | Long labels that truncate, or tabs that act like buttons |
| Actionbar | One or two of the most useful actions | Crowding it with icons |
| BottomNavbar | Three to five top-level sections, always labelled | Actions (like Buy), or more than five items |
| BottomSheet | A close button | Relying on drag-down or the backdrop alone |
| Aerobar | Toasts with an action stay until tapped or closed | Important info or undo behind a timer |
| EmptyState | Say what happened and give a way to recover | A blank screen or dead end |
| ListCell | Tappable rows get a chevron or trailing control | Tappable rows with nothing to hint at it |

---

## 17. Known token gaps

**Not yet resolved. Do not rely on these for AI generation.**

| Gap | What's in the tokens today |
|---|---|
| **us-stock and discover have not diverged** | Every `us-stock` token points to the same blue ramp as `discover` (surface light/default, content, border light/default, gradient stops), for example both are `hue-blue-500`. |
| **surface/default = surface/primary in light mode** | In LM Light both are `neutral-white-base`, so a "raised" surface doesn't separate from the page. |
| **extra/gold duplicates the honey ramp** | `extra/gold/*` aliases the `hue/honey` ramp (for example gold-100 → honey-100 in light, honey-800 in dark). It has no values of its own. |

---

## 18. Agent output contract

<!-- PENDING: what an agent must deliver and check before finishing a screen -->
