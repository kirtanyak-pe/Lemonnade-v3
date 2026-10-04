# Empty state

> What to show when a search or list has nothing in it: an illustration, a short heading and hint, and a way forward.

- Group: Feedback & status
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-66488
- Source: `src/components/EmptyState`
- Also called: No results, zero state, blank slate, nothing found

## Import

```tsx
import { EmptyState, NoResultsIllustration } from './components/EmptyState' // path relative to src/
```

## Overview

### Say what happened, then offer a way out

Use the heading to say what's missing ("No results found") and the description to say what to try. Figma's CTA is a small primary Button, "Clear" with a delete icon, that resets the search. Tap it in the demo above, then type to see results come back.

### Illustration

The default is Figma's magnifier. It's an inline SVG and every fill is a token, so it follows the theme, including the brand color. Pass your own 120px artwork to `illustration`, or `null` to hide it.

### Layout and accessibility

The empty state fills its flex parent and centres itself; Figma's frame is a fixed 412px tall. The heading is an h2 by default (use `headingLevel={3}` under a section heading). The illustration is hidden from screen readers. If results change as someone types, announce the count separately, for example in a live region next to the search field.

## Do / Don't

### Offer a way forward

- ✅ **Do:** Say what happened and give an action to recover.
- ❌ **Don't:** Leave a blank screen or a dead end.

## Options (tree)

Empty state — Nothing to show, or no results

- **Parts**
  - `illustration + title + description + action` — Say what happened and give a way to recover.
  - `title only` — Small spaces; still never a dead end.
- **Heading level**
  - `h2` — Default: the empty state is the page content.
  - `h3` — Inside a section that already has an h2.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` |  | Figma ✏️ Heading. |
| `description` | `ReactNode` |  | Figma ✏️ Description. |
| `illustration` | `ReactNode \| null` | `<NoResultsIllustration />` | Figma Illustration slot, 120px. null hides it. |
| `action` | `ReactNode` |  | Figma Clear CTA: usually <Button size="sm" variant="primary">. |
| `headingLevel` | `2 \| 3` | `2` | Heading element for the title. |

## Tokens used

- `surface/default`
- `content/primary · secondary`
- `surface/accent/brand-default (illustration)`
- `static/black · white (illustration)`
- `text-extrabold-16`
- `text-semibold-14`
- `spacing/04 · 16 · 24`
- `size/illustration (local, 120px)`

## Recent changes

- **1.0.0** (2026-09-26) First release: Illustration, heading, description and an action slot. No-results illustration with every fill bound to a theme token.
