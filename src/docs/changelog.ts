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
  changes: { kind: ChangeKind; text: string }[]
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
  colors: [
    {
      version: '1.1.0', date: '2026-10-01',
      summary: '♿ Accessible themes and Figma token sync',
      changes: [
        { kind: 'added', text: '5 ♿ Accessible themes (Figma "♿ Accessible" modes) for every brand and mode: higher-contrast secondary/tertiary text, stronger dark-mode borders, one-step-stronger accents. Turn on with data-contrast="accessible" or the ♿ button in the header.' },
        { kind: 'figma', text: 'New surface/overlay (the brand’s darkest neutral at 80%) and gradient-stop-0/static/white · black.' },
        { kind: 'figma', text: 'surface/accent/us-stock-default is now blue-500 in Lemonn and Kuber dark (was 400) — first split from discover.' },
        { kind: 'changed', text: 'New Colors page: how the three color layers work, every semantic token with “use for” guidance, live hex + alias per theme, an accent matrix, button and state-layer tokens, base palette, and a 10-theme comparison. Filter and click-to-copy.' },
        { kind: 'added', text: 'Accent groups: Brand · Market indicators (profit / loss) · Status (success, warning, error, discover, orange) · Sub-brands (US stocks, Zing) · Miscellaneous (purple, indigo, teal — exceptional cases only). Also in DESIGN_SYSTEM.md 3.1.' },
        { kind: 'changed', text: 'Accents are shown as one table per group, and border tokens are previewed as outlines instead of fills.' },
        { kind: 'changed', text: '“How color works” is now a live token flow (base → semantic → component → UI) built around green — profit and success, surface/content/border, Button and Tag — with hover-to-trace, plus four illustrated rule cards.' },
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
  card: [
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
        { kind: 'added', text: 'variant="flat": not rounded, no border, no shadow, transparent background; still clickable.' },
        { kind: 'added', text: 'surface prop to set a card background manually (surface tokens only).' },
        { kind: 'changed', text: 'Static cards (rounded + border/light) use surface/default; clickable cards stay surface/primary.' },
      ],
    },
    {
      version: '1.0.0', date: '2026-09-29',
      summary: 'First release',
      changes: [
        { kind: 'added', text: 'Clickable cards (onClick / href): surface/primary, border/light, elevation-low, press scale 0.98.' },
        { kind: 'added', text: 'Static cards for information or decoration: surface/primary + border/light, no shadow or press.' },
        { kind: 'a11y', text: 'Development warnings: a clickable card with controls inside, or a static card holding a single action.' },
      ],
    },
  ],

  'brand-logo': [
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
      version: '1.0.0', date: '2026-09-26', commit: '2998418',
      summary: 'Full Material Symbols Rounded library',
      changes: [
        { kind: 'added', text: '3,900+ icons (outlined + filled), weight 400, grade 0, 24dp optical size, downloaded from Google.' },
        { kind: 'added', text: '<Icon> component with size tokens and an optional label for meaningful icons.' },
        { kind: 'added', text: 'npm run icons to pull new icons; only imported icons end up in the app.' },
      ],
    },
  ],

  button: [
    {
      version: '1.4.1', date: '2026-10-01',
      summary: 'CS PRO primary is gold',
      changes: [
        { kind: 'figma', text: 'CS PRO: Primary button uses the brand gold (surface/accent/brand-default) with white text. ♿ Accessible CS PRO keeps the inverted primary, and Buy uses success green.' },
      ],
    },
    {
      version: '1.4.0', date: '2026-09-30',
      summary: 'Label & icon rule, usage rules',
      changes: [
        { kind: 'changed', text: 'At least one of label / iconLeft / iconRight must show, and icon-only buttons have exactly one icon — enforced in TypeScript, with a runtime fallback (left icon wins).' },
        { kind: 'added', text: 'Usage rules in src/components/Button/USAGE.md: secondary only next to a stronger button, tertiary when alone (View all), Large only in docks.' },
        { kind: 'added', text: 'ButtonGroup warns in development when a button isn’t size="lg".' },
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
        { kind: 'changed', text: 'Tap area grows to 32px (size/tap-target) without changing the drawn size.' },
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
        { kind: 'a11y', text: 'Development warnings: non-Large buttons, no strong button (secondary alone), missing aria-label.' },
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
        { kind: 'added', text: 'Medium and small sizes, role="switch" on a native checkbox.' },
        { kind: 'added', text: 'Knob slides between states (respects reduced motion).' },
      ],
    },
  ],

  tabs: [
    {
      version: '1.4.0', date: '2026-10-02',
      summary: 'Pill group',
      changes: [
        { kind: 'figma', text: 'Figma “L3: Tabs” is now “L3: Tabs group” (Type: Flat tabs · Pill tabs · Pill group); base tab isChip is now isPill.' },
        { kind: 'added', text: 'appearance="pill-group": tertiary pills in a surface/secondary track for switching views (Tree / List). Selected pill is a black fill; the rest blend into the track.' },
        { kind: 'changed', text: 'The separate SegmentedControl component is gone — Figma merged it into the Tabs group as Pill group. Use <Tabs appearance="pill-group"> instead.' },
      ],
    },
    {
      version: '1.3.0', date: '2026-10-02',
      summary: 'Tertiary chips',
      changes: [
        { kind: 'figma', text: 'Figma Type is now Primary · Secondary · Tertiary, each with a selected and an unselected look (Ghost removed, typos fixed).' },
        { kind: 'added', text: 'emphasis="tertiary": selected black fill, unselected subtle fill (surface/secondary) with no border or elevation.' },
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
        { kind: 'changed', text: 'Unselected chip (pill) tabs add elevation-low to their surface/primary + border/light.' },
        { kind: 'added', text: 'Chip tabs scale to motion/scale/press-default (0.98) while pressed.' },
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
      version: 'unreleased', date: '2026-09-28',
      summary: 'Figma updated, code to follow',
      changes: [{ kind: 'figma', text: 'Figma’s Actionbar row now has an 8px gap between items. Not yet synced to code.' }],
    },
    {
      version: '1.1.0', date: '2026-09-29',
      summary: 'Shadow on scroll',
      changes: [
        { kind: 'added', text: 'elevation-low when content scrolls under the bar: automatic with sticky, or via the new elevated prop.' },
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
      version: '2.1.1', date: '2026-10-01',
      summary: 'Overlay token',
      changes: [
        { kind: 'figma', text: 'The backdrop uses the new surface/overlay token (brand-tinted neutral at 80%) instead of black at 80%.' },
      ],
    },
    {
      version: '2.1.0', date: '2026-09-30',
      summary: 'Stacking rule: back button only on a second sheet',
      changes: [
        { kind: 'added', text: 'Rule: at most 2 sheets. The first sheet over a screen has no back button; a second sheet on top of it does. A third warns in development.' },
        { kind: 'changed', text: 'BottomSheetHeader hides onBack on the first sheet inside a modal BottomSheet (development warning).' },
        { kind: 'changed', text: 'Demo: the Buy sheet’s ⓘ opens an “Order types” sheet on top, with back. Playground back button is off by default.' },
      ],
    },
    {
      version: '2.0.0', date: '2026-09-30',
      summary: 'Invisible closing, all Figma properties',
      changes: [
        { kind: 'changed', text: 'Removed the drag handle (dragHandle prop) and the header close button (BottomSheetHeader onClose). Sheets close by tapping the backdrop or dragging.' },
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
      version: '1.3.0', date: '2026-09-28', commit: '1718d5d',
      summary: 'Figma color update',
      changes: [
        { kind: 'figma', text: 'Soft bars: paragraph is content/secondary at 60%.' },
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
      version: '2.1.0', date: '2026-10-02',
      summary: 'White text on solid success and error',
      changes: [
        { kind: 'figma', text: 'Primary (solid) success and error tags use static/white text and icons, like profit and loss (was content/inverted, which turned black in dark mode).' },
        { kind: 'figma', text: 'Checked the rest against Figma: sizes 16/20/24, padding, radius 4, icon sizes 12/16/18, all 12 colors × primary/secondary/tertiary and disabled — unchanged. Figma’s text styles are now named “Label - SB/10 · 12 · 14” (same values).' },
      ],
    },
    {
      version: '2.0.0', date: '2026-09-30',
      summary: 'Figma color set: profit, loss, zing, processing',
      changes: [
        { kind: 'figma', text: 'Colors follow Figma: neutral, profit, loss, success, error, warning, discover, processing, indigo, teal, purple, zing.' },
        { kind: 'added', text: 'profit / loss use indicator/up·down tokens (white text on solid); zing uses the zing accent.' },
        { kind: 'changed', text: 'Renamed green → success, red → error, yellow → warning, orange → processing. The old names still work (deprecated).' },
        { kind: 'figma', text: 'Neutral Secondary / Tertiary background: surface/tertiary → surface/secondary.' },
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
      changes: [{ kind: 'a11y', text: 'Removed aria-disabled from static tags (they aren’t controls).' }],
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
