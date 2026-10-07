# Card

> A surface that groups related content. Clickable cards are one tap target; static cards just show information.

- Group: Surfaces
- Lifecycle: wip
- Status: Not in Figma yet
- Version: 1.2.0
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
| `variant` | `'default' \| 'flat'` | `'default'` | flat: not rounded, no border, no shadow, transparent background. Can still be clickable. |
| `surface` | `'default' \| 'primary' \| 'secondary' \| 'tertiary' \| 'inverted'` |  | Set the background yourself (surface token). Flat cards are transparent without it. |
| `padding` | `'default' \| 'none'` | `'default'` | 12px, or none for edge-to-edge content. |
| `aria-label` | `string` |  | Name for a clickable card when its text alone isn’t a good one. |

## Tokens used

- `surface/primary`
- `border/light`
- `shadow/elevation-low (clickable)`
- `motion/scale/press-default (local, 0.98)`
- `motion/duration-short`
- `state-layer/dark/hover`
- `radius/12`
- `spacing/12 · 08`

## Recent changes

- **1.2.0** (2026-09-29) Figma card spec: Padding 16 → 12 and radius 16 → 12, matching the Figma Order card (row gap stays 8). Orders demo: 16 between cards, Body/12 meta line, Tertiary status tags, sort + filters toolbar.
- **1.1.0** (2026-09-29) Flat variant: Flat style: not rounded, no border, no shadow, transparent background; still clickable. A card background can be set manually (surface variables only). Static cards (rounded + border-light) use surface-default; clickable cards stay surface-primary.
- **1.0.0** (2026-09-29) First release: Clickable cards: surface-primary, border-light, elevation-low, press scale 0.98. Static cards for information or decoration: surface-primary + border-light, no shadow or press. Development warnings: a clickable card with controls inside, or a static card holding a single action.
