import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { lmSwitchArrowHorizontal, lmSwitchArrowVertical } from '../icons/lemonnade'
import { Aerobar } from '../components/Aerobar'
import { Tag } from '../components/Tag'
import { ButtonPreview } from '../preview/ButtonPreview'
import { TagPreview } from '../preview/TagPreview'
import { SwitchVariants } from '../preview/SwitchVariants'
import { SelectionVariants } from '../preview/SelectionVariants'
import { TabsVariants } from '../preview/TabsVariants'
import { ButtonGroupVariants } from '../preview/ButtonGroupVariants'
import { BottomSheetVariants } from '../preview/BottomSheetVariants'
import { AerobarVariants } from '../preview/AerobarVariants'
import { TextFieldVariants } from '../preview/TextFieldVariants'
import { ListCellVariants } from '../preview/ListCellVariants'
import { ActionbarVariants } from '../preview/ActionbarVariants'
import { BottomNavbarVariants } from '../preview/BottomNavbarVariants'
import { EmptyStateVariants } from '../preview/EmptyStateVariants'
import { BrandLogoVariants } from '../preview/BrandLogoVariants'
import { CardVariants } from '../preview/CardVariants'
import { BrandLogo } from '../components/BrandLogo'
import { StepperVariants } from '../preview/StepperVariants'
import { SelectVariants } from '../preview/SelectVariants'
import { SkeletonVariants } from '../preview/SkeletonVariants'
import { ProgressBarVariants } from '../preview/ProgressBarVariants'
import { ChartVariants } from '../preview/ChartVariants'
import { DatePickerVariants } from '../preview/DatePickerVariants'
import { PriceChangeVariants } from '../preview/PriceChangeVariants'
import { SectionHeaderVariants } from '../preview/SectionHeaderVariants'
import { ColorsPage } from './colors/ColorsPage'
import { TypographyPage } from './typography/TypographyPage'
import { LayoutPage } from './layout/LayoutPage'
import { LayeringPage } from './layering/LayeringPage'
import { SelectionPage } from './patterns/SelectionPage'
import { NumbersPreview } from '../preview/NumbersPreview'
import { AccountDemo, AppNavDemo, EmptySearchDemo, OrdersDemo, FiltersDemo, StockDetailDemo, OrderFormDemo, OrderReviewDemo, SheetsDemo, ToastDemo, PortfolioDemo, SettingsDemo, TradeTicketDemo, WatchlistDemo } from './demos'
import { PhoneFrame } from './PhoneFrame'
import { IconsBrowserLazy } from './IconsBrowserLazy'
import { HomePage } from './HomePage'
import { DevOnly } from './DevOnly'
import type { DocPage } from './types'
import styles from './Docs.module.css'

/** Lifecycle: explicit `progress`, else done for Figma-synced pages. */
export const progressOf = (p: DocPage) => p.progress ?? (p.status === 'Figma synced' ? 'done' : undefined)

/** Header tag for each lifecycle state (Tag colors: success = finished, warning = in progress, processing = ongoing). */
export const progressTags = {
  done: { label: 'Completed', color: 'success' },
  wip: { label: 'WIP', color: 'warning' },
  'next-wip': { label: 'Next version WIP', color: 'processing' },
  discarded: { label: 'Not in use · Discarded', color: 'neutral' },
  replaced: { label: 'Replaced', color: 'neutral' },
} as const

const FIGMA_FILE = 'https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/'
export const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(':', '-')}`

const buttonVariants = ['primary', 'secondary', 'tertiary', 'ghost', 'brand', 'buy', 'sell'] as const

export const pages: DocPage[] = [
  {
    id: 'home',
    title: 'Home',
    group: 'Start',
    description: 'Lemonnade V3 components, tokens and guidelines.',
    content: <HomePage />,
  },

  // ---- Foundations --------------------------------------------------------
  {
    id: 'colors',
    progress: 'done',
    title: 'Colors',
    group: 'Foundations',
    description: 'How Lemonnade color works: semantic tokens by role, the 13 accent families, component tokens and the base palette — for all 10 themes (5 brands × modes, plus ♿ Accessible).',
    content: <ColorsPage />,
  },
  {
    id: 'typography',
    progress: 'wip',
    title: 'Typography',
    group: 'Foundations',
    description: 'Manrope in three roles — Heading (750), Label (650) and Description (500) — 20 text styles, each a single font token.',
    content: <TypographyPage />,
  },
  {
    id: 'spacing',
    progress: 'done',
    title: 'Spacing & radius',
    group: 'Foundations',
    description: 'Spacing, radius, size and icon-size tokens from the Figma "🌌 Number" and "Icon size" collections.',
    content: <NumbersPreview />,
  },
  {
    id: 'layout',
    progress: 'done',
    title: 'Layout',
    group: 'Foundations',
    description: 'How a screen is spaced: 16 page padding, sections 24 apart (32 for a bigger break), 16 from a section heading to its card, and 12 inside every card.',
    content: <LayoutPage />,
  },
  {
    id: 'layering',
    progress: 'done',
    title: 'Layering',
    group: 'Foundations',
    description: 'How surfaces stack, from the screen up to a second bottom sheet: what lives on each layer, its surface and its shadow.',
    content: <LayeringPage />,
  },

  {
    id: 'icons',
    progress: 'done',
    title: 'Icons',
    group: 'Foundations',
    description: 'The full Material Symbols set — Rounded, weight 400, grade 0, optical size 24dp, fill off (with the filled variant). Search, copy as SVG or download any icon.',
    content: (
      <>
        <section className={styles.section}>
          <h2>Using an icon</h2>
          <p>In Figma, place icons from the <strong>👁️ Lemonnade V3 → Icons</strong> library and swap them through a component's ↪ icon properties. Every icon is Material Symbols Rounded (weight 400, grade 0, 24dp) — never mix in another icon set or the 48px version.</p>
          <ul>
            <li><strong>Size:</strong> 24 by default; 16 inside small buttons, tabs and tags; 12–24 from the icon-size variables.</li>
            <li><strong>Color:</strong> icons take the color of the text next to them — use content color variables, never a custom color.</li>
            <li><strong>Fill off</strong> is the default; the filled version marks a selected or active state.</li>
            <li>Missing an icon in Figma? Find it below, <strong>Copy SVG</strong> and paste it into Figma, or download it.</li>
          </ul>
        </section>
        <section className={styles.section}>
          <h2>Lemonnade icons</h2>
          <p>A few icons are drawn for Lemonnade and aren't in Material Symbols. They live in the same <strong>👁️ Lemonnade V3 → Icons</strong> library and follow the same size and color rules.</p>
          <ul>
            <li><Icon icon={lmSwitchArrowVertical} size={20} label="Switch arrow, vertical" /> <strong>Switch arrow toggle · ↕</strong> — the toggle in the Select switcher: switches between a few modes (Quantity ⇄ Amount).</li>
            <li><Icon icon={lmSwitchArrowHorizontal} size={20} label="Switch arrow, horizontal" /> <strong>Switch arrow toggle · ↔</strong> — the same toggle, sideways.</li>
          </ul>
          <DevOnly><p><code>import {'{'} lmSwitchArrowVertical, lmSwitchArrowHorizontal {'}'} from './icons/lemonnade'</code>, then <code>&lt;Icon icon={'{'}lmSwitchArrowVertical{'}'} /&gt;</code>. Prefix <code>lm</code>; add one only when it's a Lemonnade drawing in the Figma icons library.</p></DevOnly>
        </section>
        <DevOnly>
          <section>
            <h2>Using an icon in code</h2>
            <pre><code>{`import { Icon } from './components/Icon'
import { msWallet, msWalletFill } from './icons/material'

<Icon icon={msWallet} size={24} />            // decorative
<Icon icon={msWalletFill} label="Wallet" />    // meaningful → announced
<Button iconLeft={<Icon icon={msAdd} />}>Add funds</Button>`}</code></pre>
            <p>Only the icons you import end up in the app. Color comes from the surrounding text color; sizes use the icon-size tokens (12–24). Run <code>npm run icons</code> to pull new icons from Google. Import name: <code>ms</code> + the icon name in PascalCase (<code>content_copy</code> → <code>msContentCopy</code>, filled: <code>msContentCopyFill</code>).</p>
          </section>
        </DevOnly>
        <IconsBrowserLazy />
      </>
    ),
  },

  {
    id: 'brand-logo',
    title: 'Brand logo',
    group: 'Foundations',
    description: 'The Lemonn, Zing and Coinswitch logos: full (mark + wordmark) or just the mark, at 24–48px high.',
    status: 'Figma synced',
    altNames: 'Logo, logotype, wordmark, brand mark, app icon',
    figmaNodeId: '4735:1466',
    source: 'src/components/BrandLogo',
    exports: ['BrandLogo'],
    tokens: ['base/hue/brand-lemonn-500 · 700 (Lemonn mark)', 'surface/inverted (Lemonn wordmark)', 'base/hue/honey-300 → 500 (Zing gradient)', 'base/hue/brand-coinswitch-green · deep (local, raw in Figma)', 'size/24 · 32 · 40 · 48'],
    overview: (
      <>
        <div className={styles.logoHero}>
          <BrandLogo brand="lemonn" size={48} />
          <BrandLogo brand="zing" size={48} />
        </div>
        <section className={styles.section}>
          <h2>Full or mark</h2>
          <p>Use the full logo (isFull = True) where there's room: headers, splash, sign-in. Use the mark (isFull = False) in tight spots like avatars, app bars and list rows. Both come in 24, 32, 40 and 48px heights; the width follows the logo's proportions.</p>
          <DevOnly><p>Use the full logo where there's room: headers, splash, sign-in. Use the mark (<code>variant="icon"</code>) in tight spots like avatars, app bars and list rows. Both come in 24, 32, 40 and 48px heights; the width follows the logo's proportions.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Colors stay on brand</h2>
          <p>The lemon leaf uses the Lemonn brand ramp and Zing uses its honey gradient, in every product theme — a Lemonn logo stays lime even in CS PRO or Kuber. Coinswitch keeps its two greens; its dot and “coin” follow the theme like the Lemonn wordmark. Only the Lemonn wordmark follows the theme, so it reads on light and dark pages. (Figma binds the leaf to the theme's brand color, which would repaint it per product; the code keeps it on the Lemonn ramp.)</p>
        </section>
        <section className={styles.section}>
          <h2>Accessibility</h2>
          <p>Screen readers read the logo as its brand name. If the brand name is already written next to it, note in the handoff that the logo is decorative.</p>
          <DevOnly><p>The logo is announced as its brand name. Pass <code>label</code> for something more specific ("Lemonn home"), or <code>decorative</code> when the name is already written next to it.</p></DevOnly>
        </section>
      </>
    ),
    variants: <BrandLogoVariants />,
    props: [
      { name: 'brand', type: "'lemonn' | 'zing' | 'coinswitch'", description: 'Figma Brand.' },
      { name: 'variant', type: "'full' | 'icon'", default: "'full'", description: 'Figma isFull: mark + wordmark, or the 24×24 mark.' },
      { name: 'size', type: '24 | 32 | 40 | 48', default: '24', description: 'Height in px from the size tokens; width keeps the proportions.' },
      { name: 'label', type: 'string', description: 'Accessible name; defaults to the brand name.' },
      { name: 'decorative', type: 'boolean', default: 'false', description: 'Hide from screen readers when the name is written next to it.' },
    ],
  },

  // ---- Action ---------------------------------------------------------------
  // ---- Patterns -------------------------------------------------------------
  {
    id: 'selection',
    progress: 'done',
    title: 'Selection',
    group: 'Patterns',
    description: 'How every component shows a choice: the shared cues, strong vs subtle, single and multi-select, which component for which job, and accessibility.',
    content: <SelectionPage />,
  },

  {
    id: 'button',
    title: 'Button',
    group: 'Action',
    description: 'Buttons let people take an action, confirm a choice or move forward in a flow.',
    status: 'Figma synced',
    altNames: 'Action, call to action, CTA',
    figmaNodeId: '4471:29225',
    source: 'src/components/Button',
    exports: ['Button'],
    tokens: ['component/button/*', 'state-layer/*', 'Heading/14 · 16', 'Label/12', 'size/control-sm · md · lg', 'radius/08 · 12', 'icon-size/16 · 20 · 24', 'size/tap-target'],
    overview: (
      <>
        <PhoneFrame label="Order ticket using Buy and Sell buttons">
          <TradeTicketDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Types</h2>
          <p>Seven types. Buy and Sell carry trade actions; Brand follows the product color (Lemonn lime, CS PRO gold, Kuber green).</p>
          <div className={styles.demoRow}>
            {buttonVariants.map((v) => (
              <Button key={v} variant={v} size="md">{v[0].toUpperCase() + v.slice(1)}</Button>
            ))}
          </div>
        </section>
        <section className={styles.section}>
          <h2>Sizes</h2>
          <p>Large (48), Medium (40) and Small (32). Every size has at least a 32px tap area.</p>
          <div className={styles.demoRow}>
            <Button size="lg">Large</Button>
            <Button size="md">Medium</Button>
            <Button size="sm">Small</Button>
          </div>
        </section>
        <section className={styles.section}>
          <h2>Secondary, tertiary and docks</h2>
          <p>Secondary (dark border) only appears next to a stronger button — primary, buy, sell or brand — usually in a sheet's button dock. On its own, on the page or inside a card, use tertiary instead (e.g. <em>View all</em> at the end of a list). Buttons in a dock or ButtonGroup are always Large.</p>
        </section>
        <section className={styles.section}>
          <h2>Label and icons</h2>
          <p>👁️ Label, ↪ Icon-L and ↪ Icon-R can each be hidden, but at least one must show. An icon-only button has exactly one icon — and the handoff needs the action's name (e.g. "Share") for screen readers.</p>
          <DevOnly><p>Label, left icon and right icon can each be hidden, but at least one must show, and an icon-only button has exactly one icon (plus an <code>aria-label</code>). TypeScript rejects the other combinations.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>States</h2>
          <p>Loading keeps the button's width and ignores taps. Disabled uses the theme's disabled tokens.</p>
          <div className={styles.demoRow}>
            <Button variant="buy" size="md" loading>Buy</Button>
            <Button variant="buy" size="md" disabled>Buy</Button>
          </div>
        </section>
      </>
    ),
    variants: <ButtonPreview />,
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'tertiary' | 'ghost' | 'brand' | 'buy' | 'sell'", default: "'primary'", description: 'Figma Type.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'lg'", description: 'Figma Size: Small 32, Medium 40, Large 48.' },
      { name: 'loading', type: 'boolean', default: 'false', description: 'Figma State=♻︎ Loading. Shows the loader, keeps the width, ignores clicks, sets aria-busy.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Figma State=🚫 Disabled.' },
      { name: 'children', type: 'ReactNode', description: 'The label (Figma 👁️ Label). Leave it out for an icon button: then pass exactly one icon and aria-label.' },
      { name: 'aria-label', type: 'string', description: 'Required for an icon button (no label). Names the action, e.g. "Share".' },
      { name: 'iconLeft', type: 'ReactNode', description: 'Figma icon-l slot, sized and colored by the button.' },
      { name: 'iconRight', type: 'ReactNode', description: 'Figma icon-r slot.' },
      { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch to the container width.' },
      { name: '…button props', type: 'ButtonHTMLAttributes', description: 'onClick, type (defaults to "button"), aria-*, etc.' },
    ],
  },

  {
    id: 'button-group',
    title: 'Button dock',
    group: 'Action',
    description: 'A bar at the bottom of a screen or sheet that holds its main actions — stacked full-width, or side by side.',
    status: 'Figma synced',
    altNames: 'Button group, ButtonGroup, action bar, sticky footer, CTA bar',
    figmaNodeId: '4471:29456',
    source: 'src/components/ButtonGroup',
    exports: ['ButtonGroup'],
    tokens: ['surface/default (static)', 'surface/primary (clickable)', 'border/light', 'spacing/12 · 16', 'shadow/elevation-high', 'motion/* (local)'],
    overview: (
      <>
        <PhoneFrame label="Order review with a vertical button group that lifts while content scrolls under it">
          <OrderReviewDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Direction</h2>
          <p>Vertical stacks full-width buttons with the primary on top. Horizontal shares the width equally with the primary on the right — the Order ticket and Filters demos use it.</p>
        </section>
        <section className={styles.section}>
          <h2>What goes in a dock</h2>
          <p>The main action(s) of a screen or sheet, always Large: one strong button (primary, buy, sell or brand), optionally a secondary next to it, or sell + buy. Figma's bottom-sheet footer also stacks a ghost option last with helper text below. One dock per screen.</p>
          <DevOnly><p>The main action(s) of a screen or sheet, always Large: one strong button (primary, buy, sell or brand), optionally a secondary next to it, or sell + buy. Figma's bottom-sheet footer also stacks a ghost option last with helper text below. One dock per screen, and name it with <code>aria-label</code>.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Scroll indicator</h2>
          <p>Figma's "Scroll indicator" adds the elevation-high shadow so the bar reads as floating over content. Turn it on while there's more content below — scroll the order above to the end and it fades away.</p>
        </section>
      </>
    ),
    variants: <ButtonGroupVariants />,
    props: [
      { name: 'direction', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Figma Direction.' },
      { name: 'scrollIndicator', type: 'boolean', default: 'false', description: 'Figma "Scroll indicator": shadow while content scrolls underneath.' },
      { name: 'children', type: 'ReactNode', description: 'Figma "wrapper" slot — usually <Button size="lg" />s. Horizontal gives each an equal share.' },
      { name: 'aria-label', type: 'string', description: 'Names the group (role="group") for screen readers.' },
      { name: '…div props', type: 'HTMLAttributes', description: 'className (e.g. to make it sticky), style, etc.' },
    ],
  },

  // ---- Input & control ------------------------------------------------------
  {
    id: 'checkbox',
    title: 'Checkbox & radio',
    group: 'Input & control',
    description: 'Checkboxes pick any number of options; radios pick exactly one from a group.',
    status: 'Figma synced',
    altNames: 'Selector, check box, radio button',
    figmaNodeId: '4543:65366',
    source: 'src/components/Checkbox',
    exports: ['Checkbox', 'Radio'],
    tokens: ['content/primary', 'content/disabled', 'content/inverted', 'shadow-sm', 'radius/06', 'size/20 · 24', 'size/tap-target'],
    overview: (
      <>
        <PhoneFrame label="Filter sheet using checkboxes and radios">
          <FiltersDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Indeterminate</h2>
          <p>Figma's "Intermediate" state. Use it on a parent checkbox when only some of its children are selected — tap "All segments" above to try it.</p>
        </section>
      </>
    ),
    variants: <SelectionVariants />,
    props: [
      { name: 'checked', type: 'boolean', description: 'Controlled state (or use defaultChecked).' },
      { name: 'indeterminate', type: 'boolean', default: 'false', description: 'Checkbox only. Figma State=Intermediate.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Figma Disabled=True.' },
      { name: 'name / value', type: 'string', description: 'Radio grouping and form value.' },
      { name: '…input props', type: 'InputHTMLAttributes', description: 'onChange, aria-label, id, etc. Needs an accessible name.' },
    ],
  },
  {
    id: 'text-field',
    title: 'Input field & text box',
    group: 'Input & control',
    description: 'Fields let people enter text — a single line (input field) or several lines with a character counter (text box).',
    status: 'Figma synced',
    altNames: 'Text input, text field, textarea, form field',
    figmaNodeId: '4543:66091',
    source: 'src/components/TextField',
    exports: ['TextField'],
    tokens: ['surface/primary · disabled', 'border/light · dark · accent/error-default', 'content/primary · secondary · tertiary · disabled', 'content/accent/error-default · success-default · discover-default', 'Label/12', 'Description/12 · 14', 'radius/12', 'shadow/elevation-low', 'icon-size/14 · 16'],
    overview: (
      <>
        <PhoneFrame label="Buy order form with quantity, limit price, note and a disabled exchange field">
          <OrderFormDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>States come from the input</h2>
          <p>Figma draws six states. Default, Typing (dark border, blue caret) and Typed happen on their own as people type, and Disabled is for fields that can't be used yet. Design Error and Success yourself, with helper text that says what to do — try a quantity of 0 or a price outside the band above.</p>
          <DevOnly><p>Figma draws six states. In code, Typing is focus (dark border, blue caret), Typed is simply having a value, and Disabled is the disabled attribute. Only Error and Success are set by you with <code>status</code> — try a quantity of 0 or a price outside the band above.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Text box counter</h2>
          <p>A text box (isInputBox) with a character limit shows “n/max” under it. Typing past the limit is allowed but switches to the Error state with “Character limit reached”.</p>
          <DevOnly><p>With <code>multiline</code> and <code>maxLength</code> the text box shows “n/max”. Typing past the limit is allowed but switches to the error state with “Character limit reached”, as in Figma.</p></DevOnly>
        </section>
      </>
    ),
    variants: <TextFieldVariants />,
    props: [
      { name: 'label / required', type: 'string / boolean', description: 'Figma Label and the red * (also sets required).' },
      { name: 'placeholder / value / onChange', type: 'input props', description: 'Standard input (or textarea) props pass through.' },
      { name: 'helperText', type: 'ReactNode', description: 'Figma Helper text row.' },
      { name: 'helperIcon', type: 'boolean', default: 'true', description: 'Field: the ⓘ before neutral helper text.' },
      { name: 'status', type: "'error' | 'success'", description: 'Figma State=Error / Success: red border + ⚠ message, or ✓ message.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Figma State=Disabled.' },
      { name: 'iconLeft / iconRight', type: 'ReactNode', description: 'Field: Figma 16px icon slots.' },
      { name: 'multiline', type: 'boolean', default: 'false', description: 'Figma isInputBox: multi-line text box.' },
      { name: 'maxLength', type: 'number', description: 'Text box: shows the counter; over the limit → error.' },
      { name: 'limitMessage', type: 'string', default: "'Character limit reached'", description: 'Text box: message when over the limit.' },
    ],
  },
  {
    id: 'switch',
    title: 'Toggle switch',
    group: 'Input & control',
    description: 'Switches turn a single setting on or off, and take effect immediately.',
    status: 'Figma synced',
    altNames: 'Toggle, knob, toggle button',
    figmaNodeId: '4543:65343',
    source: 'src/components/Switch',
    exports: ['Switch'],
    tokens: ['content/primary', 'content/tertiary', 'content/inverted', 'content/disabled', 'size/12 · 16 · 20', 'motion/* (local)', 'size/tap-target'],
    overview: (
      <>
        <PhoneFrame label="Notification settings using switches">
          <SettingsDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Motion</h2>
          <p>The knob slides and the track fades over 150ms. Figma has no motion yet, so the timing comes from local motion tokens; it's instant for reduced-motion users.</p>
        </section>
      </>
    ),
    variants: <SwitchVariants />,
    props: [
      { name: 'checked', type: 'boolean', description: 'Controlled state (or use defaultChecked).' },
      { name: 'size', type: "'md' | 'sm'", default: "'md'", description: 'Figma isSmall: md 34×20, sm 28×16.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Not drawn in Figma; uses content-disabled.' },
      { name: '…input props', type: 'InputHTMLAttributes', description: 'onChange, aria-label, id, etc. Renders role="switch".' },
    ],
  },

  // ---- Navigation -------------------------------------------------------------
  {
    id: 'tabs',
    title: 'Tabs',
    group: 'Navigation',
    description: 'Tabs switch between related views on the same screen. Underline tabs split a page into sections, pill tabs filter what\'s shown, and a pill group switches how content is shown.',
    status: 'Figma synced',
    altNames: 'Tab bar, chips, filter pills, pill group, segmented control, toggle group, view switcher',
    figmaNodeId: '4543:65938',
    source: 'src/components/Tabs',
    exports: ['Tabs', 'Tab'],
    tokens: ['content/primary · secondary · inverted', 'surface/primary · secondary · inverted', 'border/light · dark', 'state-layer/*', 'Label/08 · 10 · 12 · 14', 'radius/12 · full', 'size/24 · 32 · 40', 'spacing/36', 'size/tap-target'],
    overview: (
      <>
        <PhoneFrame label="Portfolio screen with underline section tabs and pill filters">
          <PortfolioDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Two components</h2>
          <p><strong>Tabs</strong> (Figma "L3: Tabs group") is the bar: selection, horizontal scrolling on small screens, and arrow-key navigation. <strong>Tab</strong> (Figma "L3: base tab") is one item, in underline or pill form, md or sm.</p>
        </section>
        <section className={styles.section}>
          <h2>Three appearances</h2>
          <ul>
            <li><strong>underline</strong> (Figma Flat tabs) — sections of a screen; at the top they go in the Actionbar's bottom slot.</li>
            <li><strong>pill</strong> (Figma Pill tabs) — a row of filter chips in one style: primary, secondary or tertiary. Never mix styles in a row. The first chip lines up with the 16 page margin: in Figma, Pill tabs bring their own 16 side inset for edge-to-edge rows — if the container already has 16 padding, set the tabs' inset to 0 so it isn't doubled.</li>
            <li><strong>pill-group</strong> (Figma Pill group) — 2–4 options in a shared track to switch how the same content is shown (Tree / List). Its pills are always tertiary: the selected one is a black fill, the rest blend into the track.</li>
          </ul>
        </section>
        <section className={styles.section}>
          <h2>Same label, selected or not</h2>
          <p>Every tab label uses Label (650) — 14 for md, 12 for sm underline tabs, 12 / 10 for pills. Selection shows through the text color and the indicator bar (or the pill fill), never a bolder weight, so tabs never shift when the selection changes.</p>
        </section>
      </>
    ),
    variants: <TabsVariants />,
    props: [
      { name: 'items', type: 'TabItem[]', description: 'Tabs: { value, label, iconLeft?, iconRight?, subLabel?, hideLabel? }.' },
      { name: 'value', type: 'string', description: 'Tabs: the selected item value.' },
      { name: 'onChange', type: '(value) => void', description: 'Tabs: called on tap and on arrow / Home / End keys.' },
      { name: 'appearance', type: "'underline' | 'pill' | 'pill-group'", default: "'underline'", description: 'Figma Tabs group Type: Flat tabs / Pill tabs / Pill group. A Tab alone takes underline | pill (Figma isPill).' },
      { name: 'emphasis', type: "'primary' | 'secondary' | 'tertiary'", default: "'primary'", description: 'Figma base tab Type, appearance="pill" only (pill-group is always tertiary) — the style of the whole row. primary: selected black fill, unselected light border · secondary: selected dark outline, unselected light border · tertiary: selected black fill, unselected subtle fill with no border.' },
      { name: 'size', type: "'md' | 'sm'", default: "'md'", description: 'Figma isSmall: underline 40 / 36, pill 32 / 24.' },
      { name: 'width', type: "'hug' | 'fill'", default: "'hug'", description: 'Tabs: hug = tabs as wide as their labels (a pill group\'s track wraps them); fill = tabs stretch to fill the row (a pill group goes full width with equal pills).' },
      { name: 'aria-label', type: 'string', description: 'Tabs: required name for the tab list.' },
      { name: 'idPrefix', type: 'string', description: 'Tabs: sets tab ids / aria-controls so panels can be linked.' },
      { name: 'iconLeft / iconRight', type: 'ReactNode', description: 'Figma icon slots, 16px, colored with the label.' },
      { name: 'subLabel', type: 'string', description: 'Figma 👁️ Sub label: a second 8/10 line under the label. Chip (pill) tabs only.' },
      { name: 'hideLabel', type: 'boolean', default: 'false', description: 'Figma 👁️ Label off: icon-only tab. Needs one icon; the label stays as its accessible name.' },
      { name: 'selected', type: 'boolean', default: 'false', description: 'Tab only, when composing tabs yourself.' },
    ],
  },

  {
    id: 'actionbar',
    title: 'Actionbar',
    group: 'Navigation',
    description: 'The bar at the top of a screen: back, the screen title with an optional description, and up to a couple of actions — or a search field.',
    status: 'Figma synced',
    altNames: 'App bar, top bar, navigation bar, header, toolbar',
    figmaNodeId: '4543:65480',
    source: 'src/components/Actionbar',
    exports: ['Actionbar', 'ActionbarAction'],
    tokens: ['surface/default', 'border/light · dark', 'content/primary · secondary · disabled', 'content/accent/discover (caret)', 'Heading/14', 'Description/12 · 14', 'size/32 · 48', 'state-layer/*', 'radius/full'],
    overview: (
      <>
        <PhoneFrame label="Stock screen with an actionbar: back, title, search and watchlist actions, and tabs underneath">
          <StockDetailDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Title or search</h2>
          <p>The base content has three types: Content (heading + description), Search (placeholder) and Searched (typed). In Search, the middle of the bar becomes the search field — tap the search action above.</p>
          <DevOnly><p>Figma's base content has three types: Content (heading + description), Search (placeholder) and Searched (typed). Pass <code>search</code> and the middle becomes a real search input — tap the search action above.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Actions and bottom content</h2>
          <p>The actions in → content right are round 32px Tertiary or Ghost icon buttons — at most two. ↓ Content bottom holds tabs or filters that belong to the bar. The heading is the screen's title.</p>
          <DevOnly><p><code>ActionbarAction</code> is Figma's round 32px icon button; give it a label so it's announced. <code>bottom</code> is Figma's content-bottom slot — tabs or filters that belong to the bar. The title is the screen's heading (h1).</p></DevOnly>
        </section>
      </>
    ),
    variants: <ActionbarVariants />,
    props: [
      { name: 'title / description', type: 'ReactNode', description: 'Figma ✏️ Heading / ✏️ Description.' },
      { name: 'headingLevel', type: '1 | 2', default: '1', description: 'The title is the screen heading; use 2 inside sheets or previews.' },
      { name: 'onBack / backLabel', type: "() => void / string", default: "'Back'", description: 'Figma 👁️ Action - left: back button with a round state layer.' },
      { name: 'actions', type: 'ReactNode', description: 'Figma → content right — usually <ActionbarAction icon label onClick />.' },
      { name: 'bottom', type: 'ReactNode', description: 'Figma ↓ Content bottom — Tabs, filters…' },
      { name: 'search', type: '{ value, onChange, placeholder?, label?, autoFocus? }', description: 'Figma base content Type=Search / Searched: the middle becomes a search input.' },
      { name: 'elevated', type: 'boolean', description: 'Show the scrolled state (elevation-low) yourself, when a sibling scroll area moves under the bar. Overrides sticky\'s automatic behaviour.' },
      { name: 'sticky', type: 'boolean', default: 'false', description: 'Stick to the top while the page scrolls.' },
      { name: 'ActionbarAction', type: '{ icon, label, onClick, pressed? }', description: 'Round 32px icon button; pressed shows a toggle state (e.g. watchlist).' },
    ],
  },
  {
    id: 'bottom-navbar',
    title: 'Bottom navbar',
    group: 'Navigation',
    description: 'The tab bar at the bottom of the app for moving between its main sections. Mutual Fund and F&O have their own sub-navs with a Home item back to the main bar.',
    status: 'Figma synced',
    altNames: 'Bottom navigation, tab bar, nav bar, bottom tabs, dock',
    figmaNodeId: '4543:61961',
    source: 'src/components/BottomNavbar',
    exports: ['BottomNavbar', 'NavIcon', 'navIconNames'],
    tokens: ['surface/primary', 'border/light', 'content/tertiary (unselected)', 'content/accent/success-default (selected)', 'content/primary (nav icon mask)', 'Label/10', 'size/64', 'spacing/04 · 10', 'icon-size/24', 'shadow/elevation-medium', 'state-layer/dark/*'],
    overview: (
      <>
        <PhoneFrame label="App home screen with the bottom navbar: tap Mutual Fund or F&O to open their sub-navs, and Home to come back">
          <AppNavDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Main nav and sub-navs</h2>
          <p>The main bar has Stocks, Market, Portfolio, Mutual Fund and F&amp;O. Mutual Fund and F&amp;O each have their own bar, which starts with a Home item and a separator to get back. Tap Mutual Fund in the demo above to try it.</p>
          <DevOnly><p>The main bar has Stocks, Market, Portfolio, Mutual Fund and F&amp;O. Mutual Fund and F&amp;O each have their own bar. Pass <code>home</code> to add the Home item and the separator after it. Tap Mutual Fund in the demo above to try it.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Moving between navs</h2>
          <p>When the options change, the bar animates. The option you tapped glides into its new slot, and the rest slide in one after another from the direction you're going: from the right into a sub-nav, from the left back Home. The animation uses the motion tokens, and it's turned off when the device is set to reduce motion.</p>
        </section>
        <section className={styles.section}>
          <h2>Nav icons</h2>
          <p>The nav icons are custom artwork. Unselected icons are one color and follow the theme; selected icons are two-tone brand artwork with fixed colors, so they look the same in every theme. Any other icon is a Material Symbol in content-tertiary, or success green when selected.</p>
          <DevOnly><p><code>NavIcon</code> is Figma's nav icon set. Unselected icons are one color, with the tertiary and secondary parts built into the artwork, and follow the theme. Selected icons are two-tone brand artwork with fixed colors, so they look the same in every theme. For any other icon, pass a Material Symbol with <code>&lt;Icon&gt;</code>: it's shown in content-tertiary, or success green when selected.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Accessibility</h2>
          <p>Every option always shows its label, and the current one is marked for screen readers. The bar stays at the bottom of the screen and leaves room for the phone's home indicator.</p>
          <DevOnly><p>The bar is a <code>&lt;nav&gt;</code> landmark. Give it a name with <code>aria-label</code>. Each option is a button, or a link when you pass <code>href</code>. The current option is marked with <code>aria-current="page"</code>, and the label is always shown. With <code>fixed</code>, the bar sticks to the bottom of the screen and adds space for the home indicator.</p></DevOnly>
        </section>
      </>
    ),
    variants: <BottomNavbarVariants />,
    props: [
      { name: 'items', type: 'BottomNavbarItem[]', description: '{ value, label, icon, selectedIcon?, href? }. Icons are 24px.' },
      { name: 'value', type: 'string', description: 'The current section (Figma Tab / isActive).' },
      { name: 'onChange', type: '(value) => void', description: 'Called when an option is tapped.' },
      { name: 'home', type: '{ label?, onClick?, href? }', description: "Figma MF / F&O sub-navs: a Home item (back-home icon) and a separator. The label defaults to 'Home'." },
      { name: 'aria-label', type: 'string', default: "'Main'", description: 'Name of the nav landmark.' },
      { name: 'fixed', type: 'boolean', default: 'false', description: 'Fix the bar to the bottom of the viewport and add the safe-area inset.' },
      { name: 'NavIcon', type: '{ name: NavIconName; selected? }', description: 'Figma .L3: base navicons: stocks, market, portfolio, mutualFund, fno, mfFunds, mfDashboard, mfSips, fnoOptionChain, fnoPositions, fnoScalper, backHome.' },
    ],
  },
  {
    id: 'card',
    title: 'Card',
    group: 'Surfaces',
    description: 'A surface that groups related content. Clickable cards are one tap target; static cards just show information.',
    status: 'Figma synced',
    figmaNodeId: '5364:38',
    altNames: 'Tile, panel, container, list item card',
    source: 'src/components/Card',
    exports: ['Card'],
    tokens: ['surface/primary', 'surface/secondary (filled, flat selected)', 'border/light', 'border/dark (selected)', 'shadow/elevation-low (clickable)', 'motion/scale/press-default (local, 0.98)', 'motion/duration-short', 'state-layer/dark/hover', 'radius/12', 'spacing/12 · 08'],
    overview: (
      <>
        <PhoneFrame label="Portfolio orders: tabs in the actionbar, chip tabs, a static summary card and clickable order cards">
          <OrdersDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Clickable or static</h2>
          <p>Cards sit on the screen background (surface-default). In light mode that and surface-primary are both white, so every card has a 1px border-light outline. A <strong>clickable</strong> card also gets elevation-low and scales to 0.98 while pressed. A <strong>static</strong> card is for information or decoration: rounded with a border-light outline on surface-default, and no shadow or press.</p>
          <DevOnly><p>Cards sit on the screen background (surface-default). In light mode that and surface-primary are both white, so every card has a 1px border-light outline. A <strong>clickable</strong> card (<code>onClick</code> or <code>href</code>) also gets elevation-low and scales to 0.98 while pressed. A <strong>static</strong> card is for information or decoration: rounded with a border-light outline on surface-default, and no shadow or press.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>One action means a clickable card</h2>
          <p>If a card would hold a single button, make the whole card clickable instead. A clickable card is one tap target, so it can't contain other buttons or links (a development warning flags both cases).</p>
        </section>
        <section className={styles.section}>
          <h2>Flat cards</h2>
          <p>A flat card — not rounded, no border — has no background unless you give it one: it's transparent, with no border and no shadow. It can still be clickable: it keeps the press scale and hover tint.</p>
          <DevOnly><p>A card that isn’t rounded and has no border (<code>variant="flat"</code>) has no background unless you set one with <code>surface</code> — it’s transparent, with no border and no shadow. It can still be clickable: it keeps the press scale, hover tint and focus ring.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Filled cards</h2>
          <p>A filled card is a grey inset panel: rounded, surface-secondary, no border and no shadow. Use it to group details on a white screen — contract info, performance stats, market depth. Anything inside that needs its own fill (a skeleton, a tag, an inner panel) uses the grey-friendly version, surface-tertiary.</p>
          <DevOnly><p><code>variant="filled"</code>. Inside it, use <code>Skeleton onGrey</code> and surface-tertiary for inner fills.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Padding and placement</h2>
          <p>Cards always sit inside a margin: they never touch the edges of what contains them (16 from the screen edge, 16 between cards in a list). A card is padded 12 by default. A clickable or static card can drop its own padding when its content is built from sections that bring their own — for example a 12-padded body and an action footer — but the rule doesn't change: <strong>the content always sits 12 from the card edge</strong>. Filled cards are always padded, and a flat card runs edge to edge in its container.</p>
          <DevOnly><p><code>padding="none"</code> on a default (clickable / static) or flat card; the sections inside carry the 12 padding. Filled cards are always padded (TypeScript enforces it). The margin around cards comes from the parent's padding or gap — cards have no outer margin of their own.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Action footer</h2>
          <p>A clickable card is one tap target, so it never has buttons inside its content. When the card needs quick actions on its subject — save, learn more, apply — put them in an <strong>action footer</strong> at the bottom of the card: no fill, the buttons 12 from the card edge right under the content. The rest of the card stays the tap target; pressing a footer button doesn't press the card. Keep it to three actions at most, with one primary at most; a single button is Tertiary.</p>
          <p>The footer can be a full-width grey strip (surface-secondary, 12 padding) — but only when it's meant to stand out. Grey is for small highlights inside a card (tags, chips, a small detail box); a large grey area has to be intentional and high-emphasis.</p>
          <DevOnly><p><code>footer</code> takes the buttons; <code>footerFilled</code> makes it the grey strip. On a clickable card the body becomes the button / link and the footer sits beside it (never nested); a development warning still flags controls inside the body.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Selected cards</h2>
          <p>When cards are a list of choices — pick a contract, a plan, an account — the chosen one is selected. A card with a border keeps everything and only swaps border-light for the darker border-dark. A flat card has no border, so it shows its selection with a surface-secondary background; unselected, a flat card has no fill at all and takes the colour of whatever it sits on — another card or the screen. Only clickable cards can be selected; static and filled cards never are.</p>
          <DevOnly><p><code>selected</code> on a clickable card (<code>onClick</code> / <code>href</code>). It's announced as pressed (button) or current (link); a development warning flags <code>selected</code> on a card that isn't clickable.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Same rule for chip tabs</h2>
          <p>Chip (pill) tabs are tappable surfaces too: unselected chips use surface-primary with border-light and elevation-low, and scale to 0.98 while pressed.</p>
        </section>
      </>
    ),
    variants: <CardVariants />,
    props: [
      { name: 'children', type: 'ReactNode', description: 'Card content. Inside a clickable card use text and spans only — no other controls.' },
      { name: 'onClick', type: '() => void', description: 'Makes the whole card a button (clickable card).' },
      { name: 'href', type: 'string', description: 'Makes the whole card a link (clickable card).' },
      { name: 'as', type: "'div' | 'article' | 'section' | 'li'", default: "'div'", description: 'Element for a static card.' },
      { name: 'variant', type: "'default' | 'flat' | 'filled'", default: "'default'", description: 'flat: not rounded, no border, no shadow, transparent background. filled: grey inset panel (surface-secondary, no border, no shadow). Both can still be clickable.' },
      { name: 'surface', type: "'default' | 'primary' | 'secondary' | 'tertiary' | 'inverted'", description: 'Set the background yourself (surface token). Flat cards are transparent without it.' },
      { name: 'padding', type: "'default' | 'none'", default: "'default'", description: '12px. none when the content’s sections bring their own padding (content still 12 from the edge); not on filled cards.' },
      { name: 'selected', type: 'boolean', default: 'false', description: 'The chosen option in a list of choices (clickable cards only): bordered → border-dark, flat → surface-secondary background.' },
      { name: 'footer', type: 'ReactNode', description: 'Action footer: up to 3 buttons at the bottom of the card, no fill, 12 from the edge. On a clickable card the body stays the tap target.' },
      { name: 'footerFilled', type: 'boolean', default: 'false', description: 'Grey footer strip (surface-secondary, 12 padding) — intentional, high-emphasis footers only.' },
      { name: 'aria-label', type: 'string', description: 'Name for a clickable card when its text alone isn’t a good one.' },
    ],
  },
  {
    id: 'bottom-sheet',
    title: 'Bottom sheet',
    group: 'Surfaces',
    description: 'A panel that slides over the screen to show a focused task — confirm an order, pick an option, see a result — without leaving the page.',
    status: 'Figma synced',
    altNames: 'Sheet, modal sheet, drawer, action sheet, top sheet',
    figmaNodeId: '4543:63932',
    source: 'src/components/BottomSheet',
    exports: ['BottomSheet', 'BottomSheetHeader', 'BottomSheetSurface'],
    tokens: ['surface/primary', 'border/light · intense', 'content/primary · secondary', 'Heading/16 · 20', 'Description/12 · 14', 'radius/24 · full', 'shadow/elevation-high', 'surface/overlay (Overlay)', 'motion/* (local)', 'size/tap-target'],
    overview: (
      <>
        <PhoneFrame label="Stock screen that opens an order bottom sheet, a result sheet and a top sheet">
          <SheetsDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Three pieces</h2>
          <p><strong>BottomSheet</strong> is the modal: the Figma "L3: Overlay" backdrop, slide-in, focus trap, backdrop tap / drag down / Esc to close. <strong>BottomSheetHeader</strong> is Figma's header in small (back · heading · ⓘ · any action) and large (icon · tag · heading · description) sizes. <strong>BottomSheetSurface</strong> is the panel alone, for embedding or static layouts.</p>
        </section>
        <section className={styles.section}>
          <h2>Closing is invisible</h2>
          <p>There is no drag handle and no ✕. People close a sheet by <strong>tapping the backdrop</strong> or <strong>dragging it down</strong> — anywhere on the sheet: the header and footer always, the content once it's scrolled to the top (before that, a swipe scrolls the content). Esc also closes it, and a visually hidden “Close” button is there for screen-reader and keyboard users. The page behind the sheet is inert while it's open.</p>
        </section>
        <section className={styles.section}>
          <h2>At most two sheets</h2>
          <p>The first sheet over a screen has <strong>no back button</strong>. A second sheet can open on top of it (e.g. an explainer from the ⓘ) — that one has a back button that returns to the first. Never stack a third: replace the second sheet instead. Try the ⓘ on the Buy sheet above.</p>
        </section>
        <section className={styles.section}>
          <h2>Confirmations live in a sheet</h2>
          <p>Every confirmation is a bottom sheet — there is no dialog. Before an action, the sheet asks the question (“Place this order?”), lists the facts as rows, adds a warning when it's risky, and ends with Cancel next to the strong confirm button. After it, a large-header result sheet (“Order placed”) with one button. A confirmation opened from a sheet is the second sheet, with a back button.</p>
        </section>
        <section className={styles.section}>
          <h2>Bottom or top</h2>
          <p>Figma's isBottom=False drops the sheet from the top with rounded bottom corners — handy for sort or filter menus tied to the top of the screen.</p>
        </section>
      </>
    ),
    variants: <BottomSheetVariants />,
    props: [
      { name: 'open / onClose', type: 'boolean / () => void', description: 'BottomSheet: visibility; onClose fires on backdrop tap, drag down (up for top sheets), Esc and the screen-reader close button.' },
      { name: 'placement', type: "'bottom' | 'top'", default: "'bottom'", description: 'Figma isBottom.' },
      { name: 'header', type: 'ReactNode', description: 'Figma 👁️ Header — usually <BottomSheetHeader />.' },
      { name: 'children', type: 'ReactNode', description: 'Figma content slot; scrolls if the sheet would be taller than the screen.' },
      { name: 'footer', type: 'ReactNode', description: 'Figma Utility slot: the area under the content — usually the button dock (<ButtonGroup>).' },
      { name: 'utility', type: 'ReactNode', description: 'Code-only extra area under footer (e.g. a note under the buttons). In Figma it goes inside the Utility slot.' },
      { name: 'closeLabel', type: 'string', default: "'Close'", description: 'Name of the visually hidden close button (screen readers / keyboard). There is no visible close button or drag handle; the whole sheet drags to dismiss.' },
      { name: 'container', type: 'HTMLElement | null', default: 'document.body', description: 'Render inside another element instead of covering the page.' },
      { name: 'aria-labelledby', type: 'string', description: 'Point at the header heading (headingId) to name the dialog.' },
      { name: 'Header: size', type: "'sm' | 'lg'", default: "'sm'", description: 'Figma isSmall.' },
      { name: 'Header: heading / description', type: 'string', description: 'Heading text and optional description.' },
      { name: 'Header: info', type: 'boolean | ReactNode', default: 'false', description: 'sm: ⓘ after the heading (decorative on its own).' },
      { name: 'Header: onInfo / infoLabel', type: "() => void / string", default: "'More information'", description: 'sm: makes the ⓘ a real, labelled button.' },
      { name: 'Header: onBack / trailing', type: '() => void / ReactNode', description: 'sm actions: back button — only on a second sheet stacked on another (hidden on the first sheet over the screen) — or any right-side node (Tag, small Button). There is no close (✕) button.' },
      { name: 'Header: bottom', type: 'ReactNode', description: 'sm: Figma "Content bottom" slot under the header row — e.g. flat Tabs or a search field. Put them here, not as a separate row in the sheet body.' },
      { name: 'Header: icon / tag', type: 'ReactNode', description: 'lg: 64px icon slot and a header tag.' },
    ],
  },

  {
    id: 'aerobar',
    title: 'Aerobar & toast',
    group: 'Feedback & status',
    description: 'A short status message with an optional action — inline as a full-width bar, or floating as a toast after something happens.',
    status: 'Figma synced',
    altNames: 'Toast, snackbar, banner, alert bar, notification',
    figmaNodeId: '4543:65562',
    source: 'src/components/Aerobar',
    exports: ['Aerobar'],
    tokens: ['surface/tertiary · inverted', 'surface/accent/* (light · default)', 'content/primary · secondary · inverted', 'static/white · black', 'opacity/60 · 80', 'Label/14', 'Description/12', 'radius/12', 'shadow/elevation-low · medium', 'motion/* (local)'],
    overview: (
      <>
        <PhoneFrame label="Stock screen with an inline warning aerobar and floating success or danger toasts">
          <ToastDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Toasts</h2>
          <p>Floating, solid toasts for results people should notice — always shown here; in the phone above they rise in after Buy or Sell.</p>
          <div className={styles.toastExamples}>
            <Aerobar floating emphasis="primary" type="success" heading="Buy order placed" paragraph="10 × RELIANCE at ₹2,947.10" action={{ label: 'View', onClick: () => {} }} />
            <Aerobar floating emphasis="primary" type="danger" heading="Sell order rejected" paragraph="You have no RELIANCE shares to sell." action={{ label: 'Retry', onClick: () => {} }} />
            <Aerobar floating type="discover" heading="New: price alerts" paragraph="Get notified when a stock crosses your target." action={{ label: 'Try', onClick: () => {} }} />
          </div>
        </section>
        <section className={styles.section}>
          <h2>Inline or floating</h2>
          <p>Inline, it's a full-width strip that sits in the layout (the market-hours warning above). Floating (isFloating), it's a rounded, shadowed toast inset 16px from the edges that rises in when shown.</p>
          <DevOnly><p>Without <code>floating</code> it's a full-width strip that sits in the layout (the market-hours warning above). With <code>floating</code> it's a rounded, shadowed toast inset 16px from the edges that rises in when shown.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Soft or solid</h2>
          <p>Figma's isPrimary: the light tint (False) suits information that can wait; the solid color (True) is for results people should notice straight away. Danger is read out to screen readers immediately; the others politely.</p>
          <DevOnly><p>Figma's isPrimary: the default light tint suits information that can wait; the solid color (emphasis="primary") is for results people should notice straight away. Danger is announced immediately to screen readers (role="alert"); the rest politely (role="status"). For a danger bar that is part of the page rather than a new event, pass <code>role="status"</code> so it isn't read out as an alert on every visit.</p></DevOnly>
        </section>
      </>
    ),
    variants: <AerobarVariants />,
    props: [
      { name: 'type', type: "'primary' | 'discover' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Figma Type.' },
      { name: 'emphasis', type: "'primary' | 'secondary'", default: "'secondary'", description: 'Figma isPrimary: solid color (primary) or light tint (secondary).' },
      { name: 'floating', type: 'boolean', default: 'false', description: 'Figma isFloating: toast card with shadow and a rise-in animation.' },
      { name: 'heading / paragraph', type: 'ReactNode', description: 'Figma Headline text / Paragraph text (hidden when not passed).' },
      { name: 'icon', type: 'ReactNode | false', default: 'info icon', description: 'Figma icon-L slot (24px); false hides it.' },
      { name: 'action', type: '{ label, onClick }', description: 'Figma Action-r: small Ghost button in a 48px slot; its label follows the bar color.' },
    ],
  },

  // ---- Data display -----------------------------------------------------------
  {
    id: 'empty-state',
    title: 'Empty state',
    group: 'Feedback & status',
    description: 'What to show when a search or list has nothing in it: an illustration, a short heading and hint, and a way forward.',
    status: 'Figma synced',
    altNames: 'No results, zero state, blank slate, nothing found',
    figmaNodeId: '4543:66488',
    source: 'src/components/EmptyState',
    exports: ['EmptyState', 'NoResultsIllustration'],
    tokens: ['surface/default', 'content/primary · secondary', 'surface/accent/brand-default (illustration)', 'static/black · white (illustration)', 'Heading/16', 'Label/14', 'spacing/04 · 16 · 24', 'size/illustration (local, 120px)'],
    overview: (
      <>
        <PhoneFrame label="Stock search with no matches: the empty state with a Clear button">
          <EmptySearchDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Say what happened, then offer a way out</h2>
          <p>Use the heading to say what's missing ("No results found") and the description to say what to try. Figma's CTA is a small primary Button, "Clear" with a delete icon, that resets the search. Tap it in the demo above, then type to see results come back.</p>
        </section>
        <section className={styles.section}>
          <h2>Illustration</h2>
          <p>The default is Figma's magnifier, and it follows the theme, including the brand color. You can swap in your own 120px artwork through the Illustration slot, or hide it.</p>
          <DevOnly><p>The default is Figma's magnifier. It's an inline SVG and every fill is a token, so it follows the theme, including the brand color. Pass your own 120px artwork to <code>illustration</code>, or <code>null</code> to hide it.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Layout and accessibility</h2>
          <p>The empty state fills the space it's in and centres itself; Figma's frame is a fixed 412px tall. If results change as someone types, the result count should be announced to screen readers — note it in the handoff.</p>
          <DevOnly><p>The empty state fills its flex parent and centres itself; Figma's frame is a fixed 412px tall. The heading is an h2 by default (use <code>headingLevel=&#123;3&#125;</code> under a section heading). The illustration is hidden from screen readers. If results change as someone types, announce the count separately, for example in a live region next to the search field.</p></DevOnly>
        </section>
      </>
    ),
    variants: <EmptyStateVariants />,
    props: [
      { name: 'title', type: 'ReactNode', description: 'Figma ✏️ Heading.' },
      { name: 'description', type: 'ReactNode', description: 'Figma ✏️ Description.' },
      { name: 'illustration', type: 'ReactNode | null', default: '<NoResultsIllustration />', description: 'Figma Illustration slot, 120px. null hides it.' },
      { name: 'action', type: 'ReactNode', description: 'Figma Clear CTA: usually <Button size="sm" variant="primary">.' },
      { name: 'headingLevel', type: '2 | 3', default: '2', description: 'Heading element for the title.' },
    ],
  },
  {
    id: 'list-cell',
    title: 'List cell',
    group: 'Data display',
    description: 'A row in a list: an icon, a label with an optional description, and something on the right — a chevron, a switch, a tag or a value.',
    status: 'Figma synced',
    altNames: 'List item, row, cell, settings row, menu item',
    figmaNodeId: '4543:65400',
    source: 'src/components/ListCell',
    exports: ['ListCell'],
    tokens: ['surface/primary (tappable card)', 'surface/secondary (plain selected)', 'border/light', 'border/dark (card selected)', 'shadow/elevation-low (tappable card)', 'motion/scale/press-default', 'content/primary · secondary', 'content/accent/discover (dot)', 'Label/14 · 16', 'Description/12', 'radius/12 · full', 'icon-size/16 · 24', 'state-layer/* (tappable rows)'],
    overview: (
      <>
        <PhoneFrame label="Account screen built from list cells with chevrons, a switch, a tag and bank-account cards">
          <AccountDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Plain or card</h2>
          <p>A list cell is a card with more specific content — dropdown options, settings, lists — so it follows the <strong>Card rules</strong>. Plain rows are flat cards: no fill, they take the colour of whatever they sit on, and they run edge to edge. Card rows (Figma isPlain=False) are rounded with border-light and always sit inside a margin (16 from the screen edge):</p>
          <ul>
            <li><strong>Not tappable</strong> (a static card): no fill — it takes the colour it sits on — and border-light, no shadow.</li>
            <li><strong>Tappable</strong> (a clickable card, Figma isTappable): surface-primary, border-light and elevation-low, and it scales to 0.98 while pressed.</li>
          </ul>
          <p>Both come in default (48) and small (32).</p>
        </section>
        <section className={styles.section}>
          <h2>Selected rows</h2>
          <p>When rows are a list of choices, the chosen one is selected. A plain row gets a surface-secondary background; a card row swaps border-light for the darker border-dark and nothing else changes. Only tappable rows can be selected.</p>
          <DevOnly><p><code>selected</code> on a tappable row (<code>onClick</code>, <code>href</code> or <code>as="label"</code>). Announced as pressed (button) or current (link); in a label row the Radio or Checkbox carries the state.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Tappable rows</h2>
          <p>A whole row can be tappable, with a pressed tint — show a chevron or a control on the right so people know. A row with a Switch or Checkbox toggles it when tapped anywhere — try “Biometric login”.</p>
          <DevOnly><p>Use <code>as="button"</code> or <code>href</code> to make the whole row tappable with a pressed tint. Use <code>as="label"</code> with a Switch or Checkbox in <code>trailing</code> so tapping anywhere on the row toggles it — try “Biometric login”.</p></DevOnly>
        </section>
      </>
    ),
    variants: <ListCellVariants />,
    props: [
      { name: 'label / description', type: 'ReactNode', description: 'Figma "Label goes here" / "Type description".' },
      { name: 'multiline', type: 'boolean', default: 'false', description: 'Figma isMultiline: the description wraps onto as many lines as it needs instead of ending in "…". The label stays on one line.' },
      { name: 'size', type: "'md' | 'sm'", default: "'md'", description: 'Figma isSmall: 48 / 32 min height, 24 / 16 icons.' },
      { name: 'variant', type: "'plain' | 'card'", default: "'plain'", description: 'Figma isPlain: flat row (no fill, edge to edge), or bordered rounded card (inside a margin). Card rows follow Card: static = no fill + border-light; tappable = surface-primary + elevation-low.' },
      { name: 'selected', type: 'boolean', default: 'false', description: 'Figma isSelected: the chosen row in a list of choices — plain → surface-secondary, card → border-dark. Tappable rows only.' },
      { name: 'iconLeft / iconRight', type: 'ReactNode', description: 'Figma Icon-L / Icon-R slots, sized for you.' },
      { name: 'trailing', type: 'ReactNode', description: 'Anything else on the right: Switch, Checkbox, Tag, value text.' },
      { name: 'dotLeft / dotRight', type: 'boolean', default: 'false', description: 'Figma Dot-L / Dot-R: unread dot on the icon.' },
      { name: 'dotLabel', type: 'string', default: "'New'", description: 'What screen readers hear for the dot (it is otherwise only visual).' },
      { name: 'as / href / onClick', type: "'div' | 'button' | 'a' | 'label'", description: 'Makes the row tappable (button / a) or a label for a trailing control.' },
    ],
  },
  {
    id: 'tag',
    title: 'Tag',
    group: 'Data display',
    description: 'Tags label, categorise or show the status of something in a compact form.',
    status: 'Figma synced',
    altNames: 'Badge, chip, label, pill',
    figmaNodeId: '4464:27218',
    source: 'src/components/Tag',
    exports: ['Tag'],
    tokens: ['surface/accent/*', 'content/accent/*', 'border/accent/*', 'surface/accent/indicator/*', 'surface/inverted', 'surface/secondary', 'static/black', 'static/white', 'Label/10 · 12 · 14', 'radius/04', 'size/16 · 20 · 24'],
    overview: (
      <>
        <PhoneFrame label="Watchlist using tags for exchange, segment and price change">
          <WatchlistDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Types</h2>
          <p>Primary is solid, Secondary is soft with a border, Tertiary is soft without one.</p>
          <div className={styles.demoRow}>
            <Tag variant="primary" color="success" size="md">Primary</Tag>
            <Tag variant="secondary" color="success" size="md">Secondary</Tag>
            <Tag variant="tertiary" color="success" size="md">Tertiary</Tag>
            <Tag size="md" disabled>Disabled</Tag>
          </div>
        </section>
      </>
    ),
    variants: <TagPreview />,
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'tertiary'", default: "'primary'", description: 'Figma Type (Tertiory → tertiary).' },
      { name: 'color', type: "'neutral' | 'profit' | 'loss' | 'success' | 'error' | 'warning' | 'discover' | 'processing' | 'indigo' | 'teal' | 'purple' | 'zing'", default: "'neutral'", description: 'Figma Color. profit / loss = indicator up / down (price moves, P&L); success / error = outcomes; processing = orange. v1 names green, red, yellow, orange still work (→ success, error, warning, processing).' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'sm'", description: 'Figma Size: 16, 20, 24.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Figma Type=Disabled; overrides variant and color.' },
      { name: 'iconLeft / iconRight', type: 'ReactNode', description: 'Icon slots, sized and colored by the tag.' },
      { name: 'hideLabel', type: 'boolean', default: 'false', description: 'Figma 👁️ Label off: icon-only (square) tag. Needs one icon; children stay as the screen-reader text.' },
    ],
  },

  {
    id: 'overlay',
    title: 'Overlay',
    group: 'Surfaces',
    description: 'The dimmed backdrop behind a bottom sheet or any other modal.',
    status: 'Figma synced',
    figmaNodeId: '4603:91773',
    altNames: 'Scrim, backdrop, dim, modal background',
    source: 'src/components/Overlay',
    exports: ['Overlay'],
    tokens: ['surface/overlay', 'motion/duration-medium · easing-standard (local)'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>Behind every modal</h2>
          <p>The overlay dims the screen behind a sheet so the task in front gets all the attention. Tapping it closes the sheet. Bottom sheets already include it — use Version = Latest in Figma.</p>
          <DevOnly><p><code>&lt;BottomSheet&gt;</code> renders it for you. For another modal, render <code>&lt;Overlay open onClick={'{close}'} /&gt;</code> inside a positioned container, then the panel after it. It's decorative (aria-hidden): the panel owns the dialog role and its keyboard close.</p></DevOnly>
        </section>
      </>
    ),
    props: [
      { name: 'open', type: 'boolean', description: 'Fades in when true.' },
      { name: 'onClick', type: '() => void', description: 'Tap on the scrim — usually closes the modal above it.' },
    ],
  },
  // ---- Added 2026-10-09: components that were Figma gaps -------------------
  {
    id: 'stepper',
    title: 'Stepper',
    group: 'Input & control',
    description: 'A number with − and + buttons, for quantity and lots in the order pad.',
    status: 'Figma synced',
    figmaNodeId: '5374:18184',
    altNames: 'Quantity input, counter, number input, lot picker, spinner',
    source: 'src/components/Stepper',
    exports: ['Stepper'],
    tokens: ['surface/secondary (Small)', 'surface/accent/discover-light + content/accent/discover-default (Small buttons)', 'surface/primary + border/intense (Large buttons)', 'surface/disabled + content/disabled (at the limit)', 'Heading/12 · 14', 'Label/10 (sublabel)', 'size/20 · 32 · 48 · tap-target', 'radius/04 · 08 · full', 'spacing/02 · 04'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>Small or Large</h2>
          <p><strong>Small</strong> sits inline in an order-pad row, next to its label (“Quantity (100 = 1 Lot)”): a 104×28 grey pill with 20px square buttons. <strong>Large</strong> stands on its own, like in Scalp Pro: round outlined buttons, a bigger value and an optional sublabel such as “91 Lots”.</p>
        </section>
        <section className={styles.section}>
          <h2>Limits</h2>
          <p>Each tap adds or removes one step — usually the lot size. At the lowest value the − button turns grey (State = Disabled), and the same for + at the highest. Never let the value go below one lot.</p>
          <DevOnly><p><code>min</code>, <code>max</code> and <code>step</code> clamp the value and disable the buttons. The value is an <code>&lt;output aria-live="polite"&gt;</code>, so screen readers hear each change. The Small buttons are 20px but their tap area is 32px.</p></DevOnly>
        </section>
      </>
    ),
    variants: <StepperVariants />,
    props: [
      { name: 'value', type: 'number', description: 'Current value.' },
      { name: 'onChange', type: '(value: number) => void', description: 'Called with the new, clamped value.' },
      { name: 'min · max', type: 'number', default: '0 · Infinity', description: 'Limits; the − / + button disables at each.' },
      { name: 'step', type: 'number', default: '1', description: 'Amount per tap (e.g. the lot size).' },
      { name: 'size', type: "'sm' | 'lg'", default: "'sm'", description: 'Figma Size: Small · Large.' },
      { name: 'sublabel', type: 'ReactNode', description: 'Large only: a line under the value, e.g. "91 Lots".' },
      { name: 'format', type: '(value) => string', description: 'How the value is shown; default Indian grouping.' },
      { name: 'label', type: 'string', description: 'Accessible name of the group, e.g. "Quantity". Required.' },
      { name: 'disabled', type: 'boolean', description: 'Disables both buttons.' },
    ],
  },
  {
    id: 'select',
    title: 'Select',
    group: 'Input & control',
    description: 'An inline trigger — a label and an icon — that opens a sheet of options.',
    status: 'Figma synced',
    figmaNodeId: '5377:49',
    altNames: 'Dropdown, picker, switcher, toggle, mode selector, filter',
    source: 'src/components/Select',
    exports: ['Select'],
    tokens: ['content/primary · secondary (subtle)', 'Label/12 · 14', 'Heading/14', 'spacing/02 · 04', 'size/tap-target'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>No box</h2>
          <p>Select is just the current choice and an icon. It sits in a row or a header; tapping it opens a bottom sheet with the options as radio rows. Use <strong>↕</strong> when it switches between a few modes (Quantity ↔ Amount, Total P&amp;L ↔ Day P&amp;L, the asset in a title). Use the <strong>chevron</strong> for a filter list (Deposit &amp; Credits).</p>
        </section>
        <section className={styles.section}>
          <h2>Sizes</h2>
          <p><strong>Small</strong> (Label-12) in form rows, <strong>Medium</strong> (Label-14) for filters, <strong>Large</strong> (Heading-14) for titles. <strong>Subtle</strong> makes it secondary grey when it shouldn't compete with the content. Make the whole row or header tappable, not only the text.</p>
          <DevOnly><p>A <code>&lt;button aria-haspopup="dialog"&gt;</code>; pass <code>expanded</code> while the sheet is open. Its tap area grows to 32px.</p></DevOnly>
        </section>
      </>
    ),
    variants: <SelectVariants />,
    props: [
      { name: 'children', type: 'ReactNode', description: 'The current choice, e.g. "Quantity".' },
      { name: 'onClick', type: '() => void', description: 'Open the options (usually a BottomSheet with Radio rows).' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'sm'", description: 'Figma Size: Small · Medium · Large.' },
      { name: 'subtle', type: 'boolean', default: 'false', description: 'Figma isSubtle: content/secondary.' },
      { name: 'icon', type: "'swap' | 'chevron'", default: "'swap'", description: 'Figma ↪ Icon: ↕ for modes, chevron for filter lists.' },
      { name: 'expanded', type: 'boolean', description: 'Sets aria-expanded while the options are open.' },
      { name: 'aria-label', type: 'string', description: 'When the visible text alone is not a good name.' },
    ],
  },
  {
    id: 'date-picker',
    title: 'Date picker',
    group: 'Input & control',
    description: 'A month calendar for picking one day or a date range.',
    status: 'Figma synced',
    figmaNodeId: '5387:279',
    altNames: 'Calendar, date range, period picker, date input',
    source: 'src/components/DatePicker',
    exports: ['DatePicker'],
    tokens: ['surface/inverted + content/inverted (selected)', 'surface/secondary (range band)', 'border/accent/discover-default + content/accent/discover-default (today)', 'content/disabled', 'Heading/14 · 16', 'Label/12 · 14', 'size/32 · 40', 'radius/full'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>In a bottom sheet</h2>
          <p>Open the picker in a bottom sheet with a title (“Select date range”) and a button dock — Clear and Apply. Add quick presets (1W · 1M · 3M · 1Y) above it as pill tabs when people mostly want a standard period, like for P&amp;L and tax reports.</p>
        </section>
        <section className={styles.section}>
          <h2>Single or Range</h2>
          <p><strong>Single</strong> picks one day (black circle). <strong>Range</strong> picks a start and an end, joined by a grey band. Today has a blue ring. Weeks start on Monday and the grid is always six weeks tall, so the sheet doesn't jump between months.</p>
        </section>
        <section className={styles.section}>
          <h2>Disable what can't be picked</h2>
          <p>For reports and history, days after today are disabled. For future dates (GTT or order expiry), days before today are.</p>
          <DevOnly><p>Use <code>max</code> / <code>min</code>. Keyboard: arrows move by day and week, Home / End to the week's ends, PageUp / PageDown by month, Enter picks. Range: the first tap sets the start, the second the end.</p></DevOnly>
        </section>
      </>
    ),
    variants: <DatePickerVariants />,
    props: [
      { name: 'mode', type: "'single' | 'range'", default: "'single'", description: 'Figma Mode.' },
      { name: 'value', type: 'Date | null  ·  { start, end }', description: 'Selected day, or the range.' },
      { name: 'onChange', type: '(value) => void', description: 'Called with the new day or range.' },
      { name: 'min · max', type: 'Date', description: 'Days outside are disabled (Figma State = Disabled).' },
      { name: 'initialMonth', type: 'Date', description: 'Month shown first; defaults to the selection or today.' },
      { name: 'label', type: 'string', description: 'Accessible name of the calendar, e.g. "Report period". Required.' },
    ],
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    group: 'Feedback & status',
    description: 'A grey placeholder that mirrors the layout while content loads.',
    status: 'Figma synced',
    figmaNodeId: '5380:30',
    altNames: 'Loading, shimmer, placeholder, loader, ghost',
    source: 'src/components/Skeleton',
    exports: ['Skeleton', 'SkeletonListRow', 'SkeletonCard'],
    tokens: ['surface/secondary', 'surface/tertiary (on grey)', 'surface/primary at opacity/60 (shimmer)', 'radius/04 · 08 · full', 'size/*'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>Mirror the real layout</h2>
          <p>Draw the skeleton in the same places and sizes as the content that's coming, so nothing jumps when it loads. <strong>Line</strong> is a line of text (12, 16 or 20 tall — the text's line height), <strong>Circle</strong> an icon or avatar, <strong>Box</strong> an image, chart or button. For lists and cards, use the ready-made patterns: a list row matches the 58px list cell.</p>
        </section>
        <section className={styles.section}>
          <h2>On white or on grey</h2>
          <p>On white screens the skeleton is surface-secondary. On grey cards and panels, switch on <strong>isOnGrey</strong> (surface-tertiary) so it stays visible. It shimmers, and stays still for people who turn off animations.</p>
          <DevOnly><p>Skeletons are hidden from screen readers. Mark the loading region with <code>aria-busy="true"</code> and give it a name (“Loading watchlist”).</p></DevOnly>
        </section>
      </>
    ),
    variants: <SkeletonVariants />,
    props: [
      { name: 'shape', type: "'line' | 'circle' | 'box'", default: "'line'", description: 'Figma Shape.' },
      { name: 'width · height', type: 'string (CSS)', description: 'Ideally tokens (var(--l3-size-96)) or %. Line height = the text line height.' },
      { name: 'onGrey', type: 'boolean', default: 'false', description: 'Figma isOnGrey: surface/tertiary.' },
      { name: 'SkeletonListRow', type: '{ onGrey? }', description: 'Figma pattern Type=List row (matches ListCell).' },
      { name: 'SkeletonCard', type: '—', description: 'Figma pattern Type=Card.' },
    ],
  },
  {
    id: 'progress-bar',
    title: 'Progress bar',
    group: 'Feedback & status',
    description: 'Shows how much of something is used or done, or where a value sits in a range.',
    status: 'Figma synced',
    figmaNodeId: '5384:321',
    altNames: 'Progress, meter, range bar, usage bar, 24H range, slider (read-only)',
    source: 'src/components/ProgressBar',
    exports: ['ProgressBar'],
    tokens: ['surface/tertiary (track)', 'surface/accent/discover · success · warning · error -default', 'surface/primary (marker ring)', 'size/04 · 08 · 12 · 16', 'radius/full'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>Progress or Range</h2>
          <p><strong>Progress</strong> fills a track from the left: funds or margin used, steps done. <strong>Range</strong> puts a marker on the track: where today's price sits between the 24H low and high. Always write the value next to the bar — colour alone isn't enough.</p>
        </section>
        <section className={styles.section}>
          <h2>Status</h2>
          <p>Default is blue. Use <strong>Warning</strong> when something is close to a limit (margin above 80%), <strong>Error</strong> when it's over, and <strong>Success</strong> when it's complete. In Figma, pick the value in steps of 10; the bar keeps its percentage at any width.</p>
          <DevOnly><p>Progress is <code>role="progressbar"</code>, Range is <code>role="meter"</code>. Pass <code>valueText</code> for what to announce (“₹3,42,000 of ₹5,00,000”).</p></DevOnly>
        </section>
      </>
    ),
    variants: <ProgressBarVariants />,
    props: [
      { name: 'value', type: 'number', description: '0–100.' },
      { name: 'type', type: "'progress' | 'range'", default: "'progress'", description: 'Figma Type.' },
      { name: 'size', type: "'sm' | 'md'", default: "'sm'", description: 'Figma Size: 4px · 8px bar.' },
      { name: 'status', type: "'default' | 'success' | 'warning' | 'error'", default: "'default'", description: 'Figma Status.' },
      { name: 'label', type: 'string', description: 'Accessible name. Required.' },
      { name: 'valueText', type: 'string', description: 'What screen readers announce; defaults to the percentage.' },
    ],
  },
  {
    id: 'section-header',
    title: 'Section header',
    group: 'Data display',
    description: 'The heading row of a section: a title, with an optional tag, info icon, short description and one action — View all or a switcher.',
    status: 'Figma synced',
    figmaNodeId: '5407:124',
    altNames: 'Section title, section heading, list header, group header, view all',
    source: 'src/components/SectionHeader',
    exports: ['SectionHeader'],
    tokens: ['content/primary (title)', 'content/secondary (description, info)', 'Heading/14', 'Description/12', 'spacing/08 · 04', 'size/48 (touch area)'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>What goes in it</h2>
          <p>The <strong>heading</strong> is always there. Everything else is optional: a <strong>tag</strong> and an <strong>info</strong> icon after the heading, a <strong>description</strong> under it, and one <strong>action</strong> on the right.</p>
          <ul>
            <li><strong>Description:</strong> aim for one line. It never goes past two — longer text is cut with “…”.</li>
            <li><strong>Action:</strong> either <strong>View all</strong> (opens the full list) or a <strong>switcher</strong> — a Select like “Day P&amp;L ↕” or a filter that opens a sheet of choices. Never two actions.</li>
            <li><strong>Touch area:</strong> the action and the info icon are at least 48 × 48 to tap, whatever they look like — without making the row taller.</li>
          </ul>
        </section>
        <section className={styles.section}>
          <h2>Spacing</h2>
          <p>The section header sits 16 above its card or list, and sections are 24 apart (32 for a bigger break) inside the 16 page padding — see Layout.</p>
        </section>
      </>
    ),
    variants: <SectionHeaderVariants />,
    props: [
      { name: 'title', type: 'ReactNode', description: 'Figma ✏️ Heading — required.' },
      { name: 'description', type: 'ReactNode', description: 'Figma ✏️ Description — one line ideally, two at most (cut with an ellipsis).' },
      { name: 'tag', type: 'ReactNode', description: 'Figma 👁️ Tag: a small Tag after the title.' },
      { name: 'onInfo / infoLabel', type: '() => void · string', description: 'Figma 👁️ Info: an ⓘ button after the title (name defaults to “About <title>”).' },
      { name: 'action', type: "{ type: 'view-all', onClick, label? } | { type: 'switcher', label, onClick, expanded? }", description: 'Figma 👁️ CTA, nested Type = Button (View all) · Time Switcher. Touch area ≥ 48 × 48; the row stays as tall as its text.' },
      { name: 'headingLevel', type: '2 | 3 | 4', default: '2', description: 'Heading level of the title.' },
    ],
  },
  {
    id: 'price-change',
    title: 'Price change',
    group: 'Data display',
    description: 'A signed change — price, P&L or returns — in green when up and red when down.',
    status: 'Figma synced',
    figmaNodeId: '5391:79',
    altNames: 'Change, delta, percent change, returns, gain/loss, P&L change, LTP change',
    source: 'src/components/PriceChange',
    exports: ['PriceChange'],
    tokens: ['content/accent/indicator/up-default · down-default', 'content/secondary (flat)', 'Label/12 · 14 · 16', 'size/16 · 20 · 24 (arrow)'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>The sign decides the colour</h2>
          <p>Up is green with “+”, down is red with “−”, and no change is grey with no sign. In Figma you pick the Direction and type only the number in ✏️ Value, so the sign and the colour can never disagree — a falling price can't end up green.</p>
          <DevOnly><p>Pass the signed number as <code>value</code>; direction, sign, colour and arrow all come from it. Screen readers hear “up” / “down” / “unchanged” first.</p></DevOnly>
        </section>
        <section className={styles.section}>
          <h2>Sizes and arrow</h2>
          <p><strong>Small</strong> (Label-12) in rows and cards, <strong>Medium</strong> (Label-14), <strong>Large</strong> (Label-16) next to a big number like Total P&amp;L. Turn on the ▲/▼ <strong>arrow</strong> for headline numbers; leave it off in lists. For an absolute change with a percentage, write both: +252.89 (0.05%).</p>
        </section>
      </>
    ),
    variants: <PriceChangeVariants />,
    props: [
      { name: 'value', type: 'number', description: 'The signed change; sets direction, sign, colour and arrow.' },
      { name: 'unit', type: "'percent' | 'currency' | 'number'", default: "'percent'", description: 'How the absolute value is written.' },
      { name: 'percent', type: 'number', description: 'Optional % in brackets after an absolute change.' },
      { name: 'decimals', type: 'number', default: '2', description: 'Decimal places.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'sm'", description: 'Figma Size.' },
      { name: 'arrow', type: 'boolean', default: 'false', description: 'Figma 👁️ Arrow: ▲ / ▼.' },
    ],
  },
  {
    id: 'chart',
    title: 'Chart',
    group: 'Data display',
    description: 'Price charts — candles, line or area — and a small sparkline for lists.',
    status: 'Figma synced',
    figmaNodeId: '5386:678',
    altNames: 'Graph, candlestick, price chart, line chart, area chart, sparkline, trend line',
    source: 'src/components/Chart',
    exports: ['Chart', 'Sparkline'],
    tokens: ['surface/accent/indicator/up · down -default (candles)', 'surface/accent/indicator/* -light (volume, area)', 'gradient-stop-0/accent/indicator/* -light (area fade)', 'border/accent/indicator/* -default (line)', 'border/light (grid) · border/intense (price line)', 'surface/inverted + content/inverted (last price)', 'Description/10 · Label/10'],
    overview: (
      <>
        <section className={styles.section}>
          <h2>Which chart</h2>
          <p><strong>Candle</strong> for trading views (asset page, Scalp Pro). <strong>Line</strong> for simple price history. <strong>Area</strong> for portfolio value or P&amp;L over time. <strong>Sparkline</strong> is a tiny trend line for watchlist and holdings rows — always next to the price and % change as text.</p>
        </section>
        <section className={styles.section}>
          <h2>Keep the trend honest</h2>
          <p>Up is green and down is red, from the first to the last price. In mockups, pick the Trend that matches the change shown on the screen — a falling price uses Trend = Down. Hide volume, grid, axes or the last-price tag when the space is small.</p>
          <DevOnly><p>Pass <code>data</code> (open, high, low, close, volume); <code>trend</code> defaults to first vs last close. The SVG is a 360×200 viewBox that scales to its container, with a text summary for screen readers.</p></DevOnly>
        </section>
      </>
    ),
    variants: <ChartVariants />,
    props: [
      { name: 'data', type: '{ open, high, low, close, volume? }[]', description: 'Oldest first. Line and Area use close.' },
      { name: 'type', type: "'candle' | 'line' | 'area'", default: "'candle'", description: 'Figma Type.' },
      { name: 'trend', type: "'up' | 'down'", description: 'Figma Trend; defaults to first vs last close.' },
      { name: 'timeLabels', type: 'string[]', description: 'Spread along the x axis.' },
      { name: 'showVolume · showGrid · showAxes · showLastPrice', type: 'boolean', default: 'true', description: 'Figma 👁️ toggles.' },
      { name: 'format', type: '(value) => string', description: 'Axis and last-price formatting.' },
      { name: 'label', type: 'string', description: 'What the chart shows; read with the trend and range. Required.' },
      { name: 'Sparkline', type: '{ data: number[]; trend?; label? }', description: 'Figma L3: Sparkline, 64×24. Decorative unless label is set.' },
    ],
  },
]

export const defaultPageId = 'home'

/** Nav rail groups in display order. */
export const navGroups = [...new Set(pages.map((p) => p.group))].map((group) => ({
  group,
  pages: pages.filter((p) => p.group === group),
}))
