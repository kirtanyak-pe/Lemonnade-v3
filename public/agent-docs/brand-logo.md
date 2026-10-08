# Brand logo

> The Lemonn, Zing and Coinswitch logos: full (mark + wordmark) or just the mark, at 24–48px high.

- Group: Foundations
- Lifecycle: done
- Status: Figma synced
- Version: 1.1.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4735-1466
- Source: `src/components/BrandLogo`
- Also called: Logo, logotype, wordmark, brand mark, app icon

## Import

```tsx
import { BrandLogo } from './components/BrandLogo' // path relative to src/
```

## Overview

### Full or mark

Use the full logo (isFull = True) where there's room: headers, splash, sign-in. Use the mark (isFull = False) in tight spots like avatars, app bars and list rows. Both come in 24, 32, 40 and 48px heights; the width follows the logo's proportions.

Use the full logo where there's room: headers, splash, sign-in. Use the mark (`variant="icon"`) in tight spots like avatars, app bars and list rows. Both come in 24, 32, 40 and 48px heights; the width follows the logo's proportions.

### Colors stay on brand

The lemon leaf uses the Lemonn brand ramp and Zing uses its honey gradient, in every product theme — a Lemonn logo stays lime even in CS PRO or Kuber. Coinswitch keeps its two greens; its dot and “coin” follow the theme like the Lemonn wordmark. Only the Lemonn wordmark follows the theme, so it reads on light and dark pages. (Figma binds the leaf to the theme's brand color, which would repaint it per product; the code keeps it on the Lemonn ramp.)

### Accessibility

Screen readers read the logo as its brand name. If the brand name is already written next to it, note in the handoff that the logo is decorative.

The logo is announced as its brand name. Pass `label` for something more specific ("Lemonn home"), or `decorative` when the name is already written next to it.

## Options (tree)

Brand logo — Figma artwork — never redraw or recolor

- **Brand**
  - `lemonn`
  - `zing`
- **Variant**
  - `full` — Mark + wordmark.
  - `icon` — The mark only.
- **Size** — Height
  - `24`
  - `32`
  - `40`
  - `48`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `brand` | `'lemonn' \| 'zing' \| 'coinswitch'` |  | Figma Brand. |
| `variant` | `'full' \| 'icon'` | `'full'` | Figma isFull: mark + wordmark, or the 24×24 mark. |
| `size` | `24 \| 32 \| 40 \| 48` | `24` | Height in px from the size tokens; width keeps the proportions. |
| `label` | `string` |  | Accessible name; defaults to the brand name. |
| `decorative` | `boolean` | `false` | Hide from screen readers when the name is written next to it. |

## Tokens used

- `base/hue/brand-lemonn-500 · 700 (Lemonn mark)`
- `surface/inverted (Lemonn wordmark)`
- `base/hue/honey-300 → 500 (Zing gradient)`
- `base/hue/brand-coinswitch-green · deep (local, raw in Figma)`
- `size/24 · 32 · 40 · 48`

## Recent changes

- **1.1.0** (2026-10-09) Coinswitch: Coinswitch logo, full and mark only, matching Figma Brand = Coinswitch. Its two greens stay the same in every theme; the dot and “coin” follow the theme. brand="coinswitch". Greens are local tokens base/hue/brand-coinswitch-green · deep (source/local.colors.json) — raw fills in Figma.
- **1.0.0** (2026-09-28) First release: Lemonn and Zing logos, full or mark only, 24–48px high. Artwork exported from Figma; every color is a token (Lemonn and honey brand ramps, theme wordmark). The lemon leaf stays on the Lemonn ramp in every product theme (Figma binds it to the theme brand color).
