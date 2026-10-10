# Section header

> The heading row of a section: a title, with an optional tag, info icon, short description and one action — View all or a switcher.

- Group: Data display
- Lifecycle: done
- Status: Figma synced
- Version: 1.1.1
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5407-124
- Source: `src/components/SectionHeader`
- Also called: Section title, section heading, list header, group header, view all

## Import

```tsx
import { SectionHeader } from './components/SectionHeader' // path relative to src/
```

## Overview

### What goes in it

The **heading** is always there. Everything else is optional: a **tag** and an **info** icon after the heading, a **description** under it, and one **action** on the right.

- **Description:** aim for one line. It never goes past two — longer text is cut with “…”.
- **Action:** either **View all** (opens the full list) or a **switcher** — a Select like “Day P&L ↕” or a filter that opens a sheet of choices. Never two actions.
- **Touch area:** the action and the info icon are at least 48 × 48 to tap, whatever they look like — without making the row taller.

### Spacing

The section header sits 16 above its card or list, and sections are 24 apart (32 for a bigger break) inside the 16 page padding — see Layout.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` |  | Figma ✏️ Heading — required. |
| `description` | `ReactNode` |  | Figma ✏️ Description — one line ideally, two at most (cut with an ellipsis). |
| `tag` | `ReactNode` |  | Figma 👁️ Tag: a small Tag after the title. |
| `onInfo / infoLabel` | `() => void · string` |  | Figma 👁️ Info: an ⓘ button after the title (name defaults to “About <title>”). |
| `action` | `{ type: 'view-all', onClick, label? } \| { type: 'switcher', label, onClick, expanded? }` |  | Figma 👁️ CTA, nested Type = Button (View all) · Time Switcher. Touch area ≥ 48 × 48; the row stays as tall as its text. |
| `headingLevel` | `2 \| 3 \| 4` | `2` | Heading level of the title. |

## Tokens used

- `content/primary (title)`
- `content/secondary (description, info)`
- `Heading/14`
- `Description/12`
- `spacing/08 · 04`
- `size/48 (touch area)`

## Recent changes

- **1.1.1** (2026-10-10) Uses the shared touch areas: View all and the switcher hug their content and bring their own 48 × 48 touch areas (now built into Ghost buttons and Select), so the header no longer adds its own.
- **1.1.0** (2026-10-10) Simpler CTA: L3: Section header is one component now: 👁️ CTA shows the action, and the nested "L3 base: section header cta" picks its Type — Button (View all) or Time Switcher. The three CTA variants are gone. View all hugs its label like in Figma: 16 tall instead of 32, so a header with only a title and View all is 20 tall. Its touch area stays 48 × 48. No API change: action={{ type: 'view-all' }} is Type=Button, type: 'switcher' is Type=Time Switcher.
- **1.0.0** (2026-10-09) New component: Section header: a required heading with an optional tag, info icon, description (one line ideally, two at most) and one action — View all or a switcher. The action and info icon have a 48 × 48 touch area. New Figma component L3: Section header (CTA = None · View all · Switcher; ✏️ Heading, ✏️ Description, 👁️ Description · Tag · Info). <SectionHeader title description tag onInfo action headingLevel />; action is typed to view-all | switcher.
