# Card

> A surface that groups related content. Clickable cards are one tap target; static cards just show information.

- Group: Surfaces
- Lifecycle: done
- Status: Figma synced
- Version: 1.5.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5364-38
- Source: `src/components/Card`
- Also called: Tile, panel, container, list item card

## Import

```tsx
import { Card } from './components/Card' // path relative to src/
```

## Overview

### Clickable or static

Cards sit on the screen background (surface-default). In light mode that and surface-primary are both white, so every card has a 1px border-light outline. A **clickable** card also gets elevation-low and scales to 0.98 while pressed. A **static** card is for information or decoration: rounded with a border-light outline on surface-default, and no shadow or press.

Cards sit on the screen background (surface-default). In light mode that and surface-primary are both white, so every card has a 1px border-light outline. A **clickable** card (`onClick` or `href`) also gets elevation-low and scales to 0.98 while pressed. A **static** card is for information or decoration: rounded with a border-light outline on surface-default, and no shadow or press.

### One action means a clickable card

If a card would hold a single button, make the whole card clickable instead. A clickable card is one tap target, so it can't contain other buttons or links (a development warning flags both cases).

### Flat cards

A flat card — not rounded, no border — has no background unless you give it one: it's transparent, with no border and no shadow. It can still be clickable: it keeps the press scale and hover tint.

A card that isn’t rounded and has no border (`variant="flat"`) has no background unless you set one with `surface` — it’s transparent, with no border and no shadow. It can still be clickable: it keeps the press scale, hover tint and focus ring.

### Filled cards

A filled card is a grey inset panel: rounded, surface-secondary, no border and no shadow. Use it to group details on a white screen — contract info, performance stats, market depth. Anything inside that needs its own fill (a skeleton, a tag, an inner panel) uses the grey-friendly version, surface-tertiary.

`variant="filled"`. Inside it, use `Skeleton onGrey` and surface-tertiary for inner fills.

### Padding and placement

Rounded cards — clickable, static and filled — are always padded (12) and always sit inside a margin: they never touch the edges of what contains them (16 from the screen edge, 16 between cards in a list). Only a flat card can drop its padding, for edge-to-edge media or lists, and a flat card always runs edge to edge in its container.

`padding="none"` is only allowed with `variant="flat"` (TypeScript enforces it). The margin around rounded cards comes from the parent's padding or gap — cards have no outer margin of their own.

### Selected cards

When cards are a list of choices — pick a contract, a plan, an account — the chosen one is selected. A card with a border keeps everything and only swaps border-light for the darker border-dark. A flat card has no border, so it shows its selection with a surface-secondary background; unselected, a flat card has no fill at all and takes the colour of whatever it sits on — another card or the screen. Only clickable cards can be selected; static and filled cards never are.

`selected` on a clickable card (`onClick` / `href`). It's announced as pressed (button) or current (link); a development warning flags `selected` on a card that isn't clickable.

### Same rule for chip tabs

Chip (pill) tabs are tappable surfaces too: unselected chips use surface-primary with border-light and elevation-low, and scale to 0.98 while pressed.

## Do / Don't

### One action? Make the whole card clickable

- ✅ **Do:** The card itself is the tap target — elevation-low, press scale.
- ❌ **Don't:** Put a single button inside a static card.

## Options (tree)

Card — Groups related content

- **Kind** — Can it be tapped?
  - `clickable` — surface-primary + border-light + elevation-low + press scale. One action → the whole card.
  - `static` — Rounded + border → surface-default, no shadow.
- **Variant**
  - `default` — Radius 12, padding 12.
  - `flat` — No radius, no border, transparent unless a surface is set.
- **Surface** — Only when set manually
  - `secondary` — An inner panel inside a container.
  - `inverted` — High emphasis.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` |  | Card content. Inside a clickable card use text and spans only — no other controls. |
| `onClick` | `() => void` |  | Makes the whole card a button (clickable card). |
| `href` | `string` |  | Makes the whole card a link (clickable card). |
| `as` | `'div' \| 'article' \| 'section' \| 'li'` | `'div'` | Element for a static card. |
| `variant` | `'default' \| 'flat' \| 'filled'` | `'default'` | flat: not rounded, no border, no shadow, transparent background. filled: grey inset panel (surface-secondary, no border, no shadow). Both can still be clickable. |
| `surface` | `'default' \| 'primary' \| 'secondary' \| 'tertiary' \| 'inverted'` |  | Set the background yourself (surface token). Flat cards are transparent without it. |
| `padding` | `'default' \| 'none'` | `'default'` | 12px. none (edge-to-edge content) only on flat cards — rounded cards are always padded. |
| `selected` | `boolean` | `false` | The chosen option in a list of choices (clickable cards only): bordered → border-dark, flat → surface-secondary background. |
| `aria-label` | `string` |  | Name for a clickable card when its text alone isn’t a good one. |

## Tokens used

- `surface/primary`
- `surface/secondary (filled, flat selected)`
- `border/light`
- `border/dark (selected)`
- `shadow/elevation-low (clickable)`
- `motion/scale/press-default (local, 0.98)`
- `motion/duration-short`
- `state-layer/dark/hover`
- `radius/12`
- `spacing/12 · 08`

## Recent changes

- **1.5.0** (2026-10-09) Selected cards: Selected state for clickable cards — the chosen option in a list of choices. A bordered card swaps border-light for border-dark; a flat card gets a surface-secondary background (unselected flat cards stay transparent). L3: Card gets isSelected = True · False (Clickable and Flat, padded and not padded). selected prop (aria-pressed on buttons, aria-current on links; warns when the card isn't clickable). No padding is for flat cards only: rounded cards (clickable, static, filled) are always padded and always sit inside a margin; flat cards run edge to edge. L3: Card drops isPadded = False for Clickable, Static and Filled (kept for Flat). padding="none" now only type-checks with variant="flat".
- **1.4.0** (2026-10-09) Filled cards: Filled card: a grey inset panel (surface-secondary, rounded, no border or shadow) for grouping details like contract info or market depth. L3: Card gets Type = Filled (padded and not padded), same content slot. variant="filled".
- **1.3.0** (2026-10-08) In Figma: New Figma component L3: Card: Type = Clickable · Static · Flat, isPadded = True · False, and one content slot. Same tokens as code: surface-primary or surface-default, border-light, elevation-low on clickable cards, radius-12, padding-12, rows 8 apart.
