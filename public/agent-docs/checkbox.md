# Checkbox & radio

> Checkboxes pick any number of options; radios pick exactly one from a group.

- Group: Input & control
- Lifecycle: done
- Status: Figma synced
- Version: 1.3.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65366
- Source: `src/components/Checkbox`
- Also called: Selector, check box, radio button

## Import

```tsx
import { Checkbox, Radio } from './components/Checkbox' // path relative to src/
```

## Overview

### Indeterminate

Figma's "Intermediate" state. Use it on a parent checkbox when only some of its children are selected — tap "All segments" above to try it.

## Do / Don't

### Checkboxes for many, radios for one

- ✅ **Do:** Radios when exactly one option can be chosen.
- ❌ **Don't:** Checkboxes for mutually exclusive options.

## Options (tree)

Checkbox & radio — Pick many · pick one

- **Type** — How many can be chosen
  - `checkbox` — Several options, or one on/off choice in a form.
  - `radio` — Exactly one of a set; radios share a name.
- **State** — Checkbox shown
  - `unchecked`
  - `checked`
  - `indeterminate` — A parent with some children checked.
  - `disabled`
- **In a row** — With a label
  - `ListCell as="label"` — Tap anywhere on the row to toggle.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `checked` | `boolean` |  | Controlled state (or use defaultChecked). |
| `indeterminate` | `boolean` | `false` | Checkbox only. Figma State=Intermediate. |
| `disabled` | `boolean` | `false` | Figma Disabled=True. |
| `name / value` | `string` |  | Radio grouping and form value. |
| `…input props` | `InputHTMLAttributes` |  | onChange, aria-label, id, etc. Needs an accessible name. |

## Tokens used

- `content/primary`
- `content/disabled`
- `content/inverted`
- `shadow-sm`
- `radius/06`
- `size/20 · 24`
- `size/tap-target`

## Recent changes

- **1.3.0** (2026-10-10) Refs for forms: Checkbox and Radio pass the ref you give them to the <input> — they used to replace it with their own, so form libraries like react-hook-form couldn't register them. The check and dash marks now draw on older Android phones too (Chrome / WebView before version 120).
- **1.2.0** (2026-09-26) Accessibility pass: Development warning when a checkbox or radio has no accessible name.
- **1.1.1** (2026-09-26) L3 naming: Figma references renamed from D2 to L3.
