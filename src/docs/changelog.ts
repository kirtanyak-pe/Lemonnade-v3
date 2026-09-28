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
  text: 'Icons now come from the Material Symbols Rounded library (weight 400, 24dp) and take the text colour.',
})

export const changelog: Record<string, Release[]> = {
  card: [
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
        { kind: 'figma', text: 'Artwork exported from Figma; every colour is a token (Lemonn and honey brand ramps, theme wordmark).' },
        { kind: 'changed', text: 'The lemon leaf stays on the Lemonn ramp in every product theme (Figma binds it to the theme brand colour).' },
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
      changes: [{ kind: 'changed', text: 'Icon slots use the shared MaskIcon, so icons always match the label colour.' }],
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
      summary: 'Figma colour update',
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
      changes: [{ kind: 'added', text: 'Primary, secondary and tertiary × 9 colours × 3 sizes, plus disabled.' }],
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
