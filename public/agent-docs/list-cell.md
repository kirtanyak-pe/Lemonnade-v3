# List cell

> A row in a list: an icon, a label with an optional description, and something on the right — a chevron, a switch, a tag or a value.

- Group: Data display
- Lifecycle: done
- Status: Figma synced
- Version: 1.6.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=4543-65400
- Source: `src/components/ListCell`
- Also called: List item, row, cell, settings row, menu item

## Import

```tsx
import { ListCell } from './components/ListCell' // path relative to src/
```

## Usage rules (USAGE.md)

`import { ListCell } from './components/ListCell'` · Figma: "L3: list cell" (4543:65400) · Docs: `#/list-cell`

A row in a list: an icon, a label with an optional description, and something on the right — a chevron, a switch, a
tag or a value. **A list cell is a card with specific content, so it follows the Card rules** (`Card/USAGE.md`).

---

### 1. When to use it

- Lists of things: holdings, watchlist (symbol · Sparkline · price + `PriceChange`), search results, history grouped
  by date.
- Settings and menus: navigation rows with a chevron, toggles with a `Switch`.
- Choices: the options in a select sheet (single select → `Radio` rows; multi-select → `Checkbox` rows).
- Facts in a review sheet: *Quantity 10*, *Price ₹2,948.60*, *Charges ₹23.10* (see `BottomSheet/USAGE.md` §7).

Don't use it for:
- One block of grouped content → `Card`.
- 2–4 options that should all be visible at once → pill `Tabs`.
- A status message → `Aerobar`.

### 2. Plain or card

| Row | Figma | Code | Looks |
|---|---|---|---|
| Plain | isPlain = True | `variant="plain"` (default) | a flat card: **no fill** (takes the colour of what it sits on), runs edge to edge |
| Card, not tappable | isPlain = False, isTappable = False | `variant="card"` | a static card: **no fill** + `border-light`, no shadow, radius 12 |
| Card, tappable | isPlain = False, isTappable = True | `variant="card"` + `onClick` / `href` / `as="label"` | a clickable card: `surface-primary` + `border-light` + `elevation-low`, scales to 0.98 while pressed |

- Card rows always sit inside a margin (16 from the screen edge, like any card). Plain rows run edge to edge in their
  container and keep their own 16 side padding.
- Sizes: `md` (default — min 48, 24px icons) and `sm` (Figma isSmall — min 32, 16px icons).
- **Density** (default-size rows): `compact` (default — 8 above and below a plain row, 58px with a description) or
  `breathable` (16 above and below, 74px). **Asset lists** — logo, name + company, price + `PriceChange` — use
  breathable; settings, menus and options stay compact. Small rows are always compact.

### 3. Tappable rows

- A tappable row is one tap target: `onClick` (a button) or `href` (a link) makes the **whole row** tappable, with a
  pressed tint.
- **Show where a row leads:** a tappable row gets a chevron (`iconRight`) or a control on the right. Never a tappable
  row with nothing to hint at it.
- **A row with a `Switch`, `Checkbox` or `Radio`** is `as="label"`, with the control in `trailing`: tapping anywhere on
  the row toggles it. Don't make that row a button or a link — a button can't contain another control (development
  warning).
- **Which control:** a `Switch` is a setting that applies immediately (not inside a form that needs Save); `Checkbox`
  rows for picking several; `Radio` rows (in a select sheet) for picking one.

### 4. Selected rows

When rows are a list of choices, the chosen one is `selected` (Figma isSelected = True).

- **Plain** row: a `surface-secondary` background.
- **Card** row: `border-light` becomes `border-dark`; nothing else changes.
- **Only tappable rows** can be selected (development warning otherwise). In a `label` row, the `Radio` / `Checkbox`
  carries the state for screen readers.
- One surface cue plus the control's mark — never stack cues, never colour alone, never a font-weight change.

### 5. Content

- **Label:** one line, short; it truncates with "…".
- **Description:** one line ending in "…" by default. `multiline` (Figma isMultiline) lets it wrap onto as many lines
  as it needs — for a setting explained in a sentence. The label still stays on one line.
- **Right side:** `iconRight` for a chevron; `trailing` for anything else — `Switch`, `Checkbox`, `Radio`, `Tag`, a
  value, a price + `PriceChange`. `trailing` comes before `iconRight` when both are set.
- **Left side:** `iconLeft` — an icon, a logo or an avatar; the slot sizes it (24 / 16).
- **Dots:** `dotLeft` / `dotRight` put an unread or new dot on the icon. It's only visual, so `dotLabel` says what
  screen readers hear (default "New").
- In a settings screen, destructive actions go last, as `tertiary` buttons.

### 6. Lists

- A list under a heading: `SectionHeader`, then the rows 16 below it.
- Sections are separated by space, not lines. A divider goes only between rows of the same list.
- Loading: `SkeletonListRow` in the same layout. Empty: `EmptyState` with a way forward.

### 7. Anatomy (Figma properties → props)

| Figma | Prop | Notes |
|---|---|---|
| isPlain = True · False | `variant` `'plain' \| 'card'` | |
| isSmall | `size` `'md' \| 'sm'` | |
| (density — Figma property to come) | `density` `'compact' \| 'breathable'` | default-size rows; asset lists are breathable |
| isTappable | `onClick` · `href` · `as="label"` | `as="button"` / `"a"` / `"label"` / `"div"` can be set directly |
| isSelected | `selected` | tappable rows only |
| isMultiline | `multiline` | the variant is being added to the Figma library |
| ✏️ Label · ✏️ Description (👁️ Description) | `label` · `description` | |
| Icon-l (👁️ Icon - L) | `iconLeft` | |
| icon-r (👁️ Icon - R) | `iconRight` (chevron) or `trailing` (switch, tag, value) | |
| 👁️ Dot-L · 👁️ Dot-R | `dotLeft` · `dotRight` + `dotLabel` | |

---

### Code

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

// Asset list: breathable rows (16 above and below) — logo, name + company, price + change
<ListCell density="breathable" label="Tata Motors" description="Tata Motors Ltd" iconLeft={tataLogo}
  trailing={<span className={styles.price}>₹418.20 <PriceChange value={0.22} unit="percent" size="sm" /></span>}
  onClick={openTataMotors} />

// Facts in a review sheet: static rows, the value on the right
<ListCell label="Quantity" trailing="10" />

// Unread dot on the icon, with a name for screen readers
<ListCell label="Inbox" iconLeft={<Icon icon={msMail} />} dotLeft dotLabel="New messages"
  iconRight={<Icon icon={msChevronRight} />} onClick={openInbox} />
```

---

### Open questions

<!-- PENDING: how a divider between rows of the same list is drawn — ListCell has no divider option -->
<!-- PENDING: when to use the small (sm) row instead of the default -->
<!-- PENDING: grouping and section headers in long lists (DESIGN_SYSTEM §7.3 list patterns) -->

## Overview

### Plain or card

A list cell is a card with more specific content — dropdown options, settings, lists — so it follows the **Card rules**. Plain rows are flat cards: no fill, they take the colour of whatever they sit on, and they run edge to edge. Card rows (Figma isPlain=False) are rounded with border-light and always sit inside a margin (16 from the screen edge):

- **Not tappable** (a static card): no fill — it takes the colour it sits on — and border-light, no shadow.
- **Tappable** (a clickable card, Figma isTappable): surface-primary, border-light and elevation-low, and it scales to 0.98 while pressed.

Both come in default (48) and small (32).

### Compact or breathable

Default-size rows come in two densities. **Compact** (8 above and below, 58px with a description) is the default — settings, menus, options. **Breathable** (16 above and below, 74px) is for **asset lists**: a logo, the name and company, the price and its change. Small rows are always compact.

### Selected rows

When rows are a list of choices, the chosen one is selected. A plain row gets a surface-secondary background; a card row swaps border-light for the darker border-dark and nothing else changes. Only tappable rows can be selected.

`selected` on a tappable row (`onClick`, `href` or `as="label"`). Announced as pressed (button) or current (link); in a label row the Radio or Checkbox carries the state.

### Tappable rows

A whole row can be tappable, with a pressed tint — show a chevron or a control on the right so people know. A row with a Switch or Checkbox toggles it when tapped anywhere — try “Biometric login”.

Use `as="button"` or `href` to make the whole row tappable with a pressed tint. Use `as="label"` with a Switch or Checkbox in `trailing` so tapping anywhere on the row toggles it — try “Biometric login”.

## Do / Don't

### Show where a row leads

- ✅ **Do:** Tappable rows get a chevron (or trailing control).
- ❌ **Don't:** Make rows tappable with nothing to hint at it.

## Options (tree)

List cell — Rows of settings, accounts, items

- **Variant**
  - `plain` — Full width, edge to edge.
  - `card` — A one-line row as a card.
- **Size**
  - `md`
  - `sm`
- **Tap behaviour** — as=
  - `button / a` — Whole row taps; show a chevron.
  - `label` — With a Switch or Checkbox in trailing.
  - `dotRight` — Unread marker with screen-reader text.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label / description` | `ReactNode` |  | Figma "Label goes here" / "Type description". |
| `multiline` | `boolean` | `false` | Figma isMultiline: the description wraps onto as many lines as it needs instead of ending in "…". The label stays on one line. |
| `size` | `'md' \| 'sm'` | `'md'` | Figma isSmall: 48 / 32 min height, 24 / 16 icons. |
| `density` | `'compact' \| 'breathable'` | `'compact'` | Default-size rows: compact (8 above and below, 58px rows) or breathable (16, 74px rows) — breathable for asset lists. |
| `variant` | `'plain' \| 'card'` | `'plain'` | Figma isPlain: flat row (no fill, edge to edge), or bordered rounded card (inside a margin). Card rows follow Card: static = no fill + border-light; tappable = surface-primary + elevation-low. |
| `selected` | `boolean` | `false` | Figma isSelected: the chosen row in a list of choices — plain → surface-secondary, card → border-dark. Tappable rows only. |
| `iconLeft / iconRight` | `ReactNode` |  | Figma Icon-L / Icon-R slots, sized for you. |
| `trailing` | `ReactNode` |  | Anything else on the right: Switch, Checkbox, Tag, value text. |
| `dotLeft / dotRight` | `boolean` | `false` | Figma Dot-L / Dot-R: unread dot on the icon. |
| `dotLabel` | `string` | `'New'` | What screen readers hear for the dot (it is otherwise only visual). |
| `as / href / onClick` | `'div' \| 'button' \| 'a' \| 'label'` |  | Makes the row tappable (button / a) or a label for a trailing control. |

## Tokens used

- `surface/primary (tappable card)`
- `surface/secondary (plain selected)`
- `border/light`
- `border/dark (card selected)`
- `shadow/elevation-low (tappable card)`
- `motion/scale/press-default`
- `content/primary · secondary`
- `content/accent/discover (dot)`
- `Label/14 · 16`
- `Description/12`
- `radius/12 · full`
- `icon-size/16 · 24`
- `state-layer/* (tappable rows)`

## Recent changes

- **1.6.0** (2026-10-10) Compact or breathable: Two densities for default-size rows: compact (8 above and below — the default, 58px rows) and breathable (16 — 74px rows) for asset lists: logo, name and company, price and change. The matching property for L3: list cell is still to come in the library. density="compact" | "breathable" (default compact; small rows are always compact).
- **1.5.0** (2026-10-09) Multi-line description: isMultiline: the description can wrap onto several lines instead of ending in "…" on one line. The label stays on one line. L3: list cell gets isMultiline = False · True (pending — added in the library next). multiline prop.
- **1.4.0** (2026-10-09) Follows the Card rules: A list cell is a card with specific content, so it follows Card: a card row that isn't tappable has no fill (it takes the colour it sits on) and border-light; a tappable card row is surface-primary + border-light + elevation-low and scales to 0.98 when pressed. L3: list cell gets isTappable = True · False (selected only when tappable). Tappable = onClick, href or as="label" — no new prop.
