# Skeleton

> A grey placeholder that mirrors the layout while content loads.

- Group: Feedback & status
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5380-30
- Source: `src/components/Skeleton`
- Also called: Loading, shimmer, placeholder, loader, ghost

## Import

```tsx
import { Skeleton, SkeletonListRow, SkeletonCard } from './components/Skeleton' // path relative to src/
```

## Overview

### Mirror the real layout

Draw the skeleton in the same places and sizes as the content that's coming, so nothing jumps when it loads. **Line** is a line of text (12, 16 or 20 tall — the text's line height), **Circle** an icon or avatar, **Box** an image, chart or button. For lists and cards, use the ready-made patterns: a list row matches the 58px list cell.

### On white or on grey

On white screens the skeleton is surface-secondary. On grey cards and panels, switch on **isOnGrey** (surface-tertiary) so it stays visible. It shimmers, and stays still for people who turn off animations.

Skeletons are hidden from screen readers. Mark the loading region with `aria-busy="true"` and give it a name (“Loading watchlist”).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `shape` | `'line' \| 'circle' \| 'box'` | `'line'` | Figma Shape. |
| `width · height` | `string (CSS)` |  | Ideally tokens (var(--l3-size-96)) or %. Line height = the text line height. |
| `onGrey` | `boolean` | `false` | Figma isOnGrey: surface/tertiary. |
| `SkeletonListRow` | `{ onGrey? }` |  | Figma pattern Type=List row (matches ListCell). |
| `SkeletonCard` | `—` |  | Figma pattern Type=Card. |

## Tokens used

- `surface/secondary`
- `surface/tertiary (on grey)`
- `surface/primary at opacity/60 (shimmer)`
- `radius/04 · 08 · full`
- `size/*`

## Recent changes

- **1.0.0** (2026-10-09) New component: Skeleton: Line, Circle and Box placeholders that shimmer while content loads, plus ready-made List row and Card patterns. A grey-friendly version for grey cards. New Figma components L3: Skeleton (Shape × isOnGrey) and L3: Skeleton pattern (List row · Card). Hidden from screen readers (mark the region aria-busy); the shimmer stops under reduced motion.
