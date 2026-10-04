# Tabs

> Tabs switch between related views on the same screen. Underline tabs split a page into sections, pill tabs filter what's shown, and a pill group switches how content is shown.

- Group: Navigation
- Lifecycle: done
- Status: Figma synced
- Version: 1.5.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65938
- Source: `src/components/Tabs`
- Also called: Tab bar, chips, filter pills, pill group, segmented control, toggle group, view switcher

## Import

```tsx
import { Tabs, Tab } from './components/Tabs' // path relative to src/
```

## Overview

### Two components

**Tabs** (Figma "L3: Tabs group") is the bar: selection, horizontal scrolling on small screens, and arrow-key navigation. **Tab** (Figma "L3: base tab") is one item, in underline or pill form, md or sm.

### Three appearances

- **underline** (Figma Flat tabs) — sections of a screen; at the top they go in the Actionbar's bottom slot.
- **pill** (Figma Pill tabs) — a row of filter chips in one style: primary, secondary or tertiary. Never mix styles in a row.
- **pill-group** (Figma Pill group) — 2–4 options in a shared track to switch how the same content is shown (Tree / List). Its pills are always tertiary: the selected one is a black fill, the rest blend into the track.

### No layout shift

Selected underline tabs switch to the extrabold style. Each tab reserves that bolder width up front, so neighbouring tabs don't move when the selection changes.

## Do / Don't

### Short, parallel labels

- ✅ **Do:** Two to four one-word sections of the same thing.
- ❌ **Don't:** Long labels that truncate, or tabs that act like buttons.

## Options (tree)

Tabs — Switch sections, filter or switch views

- **Appearance** — What it switches
  - `underline` — Sections of a screen. At the top: in the Actionbar bottom slot.
  - `pill` — A row of filter chips.
  - `pill-group` — 2–4 options in a track to switch views (Tree / List). Always tertiary.
- **Size**
  - `md` — Default.
  - `sm` — Dense filter rows inside content.
- **Width**
  - `hug` — Default. Tabs as wide as their labels.
  - `fill` — Tabs share the row; pill group pills become equal.
- **Pill options** — Chip tabs only
  - `emphasis: primary` — Default. Black fill when selected, light border when not.
  - `emphasis: secondary` — Dark outline when selected — inside cards and sheets.
  - `emphasis: tertiary` — Subtle fill, no border when unselected — quiet, dense rows.
  - `subLabel` — A second 8/10 line under the label.
  - `hideLabel` — Icon-only tab; the label stays as its name.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TabItem[]` |  | Tabs: { value, label, iconLeft?, iconRight?, subLabel?, hideLabel? }. |
| `value` | `string` |  | Tabs: the selected item value. |
| `onChange` | `(value) => void` |  | Tabs: called on tap and on arrow / Home / End keys. |
| `appearance` | `'underline' \| 'pill' \| 'pill-group'` | `'underline'` | Figma Tabs group Type: Flat tabs / Pill tabs / Pill group. A Tab alone takes underline \| pill (Figma isPill). |
| `emphasis` | `'primary' \| 'secondary' \| 'tertiary'` | `'primary'` | Figma base tab Type, appearance="pill" only (pill-group is always tertiary) — the style of the whole row. primary: selected black fill, unselected light border · secondary: selected dark outline, unselected light border · tertiary: selected black fill, unselected subtle fill with no border. |
| `size` | `'md' \| 'sm'` | `'md'` | Figma isSmall: underline 40 / 36, pill 32 / 24. |
| `width` | `'hug' \| 'fill'` | `'hug'` | Tabs: hug = tabs as wide as their labels (a pill group's track wraps them); fill = tabs stretch to fill the row (a pill group goes full width with equal pills). |
| `aria-label` | `string` |  | Tabs: required name for the tab list. |
| `idPrefix` | `string` |  | Tabs: sets tab ids / aria-controls so panels can be linked. |
| `iconLeft / iconRight` | `ReactNode` |  | Figma icon slots, 16px, colored with the label. |
| `subLabel` | `string` |  | Figma 👁️ Sub label: a second 8/10 line under the label. Chip (pill) tabs only. |
| `hideLabel` | `boolean` | `false` | Figma 👁️ Label off: icon-only tab. Needs one icon; the label stays as its accessible name. |
| `selected` | `boolean` | `false` | Tab only, when composing tabs yourself. |

## Tokens used

- `content/primary · secondary · inverted`
- `surface/primary · secondary · inverted`
- `border/light · dark`
- `state-layer/*`
- `text-semibold-10 · 12 · 14`
- `text-extrabold-12 · 14`
- `radius/12 · full`
- `size/24 · 32 · 40`
- `spacing/36`
- `size/tap-target`

## Recent changes

- **1.5.0** (2026-10-02) Hug or fill width: width="hug" | "fill". Hug (default): tabs as wide as their labels, and a pill group's track wraps them. Fill: tabs stretch to fill the row; a pill group goes full width with equal pills. A pill group no longer stretches across a flex or grid parent when it should hug.
- **1.4.0** (2026-10-02) Pill group: Figma “L3: Tabs” is now “L3: Tabs group” (Type: Flat tabs · Pill tabs · Pill group); base tab isChip is now isPill. appearance="pill-group": tertiary pills in a surface/secondary track for switching views (Tree / List). Selected pill is a black fill; the rest blend into the track. The separate SegmentedControl component is gone — Figma merged it into the Tabs group as Pill group. Use <Tabs appearance="pill-group"> instead.
- **1.3.0** (2026-10-02) Tertiary chips: Figma Type is now Primary · Secondary · Tertiary, each with a selected and an unselected look (Ghost removed, typos fixed). emphasis="tertiary": selected black fill, unselected subtle fill (surface/secondary) with no border or elevation. Switching between views moved to the new Segmented control; pill tabs are for filtering.
