# Bottom navbar

> The tab bar at the bottom of the app for moving between its main sections. Mutual Fund and F&O have their own sub-navs with a Home item back to the main bar.

- Group: Navigation
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-61961
- Source: `src/components/BottomNavbar`
- Also called: Bottom navigation, tab bar, nav bar, bottom tabs, dock

## Import

```tsx
import { BottomNavbar, NavIcon, navIconNames } from './components/BottomNavbar' // path relative to src/
```

## Overview

### Main nav and sub-navs

The main bar has Stocks, Market, Portfolio, Mutual Fund and F&O. Mutual Fund and F&O each have their own bar. Pass `home` to add the Home item and the separator after it. Tap Mutual Fund in the demo above to try it.

### Moving between navs

When the options change, the bar animates. The option you tapped glides into its new slot, and the rest slide in one after another from the direction you're going: from the right into a sub-nav, from the left back Home. The animation uses the motion tokens, and it's turned off when the device is set to reduce motion.

### Nav icons

`NavIcon` is Figma's nav icon set. Unselected icons are one color, with the tertiary and secondary parts built into the artwork, and follow the theme. Selected icons are two-tone brand artwork with fixed colors, so they look the same in every theme. For any other icon, pass a Material Symbol with `<Icon>`: it's shown in content/tertiary, or success green when selected.

### Accessibility

The bar is a `<nav>` landmark. Give it a name with `aria-label`. Each option is a button, or a link when you pass `href`. The current option is marked with `aria-current="page"`, and the label is always shown. With `fixed`, the bar sticks to the bottom of the screen and adds space for the home indicator.

## Do / Don't

### Only top-level sections

- ✅ **Do:** Three to five main sections, always with labels.
- ❌ **Don't:** Put actions (like Buy) or more than five items in the bar.

## Options (tree)

Bottom navbar — App sections, 3–5 items

- **Item set** — Which part of the app
  - `main` — Top-level sections, always labelled.
  - `sub-nav + home` — MF / F&O sections with a way back home.
- **Rules**
  - `no actions` — Never Buy or other actions in the bar; never more than five items.
  - `aria-current` — The current section is marked for screen readers.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `BottomNavbarItem[]` |  | { value, label, icon, selectedIcon?, href? }. Icons are 24px. |
| `value` | `string` |  | The current section (Figma Tab / isActive). |
| `onChange` | `(value) => void` |  | Called when an option is tapped. |
| `home` | `{ label?, onClick?, href? }` |  | Figma MF / F&O sub-navs: a Home item (back-home icon) and a separator. The label defaults to 'Home'. |
| `aria-label` | `string` | `'Main'` | Name of the nav landmark. |
| `fixed` | `boolean` | `false` | Fix the bar to the bottom of the viewport and add the safe-area inset. |
| `NavIcon` | `{ name: NavIconName; selected? }` |  | Figma .L3: base navicons: stocks, market, portfolio, mutualFund, fno, mfFunds, mfDashboard, mfSips, fnoOptionChain, fnoPositions, fnoScalper, backHome. |

## Tokens used

- `surface/primary`
- `border/light`
- `content/tertiary (unselected)`
- `content/accent/success-default (selected)`
- `content/primary (nav icon mask)`
- `text-semibold-10`
- `size/64`
- `spacing/04 · 10`
- `icon-size/24`
- `shadow/elevation-medium`
- `state-layer/dark/*`

## Recent changes

- **1.0.0** (2026-09-26) First release: Main nav plus Mutual Fund and F&O sub-navs with a Home item and separator. Figma nav icons: theme-aware outlines, brand artwork when selected. Animated switch between navs: the tapped option glides, the rest slide in.
