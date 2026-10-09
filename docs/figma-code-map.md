# Figma → code map

How each component in the Figma library "✅ Lemonnade V3" (`lxQ6QIXGOv5mmx0khh5sJn`) maps to the React components in
`src/components`. Use it to turn a Figma design into code: read the instance's component and properties, then write the
matching JSX. (This stands in for Figma Code Connect, which needs an Organization/Enterprise plan.)

Conventions: Figma `👁️ X` toggles = whether the prop is passed; `✏️ X` text = the prop's string; `↪ X` swaps = the icon
passed (`<Icon icon={ms…} size={16} />`); `Version=❌ Discontinued` variants are never used.

## Actions

### L3: Button → `<Button>` (`components/Button`)
| Figma | React |
|---|---|
| Type = ◻️ Primary · 🔲 Secondary · ⬜︎ Tertiary · Ghost · 🟨 Brand · 🟩 Buy · 🟥 Sell | `variant="primary" \| "secondary" \| "tertiary" \| "ghost" \| "brand" \| "buy" \| "sell"` |
| Size = Large · Medium · Small | `size="lg" \| "md" \| "sm"` |
| State = ♻︎ Loading | `loading` |
| State = 🚫 Disabled | `disabled` |
| ✏️ Label (👁️ Label on) | children |
| 👁️ Label off (icon-only) | no children, one icon, `aria-label` required |
| ↪ Icon-L / ↪ Icon-R (👁️ on) | `iconLeft` / `iconRight` |

### L3: Button Dock → `<ButtonGroup>` (`components/ButtonGroup`)
| Figma | React |
|---|---|
| Direction = ↓ Vertical · → Horizontal | `direction="vertical" \| "horizontal"` |
| Scroll indicator | `scrollIndicator` |
| wrapper (slot) | `<Button size="lg">` children; `aria-label` required |

## Input & control

### L3: input field & text Box → `<TextField>` (`components/TextField`)
| Figma | React |
|---|---|
| ✏️ Label (👁️ Label) | `label` (always visible in practice) |
| 👁️ Required | `required` |
| ✏️ Placeholder text | `placeholder` |
| ✏️ Input text | `value` / `defaultValue` |
| ✏️ Helper text (Description) | `helperText` (Description-Icon → `helperIcon`) |
| State = Error · Success | `status="error" \| "success"` |
| State = Disabled | `disabled` |
| State = Default · Typing · Typed | runtime states — no prop |
| isInputBox = True | `multiline` (+ `maxLength` for the counter) |
| ↪ Icon-L / ↪ Icon-R | `iconLeft` / `iconRight` |

### L3→ Toggle switch → `<Switch>` (`components/Switch`)
| Figma | React |
|---|---|
| ↔ On = True · False | `checked` / `defaultChecked` |
| isSmall = True | `size="sm"` (default `md`) |
| isTappable = True · False | `onClick` / `href` / `as="label"` · none — card rows: Clickable (surface/primary + elevation-low) · Static (no fill + border/light) |
| isSelected = True (tappable only) | `selected` — plain: surface/secondary · card: border/dark |
| (no Figma variant) | `disabled` |

### L3: Radio button & check box → `<Checkbox>` / `<Radio>` (`components/Checkbox`)
| Figma | React |
|---|---|
| isRadio = False · True | `<Checkbox>` · `<Radio>` (radios share a `name`) |
| 👆 State = selected | `checked` |
| 👆 State = Intermediate | `indeterminate` (Checkbox only) |
| Disabled = True | `disabled` |

### L3: Stepper → `<Stepper>` (`components/Stepper`)
| Figma | React |
|---|---|
| Size = Small · Large | `size="sm" \| "lg"` |
| ✏️ Value | `value` (+ `format`) |
| ✏️ Sublabel / 👁️ Sublabel | `sublabel` (Large only) |
| .L3: Stepper button State = Disabled | automatic at `min` / `max` (or `disabled`) |

### L3: Select → `<Select>` (`components/Select`)
| Figma | React |
|---|---|
| ✏️ Label | children |
| Size = Small · Medium · Large | `size="sm" \| "md" \| "lg"` |
| isSubtle | `subtle` |
| ↪ Icon (↕ · expand_more) | `icon="swap" \| "chevron"` |

### L3: Date picker → `<DatePicker>` (`components/DatePicker`)
| Figma | React |
|---|---|
| Mode = Single · Range | `mode="single" \| "range"` |
| ✏️ Month | from `initialMonth` / the selection (navigates itself) |
| .L3: Date cell State = Disabled | days outside `min` / `max` |
| State = Today · Selected · Range start/middle/end · Empty | automatic |

## Navigation

### L3: Tabs group → `<Tabs>` (`components/Tabs`)
| Figma | React |
|---|---|
| Type = Flat tabs · Pill tabs · Pill group | `appearance="underline" \| "pill" \| "pill-group"` |
| wrapper (slot) of base tabs | `items={[{ value, label, … }]}`, `value`, `onChange`, `aria-label` |

### L3: base tab → one item in `Tabs` `items` (or `<Tab>` when composing)
| Figma | React |
|---|---|
| isPill = True | `appearance="pill"` (set on `Tabs`) |
| Type = Primary · Secondary · Tertiary (pills) | `emphasis="primary" \| "secondary" \| "tertiary"` (set on `Tabs`; one style per row) |
| isSmall = True | `size="sm"` (on `Tabs`) |
| isSelected = True | that item's `value` is the `Tabs` `value` |
| ✏️ label | item `label` |
| 👁️ Label off | item `hideLabel: true` (+ one icon) |
| ✏️ Sub label (👁️ Sub label) | item `subLabel` (pills only) |
| ↪ icon - l / ↪ Icon - r | item `iconLeft` / `iconRight` |

### L3: Actionbar → `<Actionbar>` (`components/Actionbar`)
| Figma | React |
|---|---|
| 👁️ Action - left (back) | `onBack` |
| Base actionbar content: Heading / Description | `title` / `description` |
| Base actionbar content: Type = Search · Searched | `search={{ value, onChange, placeholder }}` |
| → content right (slot) | `actions` — 1–2 `<ActionbarAction icon label onClick>` (Tertiary/Ghost style) |
| ↓ Content bottom (slot) | `bottom` — e.g. `<Tabs>` |
| Scrolled / elevated look | `sticky` or `elevated` |

### L3: Bottom Navbar → `<BottomNavbar>` (`components/BottomNavbar`)
| Figma | React |
|---|---|
| Tab = Stocks · Market · Portfolio · MF · F&O | `items` = main nav, `value` = selected item |
| Tab = MF - Funds · MF - Dashboard · MF - SIPs | MF sub-nav `items` + `home` |
| Tab = F&O - Option Chain · F&O - Positions · F&O - Scalper | F&O sub-nav `items` + `home` |
| L3 → base navoption (internal) | one entry in `items` |

## Surfaces

### L3: Bottom sheet → `<BottomSheet>` (`components/BottomSheet`)
| Figma | React |
|---|---|
| isBottom = True · False | `placement="bottom" \| "top"` |
| 👁️ Header | `header={<BottomSheetHeader …/>}` |
| content slot | children |
| Utility slot | `utility` |
| (dock under the content) | `footer={<ButtonGroup>…</ButtonGroup>}` |
| L3: Overlay | built in (the backdrop) |
| — | `open`, `onClose`, and a name (`aria-label` / `aria-labelledby`) |

### L3: Bottom sheet header → `<BottomSheetHeader>`
| Figma | React |
|---|---|
| ✏️ Heading | `heading` |
| ✏️ Description (👁️) | `description` |
| isSmall = True · False | `size="sm" \| "lg"` |
| 👁️ Back button | `onBack` (second, stacked sheet only) |
| H-Icon (👁️ H-Icon) | `icon` |
| 👁️ header tag | `tag={<Tag …/>}` |
| 👁️ info | `info` (+ `onInfo`) |
| right slot (👁️ Action - right) | `trailing` |
| Content bottom (👁️) | `bottom` — tabs or search |

### L3: Card → `<Card>` (`components/Card`)
| Figma | React |
|---|---|
| Type = Clickable | `onClick` or `href` (the whole card is the tap target) |
| Type = Static | neither `onClick` nor `href` |
| Type = Flat | `variant="flat"` (+ `onClick`/`href` if it's clickable) |
| Type = Filled | `variant="filled"` (grey inset panel) |
| isPadded = True · False (False: Clickable, Static, Flat — content brings its own 12) | `padding="default" \| "none"` (not with `variant="filled"`) |
| isSelected = True (Clickable · Flat) | `selected` — Clickable: border/dark · Flat: surface/secondary |
| content (slot) | children |
| full-width grey action strip at the bottom of the content | `footer` |
| (manual background) | `surface` |

### L3: Section header → `<SectionHeader>` (`components/SectionHeader`)
| Figma | React |
|---|---|
| ✏️ Heading | `title` (required) |
| ✏️ Description (👁️ Description) | `description` — one line ideally, max two |
| 👁️ Tag | `tag` (`<Tag size="sm">`) |
| 👁️ Info | `onInfo` (+ `infoLabel`) |
| CTA = None · View all · Switcher | no `action` · `action={{ type: 'view-all', onClick }}` · `action={{ type: 'switcher', label, onClick }}` |
| touch area (48) | built in (≥ 48 × 48) |

## Feedback & status

### L3: aerobar - toast → `<Aerobar>` (`components/Aerobar`)
| Figma | React |
|---|---|
| Type = Primary · Discover · Danger · Success · Warning | `type="primary" \| "discover" \| "danger" \| "success" \| "warning"` |
| isPrimary = True · False | `emphasis="primary" \| "secondary"` (solid · light tint) |
| isFloating = True | `floating` (toast) |
| Headline text (👁️ Heading) | `heading` |
| Paragraph text (👁️ Paragraph) | `paragraph` |
| icon-L (👁️ Icon-L) | `icon` (`false` hides it) |
| 👁️ Action-r | `action` |

### L3 → Empty state → `<EmptyState>` (`components/EmptyState`)
| Figma | React |
|---|---|
| ✏️ Heading | `title` |
| ✏️ Description | `description` |
| Illustration (slot) | `illustration` (default artwork if omitted) |
| (button under it) | `action` |

### L3: Skeleton → `<Skeleton>` (`components/Skeleton`)
| Figma | React |
|---|---|
| Shape = Line · Circle · Box | `shape="line" \| "circle" \| "box"` (+ `width`, `height`) |
| isOnGrey | `onGrey` |
| L3: Skeleton pattern Type = List row · Card | `<SkeletonListRow />` · `<SkeletonCard />` |

### L3: Progress bar → `<ProgressBar>` (`components/ProgressBar`)
| Figma | React |
|---|---|
| Type = Progress · Range | `type="progress" \| "range"` |
| Size = Small · Medium | `size="sm" \| "md"` |
| Status = Default · Success · Warning · Error | `status` |
| Value (nested fill / marker, steps of 10) | `value` (any 0–100) |

## Data display

### L3: list cell → `<ListCell>` (`components/ListCell`)
| Figma | React |
|---|---|
| isPlain = True · False | `variant="plain" \| "card"` |
| isSmall = True | `size="sm"` (default `md`) |
| ✏️ Label · ✏️ Description | `label` · `description` |
| isMultiline = True | `multiline` (description wraps; default one line + "…") |
| Icon-l (👁️ Icon - L) | `iconLeft` |
| icon-r (👁️ Icon - R) | `iconRight` (chevron) or `trailing` (switch, tag, value) |
| 👁️ Dot-L · 👁️ Dot-R | `dotLeft` · `dotRight` (+ `dotLabel`) |
| (tappable row) | `as="button"` + `onClick`, `href`, or `as="label"` with a Switch/Checkbox |

### L3: Tags → `<Tag>` (`components/Tag`)
| Figma | React |
|---|---|
| Type = Primary · Secondary · Tertiory | `variant="primary" \| "secondary" \| "tertiary"` |
| Type = Disabled | `disabled` |
| Color = Neutral · 🟩 Profit · 🟥 Loss · ✅ Success · 🚨 Error · ⚠️ Warning · 🔷 Discover · 🟠 Processing · indigo · teal · purple · ⚡ Zing | `color="neutral" \| "profit" \| "loss" \| "success" \| "error" \| "warning" \| "discover" \| "processing" \| "indigo" \| "teal" \| "purple" \| "zing"` |
| Size = Small → 16 · Medium → 20 · Large → 24 | `size="sm" \| "md" \| "lg"` |
| ✏️ Label | children |
| 👁️ Label off | `hideLabel` (+ one icon; label text still required) |
| ↪ Icon-L / ↪ Icon-R | `iconLeft` / `iconRight` |

### L3: Price change → `<PriceChange>` (`components/PriceChange`)
| Figma | React |
|---|---|
| Direction = Up · Down · Flat | the sign of `value` |
| ✏️ Value (number without sign) | `value` (+ `unit`, `percent`, `decimals`) |
| Size = Small · Medium · Large | `size="sm" \| "md" \| "lg"` |
| 👁️ Arrow | `arrow` |

### L3: Chart → `<Chart>` (`components/Chart`)
| Figma | React |
|---|---|
| Type = Candle · Line · Area | `type="candle" \| "line" \| "area"` |
| Trend = Up · Down | `trend` (defaults to first vs last close) |
| 👁️ Volume · Grid · Axes · Last price | `showVolume` · `showGrid` · `showAxes` · `showLastPrice` |
| ✏️ Last price | the last `close` (via `format`) |
| (sample data) | `data` |

### L3: Sparkline → `<Sparkline>` (`components/Chart`)
| Figma | React |
|---|---|
| Trend = Up · Down | `trend` (defaults to first vs last value) |

## Brand & device

### L3 → Brand logo → `<BrandLogo>` (`components/BrandLogo`)
| Figma | React |
|---|---|
| Brand = 🍋 Lemonn · ⭐ Zing | `brand="lemonn" \| "zing"` |
| isFull = True · False | `variant="full" \| "icon"` |

### L3: System statusbar → `<SystemStatusbar>` (mockups only)
| Figma | React |
|---|---|
| isDark = True | `inverted` |

### L3: Overlay → `<Overlay>` (`components/Overlay`)
| Figma | React |
|---|---|
| container slot | render the modal panel after `<Overlay>` in the same positioned container |
| (shown) | `open` · tap = `onClick` |

## Not in code

| Figma | Status |
|---|---|
| L3: Title | Figma-only — not built in code (by decision) |
| L3: System navbar · L3: System keyboard | Device chrome for mockups — not app UI |
| L3: Space block · L3: Utility / Component container · L3: dev-note · L3: component slot | Figma-only utilities — use CSS gaps / layout in code |
| L3 → State layer | Built into each component (`--l3-state-layer-*`) |
