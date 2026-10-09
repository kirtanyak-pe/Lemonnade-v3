# Toggle switch

> Switches turn a single setting on or off, and take effect immediately.

- Group: Input & control
- Lifecycle: done
- Status: Figma synced
- Version: 1.3.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65343
- Source: `src/components/Switch`
- Also called: Toggle, knob, toggle button

## Import

```tsx
import { Switch } from './components/Switch' // path relative to src/
```

## Overview

### Motion

The knob slides and the track fades over 150ms. Figma has no motion yet, so the timing comes from local motion tokens; it's instant for reduced-motion users.

## Do / Don't

### Switches apply immediately

- ✅ **Do:** Use for settings that take effect as soon as they flip.
- ❌ **Don't:** Use inside a form that needs Save — use a checkbox there.

## Options (tree)

Toggle switch — A setting that applies immediately

- **Size**
  - `md` — Default, in settings rows.
  - `sm` — Compact rows and toolbars.
- **State**
  - `off`
  - `on`
  - `disabled`
- **In a row** — Never inside a form that needs Save
  - `ListCell as="label"` — The whole row toggles it.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` |  | Controlled state (or use defaultChecked). |
| `size` | `'md' \| 'sm'` | `'md'` | Figma isSmall: md 34×20, sm 28×16. |
| `disabled` | `boolean` | `false` | Not drawn in Figma; uses content-disabled. |
| `…input props` | `InputHTMLAttributes` |  | onChange, aria-label, id, etc. Renders role="switch". |

## Tokens used

- `content/primary`
- `content/tertiary`
- `content/inverted`
- `content/disabled`
- `size/12 · 16 · 20`
- `motion/* (local)`
- `size/tap-target`

## Recent changes

- **1.3.0** (2026-10-10) Refs for forms: The ref you give it reaches the <input> (it used to be replaced by the switch's own), so react-hook-form and focus management work. Knob shadow uses color-mix() instead of relative rgb(from …) — same look, works in more browsers.
- **1.2.0** (2026-09-26) Accessibility pass: Development warning when a switch has no accessible name.
- **1.1.1** (2026-09-26) L3 naming: Figma references renamed from D2 to L3.
