# ButtonGroup (Button dock) — usage rules

`import { ButtonGroup } from './components/ButtonGroup'` · Figma: "L3: Button Dock" (4471:29456, formerly "L3: Button Group") · Docs: `#/button-group`

The **button dock**: the bar at the bottom of a screen or bottom sheet that holds its main action(s).
In code it's a `surface-primary` bar with a 1px `border-light` top line, 16px padding, 12px between buttons and
extra bottom padding for the home indicator.

---

## 1. When to use it

- For the **main action(s) of a screen or a bottom sheet**: *Place order*, *Confirm*, *Save*, *Buy / Sell*.
- Even for a **single** main action — the dock gives it the bar, spacing and safe-area padding.
- **One dock per screen** (and one per open sheet, in the sheet's `footer`).

Don't use it for:
- Actions inside content (a card, a list, a form section) → a standalone `Button` (`tertiary` when alone, e.g. *View all*).
- Toolbar actions like *Filters* or *Sort* → text actions / `tertiary` buttons in the toolbar row.
- Choosing between options → `Tabs` (pill for chips).

## 2. What goes inside

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

## 3. Direction & order

| Direction | Use when | Order |
|---|---|---|
| `vertical` *(default)* | One button, or two buttons whose labels don't fit side by side at 360px | **Primary (strong) on top**, secondary below |
| `horizontal` | Two buttons with short labels (1–2 words each) | **Primary (strong) on the right**, secondary on the left; `sell` left, `buy` right |

- Keep the same order on every screen — people learn where the main action is.
- Horizontal gives each button an equal width; never set widths yourself.

## 4. Placement & scrolling

- The dock is the **last element** of the screen or sheet, pinned to the bottom (in a sheet, pass it as `footer`).
- The scrolling content above it ends above the dock — nothing sits behind it.
- Turn on **`scrollIndicator`** while content is scrolling underneath and there's more below; turn it off when the
  user reaches the end (the Order review demo does this).

## 5. States

- While the main action runs, set `loading` on **that** button (it keeps its width and blocks double taps); leave
  the other button enabled unless it would break the action.
- Disable the main button only when the reason is visible above (e.g. an invalid field) — see `Button/USAGE.md`.

## 6. Accessibility

- Give the dock an **`aria-label`** naming the task (*"Order actions"*, *"Confirm order"*); it's a `role="group"`.
  `ButtonGroup` warns in development when it's missing.
- Reading and tab order follow the visual order.

---

## Code

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

## Open questions

<!-- PENDING: maximum number of buttons — Figma's sheet footer shows 3 (vertical). Is 3 the max, and only in sheets? -->
<!-- PENDING: can a screen have both a ButtonGroup dock and the BottomNavbar? Which wins? -->
<!-- PENDING: exact label length that forces vertical (currently: "labels don't fit side by side at 360px") -->
