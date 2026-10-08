# Date picker

> A month calendar for picking one day or a date range.

- Group: Input & control
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5387-279
- Source: `src/components/DatePicker`
- Also called: Calendar, date range, period picker, date input

## Import

```tsx
import { DatePicker } from './components/DatePicker' // path relative to src/
```

## Overview

### In a bottom sheet

Open the picker in a bottom sheet with a title (“Select date range”) and a button dock — Clear and Apply. Add quick presets (1W · 1M · 3M · 1Y) above it as pill tabs when people mostly want a standard period, like for P&L and tax reports.

### Single or Range

**Single** picks one day (black circle). **Range** picks a start and an end, joined by a grey band. Today has a blue ring. Weeks start on Monday and the grid is always six weeks tall, so the sheet doesn't jump between months.

### Disable what can't be picked

For reports and history, days after today are disabled. For future dates (GTT or order expiry), days before today are.

Use `max` / `min`. Keyboard: arrows move by day and week, Home / End to the week's ends, PageUp / PageDown by month, Enter picks. Range: the first tap sets the start, the second the end.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `'single' \| 'range'` | `'single'` | Figma Mode. |
| `value` | `Date \| null  ·  { start, end }` |  | Selected day, or the range. |
| `onChange` | `(value) => void` |  | Called with the new day or range. |
| `min · max` | `Date` |  | Days outside are disabled (Figma State = Disabled). |
| `initialMonth` | `Date` |  | Month shown first; defaults to the selection or today. |
| `label` | `string` |  | Accessible name of the calendar, e.g. "Report period". Required. |

## Tokens used

- `surface/inverted + content/inverted (selected)`
- `surface/secondary (range band)`
- `border/accent/discover-default + content/accent/discover-default (today)`
- `content/disabled`
- `Heading/14 · 16`
- `Label/12 · 14`
- `size/32 · 40`
- `radius/full`

## Recent changes

- **1.0.0** (2026-10-09) New component: Date picker: a Monday-first month calendar for one day or a range, with today, selected, range and disabled days. Six weeks tall, so sheets don't jump between months. New Figma components L3: Date picker (Mode = Single · Range, ✏️ Month) and .L3: Date cell (8 states). ARIA grid with full-date labels, aria-selected and aria-current; arrows, Home / End and PageUp / PageDown move focus.
