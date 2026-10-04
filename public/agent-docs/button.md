# Button

> Buttons let people take an action, confirm a choice or move forward in a flow.

- Group: Action
- Lifecycle: done
- Status: Figma synced
- Version: 1.4.1
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4471-29225
- Source: `src/components/Button`
- Also called: Action, call to action, CTA

## Import

```tsx
import { Button } from './components/Button' // path relative to src/
```

## Usage rules (USAGE.md)

`import { Button } from './components/Button'` · Figma: "L3: Button" (4471:29225) · Docs: `#/button`

A button starts an action. If it only navigates to another screen or section, it is still a Button when it
looks like one; text links inside content use a text action instead (see *Not a button*).

---

### 1. Choose the variant

| Variant | Use for | Limit |
|---|---|---|
| `primary` *(default)* | The main action of a screen, sheet or step: *Place order*, *Continue*, *Save*. | **One per screen** (one per sheet when a sheet is open). |
| `secondary` | The alternative action **next to a stronger button** (`primary`, `buy`, `sell` or `brand`): *Cancel*, *Modify*, *Edit order*. Its darker border only makes sense beside that stronger button. Mostly used in a **button dock / `ButtonGroup`, typically inside a bottom sheet**. | **Only alongside a stronger button.** Never on its own on the page or inside a card. |
| `tertiary` | Low-emphasis actions that sit **on the page or inside content**: *View all* at the end of a list, *Add another*, *Load more*, *Sort*. | Use this (not `secondary`) when the action stands alone. |
| `ghost` | Text-style actions with no container, inside other components: the Aerobar action, *Clear* next to search, inline *Edit*. | Not as a screen's main action. |
| `brand` | Brand moments: onboarding, promotions, first-run CTAs. Follows the product color (Lemonn lime, CS PRO gold, Kuber green). | Not for everyday actions, not next to `buy`/`sell`. |
| `buy` / `sell` | **Only** to place or confirm a trade. Colors follow the product theme: `buy` uses the product's buy color (Lemonn lime, CS PRO market green, Kuber green), `sell` is red. | Never for unrelated actions (don't use `sell` as a "danger" button). |

**Rule of thumb: every action is `primary` (or `secondary`/`tertiary`/`ghost` around it), except buying or selling, which use `buy` / `sell`.** In Lemonn and Kuber `buy` and `brand` share the product color on purpose — they never appear on the same screen, so it isn't ambiguous.

Pairs that work: `secondary` + `primary`, `sell` + `buy`, `secondary` + `buy` (e.g. *Modify* + *Buy*), `secondary` + `brand`.
Pairs to avoid: two `primary`, `primary` + `buy`, `brand` + `primary`, a `secondary` on its own.

**Example — a list with a "View all" at the end:** the button is `tertiary`, not `secondary`, because it stands alone on the page.

### 2. Choose the size

| Size | Height (code) | Use in |
|---|---|---|
| `lg` *(default)* | 48 (`size/control-lg`) | Bottom docks and `ButtonGroup` — **always `lg` there, never `md` or `sm`** (`ButtonGroup` warns in development). Also the main CTA of a screen or sheet. |
| `md` | 40 (`size/control-md`) | Actions inside content: cards, sheet bodies, form sections. |
| `sm` | 32 (`size/control-sm`) | Compact spots: empty-state action, inline row actions, toolbars, Actionbar actions (via `ActionbarAction`). |

- Buttons that sit side by side use the **same size**.
- Every size keeps a tap area of at least 32px (code).

### 3. Width & placement

- In a bottom dock with one action, use `fullWidth`. With two, use `ButtonGroup` (it sizes them for you). Dock buttons are always `lg`.
- `ButtonGroup` order: **horizontal → primary on the right**, **vertical → primary on top**. Keep the same order on every screen.
- Inside content, buttons hug their label (no `fullWidth`) and align to the start, unless they are the only element in a centred block (e.g. `EmptyState`).
- Don't put more than 2 buttons in a row on a 360px screen; move extra actions to a sheet or menu.

### 4. Label

- **Verb first, specific, sentence case:** *Place order*, *Add funds*, *Cancel order* — not *Submit*, *OK*, *Yes*.
- 1–3 words; no ending punctuation; no ALL CAPS.
- Labels must fit on one line at 360px in the chosen size. If it doesn't fit, shorten the label, don't shrink the text.
- Say the same action the same way everywhere (*Add to watchlist*, not *Save* on one screen and *Add* on another).

### 5. Label & icons: what can be shown

A button has three parts that can each be shown or hidden (Figma 👁️ Label · 👁️ Icon-L · 👁️ Icon-R):

| Label | Icon left | Icon right | Allowed? |
|---|---|---|---|
| ✓ | – | – | ✅ label only |
| ✓ | ✓ | – | ✅ |
| ✓ | – | ✓ | ✅ |
| ✓ | ✓ | ✓ | ✅ label with an icon on both sides |
| – | ✓ | – | ✅ icon-only (needs `aria-label`) |
| – | – | ✓ | ✅ icon-only (needs `aria-label`) |
| – | ✓ | ✓ | ❌ **never two icons without a label** |
| – | – | – | ❌ **at least one part must be visible** |

The component enforces this: TypeScript rejects the two ❌ rows, and at runtime an icon-only button with two icons
shows only the left one (with a development warning).

### 6. Icons

- `iconLeft` reinforces the action (*+ Add*, *filter*); `iconRight` shows direction (*Continue →*).
- Use Material Symbols from `icons/material` (`<Icon icon={msAdd} />`); the button sizes the icon for you (24 / 20 / 16 by size — code).
- **Icon-only** buttons must have `aria-label`. In the top bar, use `ActionbarAction` instead of a bare Button.

### 7. States

- `loading` while the action is running (submitting an order, saving). It keeps the width and ignores taps, so it also prevents double submits (code). Don't change the label while loading.
- `disabled` only when the action isn't possible **and** the reason is visible nearby (e.g. an invalid field with its error message). Don't disable to hide a feature.
- After the action: show the result with an `Aerobar` (toast) or move to the next screen — don't leave the button as the only feedback.

### 8. Accessibility

- Buttons default to `type="button"` (code); use `type="submit"` for a form's main button.
- The label is the accessible name; with no label, `aria-label` is required.
- Don't put interactive elements inside a button.

### 9. Not a button

- **Tapping a whole card** → a clickable `Card`, not a Card with a single Button in it.
- **Inline text action** like *Filters* or *View details* in a toolbar → text in `content/accent/discover` (a real `<button>` or link underneath), not a Button.
- **Tabs / segmented choices** → `Tabs` (pill for chips).
- **Status labels** → `Tag` (tags are never tappable). Price moves use `profit` / `loss`, outcomes `success` / `error`.

---

### Code

```tsx
// Screen CTA in a dock
<ButtonGroup direction="horizontal" aria-label="Order actions">
  <Button variant="secondary">Modify</Button>
  <Button variant="buy">Buy</Button>
</ButtonGroup>

// Single full-width CTA
<Button fullWidth loading={saving} onClick={save}>Save changes</Button>

// Sheet dock: secondary only next to the stronger action, both Large
<ButtonGroup direction="horizontal" aria-label="Confirm">
  <Button variant="secondary">Cancel</Button>
  <Button>Confirm</Button>
</ButtonGroup>

// "View all" at the end of a list: tertiary (it stands alone)
<Button size="md" variant="tertiary" iconRight={<Icon icon={msArrowForward} />}>View all</Button>

// Inside content
<Button size="md" variant="tertiary" iconLeft={<Icon icon={msAdd} />}>Add another</Button>

// Empty state action
<Button size="sm" iconLeft={<Icon icon={msDeleteForever} size={12} />} onClick={clear}>Clear</Button>

// Icon-only (outside the Actionbar): exactly one icon + aria-label; tertiary because it stands alone
<Button size="sm" variant="tertiary" aria-label="Share" iconLeft={<Icon icon={msShare} />} />
```

---

### Open questions

<!-- PENDING: destructive actions that aren't trades (Delete list, Remove card) — no danger variant exists. Use tertiary + a confirmation sheet? -->
<!-- PENDING: is "Cancel order" a trade action (sell style) or a destructive action? -->
<!-- PENDING: difference in intent between tertiary and ghost beyond "container or not" -->
<!-- PENDING: brand vs primary — which screens count as "brand moments"? -->

## Overview

### Types

Seven types. Buy and Sell carry trade actions; Brand follows the product color (Lemonn lime, CS PRO gold, Kuber green).

PrimarySecondaryTertiaryGhostBrandBuySell

### Sizes

Large (48), Medium (40) and Small (32). Every size has at least a 32px tap area.

LargeMediumSmall

### Secondary, tertiary and docks

Secondary (dark border) only appears next to a stronger button — primary, buy, sell or brand — usually in a sheet's button dock. On its own, on the page or inside a card, use tertiary instead (e.g. *View all* at the end of a list). Buttons in a dock or ButtonGroup are always Large.

### Label and icons

Label, left icon and right icon can each be hidden, but at least one must show, and an icon-only button has exactly one icon (plus an `aria-label`). TypeScript rejects the other combinations.

### States

Loading keeps the button's width and ignores taps. Disabled uses the theme's disabled tokens.

BuyBuy

## Do / Don't

### One primary action per screen

- ✅ **Do:** Pair one primary with secondary actions so the main step is obvious.
- ❌ **Don't:** Put several primary buttons side by side — nothing stands out.

### Secondary only beside a stronger button

- ✅ **Do:** Pair secondary with primary, buy, sell or brand — usually in a dock. Alone, use tertiary.
- ❌ **Don't:** Use a secondary button on its own on the page or inside a card.

### Use Buy and Sell only for trades

- ✅ **Do:** Use Primary for every action; Buy and Sell only for placing orders.
- ❌ **Don't:** Borrow their colors for unrelated actions like saving settings.

## Options (tree)

Button — 7 variants · 3 sizes · 3 states

- **Variant** — What the action means
  - *Emphasis* — Everyday actions, strongest to quietest
    - `primary` — The main action. One per screen.
    - `secondary` — Only next to a stronger button, usually in a dock.
    - `tertiary` — Stand-alone actions in content, e.g. View all.
    - `ghost` — Text-style action inside other components.
  - *Brand* — Follows the product color
    - `brand` — Brand moments: onboarding, promotions.
  - *Trade* — Only to place or confirm a trade
    - `buy` — Buy side.
    - `sell` — Sell side. Never a "danger" button.
- **Size** — Where it sits
  - `lg · 48` — Docks / ButtonGroup (always) and the main CTA.
  - `md · 40` — Inside content: cards, sheet bodies, forms.
  - `sm · 32` — Compact spots: empty states, inline rows, toolbars.
- **State** — What it is doing
  - `default` — Ready to tap.
  - `loading` — While the action runs. Keeps its width, ignores taps.
  - `disabled` — Only when the reason is visible nearby.
- **Content** — Label and icons
  - `label` — Verb first, 1–3 words.
  - `icon left + label` — Icon reinforces the action.
  - `label + icon right` — Icon shows direction.
  - `icon only` — Exactly one icon + aria-label. Never two icons without a label.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'tertiary' \| 'ghost' \| 'brand' \| 'buy' \| 'sell'` | `'primary'` | Figma Type. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | Figma Size: Small 32, Medium 40, Large 48. |
| `loading` | `boolean` | `false` | Figma State=♻︎ Loading. Shows the loader, keeps the width, ignores clicks, sets aria-busy. |
| `disabled` | `boolean` | `false` | Figma State=🚫 Disabled. |
| `children` | `ReactNode` |  | The label (Figma 👁️ Label). Leave it out for an icon button: then pass exactly one icon and aria-label. |
| `aria-label` | `string` |  | Required for an icon button (no label). Names the action, e.g. "Share". |
| `iconLeft` | `ReactNode` |  | Figma icon-l slot, sized and colored by the button. |
| `iconRight` | `ReactNode` |  | Figma icon-r slot. |
| `fullWidth` | `boolean` | `false` | Stretch to the container width. |
| `…button props` | `ButtonHTMLAttributes` |  | onClick, type (defaults to "button"), aria-*, etc. |

## Tokens used

- `component/button/*`
- `state-layer/*`
- `text-bold-16 · 14`
- `text-semibold-12`
- `size/control-sm · md · lg`
- `radius/08 · 12`
- `icon-size/16 · 20 · 24`
- `size/tap-target`

## Recent changes

- **1.4.1** (2026-10-01) CS PRO primary is gold: CS PRO: Primary button uses the brand gold (surface/accent/brand-default) with white text. ♿ Accessible CS PRO keeps the inverted primary, and Buy uses success green.
- **1.4.0** (2026-09-30) Label & icon rule, usage rules: At least one of label / iconLeft / iconRight must show, and icon-only buttons have exactly one icon — enforced in TypeScript, with a runtime fallback (left icon wins). Usage rules in src/components/Button/USAGE.md: secondary only next to a stronger button, tertiary when alone (View all), Large only in docks. ButtonGroup warns in development when a button isn’t size="lg".
- **1.3.0** (2026-09-26) Material Symbols icons: Icons now come from the Material Symbols Rounded library (weight 400, 24dp) and take the text color.
