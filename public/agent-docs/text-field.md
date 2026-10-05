# Input field & text box

> Fields let people enter text — a single line (input field) or several lines with a character counter (text box).

- Group: Input & control
- Lifecycle: done
- Status: Figma synced
- Version: 1.4.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-66091
- Source: `src/components/TextField`
- Also called: Text input, text field, textarea, form field

## Import

```tsx
import { TextField } from './components/TextField' // path relative to src/
```

## Overview

### States come from the input

Figma draws six states. In code, Typing is focus (dark border, blue caret), Typed is simply having a value, and Disabled is the disabled attribute. Only Error and Success are set by you with `status` — try a quantity of 0 or a price outside the band above.

### Text box counter

With `multiline` and `maxLength` the text box shows “n/max”. Typing past the limit is allowed but switches to the error state with “Character limit reached”, as in Figma.

## Do / Don't

### Always show a label

- ✅ **Do:** A visible label stays when people start typing.
- ❌ **Don't:** Rely on the placeholder as the label — it disappears on input.

### Explain errors

- ✅ **Do:** Say what went wrong and how to fix it.
- ❌ **Don't:** Show a red border with no message.

## Options (tree)

Input field — Single line or text box

- **Type** — How much text
  - `field` — One line: quantity, PAN, search.
  - `multiline` — A text box with a character counter.
- **Status** — Feedback below the input
  - `default` — Helper text explains the field.
  - `success` — The value checks out.
  - `error` — Say what went wrong and how to fix it.
  - `disabled`
- **Extras** — Optional parts
  - `required` — Marks the label.
  - `iconLeft / iconRight` — 16px icons inside the field.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label / required` | `string / boolean` |  | Figma Label and the red * (also sets required). |
| `placeholder / value / onChange` | `input props` |  | Standard input (or textarea) props pass through. |
| `helperText` | `ReactNode` |  | Figma Helper text row. |
| `helperIcon` | `boolean` | `true` | Field: the ⓘ before neutral helper text. |
| `status` | `'error' \| 'success'` |  | Figma State=Error / Success: red border + ⚠ message, or ✓ message. |
| `disabled` | `boolean` | `false` | Figma State=Disabled. |
| `iconLeft / iconRight` | `ReactNode` |  | Field: Figma 16px icon slots. |
| `multiline` | `boolean` | `false` | Figma isInputBox: multi-line text box. |
| `maxLength` | `number` |  | Text box: shows the counter; over the limit → error. |
| `limitMessage` | `string` | `'Character limit reached'` | Text box: message when over the limit. |

## Tokens used

- `surface/primary · disabled`
- `border/light · dark · accent/error`
- `content/primary · secondary · tertiary · disabled`
- `content/accent/error · success · discover`
- `text-label-12`
- `text-description-12 · 14`
- `radius/12`
- `shadow/elevation-low`
- `icon-size/14 · 16`

## Recent changes

- **1.4.0** (2026-10-05) New type weights: Text uses the three typography roles: titles Heading (750), labels Label (650).
- **1.3.0** (2026-10-04) Typography from Figma: Label, input and text box text use Description (12 / 14 / 12) as in Figma; required mark Label / primary 12.
- **1.2.0** (2026-09-26) Material Symbols icons: Icons now come from the Material Symbols Rounded library (weight 400, 24dp) and take the text color.
