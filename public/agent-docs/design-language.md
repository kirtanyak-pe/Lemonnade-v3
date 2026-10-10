# L3 design language — how a Lemonnade screen looks, reads and behaves

The components say **what** to use; this says **how a great fintech screen comes together**. Every rule below is
concrete enough to check, and the ones marked **[scored]** are checked automatically by `npm run screen -- score`
(see docs/PLAYBOOK.md §7). A generated screen ships only at **score ≥ 85** with no blocking issue.

---

## 1. Principles (in priority order — when two collide, the higher one wins)

1. **Trust before delight.** Money screens must feel calm and exact: steady layout, real numbers, charges and risks
   shown *before* the action, nothing that moves while you read it.
2. **Numbers first.** The amount, price or P&L is the hero of the screen. Labels support it; decoration never
   competes with it.
3. **One job per screen.** One primary action, docked at the bottom in thumb reach **[scored]**. Secondary paths
   live in the Actionbar, a Select, or a sheet.
4. **Honest colour.** Green / red mean *up / down* (indicator) or *success / error* (status) — nothing else
   **[scored]**. The brand lime is for brand moments and Lemonn's Buy, never for decoration.
5. **Show less, reveal more.** Summary on the screen; detail one tap away (sheet, row, card). Never a wall of numbers.
6. **Fast on a phone.** 360 px first, thumb zone for actions, skeletons instead of spinners, no layout jump when data
   arrives.
7. **Accessible by default.** Names on every control, colour never alone, 48 × 48 touch areas, reduced motion respected.

---

## 2. Layout and rhythm (360 × 800 base, check 392 and 412)

| Thing | Value | Token |
|---|---|---|
| Page padding, left and right | 16 | `spacing/16` |
| Gap between sections (default) | 24 | `spacing/24` |
| Gap between sections (large — a new topic, or after a hero block) | 32 | `spacing/32` |
| Section heading → its card / list | 16 | `spacing/16` |
| Card padding / radius | 12 / 12 | `spacing/12` · `radius/12` |
| List row height (ListCell md) | 58 | — (component) |
| Top | Statusbar 32 + Actionbar | `SystemStatusbar` (mockups) · `Actionbar` |
| Bottom | ButtonGroup dock **or** BottomNavbar — never both on one screen **[scored]** | |

- **Above the fold (≈ 600 px of content on 360 × 800)** must hold the screen's main number and its main action
  **[scored: estimated]**.
- Sections are separated by **space**, not lines. A divider only between rows of the same list.
- Containers: big blocks are white with a light border; **only small info panels are grey** (`Card variant="filled"`).
  Never a whole grey section.

---

## 3. Numbers (the heart of a fintech screen)

| Rule | Example |
|---|---|
| Indian digit grouping | ₹1,42,557.00 — never ₹142,557.00 |
| Rupee symbol, no space | ₹1,240.50 · −₹252.89 |
| Prices and money: 2 decimals | ₹1,57,500.00 |
| Percent: 2 decimals, sign always | +0.68% · −1.24% · 0.00% |
| Quantities, lots: no decimals | 100 · 91 Lots |
| Tight spaces: lakh / crore short form | ₹12.4L · ₹3.2Cr |
| Minus is the real minus (U+2212) | −0.68% (the component does it) |
| Tabular figures in columns | `font-variant-numeric: tabular-nums` (components do it) |
| A change is ALWAYS `PriceChange` | sign, colour and arrow come from the value **[scored]** |

**Number hierarchy:** label (Description/12, secondary) above → value (Heading/24–28 for the hero, Label/14 in rows)
→ change next to or under it (PriceChange md/lg with arrow for the hero, sm in rows).

---

## 4. Colour meaning

| Meaning | Tokens | Never for |
|---|---|---|
| Up / down (prices, P&L, buy-sell side) | `*/accent/indicator/up-*` · `down-*` | outcomes, decoration |
| Success / error (an action's result) | `*/accent/success-*` · `error-*` | price moves |
| Warning (near a limit, risk) | `*/accent/warning-*` | decoration |
| Information, links, "new" | `*/accent/discover-*` | errors |
| Brand | `surface/accent/brand-*` | data, status |
| Everything else | neutrals: `content/primary · secondary`, `surface/default · secondary`, `border/light` | — |

A screen uses **at most two accent meanings besides up/down** **[scored]**. If everything is coloured, nothing is.

---

## 5. Interaction

- **Money actions are two-step:** the screen collects, a **review sheet** confirms (amount, charges, margin, risk),
  then a result toast. Never place an order from a single tap on a list **[scored for order archetypes]**.
- **Reversible beats confirm:** for non-money actions, act immediately and offer Undo in the Aerobar.
- **Disabled needs a reason:** a disabled primary button has helper text saying what's missing.
- **Loading:** Skeleton in the real layout for content; `Button loading` for actions; never a full-screen spinner.
- **Errors:** inline at the field (TextField status="error" + what to do), or an inline Aerobar for the screen.
- **Choices:** Select → sheet with Radio rows; 2–4 options visible at once → pill Tabs.
- **Motion:** 150–250 ms, standard easing, nothing bouncy; respect reduced motion.

---

## 6. Copy

- Sentence case everywhere ("Place order", not "Place Order") **[scored]**.
- Buttons are verbs that say the result: *Place order*, *Add money*, *Apply* — not *OK*, *Submit*, *Click here* **[scored]**.
- Say the number and the unit: "₹1,240 needed", not "Insufficient funds".
- Errors say what happened and what to do: "Price is outside today's range (₹1,52,000 – ₹1,62,000)".
- Trader terms are fine on trader screens (LTP, MTM, lots); explain once on first use elsewhere.

---

## 7. Trust and safety

- Charges, margin and the final amount appear **before** the confirm button.
- Risky choices are never pre-selected (leverage, MTF, auto-square-off).
- Market status (open / closed / pre-open) is visible wherever an order can be placed.
- Risk disclosures use an inline warning Aerobar, not small grey print.

---

## 8. Screen archetypes (anatomy → components)

Each archetype is a starting layout in `docs/patterns/archetypes.json`; `npm run screen -- new <archetype>` writes a
spec you edit. Top to bottom:

| Archetype | Anatomy |
|---|---|
| **home** (dashboard) | Actionbar (brand, 1–2 actions) · summary card (Select + hero value + PriceChange) · quick actions (pill Tabs or cards) · 1–2 short lists ("Top movers") · BottomNavbar |
| **list** (watchlist, holdings) | Actionbar (title, search) + Tabs in its bottom slot · ListCell rows (symbol · Sparkline · price + PriceChange) · loading: SkeletonListRow × 8 · empty: EmptyState · BottomNavbar |
| **detail** (asset page) | Actionbar (back, Select asset switcher) · LTP Heading/24 + PriceChange md arrow · Chart + range Tabs · key stats Card filled · ProgressBar range (24H) · ButtonGroup (Buy / Sell) |
| **order** (order pad) | Actionbar (asset + PriceChange) + Delivery/Intraday Tabs · order-type pill Tabs · Quantity row (Select ↕ + Stepper) · Price TextField · margin/charges Card filled · ButtonGroup (one Buy or Sell, lg) |
| **review** (confirm sheet) | BottomSheet: header (question) · ListCell rows of facts · charges total · warning Aerobar if risky · ButtonGroup horizontal (secondary Cancel + strong confirm) |
| **result** | Aerobar floating success / danger on the previous screen, or a full result for big moments: EmptyState-style illustration + heading + next action |
| **portfolio** (positions) | Actionbar + Tabs · summary Card (Total P&L Select ↕ Day P&L, value, PriceChange lg) · ProgressBar (margin used, warning > 80%) · position Cards (clickable) |
| **history** (orders, reports) | Actionbar + filter row (Select chevron: period, status) · grouped ListCell rows by date · DatePicker range in a sheet · empty + loading states |
| **form** (add money, KYC step) | Actionbar (back, step) · ProgressBar (steps) · TextFields · helper / error texts · ButtonGroup (primary, disabled with a reason) |
| **settings** (profile) | Actionbar · ListCell groups (as="label" + Switch for toggles, chevrons for navigation) · destructive actions last, tertiary |
| **search** | Actionbar search mode · recent + results as ListCell · SkeletonListRow while loading · EmptyState with Clear |

---

## 9. The quality bar (what `screen score` checks)

**Blocking** (score capped at 60): more than one strong button · a change not using PriceChange · raw colour / px in
generated CSS · a dock and a BottomNavbar together · an order without a review step.

**Weighted checks** (100 points): primary action docked (15) · hero number + label above the fold (10) · list has
loading + empty states (10) · form has error states + disabled reasons (8) · sentence-case copy (6) · verb buttons
(6) · ≤ 2 Actionbar actions (5) · ≤ 2 accent meanings besides up/down (6) · numbers formatted (8) · section rhythm
from tokens (6) · names on icon-only actions (5) · ≤ 8 blocks above the fold (5) · trust info before money actions (10).

**Then a human look** (2 minutes): squint test (the hero number wins), thumb test (main action reachable one-handed),
dark mode, 412 px, and "would I trust this with my money?"
