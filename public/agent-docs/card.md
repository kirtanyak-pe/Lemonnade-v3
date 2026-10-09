# Card

> A surface that groups related content. Clickable cards are one tap target; static cards just show information.

- Group: Surfaces
- Lifecycle: done
- Status: Figma synced
- Version: 1.8.0
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

Cards always sit inside a margin: they never touch the edges of what contains them (16 from the screen edge, 16 between cards in a list). A card is padded 12 by default. A clickable or static card can drop its own padding when its content is built from sections that bring their own — for example a 12-padded body and an action footer — but the rule doesn't change: **the content always sits 12 from the card edge**. Filled cards are always padded, and a flat card runs edge to edge in its container.

`padding="none"` on a default (clickable / static) or flat card; the sections inside carry the 12 padding. Filled cards are always padded (TypeScript enforces it). The margin around cards comes from the parent's padding or gap — cards have no outer margin of their own.

### Action footer

A clickable card is one tap target, so it never has buttons inside its content. When the card needs quick actions on its subject — save, learn more, apply — put them in an **action footer** at the bottom of the card: no fill, the buttons 12 from the card edge right under the content. The rest of the card stays the tap target; pressing a footer button doesn't press the card. Keep it to three actions at most, with one primary at most; a single button is Tertiary.

The footer can be a full-width grey strip (surface-secondary, 12 padding) — but only when it's meant to stand out. Grey is for small highlights inside a card (tags, chips, a small detail box); a large grey area has to be intentional and high-emphasis.

`footer` takes the buttons; `footerFilled` makes it the grey strip. On a clickable card the body becomes the button / link and the footer sits beside it (never nested); a development warning still flags controls inside the body.

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
| `padding` | `'default' \| 'none'` | `'default'` | 12px. none when the content’s sections bring their own padding (content still 12 from the edge); not on filled cards. |
| `selected` | `boolean` | `false` | The chosen option in a list of choices (clickable cards only): bordered → border-dark, flat → surface-secondary background. |
| `footer` | `ReactNode` |  | Action footer: up to 3 buttons at the bottom of the card, no fill, 12 from the edge. On a clickable card the body stays the tap target. |
| `footerFilled` | `boolean` | `false` | Grey footer strip (surface-secondary, 12 padding) — intentional, high-emphasis footers only. |
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

- **1.8.0** (2026-10-09) Action footer without the grey strip: The action footer has no fill by default: its buttons sit 12 from the card edge, right under the content. Grey is for small highlights, so the full-width grey strip is now an opt-in for footers that are meant to stand out. footerFilled: the grey footer strip (surface-secondary, 12 padding).
- **1.7.0** (2026-10-09) Action footer: Action footer: a full-width grey strip at the bottom of a card for up to three quick actions (save, learn more, apply). On a clickable card the rest of the card stays the tap target, and pressing a footer button doesn't press the card. footer prop; the clickable body becomes the button/link and the footer sits beside it (never nested).
- **1.6.0** (2026-10-09) No padding is back for rounded cards: Clickable and static cards can drop their own padding again, for content built from sections that bring their own (a 12-padded body plus a full-width footer strip). The content still sits 12 from the card edge. Filled cards stay padded. L3: Card gets isPadded = False back for Clickable (and Clickable selected) and Static. padding="none" is allowed on default and flat cards (not filled).
