import { Button } from '../components/Button'
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
import { ColorsPreview } from '../preview/ColorsPreview'
import { TypographyPreview } from '../preview/TypographyPreview'
import { NumbersPreview } from '../preview/NumbersPreview'
import { AccountDemo, FiltersDemo, StockDetailDemo, OrderFormDemo, OrderReviewDemo, SheetsDemo, ToastDemo, PortfolioDemo, SettingsDemo, TradeTicketDemo, WatchlistDemo } from './demos'
import { PhoneFrame } from './PhoneFrame'
import { IconsBrowserLazy } from './IconsBrowserLazy'
import type { DocPage } from './types'
import styles from './Docs.module.css'

const FIGMA_FILE = 'https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/'
export const figmaUrl = (nodeId: string) => `${FIGMA_FILE}?node-id=${nodeId.replace(':', '-')}`

const buttonVariants = ['primary', 'secondary', 'tertiary', 'ghost', 'brand', 'buy', 'sell'] as const

export const pages: DocPage[] = [
  // ---- Foundations --------------------------------------------------------
  {
    id: 'colors',
    title: 'Colors',
    group: 'Foundations',
    description: 'Theme tokens from the Figma "🎨 L3 → Theme" collection. Switch product and mode in the header to see every theme.',
    content: <ColorsPreview />,
  },
  {
    id: 'typography',
    title: 'Typography',
    group: 'Foundations',
    description: 'The 42 Manrope text styles from Figma, each available as a single font token.',
    content: <TypographyPreview />,
  },
  {
    id: 'spacing',
    title: 'Spacing & radius',
    group: 'Foundations',
    description: 'Spacing, radius, size and icon-size tokens from the Figma "🌌 Number" and "Icon size" collections.',
    content: <NumbersPreview />,
  },

  {
    id: 'icons',
    title: 'Icons',
    group: 'Foundations',
    description: 'The full Material Symbols set — Rounded, weight 400, grade 0, optical size 24dp, fill off (with the filled variant) — straight from Google, stored in the repo and imported one icon at a time.',
    content: (
      <>
        <section className={styles.section}>
          <h2>Using an icon</h2>
          <pre className={styles.codeBlock}><code>{`import { Icon } from './components/Icon'
import { msWallet, msWalletFill } from './icons/material'

<Icon icon={msWallet} size={24} />            // decorative
<Icon icon={msWalletFill} label="Wallet" />    // meaningful → announced
<Button iconLeft={<Icon icon={msAdd} />}>Add funds</Button>`}</code></pre>
          <p>Only the icons you import end up in the app. Colour comes from the surrounding text colour; sizes use the icon-size tokens (12–24). Run <code>npm run icons</code> to pull new icons from Google.</p>
        </section>
        <IconsBrowserLazy />
      </>
    ),
  },

  // ---- Action ---------------------------------------------------------------
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
    tokens: ['component/button/*', 'state-layer/*', 'text-bold-16 · 14', 'text-semibold-12', 'size/control-sm · md · lg', 'radius/08 · 12', 'icon-size/16 · 20 · 24', 'size/tap-target'],
    overview: (
      <>
        <PhoneFrame label="Order ticket using Buy and Sell buttons">
          <TradeTicketDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Types</h2>
          <p>Seven types. Buy and Sell carry trade actions; Brand follows the product colour (Lemonn lime, CS PRO gold, Kuber green).</p>
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
      { name: 'iconLeft', type: 'ReactNode', description: 'Figma icon-l slot, sized and coloured by the button.' },
      { name: 'iconRight', type: 'ReactNode', description: 'Figma icon-r slot.' },
      { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Stretch to the container width.' },
      { name: '…button props', type: 'ButtonHTMLAttributes', description: 'onClick, type (defaults to "button"), aria-*, etc.' },
    ],
  },

  {
    id: 'button-group',
    title: 'Button group',
    group: 'Action',
    description: 'A bar at the bottom of a screen or sheet that holds its main actions — stacked full-width, or side by side.',
    status: 'Figma synced',
    altNames: 'Button dock, action bar, sticky footer, CTA bar',
    figmaNodeId: '4471:29456',
    source: 'src/components/ButtonGroup',
    exports: ['ButtonGroup'],
    tokens: ['surface/primary', 'border/light', 'spacing/12 · 16', 'shadow/elevation-high', 'motion/* (local)'],
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
    tokens: ['surface/primary · disabled', 'border/light · dark · accent/error', 'content/primary · secondary · tertiary · disabled', 'content/accent/error · success · discover', 'text-medium-12 · 14', 'text-semibold-12', 'radius/12', 'shadow/elevation-low', 'icon-size/14 · 16'],
    overview: (
      <>
        <PhoneFrame label="Buy order form with quantity, limit price, note and a disabled exchange field">
          <OrderFormDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>States come from the input</h2>
          <p>Figma draws six states. In code, Typing is focus (dark border, blue caret), Typed is simply having a value, and Disabled is the disabled attribute. Only Error and Success are set by you with <code>status</code> — try a quantity of 0 or a price outside the band above.</p>
        </section>
        <section className={styles.section}>
          <h2>Text box counter</h2>
          <p>With <code>multiline</code> and <code>maxLength</code> the text box shows “n/max”. Typing past the limit is allowed but switches to the error state with “Character limit reached”, as in Figma.</p>
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
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Not drawn in Figma; uses content/disabled.' },
      { name: '…input props', type: 'InputHTMLAttributes', description: 'onChange, aria-label, id, etc. Renders role="switch".' },
    ],
  },

  // ---- Navigation -------------------------------------------------------------
  {
    id: 'tabs',
    title: 'Tabs',
    group: 'Navigation',
    description: 'Tabs switch between related views on the same screen. Underline tabs split a page into sections; pill tabs filter what\'s shown.',
    status: 'Figma synced',
    altNames: 'Tab bar, segmented control, chips, filter pills',
    figmaNodeId: '4543:65938',
    source: 'src/components/Tabs',
    exports: ['Tabs', 'Tab'],
    tokens: ['content/primary · secondary · inverted', 'surface/primary · inverted', 'border/light · dark', 'state-layer/*', 'text-semibold-10 · 12 · 14', 'text-extrabold-12 · 14', 'radius/12 · full', 'size/24 · 32 · 40', 'spacing/36', 'size/tap-target'],
    overview: (
      <>
        <PhoneFrame label="Portfolio screen with underline section tabs and pill filters">
          <PortfolioDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Two components</h2>
          <p><strong>Tabs</strong> (Figma "L3: Tabs") is the bar: selection, horizontal scrolling on small screens, and arrow-key navigation. <strong>Tab</strong> (Figma "L3: base tab") is one item, in underline or pill form, md or sm.</p>
        </section>
        <section className={styles.section}>
          <h2>No layout shift</h2>
          <p>Selected underline tabs switch to the extrabold style. Each tab reserves that bolder width up front, so neighbouring tabs don't move when the selection changes.</p>
        </section>
      </>
    ),
    variants: <TabsVariants />,
    props: [
      { name: 'items', type: 'TabItem[]', description: 'Tabs: { value, label, iconLeft?, iconRight? }.' },
      { name: 'value', type: 'string', description: 'Tabs: the selected item value.' },
      { name: 'onChange', type: '(value) => void', description: 'Tabs: called on tap and on arrow / Home / End keys.' },
      { name: 'appearance', type: "'underline' | 'pill'", default: "'underline'", description: 'Figma isPill (Tabs) / isChip (base tab).' },
      { name: 'emphasis', type: "'primary' | 'secondary'", default: "'primary'", description: 'Figma isPrimary: selected pill filled (primary) or outlined (secondary).' },
      { name: 'size', type: "'md' | 'sm'", default: "'md'", description: 'Figma isSmall: underline 40 / 36, pill 32 / 24.' },
      { name: 'aria-label', type: 'string', description: 'Tabs: required name for the tab list.' },
      { name: 'idPrefix', type: 'string', description: 'Tabs: sets tab ids / aria-controls so panels can be linked.' },
      { name: 'iconLeft / iconRight', type: 'ReactNode', description: 'Figma icon slots, 16px, coloured with the label.' },
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
    tokens: ['surface/default', 'border/light · dark', 'content/primary · secondary · disabled', 'content/accent/discover (caret)', 'text-extrabold-14', 'text-medium-12 · 14', 'size/32 · 48', 'state-layer/*', 'radius/full'],
    overview: (
      <>
        <PhoneFrame label="Stock screen with an actionbar: back, title, search and watchlist actions, and tabs underneath">
          <StockDetailDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Title or search</h2>
          <p>Figma's base content has three types: Content (heading + description), Search (placeholder) and Searched (typed). Pass <code>search</code> and the middle becomes a real search input — tap the search action above.</p>
        </section>
        <section className={styles.section}>
          <h2>Actions and bottom content</h2>
          <p><code>ActionbarAction</code> is Figma's round 32px icon button; give it a label so it's announced. <code>bottom</code> is Figma's content-bottom slot — tabs or filters that belong to the bar. The title is the screen's heading (h1).</p>
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
      { name: 'sticky', type: 'boolean', default: 'false', description: 'Stick to the top while the page scrolls.' },
      { name: 'ActionbarAction', type: '{ icon, label, onClick, pressed? }', description: 'Round 32px icon button; pressed shows a toggle state (e.g. watchlist).' },
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
    tokens: ['surface/primary', 'border/light · intense', 'content/primary · secondary', 'text-extrabold-18 · 20', 'text-semibold-12 · 14', 'radius/24 · full', 'shadow/elevation-high', 'static/black + opacity/80 (overlay)', 'motion/* (local)', 'size/tap-target'],
    overview: (
      <>
        <PhoneFrame label="Stock screen that opens an order bottom sheet, a result sheet and a top sheet">
          <SheetsDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Three pieces</h2>
          <p><strong>BottomSheet</strong> is the modal: the Figma "L3: Overlay" backdrop, slide-in, focus trap, Esc / backdrop / drag-down to close. <strong>BottomSheetHeader</strong> is Figma's header in small (back · heading · ⓘ · close or any action) and large (icon · tag · heading · description) sizes. <strong>BottomSheetSurface</strong> is the panel alone, for embedding or static layouts.</p>
        </section>
        <section className={styles.section}>
          <h2>Always give it a close button</h2>
          <p>Backdrop tap, Esc and drag-down all close the sheet, but screen-reader and switch users on touch devices rely on a real button — pass <code>onClose</code> to the header (or put a Cancel button in the footer). The page behind the sheet is made inert while it is open.</p>
        </section>
        <section className={styles.section}>
          <h2>Bottom or top</h2>
          <p>Figma's isBottom=False drops the sheet from the top with rounded bottom corners — handy for sort or filter menus tied to the top of the screen.</p>
        </section>
      </>
    ),
    variants: <BottomSheetVariants />,
    props: [
      { name: 'open / onClose', type: 'boolean / () => void', description: 'BottomSheet: visibility; onClose fires on backdrop tap, Esc and drag-down.' },
      { name: 'placement', type: "'bottom' | 'top'", default: "'bottom'", description: 'Figma isBottom.' },
      { name: 'header', type: 'ReactNode', description: 'Figma 👁️ Header — usually <BottomSheetHeader />.' },
      { name: 'children', type: 'ReactNode', description: 'Figma content slot; scrolls if the sheet would be taller than the screen.' },
      { name: 'footer', type: 'ReactNode', description: 'Figma "Buttons" — usually <ButtonGroup>.' },
      { name: 'utility', type: 'ReactNode', description: 'Figma Utility slot, below the buttons.' },
      { name: 'dragHandle', type: 'boolean', default: 'false', description: 'Figma 👁️ Drag handle; also enables drag-down to dismiss.' },
      { name: 'container', type: 'HTMLElement | null', default: 'document.body', description: 'Render inside another element instead of covering the page.' },
      { name: 'aria-labelledby', type: 'string', description: 'Point at the header heading (headingId) to name the dialog.' },
      { name: 'Header: size', type: "'sm' | 'lg'", default: "'sm'", description: 'Figma isSmall.' },
      { name: 'Header: heading / description', type: 'string', description: 'Heading text and optional description.' },
      { name: 'Header: info', type: 'boolean | ReactNode', default: 'false', description: 'sm: ⓘ after the heading (decorative on its own).' },
      { name: 'Header: onInfo / infoLabel', type: "() => void / string", default: "'More information'", description: 'sm: makes the ⓘ a real, labelled button.' },
      { name: 'Header: onBack / onClose / trailing', type: '() => void / ReactNode', description: 'sm actions: back button, close button, or any right-side node (Tag, small Button).' },
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
    tokens: ['surface/tertiary · inverted', 'surface/accent/* (light · default)', 'content/primary · secondary · inverted', 'static/black', 'opacity/60 · 80', 'text-semibold-14', 'text-medium-12', 'radius/12', 'shadow/elevation-low · medium', 'motion/* (local)'],
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
          <p>Without <code>floating</code> it's a full-width strip that sits in the layout (the market-hours warning above). With <code>floating</code> it's a rounded, shadowed toast inset 16px from the edges that rises in when shown.</p>
        </section>
        <section className={styles.section}>
          <h2>Soft or solid</h2>
          <p>Figma's isPrimary: the default light tint suits information that can wait; the solid colour (emphasis="primary") is for results people should notice straight away. Danger is announced immediately to screen readers (role="alert"); the rest politely (role="status"). For a danger bar that is part of the page rather than a new event, pass <code>role="status"</code> so it isn't read out as an alert on every visit.</p>
        </section>
      </>
    ),
    variants: <AerobarVariants />,
    props: [
      { name: 'type', type: "'primary' | 'discover' | 'danger' | 'success' | 'warning'", default: "'primary'", description: 'Figma Type.' },
      { name: 'emphasis', type: "'primary' | 'secondary'", default: "'secondary'", description: 'Figma isPrimary: solid colour (primary) or light tint (secondary).' },
      { name: 'floating', type: 'boolean', default: 'false', description: 'Figma isFloating: toast card with shadow and a rise-in animation.' },
      { name: 'heading / paragraph', type: 'ReactNode', description: 'Figma Headline text / Paragraph text (hidden when not passed).' },
      { name: 'icon', type: 'ReactNode | false', default: 'info icon', description: 'Figma icon-L slot (24px); false hides it.' },
      { name: 'action', type: '{ label, onClick }', description: 'Figma Action-r: small borderless secondary button.' },
    ],
  },

  // ---- Data display -----------------------------------------------------------
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
    tokens: ['surface/primary', 'border/light', 'content/primary · secondary', 'content/accent/discover (dot)', 'text-semibold-14 · 16', 'text-medium-12', 'radius/12 · full', 'icon-size/16 · 24', 'state-layer/* (tappable rows)'],
    overview: (
      <>
        <PhoneFrame label="Account screen built from list cells with chevrons, a switch, a tag and bank-account cards">
          <AccountDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Plain or card</h2>
          <p>Plain rows sit edge to edge in a list; cards (Figma isPlain=False) have a border and rounded corners and stack with a gap — like the bank accounts above. Both come in default (48) and small (32).</p>
        </section>
        <section className={styles.section}>
          <h2>Tappable rows</h2>
          <p>Use <code>as="button"</code> or <code>href</code> to make the whole row tappable with a pressed tint. Use <code>as="label"</code> with a Switch or Checkbox in <code>trailing</code> so tapping anywhere on the row toggles it — try “Biometric login”.</p>
        </section>
      </>
    ),
    variants: <ListCellVariants />,
    props: [
      { name: 'label / description', type: 'ReactNode', description: 'Figma "Label goes here" / "Type description".' },
      { name: 'size', type: "'md' | 'sm'", default: "'md'", description: 'Figma isSmall: 48 / 32 min height, 24 / 16 icons.' },
      { name: 'variant', type: "'plain' | 'card'", default: "'plain'", description: 'Figma isPlain: flat row, or bordered rounded card.' },
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
    tokens: ['surface/accent/*', 'content/accent/*', 'border/accent/*', 'surface/inverted', 'static/black', 'text-semibold-10 · 12 · 14', 'radius/04', 'size/16 · 20 · 24'],
    overview: (
      <>
        <PhoneFrame label="Watchlist using tags for exchange, segment and price change">
          <WatchlistDemo />
        </PhoneFrame>
        <section className={styles.section}>
          <h2>Types</h2>
          <p>Primary is solid, Secondary is soft with a border, Tertiary is soft without one.</p>
          <div className={styles.demoRow}>
            <Tag variant="primary" color="green" size="md">Primary</Tag>
            <Tag variant="secondary" color="green" size="md">Secondary</Tag>
            <Tag variant="tertiary" color="green" size="md">Tertiary</Tag>
            <Tag size="md" disabled>Disabled</Tag>
          </div>
        </section>
      </>
    ),
    variants: <TagPreview />,
    props: [
      { name: 'variant', type: "'primary' | 'secondary' | 'tertiary'", default: "'primary'", description: 'Figma Type (Tertiory → tertiary).' },
      { name: 'color', type: "'neutral' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo' | 'teal' | 'discover' | 'orange'", default: "'neutral'", description: 'Figma Color. Green/yellow/red use the success/warning/error tokens.' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'sm'", description: 'Figma Size: 16, 20, 24.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Figma Type=Disabled; overrides variant and color.' },
      { name: 'iconLeft / iconRight', type: 'ReactNode', description: 'Icon slots, sized and coloured by the tag.' },
    ],
  },
]

export const defaultPageId = 'button'

/** Nav rail groups in display order. */
export const navGroups = [...new Set(pages.map((p) => p.group))].map((group) => ({
  group,
  pages: pages.filter((p) => p.group === group),
}))
