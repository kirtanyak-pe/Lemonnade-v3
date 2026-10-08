# Price change

> A signed change — price, P&L or returns — in green when up and red when down.

- Group: Data display
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5391-79
- Source: `src/components/PriceChange`
- Also called: Change, delta, percent change, returns, gain/loss, P&L change, LTP change

## Import

```tsx
import { PriceChange } from './components/PriceChange' // path relative to src/
```

## Overview

### The sign decides the colour

Up is green with “+”, down is red with “−”, and no change is grey with no sign. In Figma you pick the Direction and type only the number in ✏️ Value, so the sign and the colour can never disagree — a falling price can't end up green.

Pass the signed number as `value`; direction, sign, colour and arrow all come from it. Screen readers hear “up” / “down” / “unchanged” first.

### Sizes and arrow

**Small** (Label-12) in rows and cards, **Medium** (Label-14), **Large** (Label-16) next to a big number like Total P&L. Turn on the ▲/▼ **arrow** for headline numbers; leave it off in lists. For an absolute change with a percentage, write both: +252.89 (0.05%).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` |  | The signed change; sets direction, sign, colour and arrow. |
| `unit` | `'percent' \| 'currency' \| 'number'` | `'percent'` | How the absolute value is written. |
| `percent` | `number` |  | Optional % in brackets after an absolute change. |
| `decimals` | `number` | `2` | Decimal places. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Figma Size. |
| `arrow` | `boolean` | `false` | Figma 👁️ Arrow: ▲ / ▼. |

## Tokens used

- `content/accent/indicator/up-default · down-default`
- `content/secondary (flat)`
- `Label/12 · 14 · 16`
- `size/16 · 20 · 24 (arrow)`

## Recent changes

- **1.0.0** (2026-10-09) New component: Price change: a signed change in green (up, +), red (down, −) or grey (no change), in three sizes with an optional ▲/▼ arrow. The sign and colour come from the direction, so they can never disagree. New Figma component L3: Price change (Direction × Size, ✏️ Value without the sign, 👁️ Arrow). Screen readers hear “up / down / unchanged” and the value; colour is never the only signal.
