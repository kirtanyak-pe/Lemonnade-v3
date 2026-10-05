# Button dock

> A bar at the bottom of a screen or sheet that holds its main actions — stacked full-width, or side by side.

- Group: Action
- Lifecycle: done
- Status: Figma synced
- Version: 1.1.1
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4471-29456
- Source: `src/components/ButtonGroup`
- Also called: Button group, ButtonGroup, action bar, sticky footer, CTA bar

## Import

```tsx
import { ButtonGroup } from './components/ButtonGroup' // path relative to src/
```

## Usage rules (USAGE.md)

`import { ButtonGroup } from './components/ButtonGroup'` · Figma: "L3: Button Dock" (4471:29456, formerly "L3: Button Group") · Docs: `#/button-group`

The **button dock**: the bar at the bottom of a screen or bottom sheet that holds its main action(s).
In code it's a `surface-primary` bar with a 1px `border-light` top line, 16px padding, 12px between buttons and
extra bottom padding for the home indicator.

---

### 1. When to use it

- For the **main action(s) of a screen or a bottom sheet**: *Place order*, *Confirm*, *Save*, *Buy / Sell*.
- Even for a **single** main action — the dock gives it the bar, spacing and safe-area padding.
- **One dock per screen** (and one per open sheet, in the sheet's `footer`).

Don't use it for:
- Actions inside content (a card, a list, a form section) → a standalone `Button` (`tertiary` when alone, e.g. *View all*).
- Toolbar actions like *Filters* or *Sort* → text actions / `tertiary` buttons in the toolbar row.
- Choosing between options → `Tabs` (pill for chips).

### 2. What goes inside

- **`Button`s, always `size="lg"`** — never `md` or `sm` (`ButtonGroup` warns in development otherwise) — plus optional
  helper text below them.
- **At least one strong button:** `primary`, `buy`, `sell` or `brand`.
- A `secondary` button only **next to** that strong button (never a dock of only secondary buttons) — `ButtonGroup`
  warns in development.
- Allowed combinations:

| Buttons | Example |
|---|---|
| 1 strong | *Place buy order* |
| secondary + strong | *Cancel* + *Confirm*, *Modify* + *Buy* |
| sell + buy | Trade ticket |
| strong + secondary + ghost, **vertical**, optional helper text below | Figma's bottom sheet footer (e.g. *Confirm* / *Edit* / *Not now*) |

- A `ghost` button in a dock is the lowest-priority option (e.g. *Not now*, *Skip*) and goes **last** (bottom).
  <!-- PENDING: when a ghost button belongs in a dock vs outside it; is tertiary ever allowed in a dock? -->
- **Helper text** (e.g. charges, terms) can sit under the buttons inside the dock, as in Figma's bottom sheet.

### 3. Direction & order

| Direction | Use when | Order |
|---|---|---|
| `vertical` *(default)* | One button, or two buttons whose labels don't fit side by side at 360px | **Primary (strong) on top**, secondary below |
| `horizontal` | Two buttons with short labels (1–2 words each) | **Primary (strong) on the right**, secondary on the left; `sell` left, `buy` right |

- Keep the same order on every screen — people learn where the main action is.
- Horizontal gives each button an equal width; never set widths yourself.

### 4. Placement & scrolling

- The dock is the **last element** of the screen or sheet, pinned to the bottom (in a sheet, pass it as `footer`).
- The scrolling content above it ends above the dock — nothing sits behind it.
- Turn on **`scrollIndicator`** while content is scrolling underneath and there's more below; turn it off when the
  user reaches the end (the Order review demo does this).

### 5. States

- While the main action runs, set `loading` on **that** button (it keeps its width and blocks double taps); leave
  the other button enabled unless it would break the action.
- Disable the main button only when the reason is visible above (e.g. an invalid field) — see `Button/USAGE.md`.

### 6. Accessibility

- Give the dock an **`aria-label`** naming the task (*"Order actions"*, *"Confirm order"*); it's a `role="group"`.
  `ButtonGroup` warns in development when it's missing.
- Reading and tab order follow the visual order.

---

### Code

```tsx
// One main action
<ButtonGroup aria-label="Place order">
  <Button variant="buy" disabled={!valid}>Place buy order</Button>
</ButtonGroup>

// Secondary + strong, side by side (strong on the right)
<ButtonGroup direction="horizontal" aria-label="Order actions">
  <Button variant="secondary">Modify</Button>
  <Button variant="buy">Buy</Button>
</ButtonGroup>

// Long labels: stacked (strong on top), with the scroll shadow while content is below
<ButtonGroup direction="vertical" scrollIndicator={moreBelow} aria-label="Confirm order">
  <Button variant="buy">Confirm buy</Button>
  <Button variant="secondary">Edit order</Button>
</ButtonGroup>

// Trade ticket
<ButtonGroup direction="horizontal" aria-label="Trade">
  <Button variant="sell">Sell</Button>
  <Button variant="buy">Buy</Button>
</ButtonGroup>

// In a bottom sheet
<BottomSheet open={open} onClose={close} header={…}
  footer={<ButtonGroup direction="horizontal" aria-label="Confirm"><Button variant="secondary" onClick={close}>Cancel</Button><Button onClick={confirm}>Confirm</Button></ButtonGroup>}>
  …
</BottomSheet>
```

---

### Open questions

<!-- PENDING: maximum number of buttons — Figma's sheet footer shows 3 (vertical). Is 3 the max, and only in sheets? -->
<!-- PENDING: can a screen have both a ButtonGroup dock and the BottomNavbar? Which wins? -->
<!-- PENDING: exact label length that forces vertical (currently: "labels don't fit side by side at 360px") -->

## Overview

### Direction

Vertical stacks full-width buttons with the primary on top. Horizontal shares the width equally with the primary on the right — the Order ticket and Filters demos use it.

### What goes in a dock

The main action(s) of a screen or sheet, always Large: one strong button (primary, buy, sell or brand), optionally a secondary next to it, or sell + buy. Figma's bottom-sheet footer also stacks a ghost option last with helper text below. One dock per screen, and name it with `aria-label`.

### Scroll indicator

Figma's "Scroll indicator" adds the elevation-high shadow so the bar reads as floating over content. Turn it on while there's more content below — scroll the order above to the end and it fades away.

## Do / Don't

### Primary goes where the thumb ends

- ✅ **Do:** Horizontal: primary on the right. Vertical: primary on top.
- ❌ **Don't:** Flip the order between screens — people tap the wrong one.

## Options (tree)

Button dock — The main action(s) of a screen or sheet

- **Direction** — How the buttons sit
  - `vertical` — Default. Long labels; strong button on top.
  - `horizontal` — Two short labels; strong button on the right.
- **Buttons** — Always lg · at least one strong button
  - `1 strong` — A single main action.
  - `secondary + strong` — Cancel + Confirm, Modify + Buy.
  - `sell + buy` — Trade ticket.
- **Scroll indicator** — Content under the dock
  - `off` — Nothing below, or at the end of the content.
  - `on` — While more content scrolls underneath.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Figma Direction. |
| `scrollIndicator` | `boolean` | `false` | Figma "Scroll indicator": shadow while content scrolls underneath. |
| `children` | `ReactNode` |  | Figma "wrapper" slot — usually <Button size="lg" />s. Horizontal gives each an equal share. |
| `aria-label` | `string` |  | Names the group (role="group") for screen readers. |
| `…div props` | `HTMLAttributes` |  | className (e.g. to make it sticky), style, etc. |

## Tokens used

- `surface/default (static)`
- `surface/primary (clickable)`
- `border/light`
- `spacing/12 · 16`
- `shadow/elevation-high`
- `motion/* (local)`

## Recent changes

- **1.1.1** (2026-09-30) Renamed to Button dock: Figma renamed "L3: Button Group" to "L3: Button Dock"; the docs page is now "Button dock". The code name ButtonGroup is unchanged.
- **1.1.0** (2026-09-30) Dock rules: Usage rules in src/components/ButtonGroup/USAGE.md: what goes in a dock, direction and order, placement, scroll indicator. Development warnings: non-Large buttons, no strong button (secondary alone), missing aria-label.
- **1.0.0** (2026-09-26) First release: Vertical (primary on top) and horizontal (primary on the right) layouts. Scroll indicator: elevation-high shadow while content scrolls underneath.
