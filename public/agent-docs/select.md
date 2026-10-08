# Select

> An inline trigger — a label and an icon — that opens a sheet of options.

- Group: Input & control
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5377-49
- Source: `src/components/Select`
- Also called: Dropdown, picker, switcher, toggle, mode selector, filter

## Import

```tsx
import { Select } from './components/Select' // path relative to src/
```

## Overview

### No box

Select is just the current choice and an icon. It sits in a row or a header; tapping it opens a bottom sheet with the options as radio rows. Use **↕** when it switches between a few modes (Quantity ↔ Amount, Total P&L ↔ Day P&L, the asset in a title). Use the **chevron** for a filter list (Deposit & Credits).

### Sizes

**Small** (Label-12) in form rows, **Medium** (Label-14) for filters, **Large** (Heading-14) for titles. **Subtle** makes it secondary grey when it shouldn't compete with the content. Make the whole row or header tappable, not only the text.

A `<button aria-haspopup="dialog">`; pass `expanded` while the sheet is open. Its tap area grows to 32px.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` |  | The current choice, e.g. "Quantity". |
| `onClick` | `() => void` |  | Open the options (usually a BottomSheet with Radio rows). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Figma Size: Small · Medium · Large. |
| `subtle` | `boolean` | `false` | Figma isSubtle: content/secondary. |
| `icon` | `'swap' \| 'chevron'` | `'swap'` | Figma ↪ Icon: ↕ for modes, chevron for filter lists. |
| `expanded` | `boolean` |  | Sets aria-expanded while the options are open. |
| `aria-label` | `string` |  | When the visible text alone is not a good name. |

## Tokens used

- `content/primary · secondary (subtle)`
- `Label/12 · 14`
- `Heading/14`
- `spacing/02 · 04`
- `size/tap-target`

## Recent changes

- **1.0.0** (2026-10-09) New component: Select: an inline label + icon that opens a sheet of options — Small, Medium, Large, a subtle version, and ↕ or chevron icons. New Figma component L3: Select (Size × isSubtle, ✏️ Label, ↪ Icon). A button with aria-haspopup="dialog" and aria-expanded; 32px tap area.
