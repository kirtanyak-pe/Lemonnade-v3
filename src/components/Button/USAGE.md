# Button — usage rules

`import { Button } from './components/Button'` · Figma: "L3: Button" (4471:29225) · Docs: `#/button`

A button starts an action. If it only navigates to another screen or section, it is still a Button when it
looks like one; text links inside content use a text action instead (see *Not a button*).

---

## 1. Choose the variant

| Variant | Use for | Limit |
|---|---|---|
| `primary` *(default)* | The main action of a screen, sheet or step: *Place order*, *Continue*, *Save*. | **One per screen** (one per sheet when a sheet is open). |
| `secondary` | The alternative action **next to a stronger button** (`primary`, `buy`, `sell` or `brand`): *Cancel*, *Modify*, *Edit order*. Its darker border only makes sense beside that stronger button. Mostly used in a **button dock / `ButtonGroup`, typically inside a bottom sheet**. | **Only alongside a stronger button.** Never on its own on the page or inside a card. |
| `tertiary` | Low-emphasis actions that sit **on the page or inside content**: *View all* at the end of a list, *Add another*, *Load more*, *Sort*. | Use this (not `secondary`) when the action stands alone. |
| `ghost` | Text-style actions with no container, inside other components: the Aerobar action, *Clear* next to search, inline *Edit*. | Not as a screen's main action. |
| `brand` | Brand moments: onboarding, promotions, first-run CTAs. Follows the product color (Lemonn lime, CS PRO gold, Kuber green). | Not for everyday actions, not next to `buy`/`sell`. |
| `buy` / `sell` | **Only** to place or confirm a trade. Colors follow the product theme: `buy` uses the product's buy color (Lemonn lime, CS PRO market green, Kuber green), `sell` is red. | Never for unrelated actions (don't use `sell` as a "danger" button). |

**Rule of thumb: every action is `primary` (or `secondary`/`tertiary`/`ghost` around it), except buying or selling, which use `buy` / `sell`.** In Lemonn and Kuber `buy` and `brand` share the product color on purpose — they never appear on the same screen, so it isn't ambiguous.

Pairs that work: `secondary` + `primary`, `sell` + `buy`, `secondary` + `buy` (e.g. *Modify* + *Buy*), `secondary` + `brand`.
Pairs to avoid: two `primary`, `primary` + `buy`, `brand` + `primary`, a `secondary` on its own.

**Example — a list with a "View all" at the end:** the button is `tertiary`, not `secondary`, because it stands alone on the page.

## 2. Choose the size

| Size | Height (code) | Use in |
|---|---|---|
| `lg` *(default)* | 48 (`size/control-lg`) | Bottom docks and `ButtonGroup` — **always `lg` there, never `md` or `sm`** (`ButtonGroup` warns in development). Also the main CTA of a screen or sheet. |
| `md` | 40 (`size/control-md`) | Actions inside content: cards, sheet bodies, form sections. |
| `sm` | 32 (`size/control-sm`) | Compact spots: empty-state action, inline row actions, toolbars, Actionbar actions (via `ActionbarAction`). |

- Buttons that sit side by side use the **same size**.
- Every size keeps a tap area of at least 32px (code).

## 3. Width & placement

- In a bottom dock with one action, use `fullWidth`. With two, use `ButtonGroup` (it sizes them for you). Dock buttons are always `lg`.
- `ButtonGroup` order: **horizontal → primary on the right**, **vertical → primary on top**. Keep the same order on every screen.
- Inside content, buttons hug their label (no `fullWidth`) and align to the start, unless they are the only element in a centred block (e.g. `EmptyState`).
- Don't put more than 2 buttons in a row on a 360px screen; move extra actions to a sheet or menu.

## 4. Label

- **Verb first, specific, sentence case:** *Place order*, *Add funds*, *Cancel order* — not *Submit*, *OK*, *Yes*.
- 1–3 words; no ending punctuation; no ALL CAPS.
- Labels must fit on one line at 360px in the chosen size. If it doesn't fit, shorten the label, don't shrink the text.
- Say the same action the same way everywhere (*Add to watchlist*, not *Save* on one screen and *Add* on another).

## 5. Label & icons: what can be shown

A button has three parts that can each be shown or hidden (Figma 👁️ Label · 👁️ Icon-L · 👁️ Icon-R):

| Label | Icon left | Icon right | Allowed? |
|---|---|---|---|
| ✓ | – | – | ✅ label only |
| ✓ | ✓ | – | ✅ |
| ✓ | – | ✓ | ✅ |
| ✓ | ✓ | ✓ | ✅ label with an icon on both sides |
| – | ✓ | – | ✅ icon-only (needs `aria-label`) |
| – | – | ✓ | ✅ icon-only (needs `aria-label`) |
| – | ✓ | ✓ | ❌ **never two icons without a label** |
| – | – | – | ❌ **at least one part must be visible** |

The component enforces this: TypeScript rejects the two ❌ rows, and at runtime an icon-only button with two icons
shows only the left one (with a development warning).

## 6. Icons

- `iconLeft` reinforces the action (*+ Add*, *filter*); `iconRight` shows direction (*Continue →*).
- Use Material Symbols from `icons/material` (`<Icon icon={msAdd} />`); the button sizes the icon for you (24 / 20 / 16 by size — code).
- **Icon-only** buttons must have `aria-label`. In the top bar, use `ActionbarAction` instead of a bare Button.

## 7. States

- `loading` while the action is running (submitting an order, saving). It keeps the width and ignores taps, so it also prevents double submits (code). Don't change the label while loading.
- `disabled` only when the action isn't possible **and** the reason is visible nearby (e.g. an invalid field with its error message). Don't disable to hide a feature.
- After the action: show the result with an `Aerobar` (toast) or move to the next screen — don't leave the button as the only feedback.

## 8. Accessibility

- Buttons default to `type="button"` (code); use `type="submit"` for a form's main button.
- The label is the accessible name; with no label, `aria-label` is required.
- Don't put interactive elements inside a button.

## 9. Not a button

- **Tapping a whole card** → a clickable `Card`, not a Card with a single Button in it.
- **Inline text action** like *Filters* or *View details* in a toolbar → text in `content/accent/discover` (a real `<button>` or link underneath), not a Button.
- **Tabs / segmented choices** → `Tabs` (pill for chips).
- **Status labels** → `Tag` (tags are never tappable). Price moves use `profit` / `loss`, outcomes `success` / `error`.

---

## Code

```tsx
// Screen CTA in a dock
<ButtonGroup direction="horizontal" aria-label="Order actions">
  <Button variant="secondary">Modify</Button>
  <Button variant="buy">Buy</Button>
</ButtonGroup>

// Single full-width CTA
<Button fullWidth loading={saving} onClick={save}>Save changes</Button>

// Sheet dock: secondary only next to the stronger action, both Large
<ButtonGroup direction="horizontal" aria-label="Confirm">
  <Button variant="secondary">Cancel</Button>
  <Button>Confirm</Button>
</ButtonGroup>

// "View all" at the end of a list: tertiary (it stands alone)
<Button size="md" variant="tertiary" iconRight={<Icon icon={msArrowForward} />}>View all</Button>

// Inside content
<Button size="md" variant="tertiary" iconLeft={<Icon icon={msAdd} />}>Add another</Button>

// Empty state action
<Button size="sm" iconLeft={<Icon icon={msDeleteForever} size={12} />} onClick={clear}>Clear</Button>

// Icon-only (outside the Actionbar): exactly one icon + aria-label; tertiary because it stands alone
<Button size="sm" variant="tertiary" aria-label="Share" iconLeft={<Icon icon={msShare} />} />
```

---

## Open questions

<!-- PENDING: destructive actions that aren't trades (Delete list, Remove card) — no danger variant exists. Use tertiary + a confirmation sheet? -->
<!-- PENDING: is "Cancel order" a trade action (sell style) or a destructive action? -->
<!-- PENDING: difference in intent between tertiary and ghost beyond "container or not" -->
<!-- PENDING: brand vs primary — which screens count as "brand moments"? -->
