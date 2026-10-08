# Progress bar

> Shows how much of something is used or done, or where a value sits in a range.

- Group: Feedback & status
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5384-321
- Source: `src/components/ProgressBar`
- Also called: Progress, meter, range bar, usage bar, 24H range, slider (read-only)

## Import

```tsx
import { ProgressBar } from './components/ProgressBar' // path relative to src/
```

## Overview

### Progress or Range

**Progress** fills a track from the left: funds or margin used, steps done. **Range** puts a marker on the track: where today's price sits between the 24H low and high. Always write the value next to the bar — colour alone isn't enough.

### Status

Default is blue. Use **Warning** when something is close to a limit (margin above 80%), **Error** when it's over, and **Success** when it's complete. In Figma, pick the value in steps of 10; the bar keeps its percentage at any width.

Progress is `role="progressbar"`, Range is `role="meter"`. Pass `valueText` for what to announce (“₹3,42,000 of ₹5,00,000”).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` |  | 0–100. |
| `type` | `'progress' \| 'range'` | `'progress'` | Figma Type. |
| `size` | `'sm' \| 'md'` | `'sm'` | Figma Size: 4px · 8px bar. |
| `status` | `'default' \| 'success' \| 'warning' \| 'error'` | `'default'` | Figma Status. |
| `label` | `string` |  | Accessible name. Required. |
| `valueText` | `string` |  | What screen readers announce; defaults to the percentage. |

## Tokens used

- `surface/tertiary (track)`
- `surface/accent/discover · success · warning · error -default`
- `surface/primary (marker ring)`
- `size/04 · 08 · 12 · 16`
- `radius/full`

## Recent changes

- **1.0.0** (2026-10-09) New component: Progress bar: Progress (a fill — funds or margin used) and Range (a marker — today's price between the 24H low and high), in two sizes and four statuses. New Figma component L3: Progress bar (Type × Size × Status) with Value 0–100 in steps of 10 on the nested fill or marker. role="progressbar" (Progress) or "meter" (Range) with valueText.
