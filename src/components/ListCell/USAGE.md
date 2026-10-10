# ListCell — usage rules

`import { ListCell } from './components/ListCell'` · Figma: "L3: list cell" (4543:65400) · Docs: `#/list-cell`

A row in a list: an icon, a label with an optional description, and something on the right — a chevron, a switch, a
tag or a value. **A list cell is a card with specific content, so it follows the Card rules** (`Card/USAGE.md`).

---

## 1. When to use it

- Lists of things: holdings, watchlist (symbol · Sparkline · price + `PriceChange`), search results, history grouped
  by date.
- Settings and menus: navigation rows with a chevron, toggles with a `Switch`.
- Choices: the options in a select sheet (single select → `Radio` rows; multi-select → `Checkbox` rows).
- Facts in a review sheet: *Quantity 10*, *Price ₹2,948.60*, *Charges ₹23.10* (see `BottomSheet/USAGE.md` §7).

Don't use it for:
- One block of grouped content → `Card`.
- 2–4 options that should all be visible at once → pill `Tabs`.
- A status message → `Aerobar`.

## 2. Plain or card

| Row | Figma | Code | Looks |
|---|---|---|---|
| Plain | isPlain = True | `variant="plain"` (default) | a flat card: **no fill** (takes the colour of what it sits on), runs edge to edge |
| Card, not tappable | isPlain = False, isTappable = False | `variant="card"` | a static card: **no fill** + `border-light`, no shadow, radius 12 |
| Card, tappable | isPlain = False, isTappable = True | `variant="card"` + `onClick` / `href` / `as="label"` | a clickable card: `surface-primary` + `border-light` + `elevation-low`, scales to 0.98 while pressed |

- Card rows always sit inside a margin (16 from the screen edge, like any card). Plain rows run edge to edge in their
  container and keep their own 16 side padding.
- Sizes: `md` (default — min 48, 24px icons) and `sm` (Figma isSmall — min 32, 16px icons).

## 3. Tappable rows

- A tappable row is one tap target: `onClick` (a button) or `href` (a link) makes the **whole row** tappable, with a
  pressed tint.
- **Show where a row leads:** a tappable row gets a chevron (`iconRight`) or a control on the right. Never a tappable
  row with nothing to hint at it.
- **A row with a `Switch`, `Checkbox` or `Radio`** is `as="label"`, with the control in `trailing`: tapping anywhere on
  the row toggles it. Don't make that row a button or a link — a button can't contain another control (development
  warning).
- **Which control:** a `Switch` is a setting that applies immediately (not inside a form that needs Save); `Checkbox`
  rows for picking several; `Radio` rows (in a select sheet) for picking one.

## 4. Selected rows

When rows are a list of choices, the chosen one is `selected` (Figma isSelected = True).

- **Plain** row: a `surface-secondary` background.
- **Card** row: `border-light` becomes `border-dark`; nothing else changes.
- **Only tappable rows** can be selected (development warning otherwise). In a `label` row, the `Radio` / `Checkbox`
  carries the state for screen readers.
- One surface cue plus the control's mark — never stack cues, never colour alone, never a font-weight change.

## 5. Content

- **Label:** one line, short; it truncates with "…".
- **Description:** one line ending in "…" by default. `multiline` (Figma isMultiline) lets it wrap onto as many lines
  as it needs — for a setting explained in a sentence. The label still stays on one line.
- **Right side:** `iconRight` for a chevron; `trailing` for anything else — `Switch`, `Checkbox`, `Radio`, `Tag`, a
  value, a price + `PriceChange`. `trailing` comes before `iconRight` when both are set.
- **Left side:** `iconLeft` — an icon, a logo or an avatar; the slot sizes it (24 / 16).
- **Dots:** `dotLeft` / `dotRight` put an unread or new dot on the icon. It's only visual, so `dotLabel` says what
  screen readers hear (default "New").
- In a settings screen, destructive actions go last, as `tertiary` buttons.

## 6. Lists

- A list under a heading: `SectionHeader`, then the rows 16 below it.
- Sections are separated by space, not lines. A divider goes only between rows of the same list.
- Loading: `SkeletonListRow` in the same layout. Empty: `EmptyState` with a way forward.

## 7. Anatomy (Figma properties → props)

| Figma | Prop | Notes |
|---|---|---|
| isPlain = True · False | `variant` `'plain' \| 'card'` | |
| isSmall | `size` `'md' \| 'sm'` | |
| isTappable | `onClick` · `href` · `as="label"` | `as="button"` / `"a"` / `"label"` / `"div"` can be set directly |
| isSelected | `selected` | tappable rows only |
| isMultiline | `multiline` | the variant is being added to the Figma library |
| ✏️ Label · ✏️ Description (👁️ Description) | `label` · `description` | |
| Icon-l (👁️ Icon - L) | `iconLeft` | |
| icon-r (👁️ Icon - R) | `iconRight` (chevron) or `trailing` (switch, tag, value) | |
| 👁️ Dot-L · 👁️ Dot-R | `dotLeft` · `dotRight` + `dotLabel` | |

---

## Code

```tsx
// Navigation: the whole row is tappable, the chevron shows where it leads
<ListCell label="Holdings" description="12 stocks" iconRight={<Icon icon={msChevronRight} />} onClick={openHoldings} />

// Setting: tap anywhere on the row to toggle; the description wraps
<ListCell
  as="label"
  label="Price alerts"
  description="Get notified when a stock in your watchlist moves more than 5% in a day"
  multiline
  trailing={<Switch defaultChecked />}
/>

// Single select in a sheet: Radio rows, the chosen one selected
{sorts.map((s) => (
  <ListCell key={s.value} as="label" label={s.label} selected={sort === s.value}
    trailing={<Radio name="sort" checked={sort === s.value} onChange={() => setSort(s.value)} />} />
))}

// A list of choices as card rows (inside a 16 margin): the chosen account gets border-dark
<ListCell variant="card" label="HDFC Bank ••4821" description="Primary" iconLeft={bankLogo}
  onClick={() => setAccount('hdfc')} selected={account === 'hdfc'} iconRight={<Icon icon={msChevronRight} />} />

// Facts in a review sheet: static rows, the value on the right
<ListCell label="Quantity" trailing="10" />

// Unread dot on the icon, with a name for screen readers
<ListCell label="Inbox" iconLeft={<Icon icon={msMail} />} dotLeft dotLabel="New messages"
  iconRight={<Icon icon={msChevronRight} />} onClick={openInbox} />
```

---

## Open questions

<!-- PENDING: how a divider between rows of the same list is drawn — ListCell has no divider option -->
<!-- PENDING: when to use the small (sm) row instead of the default -->
<!-- PENDING: grouping and section headers in long lists (DESIGN_SYSTEM §7.3 list patterns) -->
