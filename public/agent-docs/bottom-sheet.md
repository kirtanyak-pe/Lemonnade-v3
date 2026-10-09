# Bottom sheet

> A panel that slides over the screen to show a focused task — confirm an order, pick an option, see a result — without leaving the page.

- Group: Surfaces
- Lifecycle: done
- Status: Figma synced
- Version: 2.3.2
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-63932
- Source: `src/components/BottomSheet`
- Also called: Sheet, modal sheet, drawer, action sheet, top sheet

## Import

```tsx
import { BottomSheet, BottomSheetHeader, BottomSheetSurface } from './components/BottomSheet' // path relative to src/
```

## Usage rules (USAGE.md)

`import { BottomSheet, BottomSheetHeader } from './components/BottomSheet'` · Figma: "L3: Bottom sheet" (4543:63932),
"L3: Bottom sheet header" (4543:63897), "L3: Overlay" (4603:91773) — all `Version=Latest` · Docs: `#/bottom-sheet`

A modal panel that slides up over the screen (or drops from the top) on the dimmed "L3: Overlay" backdrop.

---

### 1. When to use it

- A short task or choice that belongs to the current screen: *place an order*, *pick a sort order*, *confirm*, a
  result (*Order placed*).
- `placement="top"` (Figma isBottom=False) for menus tied to the top of the screen, e.g. *Sort by*.

Don't use it for:
- A whole new flow or a long form → a new screen.
- A status message → `Aerobar` (toast).

### 2. Closing — invisible, no controls

- **There is no drag handle and no ✕ close button.** Don't add either (not in the header's right slot, not as an
  icon button).
- People close a sheet by:
  - **tapping the backdrop** (the overlay), or
  - **dragging the sheet down** (up for a top sheet) — from anywhere on it: the header and footer always, the content
    once it's scrolled to the top. Before that, a swipe scrolls the content. It closes past 30% of its height or on a
    quick flick; otherwise it springs back.
- `Esc` also closes it, and the component renders a visually hidden **Close** button (`closeLabel`) for screen-reader
  and keyboard users. You don't add anything for this.
- A sheet that ends in a decision can still offer a *Cancel* / *Not now* button in its dock (a `secondary` or `ghost`
  button next to the main action) — that's an action, not a close control.

### 3. Stacking & the back button

- **At most 2 sheets at a time:** the first over the screen, and one on top of it. **Never a third** — replace the
  second sheet's content (or close it first) instead. `BottomSheet` warns in development when a third opens.
- **The first sheet has no back button.** Don't pass `onBack` to it — inside a modal `BottomSheet` the header hides
  it on the first sheet (with a development warning).
- **The second sheet has a back button** (`onBack`) that closes it and returns to the first sheet, e.g. an explainer
  opened from the first sheet's ⓘ, or a sub-step. Its backdrop tap and drag close only that second sheet.

### 4. Anatomy (Figma properties → props)

| Figma | Prop | Notes |
|---|---|---|
| isBottom | `placement` `'bottom' \| 'top'` | |
| 👁️ Header | `header` | Usually `<BottomSheetHeader>`. Without a header, name the dialog with `aria-label`. |
| content slot · 👁️ Content Slot | `children` | Leave out to hide the area (e.g. a result sheet that's only header + dock). Scrolls when tall. |
| Buttons | `footer` | Always a `ButtonGroup` (button dock) — see `ButtonGroup/USAGE.md`. |
| Utility slot · 👁️ Utility slot | `utility` | Below the dock (Figma puts the system navbar here). Bottom sheets only. |
| L3: Overlay | — | Drawn by `BottomSheet` (80% black, tap to close). |

**Header** (`BottomSheetHeader`):

| Figma | Prop | Size |
|---|---|---|
| isSmall | `size` `'sm' \| 'lg'` | |
| ✏️ Heading | `heading` (+ `headingId` for `aria-labelledby`) | both |
| 👁️ / ✏️ Description | `description` | both |
| 👁️ Back button | `onBack` | sm — **only on a second sheet stacked on another**; never on the first sheet (see 3) |
| 👁️ info | `info`, `onInfo`, `infoLabel` | sm |
| 👁️ Action - right · right slot | `trailing` | sm — one small `ghost` icon `Button` or a `Tag` (Figma's preferred values). Never a ✕. |
| 👁️ Content bottom | `bottom` | sm — flat `Tabs` or search that belong to the sheet go here, not in the body |
| 👁️ H-Icon · H-Icon | `icon` | lg — 64px icon |
| 👁️ header tag | `tag` | lg — `<Tag size="sm">` |

### 5. Which header

| Header | Use for |
|---|---|
| `sm` *(default)* | Tasks and choices: order entry, sort, filters, settings |
| `lg` | Results and confirmations: *Order placed*, *KYC complete* — icon, optional tag, heading, description |

### 6. Content & placement

- One dock per sheet (`footer`). The main action follows `Button/USAGE.md` (one strong button).
- Keep sheets short; if the content needs more than about one screen of scrolling, use a new screen.
- Give the sheet a name: `aria-labelledby` pointing at `headingId`, or `aria-label` when there's no header.
- Focus moves into the sheet, is trapped there, and returns when it closes; the page behind is inert (code).

---

### Code

```tsx
// Task sheet: small header, tabs in the header slot, dock
<BottomSheet
  open={open}
  onClose={close}
  aria-labelledby="buy-heading"
  header={
    <BottomSheetHeader
      headingId="buy-heading"
      heading="Buy RELIANCE"
      description="NSE"
      info
      bottom={<Tabs aria-label="Order type" items={orderTypes} value={type} onChange={setType} />}
    />
  }
  footer={
    <ButtonGroup aria-label="Order actions">
      <Button variant="buy">Buy 10 shares</Button>
      <Button variant="ghost" onClick={close}>Not now</Button>
    </ButtonGroup>
  }
>
  …
</BottomSheet>

// Result sheet: large header, no content slot
<BottomSheet open={done} onClose={closeDone} aria-labelledby="placed-heading"
  header={<BottomSheetHeader size="lg" headingId="placed-heading" heading="Order placed" description="10 shares of RELIANCE" icon={<Icon icon={msCheckCircle} />} tag={<Tag size="sm">EXECUTED</Tag>} />}
  footer={<ButtonGroup aria-label="Done"><Button onClick={closeDone}>Done</Button></ButtonGroup>}
/>

// Second sheet stacked on the first: the only place a back button appears (max 2 sheets)
<BottomSheet open={explainerOpen} onClose={closeExplainer} aria-labelledby="types-heading"
  header={<BottomSheetHeader headingId="types-heading" heading="Order types" onBack={closeExplainer} />}>
  …
</BottomSheet>

// Top sheet (drag up or tap outside to close)
<BottomSheet open={sortOpen} onClose={closeSort} placement="top" aria-labelledby="sort-heading"
  header={<BottomSheetHeader headingId="sort-heading" heading="Sort by" />}>
  …radios…
</BottomSheet>
```

---

### Open questions

<!-- PENDING: maximum sheet height / when a sheet should become a full screen -->

## Overview

### Three pieces

**BottomSheet** is the modal: the Figma "L3: Overlay" backdrop, slide-in, focus trap, backdrop tap / drag down / Esc to close. **BottomSheetHeader** is Figma's header in small (back · heading · ⓘ · any action) and large (icon · tag · heading · description) sizes. **BottomSheetSurface** is the panel alone, for embedding or static layouts.

### Closing is invisible

There is no drag handle and no ✕. People close a sheet by **tapping the backdrop** or **dragging it down** — anywhere on the sheet: the header and footer always, the content once it's scrolled to the top (before that, a swipe scrolls the content). Esc also closes it, and a visually hidden “Close” button is there for screen-reader and keyboard users. The page behind the sheet is inert while it's open.

### At most two sheets

The first sheet over a screen has **no back button**. A second sheet can open on top of it (e.g. an explainer from the ⓘ) — that one has a back button that returns to the first. Never stack a third: replace the second sheet instead. Try the ⓘ on the Buy sheet above.

### Bottom or top

Figma's isBottom=False drops the sheet from the top with rounded bottom corners — handy for sort or filter menus tied to the top of the screen.

## Do / Don't

### Back only on a stacked sheet

- ✅ **Do:** The first sheet over a screen has no back button. A second sheet on top of it has one, returning to the first. Two sheets at most.
- ❌ **Don't:** Put a back button on the first sheet, or open a third sheet on top of two.

### Close by dragging or tapping outside

- ✅ **Do:** Keep the header clean: heading, and a back button or one action if needed. The sheet closes by dragging down or tapping the backdrop.
- ❌ **Don't:** Add a ✕ or a drag handle — closing is handled without visible controls.

## Options (tree)

Bottom sheet — A modal panel over the screen

- **Placement**
  - `bottom` — Default. Closes by backdrop tap or drag down.
  - `top` — Menus tied to the top, e.g. Sort.
- **Header size**
  - `sm` — Tasks and choices.
  - `lg` — Results: icon, tag, heading, description.
- **Stacking** — At most 2 sheets
  - `1st sheet` — No back button, no ✕.
  - `2nd sheet` — Back button returns to the first. Never a third.
  - `header bottom` — Tabs or search at the top of a sheet.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `open / onClose` | `boolean / () => void` |  | BottomSheet: visibility; onClose fires on backdrop tap, drag down (up for top sheets), Esc and the screen-reader close button. |
| `placement` | `'bottom' \| 'top'` | `'bottom'` | Figma isBottom. |
| `header` | `ReactNode` |  | Figma 👁️ Header — usually <BottomSheetHeader />. |
| `children` | `ReactNode` |  | Figma content slot; scrolls if the sheet would be taller than the screen. |
| `footer` | `ReactNode` |  | Figma Utility slot: the area under the content — usually the button dock (<ButtonGroup>). |
| `utility` | `ReactNode` |  | Code-only extra area under footer (e.g. a note under the buttons). In Figma it goes inside the Utility slot. |
| `closeLabel` | `string` | `'Close'` | Name of the visually hidden close button (screen readers / keyboard). There is no visible close button or drag handle; the whole sheet drags to dismiss. |
| `container` | `HTMLElement \| null` | `document.body` | Render inside another element instead of covering the page. |
| `aria-labelledby` | `string` |  | Point at the header heading (headingId) to name the dialog. |
| `Header: size` | `'sm' \| 'lg'` | `'sm'` | Figma isSmall. |
| `Header: heading / description` | `string` |  | Heading text and optional description. |
| `Header: info` | `boolean \| ReactNode` | `false` | sm: ⓘ after the heading (decorative on its own). |
| `Header: onInfo / infoLabel` | `() => void / string` | `'More information'` | sm: makes the ⓘ a real, labelled button. |
| `Header: onBack / trailing` | `() => void / ReactNode` |  | sm actions: back button — only on a second sheet stacked on another (hidden on the first sheet over the screen) — or any right-side node (Tag, small Button). There is no close (✕) button. |
| `Header: bottom` | `ReactNode` |  | sm: Figma "Content bottom" slot under the header row — e.g. flat Tabs or a search field. Put them here, not as a separate row in the sheet body. |
| `Header: icon / tag` | `ReactNode` |  | lg: 64px icon slot and a header tag. |

## Tokens used

- `surface/primary`
- `border/light · intense`
- `content/primary · secondary`
- `Heading/16 · 20`
- `Description/12 · 14`
- `radius/24 · full`
- `shadow/elevation-high`
- `surface/overlay (Overlay)`
- `motion/* (local)`
- `size/tap-target`

## Recent changes

- **2.3.2** (2026-10-10) Server rendering: Renders on the server (Next.js): the stack level has a server value and the portal waits for the browser. A closed sheet used to throw during server rendering. Development warnings no longer depend on Vite.
- **2.3.1** (2026-10-09) Overlay is its own component: The dimmed backdrop is now the shared Overlay component, so other modals can use it. No visual change. Slot names match Figma: footer is the Figma Utility slot (the button dock); utility is a code-only area under it.
- **2.3.0** (2026-10-05) New type weights: Text uses the three typography roles: titles Heading (750), labels Label (650). Large header description uses Description.
