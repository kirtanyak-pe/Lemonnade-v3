# List cell

> A row in a list: an icon, a label with an optional description, and something on the right — a chevron, a switch, a tag or a value.

- Group: Data display
- Lifecycle: done
- Status: Figma synced
- Version: 1.5.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65400
- Source: `src/components/ListCell`
- Also called: List item, row, cell, settings row, menu item

## Import

```tsx
import { ListCell } from './components/ListCell' // path relative to src/
```

## Overview

### Plain or card

A list cell is a card with more specific content — dropdown options, settings, lists — so it follows the **Card rules**. Plain rows are flat cards: no fill, they take the colour of whatever they sit on, and they run edge to edge. Card rows (Figma isPlain=False) are rounded with border-light and always sit inside a margin (16 from the screen edge):

- **Not tappable** (a static card): no fill — it takes the colour it sits on — and border-light, no shadow.
- **Tappable** (a clickable card, Figma isTappable): surface-primary, border-light and elevation-low, and it scales to 0.98 while pressed.

Both come in default (48) and small (32).

### Selected rows

When rows are a list of choices, the chosen one is selected. A plain row gets a surface-secondary background; a card row swaps border-light for the darker border-dark and nothing else changes. Only tappable rows can be selected.

`selected` on a tappable row (`onClick`, `href` or `as="label"`). Announced as pressed (button) or current (link); in a label row the Radio or Checkbox carries the state.

### Tappable rows

A whole row can be tappable, with a pressed tint — show a chevron or a control on the right so people know. A row with a Switch or Checkbox toggles it when tapped anywhere — try “Biometric login”.

Use `as="button"` or `href` to make the whole row tappable with a pressed tint. Use `as="label"` with a Switch or Checkbox in `trailing` so tapping anywhere on the row toggles it — try “Biometric login”.

## Do / Don't

### Show where a row leads

- ✅ **Do:** Tappable rows get a chevron (or trailing control).
- ❌ **Don't:** Make rows tappable with nothing to hint at it.

## Options (tree)

List cell — Rows of settings, accounts, items

- **Variant**
  - `plain` — Full width, edge to edge.
  - `card` — A one-line row as a card.
- **Size**
  - `md`
  - `sm`
- **Tap behaviour** — as=
  - `button / a` — Whole row taps; show a chevron.
  - `label` — With a Switch or Checkbox in trailing.
  - `dotRight` — Unread marker with screen-reader text.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label / description` | `ReactNode` |  | Figma "Label goes here" / "Type description". |
| `size` | `'md' \| 'sm'` | `'md'` | Figma isSmall: 48 / 32 min height, 24 / 16 icons. |
| `variant` | `'plain' \| 'card'` | `'plain'` | Figma isPlain: flat row (no fill, edge to edge), or bordered rounded card (inside a margin). Card rows follow Card: static = no fill + border-light; tappable = surface-primary + elevation-low. |
| `selected` | `boolean` | `false` | Figma isSelected: the chosen row in a list of choices — plain → surface-secondary, card → border-dark. Tappable rows only. |
| `iconLeft / iconRight` | `ReactNode` |  | Figma Icon-L / Icon-R slots, sized for you. |
| `trailing` | `ReactNode` |  | Anything else on the right: Switch, Checkbox, Tag, value text. |
| `dotLeft / dotRight` | `boolean` | `false` | Figma Dot-L / Dot-R: unread dot on the icon. |
| `dotLabel` | `string` | `'New'` | What screen readers hear for the dot (it is otherwise only visual). |
| `as / href / onClick` | `'div' \| 'button' \| 'a' \| 'label'` |  | Makes the row tappable (button / a) or a label for a trailing control. |

## Tokens used

- `surface/primary (tappable card)`
- `surface/secondary (plain selected)`
- `border/light`
- `border/dark (card selected)`
- `shadow/elevation-low (tappable card)`
- `motion/scale/press-default`
- `content/primary · secondary`
- `content/accent/discover (dot)`
- `Label/14 · 16`
- `Description/12`
- `radius/12 · full`
- `icon-size/16 · 24`
- `state-layer/* (tappable rows)`

## Recent changes

- **1.5.0** (2026-10-09) Multi-line description: isMultiline: the description can wrap onto several lines instead of ending in "…" on one line. The label stays on one line. L3: list cell gets isMultiline = False · True (pending — added in the library next). multiline prop.
- **1.4.0** (2026-10-09) Follows the Card rules: A list cell is a card with specific content, so it follows Card: a card row that isn't tappable has no fill (it takes the colour it sits on) and border-light; a tappable card row is surface-primary + border-light + elevation-low and scales to 0.98 when pressed. L3: list cell gets isTappable = True · False (selected only when tappable). Tappable = onClick, href or as="label" — no new prop.
- **1.3.0** (2026-10-09) Selected rows, no fill on plain rows: Selected state for tappable rows: plain rows get a surface-secondary background, card rows swap border-light for border-dark. Plain rows have no fill — they take the colour of whatever they sit on — and run edge to edge. Card rows always sit inside a margin. L3: list cell gets isSelected = True for every isSmall × isPlain; plain rows lose their surface-primary fill. selected prop (aria-pressed / aria-current; warns on a row that isn't tappable).
