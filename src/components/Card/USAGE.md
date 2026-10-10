# Card — usage rules

`import { Card } from './components/Card'` · Figma: "L3: Card" (5364:38) · Docs: `#/card`

A surface that groups related content. A **clickable** card is one tap target; a **static** card just shows
information.

---

## 1. When to use it

- One thing people can open: an order, a position, a strategy, a plan → **clickable** card.
- Information that belongs together: a summary, a note → **static** card.
- Grouped details on a white screen: contract info, key stats, market depth, margin and charges → **filled** card.
- Options in a list of choices (a contract, a plan, an account) → clickable cards with `selected` on the chosen one.

Don't use it for:
- Rows of a list (settings, holdings, facts in a review sheet) → `ListCell` (it follows these same rules).
- A whole section or a big block → `surface-default` + `border-light`, never a grey panel (see 6).
- A status message → `Aerobar`.

## 2. Which card

| Card | Figma | Code | Looks | Use for |
|---|---|---|---|---|
| Clickable | Type=Clickable | `onClick` or `href` | `surface-primary` + `border-light` + `elevation-low`, scales to 0.98 while pressed | the whole card opens or selects something |
| Static | Type=Static | neither | `surface-default` + `border-light`, no shadow, no press | information or decoration |
| Flat | Type=Flat | `variant="flat"` | not rounded, no border, no shadow, **no fill** (unless `surface` is set) | edge-to-edge content; can still be clickable |
| Filled | Type=Filled | `variant="filled"` | grey inset panel: `surface-secondary`, rounded, no border, no shadow | grouped details on a white screen |

- In light mode `surface-default` and `surface-primary` are both white, so the border (and the shadow on clickable
  cards) is what separates a card from the screen. Don't remove it.
- **Lifted means tappable:** only clickable cards get a shadow. Information stays flat with a border.

## 3. One action = a clickable card

- **A card with a single action is a clickable card:** the whole card is the tap target instead of a button inside it.
  Don't put one button in a static card.
- **A clickable card never has buttons or links in its content** — it is one tap target. (Development warnings flag
  both: a single button in a static card, and any control in a clickable card's content.)
- **Action footer** — the one exception: quick actions on the card's subject (☆ save · Learn more · Apply) go in
  `footer`, at the bottom of the card. The rest of the card stays the tap target; pressing a footer button never
  presses the card.
  - **No fill** by default: the buttons sit 12 from the card edge, under the content.
  - At most **3 actions**, at most **1 primary**. A single footer button is **tertiary**.
  - `footerFilled` turns the footer into a full-width grey strip (`surface-secondary`, 12 padding) — **only** when the
    footer is meant to stand out (see 6).

## 4. Padding & placement

- **Cards always sit inside a margin** — never touching their container's edges: 16 from the screen edge, 16 between
  cards in a list, 16 from a section heading to its card. The margin comes from the parent (padding or gap); a card has
  no outer margin of its own.
- **Padding 12** by default (Figma isPadded = True), radius 12, rows inside 8 apart.
- `padding="none"` (Figma isPadded = False) is **only** for a clickable, static or flat card whose content brings its
  own padding — sections stacked inside it, e.g. a 12-padded body and an action footer. Either way **the content always
  sits 12 from the card edge**.
- Filled cards are always padded (TypeScript enforces it). A flat card runs edge to edge in its container.

## 5. Selected cards

When cards are a list of choices, the chosen one is `selected` (Figma isSelected = True). Selection is **subtle** —
picking an option among others.

- **Bordered** clickable card: `border-light` becomes `border-dark`. Nothing else changes — same surface, shadow,
  radius, padding.
- **Flat** clickable card: it has no border, so selection is a `surface-secondary` background (unselected it has no
  fill).
- **Only clickable cards** can be selected — never static or filled ones (development warning).
- Don't show selection with a tint, a coloured border or a tick alone, and don't change the font weight. It's
  announced for you (`aria-pressed` on a button card, `aria-current` on a link card).

## 6. Grey inside and around cards

- Grey (`surface-secondary` / `surface-tertiary`) is for **small** elements inside a card: tags, chips, small
  highlight or detail boxes.
- A **large** grey area — a whole section, a full-width strip, a big panel — only when it's intentional and
  high-emphasis. The filled card is that case: a deliberate grey panel for grouped details.
- **No grey in grey:** inside a filled card, anything that needs its own fill uses `surface-tertiary`
  (and `Skeleton onGrey`). A grey card goes on `surface-default`, not on another grey surface.

## 7. Anatomy (Figma properties → props)

| Figma | Prop | Notes |
|---|---|---|
| Type = Clickable · Static · Flat · Filled | `onClick` / `href` · neither · `variant="flat"` · `variant="filled"` | flat can also be clickable |
| isPadded = True · False | `padding` `'default' \| 'none'` | not on filled cards |
| isSelected | `selected` | clickable cards only |
| content (slot) | `children` | in a clickable card: text and spans only — no controls |
| action buttons at the bottom (no fill) | `footer` | ≤ 3, ≤ 1 primary, a lone button is tertiary |
| …as a grey strip | `footer` + `footerFilled` | intentional emphasis only |
| (manual background) | `surface` `'default' \| 'primary' \| 'secondary' \| 'tertiary' \| 'inverted'` | |
| — | `as` `'div' \| 'article' \| 'section' \| 'li'` | element for a static card |
| — | `aria-label` | names a clickable card when its text alone isn't a good name |

---

## Code

```tsx
// Clickable: the whole card opens the order — no buttons inside
<Card onClick={openOrder}>
  <span className={styles.row}>
    <span className={styles.meta}>Delivery • Boost (5x)</span>
    <Tag variant="secondary" color="profit" size="md">Buy</Tag>
  </span>
  <span className={styles.title}>NHPC</span>
</Card>

// Static: information only
<Card as="section">…</Card>

// Filled: grouped details on a white screen
<Card variant="filled">…key stats…</Card>

// A list of choices: the chosen plan is selected (border-dark)
{plans.map((plan) => (
  <Card key={plan.id} onClick={() => setPlan(plan.id)} selected={plan.id === selectedPlan}>…</Card>
))}

// Action footer (no fill): the body still opens the card; a lone footer button is tertiary
<Card onClick={openSignal} footer={<Button variant="tertiary" size="sm" onClick={setAlert}>Set alert</Button>}>…</Card>

// Grey footer strip — only when the footer should stand out
<Card
  onClick={openStrategy}
  footerFilled
  footer={
    <>
      <Button variant="secondary" size="sm" aria-label="Save" iconLeft={<Icon icon={msStar} />} />
      <Button variant="secondary" size="sm">Learn in 30 secs</Button>
      <Button size="sm">Apply</Button>
    </>
  }
>…</Card>

// No padding: the sections inside bring their own 12
<Card onClick={openContract} padding="none">
  <div className={styles.body}>…</div>
  <div className={styles.strip}>Expires in 41 days</div>
</Card>
```

---

## Open questions

<!-- PENDING: confirm whether flat cards carry a border-light (e.g. as a divider) — currently: no border -->
<!-- PENDING: which press-scale step (xl · l · default · m · sm) each card / text size uses — everything uses default today -->
<!-- PENDING: a footer button that repeats the card's own tap (e.g. "View details" on a clickable card) — allowed, or should the card's tap be the only way? -->
<!-- PENDING: "one primary per screen" vs a primary footer button on every card in a list -->
