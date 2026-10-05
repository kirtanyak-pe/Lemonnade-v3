# Tag

> Tags label, categorise or show the status of something in a compact form.

- Group: Data display
- Lifecycle: done
- Status: Figma synced
- Version: 2.2.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4464-27218
- Source: `src/components/Tag`
- Also called: Badge, chip, label, pill

## Import

```tsx
import { Tag } from './components/Tag' // path relative to src/
```

## Overview

### Types

Primary is solid, Secondary is soft with a border, Tertiary is soft without one.

PrimarySecondaryTertiaryDisabled

## Do / Don't

### Keep tags short and static

- ✅ **Do:** One or two words that label or show status.
- ❌ **Don't:** Use a tag as a button or for sentences.

## Options (tree)

Tag — 3 types · 12 colors · 3 sizes · never tappable

- **Type**
  - `primary` — Solid.
  - `secondary` — Soft with a border.
  - `tertiary` — Soft, no border.
  - `disabled`
- **Color** — Pick by meaning
  - *Neutral*
    - `neutral` — Exchange, segment labels.
  - *Market indicators* — Price direction only
    - `profit`
    - `loss`
  - *Status* — Outcomes and states
    - `success`
    - `warning`
    - `error`
    - `discover`
    - `processing`
  - *Sub-brands*
    - `zing`
  - *Miscellaneous* — Exceptional cases only
    - `purple`
    - `indigo`
    - `teal`
- **Size**
  - `sm · 16`
  - `md · 20`
  - `lg · 24`
- **Content**
  - `label` — One or two words.
  - `icon + label`
  - `hideLabel` — Icon only; the label stays as screen-reader text.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Figma Type (Tertiory → tertiary). |
| `color` | `'neutral' \| 'profit' \| 'loss' \| 'success' \| 'error' \| 'warning' \| 'discover' \| 'processing' \| 'indigo' \| 'teal' \| 'purple' \| 'zing'` | `'neutral'` | Figma Color. profit / loss = indicator up / down (price moves, P&L); success / error = outcomes; processing = orange. v1 names green, red, yellow, orange still work (→ success, error, warning, processing). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Figma Size: 16, 20, 24. |
| `disabled` | `boolean` | `false` | Figma Type=Disabled; overrides variant and color. |
| `iconLeft / iconRight` | `ReactNode` |  | Icon slots, sized and colored by the tag. |
| `hideLabel` | `boolean` | `false` | Figma 👁️ Label off: icon-only (square) tag. Needs one icon; children stay as the screen-reader text. |

## Tokens used

- `surface/accent/*`
- `content/accent/*`
- `border/accent/*`
- `surface/accent/indicator/*`
- `surface/inverted`
- `surface/secondary`
- `static/black`
- `static/white`
- `text-label-10 · 12 · 14`
- `radius/04`
- `size/16 · 20 · 24`

## Recent changes

- **2.2.0** (2026-10-05) New type weights: Text uses the three typography roles: titles Heading (750), labels Label (650).
- **2.1.1** (2026-10-04) Typography tokens renamed: Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.
- **2.1.0** (2026-10-02) White text on solid success and error: Primary (solid) success and error tags use static/white text and icons, like profit and loss (was content/inverted, which turned black in dark mode). Checked the rest against Figma: sizes 16/20/24, padding, radius 4, icon sizes 12/16/18, all 12 colors × primary/secondary/tertiary and disabled — unchanged. Figma’s text styles are now named “Label - SB/10 · 12 · 14” (same values).
