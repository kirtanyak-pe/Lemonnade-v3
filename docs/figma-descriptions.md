# Figma component descriptions — draft for review

Audit #6. Written only from existing rules (DESIGN_SYSTEM.md, AGENTS.md, USAGE files, docs pages).
Shown in Figma's Assets panel and read by AI agents (Claude Design, Figma MCP). Once approved, these are written to
the components in "✅ Lemonnade V3". Mark changes inline; delete a line to drop it.

Docs: https://kirtanyak-pe.github.io/lemonnade-v3-docs/

---

## Components used in screens

### L3: Button (4471:29225)
Actions. Type: Primary for the main action (one per screen); Secondary only next to a stronger button, usually in a dock; Tertiary for standalone actions like "View all"; Ghost for text actions inside other components; Brand for brand moments; Buy / Sell only to place or confirm a trade. Icon-only: no label, one icon. Buttons in a dock are always Large.
Code: `<Button variant size>` · Docs: #/button

### L3: Tags (4464:27218)
A static label or status — never tappable. Profit / Loss for price moves and P&L; Success / Error for outcomes; Processing for in-progress (open, pending); Warning, Discover, Zing as named; Neutral otherwise. One or two words. Icon-only needs the label as its name.
Code: `<Tag variant color size>` · Docs: #/tag

### L3: input field & text Box (4543:66091)
Text entry. Always a visible label (never the placeholder as the label). Errors say what went wrong and how to fix it. isInputBox = multi-line text box with a character counter. States: Default, Typing, Typed, Error, Success, Disabled.
Code: `<TextField label status helperText multiline>` · Docs: #/text-field

### L3: list cell (4543:65400)
A row: icon, label with optional description, and something on the right (chevron, switch, tag or value). Tappable rows show a chevron or trailing control. A row holding a switch or checkbox is tappable as a whole (label row). isPlain = plain row; otherwise card style. Dots carry screen-reader text ("New").
Code: `<ListCell label description variant size>` · Docs: #/list-cell

### L3: Actionbar (4543:65480)
The top bar of a screen: back, title with optional description, at most 2 actions (Tertiary / Ghost only), or search. Flat tabs at the top go in its ↓ Content bottom slot — never a separate layer below. Actions go in → content right. Gets elevation-low when content scrolls under it.
Code: `<Actionbar title description onBack actions bottom>` · Docs: #/actionbar

### L3: Bottom Navbar (4543:61961)
App-level navigation between main sections: 3–5 items, always labelled. Mutual Fund and F&O have their own sub-navs with a Home item back to the main bar. Never put actions (like Buy) here.
Code: `<BottomNavbar items value>` · Docs: #/bottom-navbar

### L3: Bottom sheet (4543:63932)
A modal panel over the screen for a focused task (confirm an order, pick an option, see a result). No drag handle and no ✕ — closes by backdrop tap or dragging down. Footer is a Button Dock. At most 2 sheets stacked; only the second has a back button. Use Version = Latest.
Code: `<BottomSheet open onClose footer>` · Docs: #/bottom-sheet

### L3: Bottom sheet header (4543:63897)
The header of a bottom sheet: heading, optional description, icon, tag, info, right action. Tabs or search at the top of a sheet go in its Content bottom slot. Back button only on a second (stacked) sheet. isSmall for compact sheets. Use Version = Latest.
Code: `<BottomSheetHeader heading description bottom>` · Docs: #/bottom-sheet

### L3: aerobar - toast (4543:65562)
A short status message with an optional action. isFloating = toast after something happens (e.g. "Order placed"); otherwise an inline bar that belongs to the page. Danger for errors, Success, Warning, Discover (info). Toasts with an action stay until acted on — never put important info or undo behind a timer.
Code: `<Aerobar type heading floating>` · Docs: #/aerobar

### L3 → Empty state (4543:66488)
What to show when a search or list has nothing in it: illustration, short heading, hint, and a way forward. Say what happened and how to recover — never a blank screen or dead end.
Code: `<EmptyState title description action>` · Docs: #/empty-state

### L3 → Brand logo (4735:1466)
The Lemonn or Zing logo. isFull = mark + wordmark; otherwise just the mark. 24–48px high. Brand artwork — don't redraw or recolor.
Code: `<BrandLogo brand variant>` · Docs: #/brand-logo

### L3: Card (5364:38)
A surface that groups related content. Clickable: the whole card is one tap target (surface/primary, border/light, elevation-low, scales down when pressed) — never put a button inside. Static: rounded, border/light on surface/default, no shadow. Flat: no radius, border or shadow. isPadded = False for edge-to-edge media or lists. Cards in a list sit 16px apart.
Code: `<Card onClick variant padding surface>` · Docs: #/card

### L3: Title (4543:84634)
A title with an optional description, in Large / Medium / Small / Mini. Figma-only — there is no code component; in code, compose it from Heading + Description text styles.
Code: — (Figma-only) · Docs: —

### L3: Overlay (4603:91773)
The backdrop behind modal content (bottom sheets). Uses surface/overlay. Use Version = Latest.
Code: part of `<BottomSheet>` · Docs: #/bottom-sheet

---

## Building blocks — don't use directly in screens

### L3 → base navoption (4543:77042)
One item of the Bottom Navbar. Internal — use L3: Bottom Navbar.

### L3: Base actionbar content (4543:65466)
The middle of the Actionbar (heading + description, or search). Internal — use L3: Actionbar.

### L3 → State layer (4471:29572)
The hover / pressed tint inside interactive components (light on dark fills, dark on light fills). Internal — don't add to screens.

### L3: component slot (5172:24907)
Generic slot used to build components. Internal.

---

## Device chrome & handoff utilities (not part of the app UI)

### L3: System statusbar (4543:84649)
The phone's status bar (time, wifi, signal, battery), 32px high, for mockups. isDark for dark backgrounds. Device chrome — not part of an app screen.
Code: `<SystemStatusbar inverted>` (mockups only)

### L3: System navbar (4543:84670)
The phone's system navigation bar for mockups. isDark for dark backgrounds. Device chrome — not part of an app screen.

### L3: System keyboard (4543:84447)
The phone keyboard for mockups. isNumeric for number entry (quantity, price, amount). Device chrome.

### L3: Space block (4543:84365)
A spacer for laying out mockups. Prefer auto-layout gaps; on-scale spacing is 4, 8, 12, 16, 24, 32, 40, 48, 64.

### L3: Utility / Component container (4543:84355)
A documentation frame with a heading for presenting components. Not app UI.

### L3: dev-note (4543:84404)
A handoff annotation for developers, with a pointer in any direction. Not app UI — never ships.
