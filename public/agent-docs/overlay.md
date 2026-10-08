# Overlay

> The dimmed backdrop behind a bottom sheet or any other modal.

- Group: Surfaces
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4603-91773
- Source: `src/components/Overlay`
- Also called: Scrim, backdrop, dim, modal background

## Import

```tsx
import { Overlay } from './components/Overlay' // path relative to src/
```

## Overview

### Behind every modal

The overlay dims the screen behind a sheet so the task in front gets all the attention. Tapping it closes the sheet. Bottom sheets already include it — use Version = Latest in Figma.

`<BottomSheet>` renders it for you. For another modal, render `<Overlay open onClick={close} />` inside a positioned container, then the panel after it. It's decorative (aria-hidden): the panel owns the dialog role and its keyboard close.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open` | `boolean` |  | Fades in when true. |
| `onClick` | `() => void` |  | Tap on the scrim — usually closes the modal above it. |

## Tokens used

- `surface/overlay`
- `motion/duration-medium · easing-standard (local)`

## Recent changes

- **1.0.0** (2026-10-09) Its own component: Overlay: the dimmed backdrop behind sheets, now a component of its own (it was part of Bottom sheet). <Overlay open onClick />; BottomSheet uses it.
