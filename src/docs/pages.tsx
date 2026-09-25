import { Button } from '../components/Button'
import { Tag } from '../components/Tag'
import { ButtonPreview } from '../preview/ButtonPreview'
import { TagPreview } from '../preview/TagPreview'
import { SwitchVariants } from '../preview/SwitchVariants'
import { SelectionVariants } from '../preview/SelectionVariants'
import { TabsVariants } from '../preview/TabsVariants'
import { ColorsPreview } from '../preview/ColorsPreview'
import { TypographyPreview } from '../preview/TypographyPreview'
import { NumbersPreview } from '../preview/NumbersPreview'
import { FiltersDemo, PortfolioDemo, SettingsDemo, TradeTicketDemo, WatchlistDemo } from './demos'
import { PhoneFrame } from './PhoneFrame'
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

  // ---- Data display -----------------------------------------------------------
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
