# Stepper

> A number with − and + buttons, for quantity and lots in the order pad.

- Group: Input & control
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.1
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5374-18184
- Source: `src/components/Stepper`
- Also called: Quantity input, counter, number input, lot picker, spinner

## Import

```tsx
import { Stepper } from './components/Stepper' // path relative to src/
```

## Overview

### Small or Large

**Small** sits inline in an order-pad row, next to its label (“Quantity (100 = 1 Lot)”): a 104×28 grey pill with 20px square buttons. **Large** stands on its own, like in Scalp Pro: round outlined buttons, a bigger value and an optional sublabel such as “91 Lots”.

### Limits

Each tap adds or removes one step — usually the lot size. At the lowest value the − button turns grey (State = Disabled), and the same for + at the highest. Never let the value go below one lot.

`min`, `max` and `step` clamp the value and disable the buttons. The value is an `<output aria-live="polite">`, so screen readers hear each change. The Small buttons are 20px but their tap area is 32px.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` |  | Current value. |
| `onChange` | `(value: number) => void` |  | Called with the new, clamped value. |
| `min · max` | `number` | `0 · Infinity` | Limits; the − / + button disables at each. |
| `step` | `number` | `1` | Amount per tap (e.g. the lot size). |
| `size` | `'sm' \| 'lg'` | `'sm'` | Figma Size: Small · Large. |
| `sublabel` | `ReactNode` |  | Large only: a line under the value, e.g. "91 Lots". |
| `format` | `(value) => string` |  | How the value is shown; default Indian grouping. |
| `label` | `string` |  | Accessible name of the group, e.g. "Quantity". Required. |
| `disabled` | `boolean` |  | Disables both buttons. |

## Tokens used

- `surface/secondary (Small)`
- `surface/accent/discover-light + content/accent/discover-default (Small buttons)`
- `surface/primary + border/intense (Large buttons)`
- `surface/disabled + content/disabled (at the limit)`
- `Heading/12 · 14`
- `Label/10 (sublabel)`
- `size/20 · 32 · 48 · tap-target`
- `radius/04 · 08 · full`
- `spacing/02 · 04`

## Recent changes

- **1.0.1** (2026-10-10) 48 × 48 touch area: The − and + buttons have a touch area of at least 48 × 48 (was 32); the row stays compact.
- **1.0.0** (2026-10-09) New component: Stepper: a number with − / + buttons for quantity and lots. Small (inline in order-pad rows) and Large (with a sublabel such as “91 Lots”). Each button turns grey at its limit. New Figma components L3: Stepper (Size = Small · Large, ✏️ Value, ✏️ / 👁️ Sublabel) and .L3: Stepper button (Type × State × Size). Named group, labelled buttons, the value is announced on change, and the 20px Small buttons have a 32px tap area.
