# Aerobar & toast

> A short status message with an optional action — inline as a full-width bar, or floating as a toast after something happens.

- Group: Feedback & status
- Lifecycle: done
- Status: Figma synced
- Version: 1.4.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65562
- Source: `src/components/Aerobar`
- Also called: Toast, snackbar, banner, alert bar, notification

## Import

```tsx
import { Aerobar } from './components/Aerobar' // path relative to src/
```

## Overview

### Toasts

Floating, solid toasts for results people should notice — always shown here; in the phone above they rise in after Buy or Sell.

### Inline or floating

Inline, it's a full-width strip that sits in the layout (the market-hours warning above). Floating (isFloating), it's a rounded, shadowed toast inset 16px from the edges that rises in when shown.

Without `floating` it's a full-width strip that sits in the layout (the market-hours warning above). With `floating` it's a rounded, shadowed toast inset 16px from the edges that rises in when shown.

### Soft or solid

Figma's isPrimary: the light tint (False) suits information that can wait; the solid color (True) is for results people should notice straight away. Danger is read out to screen readers immediately; the others politely.

Figma's isPrimary: the default light tint suits information that can wait; the solid color (emphasis="primary") is for results people should notice straight away. Danger is announced immediately to screen readers (role="alert"); the rest politely (role="status"). For a danger bar that is part of the page rather than a new event, pass `role="status"` so it isn't read out as an alert on every visit.

## Do / Don't

### Let people act before it goes

- ✅ **Do:** Toasts with an action stay until tapped or closed.
- ❌ **Don't:** Hide important info or undo behind a timer.

## Options (tree)

Aerobar & toast — Status on the page, or a result

- **Type** — Status accents
  - `success`
  - `danger` — Announced as an alert.
  - `warning`
  - `discover`
  - `primary` — Neutral.
- **Emphasis**
  - `primary (solid)` — Results that need attention.
  - `secondary (soft)` — Quieter status on the page.
- **Placement**
  - `inline` — A message that belongs to the page.
  - `floating (toast)` — The result of an action. With an action it stays until tapped.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'primary' \| 'discover' \| 'danger' \| 'success' \| 'warning'` | `'primary'` | Figma Type. |
| `emphasis` | `'primary' \| 'secondary'` | `'secondary'` | Figma isPrimary: solid color (primary) or light tint (secondary). |
| `floating` | `boolean` | `false` | Figma isFloating: toast card with shadow and a rise-in animation. |
| `heading / paragraph` | `ReactNode` |  | Figma Headline text / Paragraph text (hidden when not passed). |
| `icon` | `ReactNode \| false` | `info icon` | Figma icon-L slot (24px); false hides it. |
| `action` | `{ label, onClick }` |  | Figma Action-r: small Ghost button in a 48px slot; its label follows the bar color. |

## Tokens used

- `surface/tertiary · inverted`
- `surface/accent/* (light · default)`
- `content/primary · secondary · inverted`
- `static/white · black`
- `opacity/60 · 80`
- `Label/14`
- `Description/12`
- `radius/12`
- `shadow/elevation-low · medium`
- `motion/* (local)`

## Recent changes

- **1.4.0** (2026-10-05) New type weights: Text uses the three typography roles: titles Heading (750), labels Label (650).
- **1.3.1** (2026-10-04) Typography tokens renamed: Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.
- **1.3.0** (2026-09-28) Figma color update: Soft bars: paragraph is content-secondary at 60%. Solid Danger and Success use static white text (stays white in dark mode). The action keeps Figma’s dark state layer on every bar.
