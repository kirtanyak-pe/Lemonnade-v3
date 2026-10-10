# BottomSheet — usage rules

`import { BottomSheet, BottomSheetHeader } from './components/BottomSheet'` · Figma: "L3: Bottom sheet" (4543:63932),
"L3: Bottom sheet header" (4543:63897), "L3: Overlay" (4603:91773) — all `Version=Latest` · Docs: `#/bottom-sheet`

A modal panel that slides up over the screen (or drops from the top) on the dimmed "L3: Overlay" backdrop.

---

## 1. When to use it

- A short task or choice that belongs to the current screen: *place an order*, *pick a sort order*, *confirm*, a
  result (*Order placed*).
- `placement="top"` (Figma isBottom=False) for menus tied to the top of the screen, e.g. *Sort by*.

Don't use it for:
- A whole new flow or a long form → a new screen.
- A status message → `Aerobar` (toast).

## 2. Closing — invisible, no controls

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

## 3. Stacking & the back button

- **At most 2 sheets at a time:** the first over the screen, and one on top of it. **Never a third** — replace the
  second sheet's content (or close it first) instead. `BottomSheet` warns in development when a third opens.
- **The first sheet has no back button.** Don't pass `onBack` to it — inside a modal `BottomSheet` the header hides
  it on the first sheet (with a development warning).
- **The second sheet has a back button** (`onBack`) that closes it and returns to the first sheet, e.g. an explainer
  opened from the first sheet's ⓘ, or a sub-step. Its backdrop tap and drag close only that second sheet.

## 4. Anatomy (Figma properties → props)

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

## 5. Which header

| Header | Use for |
|---|---|
| `sm` *(default)* | Tasks and choices: order entry, sort, filters, settings |
| `lg` | Results and confirmations: *Order placed*, *KYC complete* — icon, optional tag, heading, description |

## 6. Content & placement

- One dock per sheet (`footer`). The main action follows `Button/USAGE.md` (one strong button).
- Keep sheets short; if the content needs more than about one screen of scrolling, use a new screen.
- Give the sheet a name: `aria-labelledby` pointing at `headingId`, or `aria-label` when there's no header.
- Focus moves into the sheet, is trapped there, and returns when it closes; the page behind is inert (code).

## 7. Confirmations

**Every confirmation is a bottom sheet — L3 has no dialog** (decided 2026-10-10). That covers reviewing an order
before it's placed, confirming an action that can't be undone, and the result afterwards.

- **Before the action (review sheet):** `sm` header that asks the question (*Place this order?*, *Delete this
  watchlist?*) · `ListCell` rows with the facts (quantity, price, charges) · the total · a `warning` `Aerobar` when it's
  risky · a horizontal `ButtonGroup` with the strong confirm on the right (`buy` / `sell` for trades, `primary`
  otherwise) and `secondary` *Cancel* on the left.
- **After it (result sheet):** `lg` header — icon, optional tag, heading, description (*Order placed*) — and one button.
- Confirming something from inside a sheet? The confirmation is the **second sheet** (it gets the back button). Never a
  third.

<!-- PENDING: the confirm button for a destructive action that isn't a trade (Delete watchlist, Remove card) — no danger variant exists; see Button/USAGE.md -->
<!-- PENDING: is "Cancel order" a trade action (sell style) or a destructive action? -->

---

## Code

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

// Review sheet: the question, the facts as rows, Cancel + the strong confirm (see 7)
<BottomSheet open={reviewing} onClose={closeReview} aria-labelledby="review-heading"
  header={<BottomSheetHeader headingId="review-heading" heading="Place this order?" description="Buy RELIANCE · NSE" />}
  footer={
    <ButtonGroup aria-label="Confirm order">
      <Button variant="secondary" onClick={closeReview}>Cancel</Button>
      <Button variant="buy" onClick={place}>Buy 10 shares</Button>
    </ButtonGroup>
  }>
  <ListCell label="Quantity" trailing="10" />
  <ListCell label="Price" trailing="₹2,948.60" />
  <ListCell label="Charges" trailing="₹23.10" />
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

## Open questions

<!-- PENDING: maximum sheet height / when a sheet should become a full screen -->
