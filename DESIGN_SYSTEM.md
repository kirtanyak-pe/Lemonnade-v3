# Lemonnade V3 (L3) Design System

Rules for composing screens with the L3 React components in `src/components`. Tokens are CSS variables
named `--l3-*`, generated from the Figma "✅ Lemonnade V3" library.

---

## 1. Spacing scale

**4px base: 4, 8, 12, 16, 24, 32, 40, 48, 64.**

| Step | Token |
|---|---|
| 4 | `--l3-spacing-04` |
| 8 | `--l3-spacing-08` |
| 12 | `--l3-spacing-12` |
| 16 | `--l3-spacing-16` |
| 24 | `--l3-spacing-24` |
| 32 | `--l3-spacing-32` |
| 40 | `--l3-spacing-40` |
| 48 | `--l3-spacing-48` |
| 64 | `--l3-spacing-64` |

Spacing tokens are used for **padding, gaps and margins only**. Never use arbitrary values: no raw px, and
no off-scale steps. For sizes (width, height, icon boxes), use `--l3-size-*` / `--l3-icon-size-*`, not spacing tokens.

> The token set also contains 02, 06, 10, 14, 20, 28, 36, 56, 72, 80 and 96. These are **not part of the
> scale**. Some components still use them (see 2.3).

---

## 2. Layout primitives

There are no `Stack` / `Row` components in the codebase. These are the **de facto primitives**: the flexbox
patterns that recur across the built components (Actionbar, Aerobar, BottomNavbar, BottomSheet, Button,
ButtonGroup, Checkbox, EmptyState, ListCell, Switch, Tabs, Tag, TextField).

### 2.1 Stack (vertical: `flex-direction: column`)

| Gap | Used for | Seen in |
|---|---|---|
| 4 | Title + supporting text; icon over label | EmptyState content, BottomSheet header text, BottomNavbar option |
| 8 | Label → control → helper; stacked header items | TextField field, BottomSheet large-header centre |
| 24 | Major blocks inside a component | EmptyState (illustration · text · action), BottomSheet large header |

### 2.2 Row (horizontal: `display: flex`, `align-items: center`)

| Gap | Used for | Seen in |
|---|---|---|
| 12 | Leading icon · content · trailing action inside a bar or row | Actionbar row, Aerobar body, TextField control, ListCell (small, card), ButtonGroup |
| 8 | A cluster of sibling controls | Actionbar actions, Tabs (pill) |
| 4 | Inline label + icon/marker | TextField label & helper, BottomSheet heading row, ListCell dots |

**Bar padding:** horizontal bars pad **16 inline** and take their height from a `min-height` size token:
Actionbar row (0 16), inline Aerobar (0 16), ListCell (8 16), ButtonGroup (16), BottomSheet header (16).
This is the de facto **16px screen gutter**.

### 2.3 Inconsistencies found

1. **Title + description gap differs.** It's 2 in Actionbar content and Aerobar content, but 4 in EmptyState and the
   BottomSheet header. 2 is off-scale.
2. **Row gap outlier.** ListCell `md` uses 16 between icon and text, while every other row, including ListCell `sm`
   and `card`, uses 12.
3. **Clustered-control gap differs.** It's 12 in ButtonGroup, but 8 in Actionbar actions and Tabs (pill).
4. **Off-scale spacing inside components** (mostly copied from Figma values):
   - **02** (34 uses): focus-outline width and offset, gaps in Button `sm`, Tag, Tabs, and Actionbar/Aerobar text.
   - **06**: Button `sm` vertical padding, Tabs (pill) side padding, floating Aerobar right padding, and the
     Actionbar back-button focus offset.
   - **10**: Button `md` padding, BottomNavbar option padding and separator inset.
   - **36**: Tabs `sm` height, TextField icon box.
5. **Spacing tokens used as sizes:** the Checkbox tick box (10×10), the TextField icon box (36), and the Tabs `sm` height
   (36). These should be `--l3-size-*`.
6. **Asymmetric padding:** the floating Aerobar body pads 0 6 0 12 (Figma), while inline it's 0 16.
7. **Vertical rhythm is mixed.** Most bars get their height from `min-height`, but ListCell and Aerobar text also add
   vertical padding (8 / 12).
8. **Focus-ring offset varies:** 2 in most controls, 6 on the Actionbar back button.

---

## 3. Semantic token rules

<!-- PENDING: paste verbatim from notes -->
Waiting for the exact text from your notes on:
- `surface/*` elevation scale
- `static/black`, `static/white`
- `content/tertiary`
- indicator vs success/error
- zing / us-stock / discover
- `extra/gold`
- purple / indigo / teal / orange

---

## 4. Composition patterns

<!-- PENDING: patterns not yet defined, do not infer -->

---

## 5. Known token gaps

**Not yet resolved. Do not rely on these for AI generation.**

| Gap | What's in the tokens today |
|---|---|
| **us-stock and discover have not diverged** | Every `us-stock` token points to the same blue ramp as `discover` (surface light/default, content, border light/default, gradient stops), for example both are `hue-blue-500`. |
| **surface/default = surface/primary in light mode** | In LM Light both are `neutral-white-base`, so a "raised" surface doesn't separate from the page. |
| **extra/gold duplicates the honey ramp** | `extra/gold/*` aliases the `hue/honey` ramp (for example gold-100 → honey-100 in light, honey-800 in dark). It has no values of its own. |
