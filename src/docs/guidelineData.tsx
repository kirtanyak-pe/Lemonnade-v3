// Do / Don't pairs per docs page id. Examples use the real components (rendered inert).
import { Actionbar, ActionbarAction } from '../components/Actionbar'
import { Aerobar } from '../components/Aerobar'
import { BottomNavbar } from '../components/BottomNavbar'
import { BottomSheetHeader } from '../components/BottomSheet'
import { Button } from '../components/Button'
import { ButtonGroup } from '../components/ButtonGroup'
import { Card } from '../components/Card'
import { Checkbox, Radio } from '../components/Checkbox'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ListCell } from '../components/ListCell'
import { Switch } from '../components/Switch'
import { Tabs } from '../components/Tabs'
import { Tag } from '../components/Tag'
import { TextField } from '../components/TextField'
import { msChevronRight, msClose, msDeleteForever, msSearch, msShare, msStar } from '../icons/material'
import { mainNavItems } from '../preview/BottomNavbarVariants'
import type { Guideline } from './GuidelinesView'
import styles from './Docs.module.css'

const noop = () => {}
const tabs3 = [{ value: 'a', label: 'Overview' }, { value: 'b', label: 'Financials' }, { value: 'c', label: 'News' }]

export const guidelines: Record<string, Guideline[]> = {
  card: [
    {
      title: 'One action? Make the whole card clickable',
      do: { text: 'The card itself is the tap target — elevation-low, press scale.', example: <Card onClick={noop}><span className={styles.cardRow}><span className={styles.cardTitle}>NHPC</span><Tag variant="secondary" color="processing" size="md">Open</Tag></span></Card> },
      dont: { text: 'Put a single button inside a static card.', example: <Card><span className={styles.cardRow}><span className={styles.cardTitle}>NHPC</span><Button size="sm" variant="secondary">View</Button></span></Card> },
    },
  ],
  button: [
    {
      title: 'One primary action per screen',
      do: { text: 'Pair one primary with secondary actions so the main step is obvious.', example: <div className={styles.exRow}><Button size="md" variant="secondary">Cancel</Button><Button size="md">Confirm</Button></div> },
      dont: { text: 'Put several primary buttons side by side — nothing stands out.', example: <div className={styles.exRow}><Button size="md">Modify</Button><Button size="md">Confirm</Button></div> },
    },
    {
      title: 'Secondary only beside a stronger button',
      do: { text: 'Pair secondary with primary, buy, sell or brand — usually in a dock. Alone, use tertiary.', example: <div className={styles.exStack}><ButtonGroup direction="horizontal" aria-label="Confirm"><Button variant="secondary">Cancel</Button><Button>Confirm</Button></ButtonGroup><Button size="md" variant="tertiary">View all</Button></div> },
      dont: { text: 'Use a secondary button on its own on the page or inside a card.', example: <Button size="md" variant="secondary">View all</Button> },
    },
    {
      title: 'Use Buy and Sell only for trades',
      do: { text: 'Buy (green) and Sell (red) are for placing orders.', example: <div className={styles.exRow}><Button size="md" variant="sell">Sell</Button><Button size="md" variant="buy">Buy</Button></div> },
      dont: { text: 'Borrow their colors for unrelated actions like saving settings.', example: <Button size="md" variant="buy">Save settings</Button> },
    },
  ],
  'button-group': [
    {
      title: 'Primary goes where the thumb ends',
      do: { text: 'Horizontal: primary on the right. Vertical: primary on top.', example: <ButtonGroup direction="horizontal" aria-label="Actions"><Button size="lg" variant="secondary">Cancel</Button><Button size="lg">Place order</Button></ButtonGroup> },
      dont: { text: 'Flip the order between screens — people tap the wrong one.', example: <ButtonGroup direction="horizontal" aria-label="Actions"><Button size="lg">Place order</Button><Button size="lg" variant="secondary">Cancel</Button></ButtonGroup> },
    },
  ],
  tag: [
    {
      title: 'Keep tags short and static',
      do: { text: 'One or two words that label or show status.', example: <div className={styles.exRow}><Tag variant="secondary" color="profit" size="sm">+1.24%</Tag><Tag size="sm">NSE</Tag></div> },
      dont: { text: 'Use a tag as a button or for sentences.', example: <Tag variant="secondary" color="discover" size="md">Tap here to see all your open orders</Tag> },
    },
  ],
  switch: [
    {
      title: 'Switches apply immediately',
      do: { text: 'Use for settings that take effect as soon as they flip.', example: <label className={styles.playRow}><span>Price alerts</span><Switch defaultChecked /></label> },
      dont: { text: 'Use inside a form that needs Save — use a checkbox there.', example: <div className={styles.exStack}><label className={styles.playRow}><span>Accept terms</span><Switch /></label><Button size="sm">Submit</Button></div> },
    },
  ],
  checkbox: [
    {
      title: 'Checkboxes for many, radios for one',
      do: { text: 'Radios when exactly one option can be chosen.', example: <div className={styles.exStack}><label className={styles.playRow}><Radio name="g1" defaultChecked /><span>Delivery</span></label><label className={styles.playRow}><Radio name="g1" /><span>Intraday</span></label></div> },
      dont: { text: 'Checkboxes for mutually exclusive options.', example: <div className={styles.exStack}><label className={styles.playRow}><Checkbox defaultChecked /><span>Delivery</span></label><label className={styles.playRow}><Checkbox /><span>Intraday</span></label></div> },
    },
  ],
  'text-field': [
    {
      title: 'Always show a label',
      do: { text: 'A visible label stays when people start typing.', example: <TextField label="Quantity" placeholder="Enter quantity" /> },
      dont: { text: 'Rely on the placeholder as the label — it disappears on input.', example: <TextField aria-label="Quantity" placeholder="Quantity" /> },
    },
    {
      title: 'Explain errors',
      do: { text: 'Say what went wrong and how to fix it.', example: <TextField label="Quantity" defaultValue="30" status="error" helperText="Must be a multiple of the lot size (25)" /> },
      dont: { text: 'Show a red border with no message.', example: <TextField label="Quantity" defaultValue="30" status="error" /> },
    },
  ],
  tabs: [
    {
      title: 'Short, parallel labels',
      do: { text: 'Two to four one-word sections of the same thing.', example: <Tabs aria-label="Sections" items={tabs3} value="a" onChange={noop} /> },
      dont: { text: 'Long labels that truncate, or tabs that act like buttons.', example: <Tabs aria-label="Sections" items={[{ value: 'a', label: 'Company overview' }, { value: 'b', label: 'Quarterly results' }, { value: 'c', label: 'Buy now' }]} value="a" onChange={noop} /> },
    },
  ],
  actionbar: [
    {
      title: 'Flat tabs belong to the bar',
      do: { text: 'Put screen-level (flat) tabs in the Actionbar’s bottom slot.', example: <Actionbar headingLevel={2} title="Portfolio" bottom={<Tabs aria-label="Portfolio" items={[{ value: 'a', label: 'Positions' }, { value: 'b', label: 'Orders' }]} value="b" onChange={noop} />} /> },
      dont: { text: 'Place flat tabs below the bar as a separate layer.', example: <div className={styles.exStack}><Actionbar headingLevel={2} title="Portfolio" /><Tabs aria-label="Portfolio" items={[{ value: 'a', label: 'Positions' }, { value: 'b', label: 'Orders' }]} value="b" onChange={noop} /></div> },
    },
    {
      title: 'Two actions at most',
      do: { text: 'Keep the bar to the one or two most useful actions.', example: <Actionbar headingLevel={2} title="RELIANCE" onBack={noop} actions={<><ActionbarAction icon={msSearch} label="Search" onClick={noop} /><ActionbarAction icon={msStar} label="Watchlist" onClick={noop} /></>} /> },
      dont: { text: 'Crowd it with icons — the title gets squeezed out.', example: <Actionbar headingLevel={2} title="RELIANCE INDUSTRIES" onBack={noop} actions={<><ActionbarAction icon={msSearch} label="Search" onClick={noop} /><ActionbarAction icon={msStar} label="Watchlist" onClick={noop} /><ActionbarAction icon={msShare} label="Share" onClick={noop} /></>} /> },
    },
  ],
  'bottom-navbar': [
    {
      title: 'Only top-level sections',
      do: { text: 'Three to five main sections, always with labels.', example: <BottomNavbar aria-label="Main" items={mainNavItems} value="stocks" /> },
      dont: { text: 'Put actions (like Buy) or more than five items in the bar.', example: <BottomNavbar aria-label="Main" items={[...mainNavItems.slice(0, 3), { value: 'buy', label: 'Buy now', icon: mainNavItems[0].icon }, ...mainNavItems.slice(3)]} value="stocks" /> },
    },
  ],
  'bottom-sheet': [
    {
      title: 'Back only on a stacked sheet',
      do: { text: 'The first sheet over a screen has no back button. A second sheet on top of it has one, returning to the first. Two sheets at most.', example: <BottomSheetHeader heading="Order types" onBack={noop} /> },
      dont: { text: 'Put a back button on the first sheet, or open a third sheet on top of two.', example: <BottomSheetHeader heading="Buy RELIANCE" description="First sheet · with a back button" onBack={noop} /> },
    },
    {
      title: 'Close by dragging or tapping outside',
      do: { text: 'Keep the header clean: heading, and a back button or one action if needed. The sheet closes by dragging down or tapping the backdrop.', example: <BottomSheetHeader heading="Buy RELIANCE" description="NSE" /> },
      dont: { text: 'Add a ✕ or a drag handle — closing is handled without visible controls.', example: <BottomSheetHeader heading="Buy RELIANCE" description="NSE" trailing={<Button size="sm" variant="ghost" aria-label="Close" iconLeft={<Icon icon={msClose} />} />} /> },
    },
  ],
  aerobar: [
    {
      title: 'Let people act before it goes',
      do: { text: 'Toasts with an action stay until tapped or closed.', example: <Aerobar type="success" heading="Order placed" paragraph="Buy 10 RELIANCE" action={{ label: 'View', onClick: noop }} /> },
      dont: { text: 'Hide important info or undo behind a timer.', example: <Aerobar type="danger" heading="Order rejected — tap within 3s to retry" /> },
    },
  ],
  'empty-state': [
    {
      title: 'Offer a way forward',
      do: { text: 'Say what happened and give an action to recover.', example: <EmptyState headingLevel={3} title="No results found" description="Try a different name or symbol." action={<Button size="sm" iconLeft={<Icon icon={msDeleteForever} size={12} />}>Clear</Button>} /> },
      dont: { text: 'Leave a blank screen or a dead end.', example: <EmptyState headingLevel={3} illustration={null} title="Error" /> },
    },
  ],
  'list-cell': [
    {
      title: 'Show where a row leads',
      do: { text: 'Tappable rows get a chevron (or trailing control).', example: <ListCell as="button" label="Holdings" description="12 stocks" iconRight={<Icon icon={msChevronRight} />} onClick={noop} /> },
      dont: { text: 'Make rows tappable with nothing to hint at it.', example: <ListCell as="div" label="Holdings" description="12 stocks" /> },
    },
  ],
}
