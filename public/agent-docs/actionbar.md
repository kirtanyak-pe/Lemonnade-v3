# Actionbar

> The bar at the top of a screen: back, the screen title with an optional description, and up to a couple of actions — or a search field.

- Group: Navigation
- Lifecycle: done
- Status: Figma synced
- Version: 1.4.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65480
- Source: `src/components/Actionbar`
- Also called: App bar, top bar, navigation bar, header, toolbar

## Import

```tsx
import { Actionbar, ActionbarAction } from './components/Actionbar' // path relative to src/
```

## Overview

### Screen title: L1 or L2

The heading is the screen's title, and its size follows the screen's level. An **L1** screen — top level, reached from the bottom navbar, with no back or ✕ button — uses **Heading/18** (in Figma, an “L1 page heading” text in the heading slot). An **L2** screen — with a back or ✕ button — uses **Heading/14**. Toggle the back button above to see both.

Automatic: no `onBack` → L1, Heading/18; with `onBack` → L2, Heading/14.

### Title or search

The base content has three types: Content (heading + description), Search (placeholder) and Searched (typed). In Search, the middle of the bar becomes the search field — tap the search action above.

Figma's base content has three types: Content (heading + description), Search (placeholder) and Searched (typed). Pass `search` and the middle becomes a real search input — tap the search action above.

### Actions and bottom content

The actions in → content right are icon buttons — at most two. First choice: **Tertiary Small**, boxed (32 × 32 with the tertiary border). Use **Ghost** (no box) only when the design asks for it. ↓ Content bottom holds tabs or filters that belong to the bar.

`ActionbarAction` is a Tertiary Small icon button (`variant="ghost"` drops the box); give it a label so it's announced. `bottom` is Figma's content-bottom slot — tabs or filters that belong to the bar. The title is the screen's heading (h1).

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
| `elevated` | `boolean` |  | Show the scrolled state (elevation-low) yourself, when a sibling scroll area moves under the bar. Overrides sticky's automatic behaviour. |
| `sticky` | `boolean` | `false` | Stick to the top while the page scrolls. |
| `ActionbarAction` | `{ icon, label, onClick, pressed? }` |  | Round 32px icon button; pressed shows a toggle state (e.g. watchlist). |

## Tokens used

- `surface/default`
- `border/light · dark`
- `content/primary · secondary · disabled`
- `content/accent/discover (caret)`
- `Heading/14`
- `Description/12 · 14`
- `size/32 · 48`
- `state-layer/*`
- `radius/full`

## Recent changes

- **1.4.0** (2026-10-10) Title by screen level · Tertiary actions: The title follows the screen's level: Heading/18 on an L1 screen (top level, no back or ✕ button), Heading/14 on an L2 screen (with one). Icon actions are Tertiary Small, boxed (32 × 32 with the tertiary border) — the first choice. Ghost (no box) when the design asks for it. ActionbarAction rendered a restyled Secondary button; it's a plain Tertiary Small now, with variant="ghost" as the option. The title size comes from onBack.
- **1.3.0** (2026-10-05) Typography role rules: Typography role rules: typed search text and its placeholder use Label (input text). Matches Figma.
- **1.2.0** (2026-10-05) New type weights: Text uses the three typography roles: titles Heading (750), labels Label (650). Search text uses Description.
