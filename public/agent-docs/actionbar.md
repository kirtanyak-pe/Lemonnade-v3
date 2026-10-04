# Actionbar

> The bar at the top of a screen: back, the screen title with an optional description, and up to a couple of actions — or a search field.

- Group: Navigation
- Lifecycle: done
- Status: Figma synced
- Version: 1.1.1
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65480
- Source: `src/components/Actionbar`
- Also called: App bar, top bar, navigation bar, header, toolbar

## Import

```tsx
import { Actionbar, ActionbarAction } from './components/Actionbar' // path relative to src/
```

## Overview

### Title or search

Figma's base content has three types: Content (heading + description), Search (placeholder) and Searched (typed). Pass `search` and the middle becomes a real search input — tap the search action above.

### Actions and bottom content

`ActionbarAction` is Figma's round 32px icon button; give it a label so it's announced. `bottom` is Figma's content-bottom slot — tabs or filters that belong to the bar. The title is the screen's heading (h1).

## Do / Don't

### Flat tabs belong to the bar

- ✅ **Do:** Put screen-level (flat) tabs in the Actionbar’s bottom slot.
- ❌ **Don't:** Place flat tabs below the bar as a separate layer.

### Two actions at most

- ✅ **Do:** Keep the bar to the one or two most useful actions.
- ❌ **Don't:** Crowd it with icons — the title gets squeezed out.

## Options (tree)

Actionbar — The top bar of a screen

- **Mode**
  - `title` — Back, title, description, up to 2 actions.
  - `search` — The middle becomes a search input.
- **Slots** — Fill them, don’t stack siblings
  - `actions` — At most 2. Tertiary / ghost style only.
  - `bottom` — Flat tabs at the top always go here.
- **Elevation**
  - `flat` — surface-default + border-light bottom line.
  - `elevated / sticky` — elevation-low while content scrolls under it.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title / description` | `ReactNode` |  | Figma ✏️ Heading / ✏️ Description. |
| `headingLevel` | `1 \| 2` | `1` | The title is the screen heading; use 2 inside sheets or previews. |
| `onBack / backLabel` | `() => void / string` | `'Back'` | Figma 👁️ Action - left: back button with a round state layer. |
| `actions` | `ReactNode` |  | Figma → content right — usually <ActionbarAction icon label onClick />. |
| `bottom` | `ReactNode` |  | Figma ↓ Content bottom — Tabs, filters… |
| `search` | `{ value, onChange, placeholder?, label?, autoFocus? }` |  | Figma base content Type=Search / Searched: the middle becomes a search input. |
| `sticky` | `boolean` | `false` | Stick to the top while the page scrolls. |
| `ActionbarAction` | `{ icon, label, onClick, pressed? }` |  | Round 32px icon button; pressed shows a toggle state (e.g. watchlist). |

## Tokens used

- `surface/default`
- `border/light · dark`
- `content/primary · secondary · disabled`
- `content/accent/discover (caret)`
- `text-heading-primary-14`
- `text-label-secondary-14`
- `text-description-12`
- `size/32 · 48`
- `state-layer/*`
- `radius/full`

## Recent changes

- **1.1.1** (2026-10-04) Typography tokens renamed: Text tokens renamed to the Figma roles (e.g. --l3-text-label-primary-12). No visual change.
- **unreleased** (2026-09-28) Figma updated, code to follow: Figma’s Actionbar row now has an 8px gap between items. Not yet synced to code.
- **1.1.0** (2026-09-29) Shadow on scroll: elevation-low when content scrolls under the bar: automatic with sticky, or via the new elevated prop. Rule: flat tabs at the top go in the bottom slot (docs demos updated).
