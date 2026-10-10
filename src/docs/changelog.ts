// Per-page release history, newest first. Versions follow semver per component:
// major = breaking API change · minor = new feature or visible change (incl. Figma syncs) · patch = fix / rename.
// When you change a component, add a release at the top of its list (or an `unreleased` entry for
// Figma changes that aren't in code yet).

export type ChangeKind = 'added' | 'changed' | 'fixed' | 'figma' | 'a11y'

export type Release = {
  /** Semver, or 'unreleased' for work in Figma that isn't in code yet. */
  version: string
  date: string
  /** Short git commit. */
  commit?: string
  summary: string
  /** `dev`: a code-only change (props, tokens, warnings) — hidden on the designer site, kept in the agent docs. */
  changes: { kind: ChangeKind; text: string; dev?: boolean }[]
}

export const changeKindLabels: Record<ChangeKind, string> = {
  added: 'Added',
  changed: 'Changed',
  fixed: 'Fixed',
  figma: 'Figma sync',
  a11y: 'Accessibility',
}

const iconsMigration = (): Release['changes'][number] => ({
  kind: 'changed',
  text: 'Icons now come from the Material Symbols Rounded library (weight 400, 24dp) and take the text color.',
})

export const changelog: Record<string, Release[]> = {
  typography: [
    {
      version: '3.0.2', date: '2026-10-07',
      summary: 'Style names match Figma',
      changes: [
        { kind: 'figma', text: 'Label styles match Figma (label-10 … 18; were label-primary-sb-…). Names on the site use “-” instead of Figma’s “/”, and drop the 🔷 marker. No visual change.' },
      ],
    },
    {
      version: '3.0.1', date: '2026-10-06',
      summary: 'Figma variable names',
      changes: [
        { kind: 'figma', text: 'Figma weight variables renamed to L3-typography-base-weight-heading · label · description (750 · 650 · 500). No visual change.' },
      ],
    },
    {
      version: '3.0.0', date: '2026-10-05',
      summary: 'Three roles',
      changes: [
        { kind: 'changed', text: 'Five roles merged into three: Heading (weight 750, sizes 10–36), Label (650, 10–18) and Description (500, 10–18, with paragraph spacing).' },
        { dev: true, kind: 'changed', text: 'Tokens renamed: --l3-text-heading-*, --l3-text-label-*, --l3-text-description-*. Heading primary/secondary and the Section style merge into Heading; Label secondary uses move to Description.' },
        { kind: 'added', text: 'Manrope is loaded as a variable font (200–800) so 750 and 650 render. Figma styles still to be updated to these weights.' },
      ],
    },
    {
      version: '2.0.0', date: '2026-10-04',
      summary: 'Typography from Figma roles',
      changes: [
        { kind: 'figma', text: 'Synced with Figma "🅰️ Typography": base variables (size, line height, weight, paragraph spacing) and 34 role styles.' },
        { dev: true, kind: 'changed', text: 'Tokens are named after the Figma styles: --l3-text-heading-primary-*, heading-secondary-* (+ section), label-primary-*, label-secondary-*, description-* (with paragraph spacing).' },
        { dev: true, kind: 'changed', text: 'Removed the weight-named tokens (--l3-text-semibold-12 …), Regular, and the Display / Paragraph roles — Heading primary replaces Display, Description replaces Paragraph. Every component and docs page migrated.' },
      ],
    },
  ],

  colors: [
    {
      version: '1.2.0', date: '2026-10-07',
      summary: 'Figma variable names',
      changes: [
        { kind: 'changed', text: 'Colors are shown and copied by their variable name with “-” (surface-secondary), not the code name.' },
        { kind: 'changed', text: 'Token naming shows full names joined with “-”: L3-color-surface-accent-success-light (Figma groups them with “/”).' },
        { dev: true, kind: 'changed', text: 'CSS (--l3-…) and TS forms are documented in the agent docs (color-tokens.md) only.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-10-01',
      summary: '♿ Accessible themes and Figma token sync',
      changes: [
        { kind: 'added', text: '5 ♿ Accessible themes (Figma "♿ Accessible" modes) for every brand and mode: higher-contrast secondary/tertiary text, stronger dark-mode borders, one-step-stronger accents. Turn on with the ♿ button in the header.' },
        { kind: 'figma', text: 'New surface-overlay (the brand’s darkest neutral at 80%) and gradient-stop-0-static-white · black.' },
        { kind: 'figma', text: 'surface-accent-us-stock-default is now blue-500 in Lemonn and Kuber dark (was 400) — first split from discover.' },
        { kind: 'changed', text: 'New Colors page: how the three color layers work, every semantic token with “use for” guidance, live hex + alias per theme, an accent matrix, button and state-layer tokens, base palette, and a 10-theme comparison. Filter and click-to-copy.' },
        { kind: 'added', text: 'Accent groups: Brand · Market indicators (profit / loss) · Status (success, warning, error, discover, orange) · Sub-brands (US stocks, Zing) · Miscellaneous (purple, indigo, teal — exceptional cases only). Also in DESIGN_SYSTEM.md 3.1.' },
        { kind: 'changed', text: 'Accents are shown as one table per group, and border tokens are previewed as outlines instead of fills.' },
        { kind: 'changed', text: '“How color works” is now a live token flow (base → semantic → component → UI) built around green — profit and success, surface-content-border, Button and Tag — with hover-to-trace, plus four illustrated rule cards.' },
        { kind: 'added', text: 'Token naming: anatomy of semantic, accent, component and base names (namespace · property · group · intent · modifier · state), the same token in Figma / CSS / TS, naming rules and a parts glossary. Also in DESIGN_SYSTEM.md 3.2.' },
        { kind: 'changed', text: 'Token names shown with dashes plus a role in brackets, e.g. surface-default (Screen BG) — display only.' },
        { kind: 'added', text: 'List / Tree toggle for surface, content and border. Tree view: Colors → Surface · Icon · Text · Border, with Icon + Text merging into Content, then each role’s tokens (hover to trace, click to copy). The choice is remembered.' },
        { kind: 'added', text: 'Tree view: accents branch off the root in the brand color, then fan out into the 5 accent groups and their colors. Clearer List / Tree switch with icons.' },
        { kind: 'changed', text: '“How colors are mapped” (was “How colour works”): pick any base color to see every semantic token it feeds in the current theme (gradient stops skipped), the components that use them (found from their styles) and live previews — e.g. the input field in its success or error state.' },
        { kind: 'changed', text: 'US spelling (“color”) across the docs.' },
        { kind: 'fixed', text: 'Color mapping: each component now says where it uses the color (read from its stylesheet, e.g. “caret (search)”, “message (status=success)”), and previews show that state — solid vs soft tags, Aerobar type and emphasis, input field success / error, list cell dot.' },
        { kind: 'fixed', text: 'Tag and Aerobar are split into solid and soft nodes, each linked only to the tokens that state reads — e.g. the soft success toast links to success-light (its text is content-primary), not success-default.' },
      ],
    },
  ],
  'section-header': [
    {
      version: '1.1.1', date: '2026-10-10',
      summary: 'Uses the shared touch areas',
      changes: [
        { dev: true, kind: 'changed', text: 'View all and the switcher hug their content and bring their own 48 × 48 touch areas (now built into Ghost buttons and Select), so the header no longer adds its own.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-10-10',
      summary: 'Simpler CTA',
      changes: [
        { kind: 'figma', text: 'L3: Section header is one component now: 👁️ CTA shows the action, and the nested "L3 base: section header cta" picks its Type — Button (View all) or Time Switcher. The three CTA variants are gone.' },
        { kind: 'changed', text: 'View all hugs its label like in Figma: 16 tall instead of 32, so a header with only a title and View all is 20 tall. Its touch area stays 48 × 48.' },
        { kind: 'changed', text: 'No API change: action={{ type: \'view-all\' }} is Type=Button, type: \'switcher\' is Type=Time Switcher.', dev: true },
      ],
    },
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'New component',
      changes: [
        { kind: 'added', text: 'Section header: a required heading with an optional tag, info icon, description (one line ideally, two at most) and one action — View all or a switcher. The action and info icon have a 48 × 48 touch area.' },
        { kind: 'figma', text: 'New Figma component L3: Section header (CTA = None · View all · Switcher; ✏️ Heading, ✏️ Description, 👁️ Description · Tag · Info).' },
        { kind: 'added', text: '<SectionHeader title description tag onInfo action headingLevel />; action is typed to view-all | switcher.', dev: true },
      ],
    },
  ],
  'price-change': [
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'New component',
      changes: [
        { kind: 'added', text: 'Price change: a signed change in green (up, +), red (down, −) or grey (no change), in three sizes with an optional ▲/▼ arrow. The sign and colour come from the direction, so they can never disagree.' },
        { kind: 'figma', text: 'New Figma component L3: Price change (Direction × Size, ✏️ Value without the sign, 👁️ Arrow).' },
        { kind: 'a11y', text: 'Screen readers hear “up / down / unchanged” and the value; colour is never the only signal.', dev: true },
      ],
    },
  ],
  stepper: [
    {
      version: '1.0.1', date: '2026-10-10',
      summary: '48 × 48 touch area',
      changes: [
        { kind: 'changed', text: 'The − and + buttons have a touch area of at least 48 × 48 (was 32); the row stays compact.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'New component',
      changes: [
        { kind: 'added', text: 'Stepper: a number with − / + buttons for quantity and lots. Small (inline in order-pad rows) and Large (with a sublabel such as “91 Lots”). Each button turns grey at its limit.' },
        { kind: 'figma', text: 'New Figma components L3: Stepper (Size = Small · Large, ✏️ Value, ✏️ / 👁️ Sublabel) and .L3: Stepper button (Type × State × Size).' },
        { kind: 'a11y', text: 'Named group, labelled buttons, the value is announced on change, and the 20px Small buttons have a 32px tap area.', dev: true },
      ],
    },
  ],
  select: [
    {
      version: '1.0.2', date: '2026-10-10',
      summary: '48 × 48 touch area',
      changes: [
        { kind: 'changed', text: 'The touch area is at least 48 × 48 (was 32). Select still hugs its label and icon, so rows don\'t get taller.' },
      ],
    },
    {
      version: '1.0.1', date: '2026-10-09',
      summary: 'Lemonnade switch arrow',
      changes: [
        { kind: 'fixed', text: 'The ↕ toggle is now the Lemonnade "Switch arrow toggle" icon from the Figma icons library (solid up and down arrowheads), instead of Material\'s unfold_more.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'New component',
      changes: [
        { kind: 'added', text: 'Select: an inline label + icon that opens a sheet of options — Small, Medium, Large, a subtle version, and ↕ or chevron icons.' },
        { kind: 'figma', text: 'New Figma component L3: Select (Size × isSubtle, ✏️ Label, ↪ Icon).' },
        { kind: 'a11y', text: 'A button with aria-haspopup="dialog" and aria-expanded; 32px tap area.', dev: true },
      ],
    },
  ],
  'date-picker': [
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'New component',
      changes: [
        { kind: 'added', text: 'Date picker: a Monday-first month calendar for one day or a range, with today, selected, range and disabled days. Six weeks tall, so sheets don\'t jump between months.' },
        { kind: 'figma', text: 'New Figma components L3: Date picker (Mode = Single · Range, ✏️ Month) and .L3: Date cell (8 states).' },
        { kind: 'a11y', text: 'ARIA grid with full-date labels, aria-selected and aria-current; arrows, Home / End and PageUp / PageDown move focus.', dev: true },
      ],
    },
  ],
  skeleton: [
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'New component',
      changes: [
        { kind: 'added', text: 'Skeleton: Line, Circle and Box placeholders that shimmer while content loads, plus ready-made List row and Card patterns. A grey-friendly version for grey cards.' },
        { kind: 'figma', text: 'New Figma components L3: Skeleton (Shape × isOnGrey) and L3: Skeleton pattern (List row · Card).' },
        { kind: 'a11y', text: 'Hidden from screen readers (mark the region aria-busy); the shimmer stops under reduced motion.', dev: true },
      ],
    },
  ],
  'progress-bar': [
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'New component',
      changes: [
        { kind: 'added', text: 'Progress bar: Progress (a fill — funds or margin used) and Range (a marker — today\'s price between the 24H low and high), in two sizes and four statuses.' },
        { kind: 'figma', text: 'New Figma component L3: Progress bar (Type × Size × Status) with Value 0–100 in steps of 10 on the nested fill or marker.' },
        { kind: 'a11y', text: 'role="progressbar" (Progress) or "meter" (Range) with valueText.', dev: true },
      ],
    },
  ],
  chart: [
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'New component',
      changes: [
        { kind: 'added', text: 'Chart: Candle, Line and Area price charts with a price axis, time labels, grid, volume and a last-price tag; and Sparkline, a small trend line for lists. Green up, red down.' },
        { kind: 'figma', text: 'New Figma components L3: Chart (Type × Trend, 👁️ Volume · Grid · Axes · Last price, ✏️ Last price) and L3: Sparkline (Trend).' },
        { kind: 'added', text: 'SVG, 360×200 viewBox scaling to the container; role="img" with a trend + range summary.', dev: true },
      ],
    },
  ],
  overlay: [
    {
      version: '1.0.0', date: '2026-10-09',
      summary: 'Its own component',
      changes: [
        { kind: 'added', text: 'Overlay: the dimmed backdrop behind sheets, now a component of its own (it was part of Bottom sheet).' },
        { kind: 'added', text: '<Overlay open onClick />; BottomSheet uses it.', dev: true },
      ],
    },
  ],
  card: [
    {
      version: '1.8.0', date: '2026-10-09',
      summary: 'Action footer without the grey strip',
      changes: [
        { kind: 'changed', text: 'The action footer has no fill by default: its buttons sit 12 from the card edge, right under the content. Grey is for small highlights, so the full-width grey strip is now an opt-in for footers that are meant to stand out.' },
        { kind: 'added', text: 'footerFilled: the grey footer strip (surface-secondary, 12 padding).', dev: true },
      ],
    },
    {
      version: '1.7.0', date: '2026-10-09',
      summary: 'Action footer',
      changes: [
        { kind: 'added', text: 'Action footer: a full-width grey strip at the bottom of a card for up to three quick actions (save, learn more, apply). On a clickable card the rest of the card stays the tap target, and pressing a footer button doesn\'t press the card.' },
        { kind: 'added', text: 'footer prop; the clickable body becomes the button/link and the footer sits beside it (never nested).', dev: true },
      ],
    },
    {
      version: '1.6.0', date: '2026-10-09',
      summary: 'No padding is back for rounded cards',
      changes: [
        { kind: 'changed', text: 'Clickable and static cards can drop their own padding again, for content built from sections that bring their own (a 12-padded body plus a full-width footer strip). The content still sits 12 from the card edge. Filled cards stay padded.' },
        { kind: 'figma', text: 'L3: Card gets isPadded = False back for Clickable (and Clickable selected) and Static.' },
        { kind: 'changed', text: 'padding="none" is allowed on default and flat cards (not filled).', dev: true },
      ],
    },
    {
      version: '1.5.0', date: '2026-10-09',
      summary: 'Selected cards',
      changes: [
        { kind: 'added', text: 'Selected state for clickable cards — the chosen option in a list of choices. A bordered card swaps border-light for border-dark; a flat card gets a surface-secondary background (unselected flat cards stay transparent).' },
        { kind: 'figma', text: 'L3: Card gets isSelected = True · False (Clickable and Flat, padded and not padded).' },
        { kind: 'added', text: 'selected prop (aria-pressed on buttons, aria-current on links; warns when the card isn\'t clickable).', dev: true },
        { kind: 'changed', text: 'No padding is for flat cards only: rounded cards (clickable, static, filled) are always padded and always sit inside a margin; flat cards run edge to edge.' },
        { kind: 'figma', text: 'L3: Card drops isPadded = False for Clickable, Static and Filled (kept for Flat).' },
        { kind: 'changed', text: 'padding="none" now only type-checks with variant="flat".', dev: true },
      ],
    },
    {
      version: '1.4.0', date: '2026-10-09',
      summary: 'Filled cards',
      changes: [
        { kind: 'added', text: 'Filled card: a grey inset panel (surface-secondary, rounded, no border or shadow) for grouping details like contract info or market depth.' },
        { kind: 'figma', text: 'L3: Card gets Type = Filled (padded and not padded), same content slot.' },
        { kind: 'added', text: 'variant="filled".', dev: true },
      ],
    },
    {
      version: '1.3.0', date: '2026-10-08',
      summary: 'In Figma',
      changes: [
        { kind: 'figma', text: 'New Figma component L3: Card: Type = Clickable · Static · Flat, isPadded = True · False, and one content slot. Same tokens as code: surface-primary or surface-default, border-light, elevation-low on clickable cards, radius-12, padding-12, rows 8 apart.' },
      ],
    },
    {
      version: '1.2.0', date: '2026-09-29',
      summary: 'Figma card spec',
      changes: [
        { kind: 'figma', text: 'Padding 16 → 12 and radius 16 → 12, matching the Figma Order card (row gap stays 8).' },
        { kind: 'changed', text: 'Orders demo: 16 between cards, Body/12 meta line, Tertiary status tags, sort + filters toolbar.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-09-29',
      summary: 'Flat variant',
      changes: [
        { kind: 'added', text: 'Flat style: not rounded, no border, no shadow, transparent background; still clickable.' },
        { kind: 'added', text: 'A card background can be set manually (surface variables only).' },
        { kind: 'changed', text: 'Static cards (rounded + border-light) use surface-default; clickable cards stay surface-primary.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-29',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Clickable cards: surface-primary, border-light, elevation-low, press scale 0.98.' },
        { kind: 'added', text: 'Static cards for information or decoration: surface-primary + border-light, no shadow or press.' },
        { kind: 'a11y', text: 'Development warnings: a clickable card with controls inside, or a static card holding a single action.' },
      ],
    },
  ],

  'brand-logo': [
    {
      version: '1.1.0', date: '2026-10-09',
      summary: 'Coinswitch',
      changes: [
        { kind: 'added', text: 'Coinswitch logo, full and mark only, matching Figma Brand = Coinswitch. Its two greens stay the same in every theme; the dot and “coin” follow the theme.' },
        { kind: 'added', text: "brand=\"coinswitch\". Greens are local tokens base/hue/brand-coinswitch-green · deep (source/local.colors.json) — raw fills in Figma.", dev: true },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-28',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Lemonn and Zing logos, full or mark only, 24–48px high.' },
        { kind: 'figma', text: 'Artwork exported from Figma; every color is a token (Lemonn and honey brand ramps, theme wordmark).' },
        { kind: 'changed', text: 'The lemon leaf stays on the Lemonn ramp in every product theme (Figma binds it to the theme brand color).' },
      ],
    },
  ],

  icons: [
    {
      version: '1.2.0', date: '2026-10-10',
      summary: 'Icons that work in any bundler',
      changes: [
        { dev: true, kind: 'added', text: '<Icon icon> also takes an object with src (what an .svg import gives in Next.js).' },
        { dev: true, kind: 'added', text: 'npm run -s glyphs -- --pick search,arrow_back > icons.ts writes a module with just those icons as strings — no .svg files or bundler setup in the app.' },
        { kind: 'fixed', text: 'Icons now draw on older Android phones too (Chrome / WebView before version 120) — they showed as solid squares there.' },
        { dev: true, kind: 'changed', text: 'Components carry their icons as strings (glyphs.ts, generated by npm run glyphs from the SVGs) instead of importing .svg files.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-10-07',
      summary: 'Copy and download SVG',
      changes: [
        { kind: 'added', text: 'Pick an icon to Copy SVG (pastes into Figma as an editable vector), Download SVG or Copy name.' },
        { kind: 'changed', text: 'Usage guidance for designers: Figma icon library, sizes, color and fill.' },
        { dev: true, kind: 'changed', text: 'The import snippet and Copy import button moved to the agent docs.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: '2998418',
      summary: 'Full Material Symbols Rounded library',
      changes: [
        { kind: 'added', text: '3,900+ icons (outlined + filled), weight 400, grade 0, 24dp optical size, downloaded from Google.' },
        { dev: true, kind: 'added', text: '<Icon> component with size tokens and an optional label for meaningful icons.' },
        { dev: true, kind: 'added', text: 'npm run icons to pull new icons; only imported icons end up in the app.' },
      ],
    },
  ],

  button: [
    {
      version: '1.7.0', date: '2026-10-10',
      summary: 'Ghost hugs its content',
      changes: [
        { kind: 'changed', text: 'Ghost hugs its content in every size — no padding, no fixed height — so it\'s exactly as big as its label and icon and never adds invisible space to a layout.' },
        { kind: 'changed', text: 'Every button\'s touch area is at least 48 × 48 (was 32). It\'s invisible and doesn\'t change the layout.' },
      ],
    },
    {
      version: '1.6.0', date: '2026-10-10',
      summary: 'Works in any React app',
      changes: [
        { dev: true, kind: 'added', text: 'ref reaches the <button> (React 18 and 19): focus it, measure it.' },
        { dev: true, kind: 'fixed', text: 'Development warnings no longer depend on Vite, so the button runs in Next.js, webpack and other bundlers. The loader artwork is built in (no .svg import).' },
      ],
    },
    {
      version: '1.5.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650).' },
      ],
    },
    {
      version: '1.4.2', date: '2026-10-04',
      summary: 'Typography tokens renamed',
      changes: [
        { dev: true, kind: 'changed', text: 'Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.' },
      ],
    },
    {
      version: '1.4.1', date: '2026-10-01',
      summary: 'CS PRO primary is gold',
      changes: [
        { kind: 'figma', text: 'CS PRO: Primary button uses the brand gold (surface-accent-brand-default) with white text. ♿ Accessible CS PRO keeps the inverted primary, and Buy uses success green.' },
      ],
    },
    {
      version: '1.4.0', date: '2026-09-30',
      summary: 'Label & icon rule, usage rules',
      changes: [
        { dev: true, kind: 'changed', text: 'At least one of label / iconLeft / iconRight must show, and icon-only buttons have exactly one icon — enforced in TypeScript, with a runtime fallback (left icon wins).' },
        { kind: 'added', text: 'Usage rules in src/components/Button/USAGE.md: secondary only next to a stronger button, tertiary when alone (View all), Large only in docks.' },
        { dev: true, kind: 'added', text: 'ButtonGroup warns in development when a button isn’t size="lg".' },
      ],
    },
    {
      version: '1.3.0', date: '2026-09-26', commit: '2998418',
      summary: 'Material Symbols icons',
      changes: [iconsMigration()],
    },
    {
      version: '1.2.0', date: '2026-09-26', commit: '790abbc',
      summary: 'Built for touch',
      changes: [
        { kind: 'changed', text: 'Tap area grows to 32px (size-tap-target) without changing the drawn size.' },
        { kind: 'changed', text: 'Hover only on devices that can hover, so taps don’t leave buttons stuck highlighted.' },
      ],
    },
    {
      version: '1.1.1', date: '2026-09-26', commit: '8d68e35',
      summary: 'L3 naming',
      changes: [{ kind: 'fixed', text: 'Text style references renamed from D2 to L3.' }],
    },
    {
      version: '1.1.0', date: '2026-09-26', commit: '294656a',
      summary: 'Shared icon rendering',
      changes: [{ kind: 'changed', text: 'Icon slots use the shared MaskIcon, so icons always match the label color.' }],
    },
    {
      version: '1.0.0', date: '2026-09-25', commit: 'f48b8a6',
      summary: 'First release',
      changes: [
        { kind: 'added', text: '7 variants (primary, secondary, tertiary, ghost, brand, buy, sell) × 3 sizes.' },
        { kind: 'added', text: 'Loading and disabled states, left/right icon slots, full width.' },
        { kind: 'figma', text: 'Hover and press use state-layer tokens instead of Figma’s interaction overlay.' },
      ],
    },
  ],

  'button-group': [
    {
      version: '1.1.1', date: '2026-09-30',
      summary: 'Renamed to Button dock',
      changes: [
        { kind: 'figma', text: 'Figma renamed "L3: Button Group" to "L3: Button Dock"; the docs page is now "Button dock". The code name ButtonGroup is unchanged.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-09-30',
      summary: 'Dock rules',
      changes: [
        { kind: 'added', text: 'Usage rules in src/components/ButtonGroup/USAGE.md: what goes in a dock, direction and order, placement, scroll indicator.' },
        { dev: true, kind: 'a11y', text: 'Development warnings: non-Large buttons, no strong button (secondary alone), missing aria-label.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: 'ffb3ed9',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Vertical (primary on top) and horizontal (primary on the right) layouts.' },
        { kind: 'added', text: 'Scroll indicator: elevation-high shadow while content scrolls underneath.' },
      ],
    },
  ],

  checkbox: [
    {
      version: '1.3.1', date: '2026-10-10',
      summary: '48 × 48 touch area',
      changes: [
        { kind: 'changed', text: 'The touch area around the box or dot is at least 48 × 48 (was 32), without changing its drawn size.' },
      ],
    },
    {
      version: '1.3.0', date: '2026-10-10',
      summary: 'Refs for forms',
      changes: [
        { dev: true, kind: 'fixed', text: 'Checkbox and Radio pass the ref you give them to the <input> — they used to replace it with their own, so form libraries like react-hook-form couldn\'t register them.' },
        { kind: 'fixed', text: 'The check and dash marks now draw on older Android phones too (Chrome / WebView before version 120).' },
      ],
    },
    {
      version: '1.2.0', date: '2026-09-26', commit: '2c82c18',
      summary: 'Accessibility pass',
      changes: [{ kind: 'a11y', text: 'Development warning when a checkbox or radio has no accessible name.' }],
    },
    {
      version: '1.1.1', date: '2026-09-26', commit: '8d68e35',
      summary: 'L3 naming',
      changes: [{ kind: 'fixed', text: 'Figma references renamed from D2 to L3.' }],
    },
    {
      version: '1.1.0', date: '2026-09-26', commit: '790abbc',
      summary: 'Built for touch',
      changes: [{ kind: 'changed', text: 'The invisible input grows to a 32px tap target around the 24px control.' }],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: 'e0dcfb2',
      summary: 'First release',
      changes: [{ kind: 'added', text: 'Checkbox (with indeterminate) and Radio, using native inputs.' }],
    },
  ],

  'text-field': [
    {
      version: '1.6.0', date: '2026-10-10',
      summary: 'Refs for forms',
      changes: [
        { dev: true, kind: 'added', text: 'ref reaches the <input> (or <textarea> when multiline) on React 18 and 19 — react-hook-form\'s register works.' },
      ],
    },
    {
      version: '1.5.0', date: '2026-10-05',
      summary: 'Typography role rules',
      changes: [
        { kind: 'changed', text: 'Typography role rules: field label, typed text and the character counter use Label (a number never uses Description); helper text stays Description. Matches Figma.' },
      ],
    },
    {
      version: '1.4.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650).' },
      ],
    },
    {
      version: '1.3.0', date: '2026-10-04',
      summary: 'Typography from Figma',
      changes: [
        { kind: 'figma', text: 'Label, input and text box text use Description (12 / 14 / 12) as in Figma; required mark Label / primary 12.' },
      ],
    },
    {
      version: '1.2.0', date: '2026-09-26', commit: '2998418',
      summary: 'Material Symbols icons',
      changes: [iconsMigration()],
    },
    {
      version: '1.1.0', date: '2026-09-26', commit: '2c82c18',
      summary: 'Accessibility pass',
      changes: [
        { kind: 'a11y', text: 'Error fields show focus by thickening the red border (visible focus).' },
        { kind: 'a11y', text: 'Helper and error messages are announced while typing.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: '82c1c1b',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Input field and multiline text box with label, helper text and required marker.' },
        { kind: 'added', text: 'Error and success states; character counter with an over-limit error.' },
      ],
    },
  ],

  switch: [
    {
      version: '1.3.1', date: '2026-10-10',
      summary: '48 × 48 touch area',
      changes: [
        { kind: 'changed', text: 'The touch area is at least 48 × 48 (was 32), without changing the switch\'s drawn size.' },
      ],
    },
    {
      version: '1.3.0', date: '2026-10-10',
      summary: 'Refs for forms',
      changes: [
        { dev: true, kind: 'fixed', text: 'The ref you give it reaches the <input> (it used to be replaced by the switch\'s own), so react-hook-form and focus management work.' },
        { dev: true, kind: 'changed', text: 'Knob shadow uses color-mix() instead of relative rgb(from …) — same look, works in more browsers.' },
      ],
    },
    {
      version: '1.2.0', date: '2026-09-26', commit: '2c82c18',
      summary: 'Accessibility pass',
      changes: [{ kind: 'a11y', text: 'Development warning when a switch has no accessible name.' }],
    },
    {
      version: '1.1.1', date: '2026-09-26', commit: '8d68e35',
      summary: 'L3 naming',
      changes: [{ kind: 'fixed', text: 'Figma references renamed from D2 to L3.' }],
    },
    {
      version: '1.1.0', date: '2026-09-26', commit: '790abbc',
      summary: 'Built for touch',
      changes: [{ kind: 'changed', text: 'The invisible input grows to a 32px tap target.' }],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: 'e0dcfb2',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Medium and small sizes.' },
        { kind: 'added', text: 'Knob slides between states (respects reduced motion).' },
      ],
    },
  ],

  tabs: [
    {
      version: '1.7.1', date: '2026-10-10',
      summary: '48 tall touch area',
      changes: [
        { kind: 'changed', text: 'Pill tabs shorter than 48 get a 48-tall touch area (was 32) — vertical only, so pills side by side don\'t overlap.' },
      ],
    },
    {
      version: '1.7.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650).' },
      ],
    },
    {
      version: '1.6.0', date: '2026-10-04',
      summary: 'Typography from Figma',
      changes: [
        { kind: 'figma', text: 'Text styles follow the new Figma typography: labels use Label primary (label-primary-sb).' },
        { kind: 'changed', text: 'Selected underline tabs keep the same SemiBold label as unselected ones (Figma no longer uses a bolder selected style).' },
      ],
    },
    {
      version: '1.5.0', date: '2026-10-02',
      summary: 'Hug or fill width',
      changes: [
        { kind: 'added', text: 'Width: Hug or Fill. Hug (default): tabs as wide as their labels, and a pill group\'s track wraps them. Fill: tabs stretch to fill the row; a pill group goes full width with equal pills.' },
        { kind: 'fixed', text: 'A pill group no longer stretches across a flex or grid parent when it should hug.' },
      ],
    },
    {
      version: '1.4.0', date: '2026-10-02',
      summary: 'Pill group',
      changes: [
        { kind: 'figma', text: 'Figma “L3: Tabs” is now “L3: Tabs group” (Type: Flat tabs · Pill tabs · Pill group); base tab isChip is now isPill.' },
        { kind: 'added', text: 'Pill group: tertiary pills in a surface-secondary track for switching views (Tree / List). Selected pill is a black fill; the rest blend into the track.' },
        { dev: true, kind: 'changed', text: 'The separate SegmentedControl component is gone — Figma merged it into the Tabs group as Pill group. Use <Tabs appearance="pill-group"> instead.' },
      ],
    },
    {
      version: '1.3.0', date: '2026-10-02',
      summary: 'Tertiary chips',
      changes: [
        { kind: 'figma', text: 'Figma Type is now Primary · Secondary · Tertiary, each with a selected and an unselected look (Ghost removed, typos fixed).' },
        { kind: 'added', text: 'Tertiary pills: selected black fill, unselected subtle fill (surface-secondary) with no border or elevation.' },
        { kind: 'changed', text: 'Switching between views moved to the new Segmented control; pill tabs are for filtering.' },
      ],
    },
    {
      version: '1.2.0', date: '2026-09-30',
      summary: 'Sub label and icon-only tabs',
      changes: [
        { kind: 'figma', text: 'subLabel (Figma 👁️ Sub label): an 8/10 second line under the label on chip (pill) tabs. New local text token text-semibold-08.' },
        { kind: 'added', text: 'hideLabel (Figma 👁️ Label): icon-only tab; the label stays as its accessible name.' },
        { kind: 'changed', text: 'Variants: 👁️ Label and 👁️ Sub label toggles for every tab.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-09-29',
      summary: 'Chip tabs are tappable surfaces',
      changes: [
        { kind: 'changed', text: 'Unselected chip (pill) tabs add elevation-low to their surface-primary + border-light.' },
        { kind: 'added', text: 'Chip tabs scale to motion-scale-press-default (0.98) while pressed.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: '8d68e35',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Underline and pill appearances, primary/secondary emphasis, md/sm sizes.' },
        { kind: 'added', text: 'Left and right icons per tab; bold width reserved so labels don’t jump.' },
        { kind: 'a11y', text: 'Arrow, Home and End keys; the selected tab scrolls into view.' },
      ],
    },
  ],

  actionbar: [
    {
      version: '1.4.0', date: '2026-10-10',
      summary: 'Title by screen level · Tertiary actions',
      changes: [
        { kind: 'changed', text: 'The title follows the screen\'s level: Heading/18 on an L1 screen (top level, no back or ✕ button), Heading/14 on an L2 screen (with one).' },
        { kind: 'changed', text: 'Icon actions are Tertiary Small, boxed (32 × 32 with the tertiary border) — the first choice. Ghost (no box) when the design asks for it.' },
        { dev: true, kind: 'fixed', text: 'ActionbarAction rendered a restyled Secondary button; it\'s a plain Tertiary Small now, with variant="ghost" as the option. The title size comes from onBack.' },
      ],
    },
    {
      version: '1.3.0', date: '2026-10-05',
      summary: 'Typography role rules',
      changes: [
        { kind: 'changed', text: 'Typography role rules: typed search text and its placeholder use Label (input text). Matches Figma.' },
      ],
    },
    {
      version: '1.2.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650). Search text uses Description.' },
      ],
    },
    {
      version: '1.1.1', date: '2026-10-04',
      summary: 'Typography tokens renamed',
      changes: [
        { dev: true, kind: 'changed', text: 'Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.' },
      ],
    },
    {
      version: 'unreleased', date: '2026-09-28',
      summary: 'Figma updated, code to follow',
      changes: [{ kind: 'figma', text: 'Figma’s Actionbar row now has an 8px gap between items. Not yet synced to code.' }],
    },
    {
      version: '1.1.0', date: '2026-09-29',
      summary: 'Shadow on scroll',
      changes: [
        { kind: 'added', text: 'elevation-low when content scrolls under the bar.' },
        { kind: 'changed', text: 'Rule: flat tabs at the top go in the bottom slot (docs demos updated).' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: 'c6b276f',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Back button, title and description, up to two round icon actions.' },
        { kind: 'added', text: 'Search mode, a bottom slot for tabs or filters, and sticky positioning.' },
      ],
    },
  ],

  'bottom-navbar': [
    {
      version: '1.1.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650).' },
      ],
    },
    {
      version: '1.0.1', date: '2026-10-04',
      summary: 'Typography tokens renamed',
      changes: [
        { dev: true, kind: 'changed', text: 'Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: 'da7f351',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Main nav plus Mutual Fund and F&O sub-navs with a Home item and separator.' },
        { kind: 'added', text: 'Figma nav icons: theme-aware outlines, brand artwork when selected.' },
        { kind: 'added', text: 'Animated switch between navs: the tapped option glides, the rest slide in.' },
      ],
    },
  ],

  'bottom-sheet': [
    {
      version: '2.3.3', date: '2026-10-10',
      summary: '48 × 48 touch area',
      changes: [
        { kind: 'changed', text: 'The header\'s icon buttons (back, ⓘ) have a touch area of at least 48 × 48 (was 32).' },
      ],
    },
    {
      version: '2.3.2', date: '2026-10-10',
      summary: 'Server rendering',
      changes: [
        { dev: true, kind: 'fixed', text: 'Renders on the server (Next.js): the stack level has a server value and the portal waits for the browser. A closed sheet used to throw during server rendering.' },
        { dev: true, kind: 'fixed', text: 'Development warnings no longer depend on Vite.' },
      ],
    },
    {
      version: '2.3.1', date: '2026-10-09',
      summary: 'Overlay is its own component',
      changes: [
        { kind: 'changed', text: 'The dimmed backdrop is now the shared Overlay component, so other modals can use it. No visual change.' },
        { kind: 'fixed', text: 'Slot names match Figma: footer is the Figma Utility slot (the button dock); utility is a code-only area under it.', dev: true },
      ],
    },
    {
      version: '2.3.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650). Large header description uses Description.' },
      ],
    },
    {
      version: '2.2.0', date: '2026-10-04',
      summary: 'Typography from Figma',
      changes: [
        { kind: 'figma', text: 'Header text matches Figma: small → Heading / primary 16 + Description 12; large → Heading / secondary 20 + Label / secondary 14.' },
      ],
    },
    {
      version: '2.1.1', date: '2026-10-01',
      summary: 'Overlay token',
      changes: [
        { kind: 'figma', text: 'The backdrop uses the new surface-overlay token (brand-tinted neutral at 80%) instead of black at 80%.' },
      ],
    },
    {
      version: '2.1.0', date: '2026-09-30',
      summary: 'Stacking rule: back button only on a second sheet',
      changes: [
        { kind: 'added', text: 'Rule: at most 2 sheets. The first sheet over a screen has no back button; a second sheet on top of it does. Never open a third.' },
        { dev: true, kind: 'changed', text: 'BottomSheetHeader hides onBack on the first sheet inside a modal BottomSheet (development warning).' },
        { kind: 'changed', text: 'Demo: the Buy sheet’s ⓘ opens an “Order types” sheet on top, with back. Playground back button is off by default.' },
      ],
    },
    {
      version: '2.0.0', date: '2026-09-30',
      summary: 'Invisible closing, all Figma properties',
      changes: [
        { kind: 'changed', text: 'Removed the drag handle and the header close button. Sheets close by tapping the backdrop or dragging.' },
        { kind: 'added', text: 'The whole sheet drags to dismiss: header and footer always, the content once scrolled to the top. Top sheets drag up.' },
        { kind: 'a11y', text: 'A visually hidden Close button (closeLabel) for screen-reader and keyboard users; Esc still closes.' },
        { kind: 'figma', text: '👁️ Content Slot: leaving out children hides the content area and its padding.' },
        { kind: 'added', text: 'Playground use case: “Set Auto TP/SL” (Dev handoff 4292:34429) — interactive TP / SL cards, steppers, trail checkbox and a Save dock, built from L3 components.' },
        { kind: 'changed', text: 'Playground covers every Figma property (isBottom, header, description, back, info, right slot, content bottom, H-Icon, header tag, content, buttons, utility). New USAGE.md.' },
      ],
    },
    {
      version: '1.3.0', date: '2026-09-30',
      summary: 'Header content-bottom slot (Figma Latest)',
      changes: [
        { kind: 'figma', text: 'BottomSheetHeader bottom: Figma "Content bottom" slot under the small header row, for tabs or search.' },
        { kind: 'figma', text: 'Large header: bottom padding 24 → 0, matching Version=Latest.' },
        { kind: 'changed', text: 'Docs: the Buy sheet demo puts Delivery / Intraday tabs in the header slot; the playground footer is a Button dock; Variants shows the Content bottom header.' },
      ],
    },
    {
      version: '1.2.0', date: '2026-09-26', commit: '2998418',
      summary: 'Material Symbols icons',
      changes: [iconsMigration()],
    },
    {
      version: '1.1.0', date: '2026-09-26', commit: '2c82c18',
      summary: 'Accessibility pass',
      changes: [
        { kind: 'a11y', text: 'The ⓘ info icon became a real button with a 32px tap area.' },
        { kind: 'a11y', text: 'The page behind an open sheet is inert.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: '502d127',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Modal sheet with focus trap; closes on Esc, backdrop or drag down.' },
        { kind: 'added', text: 'Small and large headers, bottom and top placement, embeddable surface.' },
      ],
    },
  ],

  aerobar: [
    {
      version: '1.4.1', date: '2026-10-10',
      summary: 'Wider browser support',
      changes: [
        { dev: true, kind: 'changed', text: 'The 60% / 80% paragraph colours use color-mix() instead of relative rgb(from …): identical colours, and they work back to Chrome 111 / Safari 16.2.' },
      ],
    },
    {
      version: '1.4.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650).' },
      ],
    },
    {
      version: '1.3.1', date: '2026-10-04',
      summary: 'Typography tokens renamed',
      changes: [
        { dev: true, kind: 'changed', text: 'Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.' },
      ],
    },
    {
      version: '1.3.0', date: '2026-09-28', commit: '1718d5d',
      summary: 'Figma color update',
      changes: [
        { kind: 'figma', text: 'Soft bars: paragraph is content-secondary at 60%.' },
        { kind: 'figma', text: 'Solid Danger and Success use static white text (stays white in dark mode).' },
        { kind: 'figma', text: 'The action keeps Figma’s dark state layer on every bar.' },
      ],
    },
    {
      version: '1.2.0', date: '2026-09-26', commit: '6bd8853',
      summary: 'New action button',
      changes: [
        { kind: 'figma', text: 'Action is now a small Ghost button centred in a 48px slot (was a borderless Secondary).' },
        { kind: 'figma', text: 'Floating solid warning uses black text, like the inline one.' },
        { kind: 'fixed', text: 'Docs styles no longer leak into the bar’s text.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-09-26', commit: '2998418',
      summary: 'Material Symbols icons',
      changes: [iconsMigration()],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: '8c782ef',
      summary: 'First release',
      changes: [
        { kind: 'added', text: '5 types × soft/solid × inline/floating (toast).' },
        { kind: 'a11y', text: 'Announced as a status; danger as an alert.' },
      ],
    },
  ],

  'empty-state': [
    {
      version: '1.2.0', date: '2026-10-05',
      summary: 'Typography role rules',
      changes: [
        { kind: 'changed', text: 'Typography role rules: the line under the title uses Description (it describes the heading). Matches Figma.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650).' },
      ],
    },
    {
      version: '1.0.1', date: '2026-10-04',
      summary: 'Typography tokens renamed',
      changes: [
        { dev: true, kind: 'changed', text: 'Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: '82cf523',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Illustration, heading, description and an action slot.' },
        { kind: 'added', text: 'No-results illustration with every fill bound to a theme token.' },
      ],
    },
  ],

  'list-cell': [
    {
      version: '1.6.0', date: '2026-10-10',
      summary: 'Compact or breathable',
      changes: [
        { kind: 'added', text: 'Two densities for flat rows, in both sizes: compact (8 above and below — the default) and breathable (16 — 74px default rows, 70px small) for asset lists: logo, name and company, price and change. Card rows always keep their spacing.' },
        { kind: 'figma', text: 'Flat L3: list cell rows read their top and bottom padding from the new 📐 L3 → Density collection: set Compact (default) or Breathable on the list frame — no extra variants. Card rows are fixed at spacing/12.' },
        { dev: true, kind: 'added', text: 'density="compact" | "breathable" on flat rows (default compact); TypeScript rejects it on variant="card".' },
      ],
    },
    {
      version: '1.5.0', date: '2026-10-09',
      summary: 'Multi-line description',
      changes: [
        { kind: 'added', text: 'isMultiline: the description can wrap onto several lines instead of ending in "…" on one line. The label stays on one line.' },
        { kind: 'figma', text: 'L3: list cell gets isMultiline = False · True (pending — added in the library next).' },
        { kind: 'added', text: 'multiline prop.', dev: true },
      ],
    },
    {
      version: '1.4.0', date: '2026-10-09',
      summary: 'Follows the Card rules',
      changes: [
        { kind: 'changed', text: 'A list cell is a card with specific content, so it follows Card: a card row that isn\'t tappable has no fill (it takes the colour it sits on) and border-light; a tappable card row is surface-primary + border-light + elevation-low and scales to 0.98 when pressed.' },
        { kind: 'figma', text: 'L3: list cell gets isTappable = True · False (selected only when tappable).' },
        { kind: 'changed', text: 'Tappable = onClick, href or as="label" — no new prop.', dev: true },
      ],
    },
    {
      version: '1.3.0', date: '2026-10-09',
      summary: 'Selected rows, no fill on plain rows',
      changes: [
        { kind: 'added', text: 'Selected state for tappable rows: plain rows get a surface-secondary background, card rows swap border-light for border-dark.' },
        { kind: 'changed', text: 'Plain rows have no fill — they take the colour of whatever they sit on — and run edge to edge. Card rows always sit inside a margin.' },
        { kind: 'figma', text: 'L3: list cell gets isSelected = True for every isSmall × isPlain; plain rows lose their surface-primary fill.' },
        { kind: 'added', text: 'selected prop (aria-pressed / aria-current; warns on a row that isn\'t tappable).', dev: true },
      ],
    },
    {
      version: '1.2.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650).' },
      ],
    },
    {
      version: '1.1.1', date: '2026-10-04',
      summary: 'Typography tokens renamed',
      changes: [
        { dev: true, kind: 'changed', text: 'Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.' },
      ],
    },
    {
      version: '1.1.0', date: '2026-09-26', commit: '2c82c18',
      summary: 'Accessibility pass',
      changes: [
        { kind: 'a11y', text: 'Dots have screen-reader text (dotLabel, default “New”).' },
        { kind: 'a11y', text: 'Development warning when a button row contains another control.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: 'fade2f4',
      summary: 'First release',
      changes: [{ kind: 'added', text: 'Plain and card rows, md/sm, icons, trailing content, dots; renders as div, button, link or label.' }],
    },
  ],

  tag: [
    {
      version: '2.2.0', date: '2026-10-05',
      summary: 'New type weights',
      changes: [
        { kind: 'changed', text: 'Text uses the three typography roles: titles Heading (750), labels Label (650).' },
      ],
    },
    {
      version: '2.1.1', date: '2026-10-04',
      summary: 'Typography tokens renamed',
      changes: [
        { dev: true, kind: 'changed', text: 'Text tokens renamed to the Figma roles (e.g. --l3-text-label-12). No visual change.' },
      ],
    },
    {
      version: '2.1.0', date: '2026-10-02',
      summary: 'White text on solid success and error',
      changes: [
        { kind: 'figma', text: 'Primary (solid) success and error tags use static-white text and icons, like profit and loss (was content-inverted, which turned black in dark mode).' },
        { kind: 'figma', text: 'Checked the rest against Figma: sizes 16/20/24, padding, radius 4, icon sizes 12/16/18, all 12 colors × primary/secondary/tertiary and disabled — unchanged. Figma’s text styles are now named “Label - SB/10 · 12 · 14” (same values).' },
      ],
    },
    {
      version: '2.0.0', date: '2026-09-30',
      summary: 'Figma color set: profit, loss, zing, processing',
      changes: [
        { kind: 'figma', text: 'Colors follow Figma: neutral, profit, loss, success, error, warning, discover, processing, indigo, teal, purple, zing.' },
        { kind: 'added', text: 'profit / loss use indicator-up·down tokens (white text on solid); zing uses the zing accent.' },
        { kind: 'changed', text: 'Renamed green → success, red → error, yellow → warning, orange → processing. The old names still work (deprecated).' },
        { kind: 'figma', text: 'Neutral Secondary / Tertiary background: surface-tertiary → surface-secondary.' },
        { kind: 'added', text: 'hideLabel (Figma 👁️ Label): icon-only square tag; the label stays as screen-reader text.' },
        { kind: 'changed', text: 'Docs demos: price changes and Buy/Sell sides use profit / loss, order status uses processing / error.' },
      ],
    },
    {
      version: '1.2.0', date: '2026-09-26', commit: '2998418',
      summary: 'Material Symbols icons',
      changes: [iconsMigration()],
    },
    {
      version: '1.1.0', date: '2026-09-26', commit: '2c82c18',
      summary: 'Accessibility pass',
      changes: [{ dev: true, kind: 'a11y', text: 'Removed aria-disabled from static tags (they aren’t controls).' }],
    },
    {
      version: '1.0.1', date: '2026-09-26', commit: '8d68e35',
      summary: 'L3 naming',
      changes: [{ kind: 'fixed', text: 'Text style references renamed from D2 to L3.' }],
    },
    {
      version: '1.0.0', date: '2026-09-26', commit: '294656a',
      summary: 'First release',
      changes: [{ kind: 'added', text: 'Primary, secondary and tertiary × 9 colors × 3 sizes, plus disabled.' }],
    },
  ],
}

/** The latest shipped version (skips 'unreleased'). */
export const currentVersion = (pageId: string) => changelog[pageId]?.find((r) => r.version !== 'unreleased')?.version

/** Latest releases across all pages, for the home page. */
export const recentReleases = (limit = 6) =>
  Object.entries(changelog)
    .flatMap(([pageId, releases]) => releases.filter((r) => r.version !== 'unreleased').slice(0, 1).map((r) => ({ pageId, ...r })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
