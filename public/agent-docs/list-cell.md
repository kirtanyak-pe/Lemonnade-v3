# List cell

> A row in a list: an icon, a label with an optional description, and something on the right — a chevron, a switch, a tag or a value.

- Group: Data display
- Lifecycle: done
- Status: Figma synced
- Version: 1.2.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65400
- Source: `src/components/ListCell`
- Also called: List item, row, cell, settings row, menu item

## Import

```tsx
import { ListCell } from './components/ListCell' // path relative to src/
```

## Overview

### Plain or card

Plain rows sit edge to edge in a list; cards (Figma isPlain=False) have a border and rounded corners and stack with a gap — like the bank accounts above. Both come in default (48) and small (32).

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
| `variant` | `'plain' \| 'card'` | `'plain'` | Figma isPlain: flat row, or bordered rounded card. |
| `iconLeft / iconRight` | `ReactNode` |  | Figma Icon-L / Icon-R slots, sized for you. |
| `trailing` | `ReactNode` |  | Anything else on the right: Switch, Checkbox, Tag, value text. |
| `dotLeft / dotRight` | `boolean` | `false` | Figma Dot-L / Dot-R: unread dot on the icon. |
| `dotLabel` | `string` | `'New'` | What screen readers hear for the dot (it is otherwise only visual). |
| `as / href / onClick` | `'div' \| 'button' \| 'a' \| 'label'` |  | Makes the row tappable (button / a) or a label for a trailing control. |

## Tokens used

- `surface/primary`
- `border/light`
- `content/primary · secondary`
- `content/accent/discover (dot)`
- `Label/14 · 16`
- `Description/12`
- `radius/12 · full`
- `icon-size/16 · 24`
- `state-layer/* (tappable rows)`

## Recent changes

- **1.2.0** (2026-10-05) New type weights: Text uses the three typography roles: titles Heading (750), labels Label (650).
- **1.1.1** (2026-10-04) Typography tokens renamed: Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.
- **1.1.0** (2026-09-26) Accessibility pass: Dots have screen-reader text (dotLabel, default “New”). Development warning when a button row contains another control.
