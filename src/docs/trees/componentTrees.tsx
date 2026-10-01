import { Actionbar, ActionbarAction } from '../../components/Actionbar'
import { Aerobar } from '../../components/Aerobar'
import { BottomNavbar } from '../../components/BottomNavbar'
import { BottomSheetHeader, BottomSheetSurface } from '../../components/BottomSheet'
import { BrandLogo } from '../../components/BrandLogo'
import { Button } from '../../components/Button'
import { ButtonGroup } from '../../components/ButtonGroup'
import { Card } from '../../components/Card'
import { Checkbox, Radio } from '../../components/Checkbox'
import { EmptyState } from '../../components/EmptyState'
import { Icon } from '../../components/Icon'
import { ListCell } from '../../components/ListCell'
import { Switch } from '../../components/Switch'
import { Tabs } from '../../components/Tabs'
import { Tag, TagPlaceholderIcon } from '../../components/Tag'
import { TextField } from '../../components/TextField'
import { msAccountBalance, msBlurOn, msChevronRight, msSearch, msStar } from '../../icons/material'
import { fnoNavItems, mainNavItems } from '../../preview/BottomNavbarVariants'
import { Mini, type ComponentTreeSpec } from '../ComponentTree'
import { buttonTree } from './buttonTree'

// Option trees for every component page (Tree tab). Rules come from the USAGE.md files and DESIGN_SYSTEM.md.

const noop = () => {}
const tabItems = [{ value: 'a', label: 'Overview' }, { value: 'b', label: 'News' }]

const buttonGroup: ComponentTreeSpec = {
  title: 'Button dock',
  note: 'The main action(s) of a screen or sheet',
  branches: [
    {
      id: 'direction', label: 'Direction', note: 'How the buttons sit',
      leaves: [
        { id: 'd-v', label: 'vertical', note: 'Default. Long labels; strong button on top.', preview: <Mini><ButtonGroup aria-label="Confirm"><Button>Confirm buy</Button><Button variant="secondary">Edit order</Button></ButtonGroup></Mini> },
        { id: 'd-h', label: 'horizontal', note: 'Two short labels; strong button on the right.', preview: <Mini><ButtonGroup direction="horizontal" aria-label="Order"><Button variant="secondary">Modify</Button><Button variant="buy">Buy</Button></ButtonGroup></Mini> },
      ],
    },
    {
      id: 'contents', label: 'Buttons', note: 'Always lg · at least one strong button',
      leaves: [
        { id: 'c-one', label: '1 strong', note: 'A single main action.', preview: <Mini><ButtonGroup aria-label="Place"><Button variant="buy">Place buy order</Button></ButtonGroup></Mini> },
        { id: 'c-pair', label: 'secondary + strong', note: 'Cancel + Confirm, Modify + Buy.', preview: <Mini><ButtonGroup direction="horizontal" aria-label="Confirm"><Button variant="secondary">Cancel</Button><Button>Confirm</Button></ButtonGroup></Mini> },
        { id: 'c-trade', label: 'sell + buy', note: 'Trade ticket.', preview: <Mini><ButtonGroup direction="horizontal" aria-label="Trade"><Button variant="sell">Sell</Button><Button variant="buy">Buy</Button></ButtonGroup></Mini> },
      ],
    },
    {
      id: 'scroll', label: 'Scroll indicator', note: 'Content under the dock',
      leaves: [
        { id: 's-off', label: 'off', note: 'Nothing below, or at the end of the content.', preview: <Mini><ButtonGroup aria-label="Done"><Button>Done</Button></ButtonGroup></Mini> },
        { id: 's-on', label: 'on', note: 'While more content scrolls underneath.', preview: <Mini><ButtonGroup scrollIndicator aria-label="Done"><Button>Done</Button></ButtonGroup></Mini> },
      ],
    },
  ],
}

const checkbox: ComponentTreeSpec = {
  title: 'Checkbox & radio',
  note: 'Pick many · pick one',
  branches: [
    {
      id: 'type', label: 'Type', note: 'How many can be chosen',
      leaves: [
        { id: 't-cb', label: 'checkbox', note: 'Several options, or one on/off choice in a form.', preview: <Checkbox aria-label="Checkbox" defaultChecked /> },
        { id: 't-r', label: 'radio', note: 'Exactly one of a set; radios share a name.', preview: <Radio aria-label="Radio" name="tree-r" defaultChecked /> },
      ],
    },
    {
      id: 'state', label: 'State', note: 'Checkbox shown',
      leaves: [
        { id: 'st-off', label: 'unchecked', preview: <Checkbox aria-label="Off" /> },
        { id: 'st-on', label: 'checked', preview: <Checkbox aria-label="On" defaultChecked /> },
        { id: 'st-mixed', label: 'indeterminate', note: 'A parent with some children checked.', preview: <Checkbox aria-label="Some" indeterminate /> },
        { id: 'st-dis', label: 'disabled', preview: <Checkbox aria-label="Disabled" disabled defaultChecked /> },
      ],
    },
    {
      id: 'row', label: 'In a row', note: 'With a label',
      leaves: [
        { id: 'r-cell', label: 'ListCell as="label"', note: 'Tap anywhere on the row to toggle.', preview: <ListCell as="label" label="Equity" trailing={<Checkbox defaultChecked />} /> },
      ],
    },
  ],
}

const textField: ComponentTreeSpec = {
  title: 'Input field',
  note: 'Single line or text box',
  branches: [
    {
      id: 'type', label: 'Type', note: 'How much text',
      leaves: [
        { id: 't-field', label: 'field', note: 'One line: quantity, PAN, search.', preview: <TextField label="Quantity" placeholder="Enter quantity" /> },
        { id: 't-box', label: 'multiline', note: 'A text box with a character counter.', preview: <TextField multiline label="Note" maxLength={120} placeholder="Add a note" /> },
      ],
    },
    {
      id: 'status', label: 'Status', note: 'Feedback below the input',
      leaves: [
        { id: 's-def', label: 'default', note: 'Helper text explains the field.', preview: <TextField label="PAN" defaultValue="ABCDE1234F" helperText="As on your PAN card" /> },
        { id: 's-ok', label: 'success', note: 'The value checks out.', preview: <TextField label="PAN" defaultValue="ABCDE1234F" status="success" helperText="PAN verified" /> },
        { id: 's-err', label: 'error', note: 'Say what went wrong and how to fix it.', preview: <TextField label="PAN" defaultValue="ABCDE123" status="error" helperText="Enter a valid 10-character PAN" /> },
        { id: 's-dis', label: 'disabled', preview: <TextField label="PAN" defaultValue="ABCDE1234F" disabled /> },
      ],
    },
    {
      id: 'extras', label: 'Extras', note: 'Optional parts',
      leaves: [
        { id: 'e-req', label: 'required', note: 'Marks the label.', preview: <TextField label="Email" required placeholder="you@example.com" /> },
        { id: 'e-icon', label: 'iconLeft / iconRight', note: '16px icons inside the field.', preview: <TextField label="Search" iconLeft={<Icon icon={msSearch} size={16} />} placeholder="Search stocks" /> },
      ],
    },
  ],
}

const toggle: ComponentTreeSpec = {
  title: 'Toggle switch',
  note: 'A setting that applies immediately',
  branches: [
    {
      id: 'size', label: 'Size',
      leaves: [
        { id: 'sz-md', label: 'md', note: 'Default, in settings rows.', preview: <Switch aria-label="On" defaultChecked /> },
        { id: 'sz-sm', label: 'sm', note: 'Compact rows and toolbars.', preview: <Switch size="sm" aria-label="On" defaultChecked /> },
      ],
    },
    {
      id: 'state', label: 'State',
      leaves: [
        { id: 'st-off', label: 'off', preview: <Switch aria-label="Off" /> },
        { id: 'st-on', label: 'on', preview: <Switch aria-label="On" defaultChecked /> },
        { id: 'st-dis', label: 'disabled', preview: <Switch aria-label="Disabled" disabled defaultChecked /> },
      ],
    },
    {
      id: 'row', label: 'In a row', note: 'Never inside a form that needs Save',
      leaves: [
        { id: 'r-cell', label: 'ListCell as="label"', note: 'The whole row toggles it.', preview: <ListCell as="label" label="Price alerts" trailing={<Switch defaultChecked />} /> },
      ],
    },
  ],
}

const tabs: ComponentTreeSpec = {
  title: 'Tabs',
  note: 'Switch sections or segments',
  branches: [
    {
      id: 'appearance', label: 'Appearance', note: 'What it switches',
      leaves: [
        { id: 'a-u', label: 'underline', note: 'Sections of a screen. At the top: in the Actionbar bottom slot.', preview: <Tabs aria-label="Sections" items={tabItems} value="a" onChange={noop} /> },
        { id: 'a-p', label: 'pill', note: 'Segments and filter chips. There is no Chip component.', preview: <Tabs aria-label="Segments" appearance="pill" items={tabItems} value="a" onChange={noop} /> },
      ],
    },
    {
      id: 'size', label: 'Size',
      leaves: [
        { id: 's-md', label: 'md', note: 'Default.', preview: <Tabs aria-label="md" appearance="pill" items={tabItems} value="a" onChange={noop} /> },
        { id: 's-sm', label: 'sm', note: 'Dense filter rows inside content.', preview: <Tabs aria-label="sm" appearance="pill" size="sm" items={tabItems} value="a" onChange={noop} /> },
      ],
    },
    {
      id: 'pill', label: 'Pill options', note: 'Chip tabs only',
      leaves: [
        { id: 'p-em', label: 'emphasis: secondary', note: 'Outlined selected pill instead of filled.', preview: <Tabs aria-label="Secondary" appearance="pill" emphasis="secondary" items={tabItems} value="a" onChange={noop} /> },
        { id: 'p-sub', label: 'subLabel', note: 'A second 8/10 line under the label.', preview: <Tabs aria-label="Sub" appearance="pill" items={[{ value: 'a', label: '25 Sep', subLabel: 'Weekly' }, { value: 'b', label: '30 Oct', subLabel: 'Monthly' }]} value="a" onChange={noop} /> },
        { id: 'p-icon', label: 'hideLabel', note: 'Icon-only tab; the label stays as its name.', preview: <Tabs aria-label="Icons" appearance="pill" items={[{ value: 'a', label: 'Favourites', hideLabel: true, iconLeft: <Icon icon={msStar} size={16} /> }, { value: 'b', label: 'Search', hideLabel: true, iconLeft: <Icon icon={msSearch} size={16} /> }]} value="a" onChange={noop} /> },
      ],
    },
  ],
}

const actionbar: ComponentTreeSpec = {
  title: 'Actionbar',
  note: 'The top bar of a screen',
  branches: [
    {
      id: 'mode', label: 'Mode',
      leaves: [
        { id: 'm-title', label: 'title', note: 'Back, title, description, up to 2 actions.', preview: <Mini><Actionbar headingLevel={2} title="RELIANCE" description="NSE · Equity" onBack={noop} actions={<ActionbarAction icon={msSearch} label="Search" onClick={noop} />} /></Mini> },
        { id: 'm-search', label: 'search', note: 'The middle becomes a search input.', preview: <Mini><Actionbar headingLevel={2} onBack={noop} search={{ value: '', onChange: noop, placeholder: 'Search stocks' }} /></Mini> },
      ],
    },
    {
      id: 'slots', label: 'Slots', note: 'Fill them, don’t stack siblings',
      leaves: [
        { id: 's-actions', label: 'actions', note: 'At most 2. Tertiary / ghost style only.', preview: <Mini><Actionbar headingLevel={2} title="Watchlist" actions={<><ActionbarAction icon={msSearch} label="Search" onClick={noop} /><ActionbarAction icon={msStar} label="Star" onClick={noop} /></>} /></Mini> },
        { id: 's-bottom', label: 'bottom', note: 'Flat tabs at the top always go here.', preview: <Mini><Actionbar headingLevel={2} title="Portfolio" bottom={<Tabs aria-label="Portfolio" items={tabItems} value="a" onChange={noop} />} /></Mini> },
      ],
    },
    {
      id: 'elevation', label: 'Elevation',
      leaves: [
        { id: 'e-flat', label: 'flat', note: 'surface-default + border-light bottom line.', preview: <Mini><Actionbar headingLevel={2} title="Orders" /></Mini> },
        { id: 'e-raised', label: 'elevated / sticky', note: 'elevation-low while content scrolls under it.', preview: <Mini><Actionbar headingLevel={2} title="Orders" elevated /></Mini> },
      ],
    },
  ],
}

const bottomNavbar: ComponentTreeSpec = {
  title: 'Bottom navbar',
  note: 'App sections, 3–5 items',
  branches: [
    {
      id: 'set', label: 'Item set', note: 'Which part of the app',
      leaves: [
        { id: 'n-main', label: 'main', note: 'Top-level sections, always labelled.', preview: <Mini><BottomNavbar aria-label="Main" items={mainNavItems} value={mainNavItems[0].value} /></Mini> },
        { id: 'n-sub', label: 'sub-nav + home', note: 'MF / F&O sections with a way back home.', preview: <Mini><BottomNavbar aria-label="F&O" items={fnoNavItems} value={fnoNavItems[0].value} home={{ onClick: noop }} /></Mini> },
      ],
    },
    {
      id: 'rules', label: 'Rules',
      leaves: [
        { id: 'r-actions', label: 'no actions', note: 'Never Buy or other actions in the bar; never more than five items.', preview: <Tag size="md" variant="secondary" color="error">Not here: Buy</Tag> },
        { id: 'r-current', label: 'aria-current', note: 'The current section is marked for screen readers.', preview: <Tag size="md" variant="secondary" color="success">Selected item</Tag> },
      ],
    },
  ],
}

const card: ComponentTreeSpec = {
  title: 'Card',
  note: 'Groups related content',
  branches: [
    {
      id: 'kind', label: 'Kind', note: 'Can it be tapped?',
      leaves: [
        { id: 'k-click', label: 'clickable', note: 'surface-primary + border-light + elevation-low + press scale. One action → the whole card.', preview: <Card onClick={noop}><strong>NHPC</strong> · Open</Card> },
        { id: 'k-static', label: 'static', note: 'Rounded + border → surface-default, no shadow.', preview: <Card><strong>Margin</strong> ₹6,20,308</Card> },
      ],
    },
    {
      id: 'variant', label: 'Variant',
      leaves: [
        { id: 'v-default', label: 'default', note: 'Radius 12, padding 12.', preview: <Card><strong>Holdings</strong></Card> },
        { id: 'v-flat', label: 'flat', note: 'No radius, no border, transparent unless a surface is set.', preview: <Card variant="flat"><strong>Holdings</strong></Card> },
      ],
    },
    {
      id: 'surface', label: 'Surface', note: 'Only when set manually',
      leaves: [
        { id: 's-sec', label: 'secondary', note: 'An inner panel inside a container.', preview: <Card surface="secondary"><strong>Lot size</strong> 25</Card> },
        { id: 's-inv', label: 'inverted', note: 'High emphasis.', preview: <Card surface="inverted"><strong>Pro tip</strong></Card> },
      ],
    },
  ],
}

const bottomSheet: ComponentTreeSpec = {
  title: 'Bottom sheet',
  note: 'A modal panel over the screen',
  branches: [
    {
      id: 'placement', label: 'Placement',
      leaves: [
        { id: 'p-bottom', label: 'bottom', note: 'Default. Closes by backdrop tap or drag down.', preview: <Mini><BottomSheetSurface header={<BottomSheetHeader heading="Buy RELIANCE" description="NSE" />} footer={<ButtonGroup aria-label="Buy"><Button variant="buy">Buy</Button></ButtonGroup>} /></Mini> },
        { id: 'p-top', label: 'top', note: 'Menus tied to the top, e.g. Sort.', preview: <Mini><BottomSheetSurface placement="top" header={<BottomSheetHeader heading="Sort by" />} /></Mini> },
      ],
    },
    {
      id: 'header', label: 'Header size',
      leaves: [
        { id: 'h-sm', label: 'sm', note: 'Tasks and choices.', preview: <Mini><BottomSheetHeader heading="Buy RELIANCE" info description="NSE" /></Mini> },
        { id: 'h-lg', label: 'lg', note: 'Results: icon, tag, heading, description.', preview: <Mini><BottomSheetHeader size="lg" heading="Order placed" description="10 shares of RELIANCE" icon={<Icon icon={msBlurOn} />} tag={<Tag size="sm">EXECUTED</Tag>} /></Mini> },
      ],
    },
    {
      id: 'stack', label: 'Stacking', note: 'At most 2 sheets',
      leaves: [
        { id: 'st-1', label: '1st sheet', note: 'No back button, no ✕.', preview: <Mini><BottomSheetHeader heading="Buy RELIANCE" /></Mini> },
        { id: 'st-2', label: '2nd sheet', note: 'Back button returns to the first. Never a third.', preview: <Mini><BottomSheetHeader heading="Order types" onBack={noop} /></Mini> },
        { id: 'st-tabs', label: 'header bottom', note: 'Tabs or search at the top of a sheet.', preview: <Mini><BottomSheetHeader heading="Buy RELIANCE" bottom={<Tabs aria-label="Type" items={[{ value: 'd', label: 'Delivery' }, { value: 'i', label: 'Intraday' }]} value="d" onChange={noop} />} /></Mini> },
      ],
    },
  ],
}

const aerobar: ComponentTreeSpec = {
  title: 'Aerobar & toast',
  note: 'Status on the page, or a result',
  branches: [
    {
      id: 'type', label: 'Type', note: 'Status accents',
      leaves: [
        { id: 't-success', label: 'success', preview: <Aerobar type="success" heading="Order placed" /> },
        { id: 't-danger', label: 'danger', note: 'Announced as an alert.', preview: <Aerobar type="danger" heading="Order rejected" /> },
        { id: 't-warning', label: 'warning', preview: <Aerobar type="warning" heading="Market closes soon" /> },
        { id: 't-discover', label: 'discover', preview: <Aerobar type="discover" heading="New: price alerts" /> },
        { id: 't-primary', label: 'primary', note: 'Neutral.', preview: <Aerobar type="primary" heading="Syncing holdings" /> },
      ],
    },
    {
      id: 'emphasis', label: 'Emphasis',
      leaves: [
        { id: 'e-solid', label: 'primary (solid)', note: 'Results that need attention.', preview: <Aerobar type="success" emphasis="primary" heading="Order placed" /> },
        { id: 'e-soft', label: 'secondary (soft)', note: 'Quieter status on the page.', preview: <Aerobar type="success" emphasis="secondary" heading="Order placed" /> },
      ],
    },
    {
      id: 'placement', label: 'Placement',
      leaves: [
        { id: 'p-inline', label: 'inline', note: 'A message that belongs to the page.', preview: <Aerobar type="warning" heading="Market closes in 15 min" /> },
        { id: 'p-float', label: 'floating (toast)', note: 'The result of an action. With an action it stays until tapped.', preview: <Aerobar type="success" floating heading="Order placed" action={{ label: 'View', onClick: noop }} /> },
      ],
    },
  ],
}

const emptyState: ComponentTreeSpec = {
  title: 'Empty state',
  note: 'Nothing to show, or no results',
  branches: [
    {
      id: 'parts', label: 'Parts',
      leaves: [
        { id: 'p-full', label: 'illustration + title + description + action', note: 'Say what happened and give a way to recover.', preview: <Mini><EmptyState title="No results found" description="Try a different name or symbol." action={<Button size="sm">Clear search</Button>} /></Mini> },
        { id: 'p-min', label: 'title only', note: 'Small spaces; still never a dead end.', preview: <Mini><EmptyState title="No orders yet" illustration={null} /></Mini> },
      ],
    },
    {
      id: 'heading', label: 'Heading level',
      leaves: [
        { id: 'h-2', label: 'h2', note: 'Default: the empty state is the page content.', preview: <Tag size="md">h2</Tag> },
        { id: 'h-3', label: 'h3', note: 'Inside a section that already has an h2.', preview: <Tag size="md">h3</Tag> },
      ],
    },
  ],
}

const listCell: ComponentTreeSpec = {
  title: 'List cell',
  note: 'Rows of settings, accounts, items',
  branches: [
    {
      id: 'variant', label: 'Variant',
      leaves: [
        { id: 'v-plain', label: 'plain', note: 'Full width, edge to edge.', preview: <ListCell label="Notifications" description="Orders, alerts" iconRight={<Icon icon={msChevronRight} />} /> },
        { id: 'v-card', label: 'card', note: 'A one-line row as a card.', preview: <ListCell variant="card" label="HDFC Bank ••4821" iconLeft={<Icon icon={msAccountBalance} />} /> },
      ],
    },
    {
      id: 'size', label: 'Size',
      leaves: [
        { id: 's-md', label: 'md', preview: <ListCell label="Notifications" /> },
        { id: 's-sm', label: 'sm', preview: <ListCell size="sm" label="Notifications" /> },
      ],
    },
    {
      id: 'as', label: 'Tap behaviour', note: 'as=',
      leaves: [
        { id: 'a-btn', label: 'button / a', note: 'Whole row taps; show a chevron.', preview: <ListCell as="button" label="Bank accounts" iconRight={<Icon icon={msChevronRight} />} /> },
        { id: 'a-label', label: 'label', note: 'With a Switch or Checkbox in trailing.', preview: <ListCell as="label" label="Biometric login" trailing={<Switch defaultChecked />} /> },
        { id: 'a-dot', label: 'dotRight', note: 'Unread marker with screen-reader text.', preview: <ListCell label="Price alerts" dotRight dotLabel="New" /> },
      ],
    },
  ],
}

const tag: ComponentTreeSpec = {
  title: 'Tag',
  note: '3 types · 12 colors · 3 sizes · never tappable',
  branches: [
    {
      id: 'type', label: 'Type',
      leaves: [
        { id: 't-p', label: 'primary', note: 'Solid.', preview: <Tag size="md" variant="primary" color="success">Placed</Tag> },
        { id: 't-s', label: 'secondary', note: 'Soft with a border.', preview: <Tag size="md" variant="secondary" color="success">Placed</Tag> },
        { id: 't-t', label: 'tertiary', note: 'Soft, no border.', preview: <Tag size="md" variant="tertiary" color="success">Placed</Tag> },
        { id: 't-d', label: 'disabled', preview: <Tag size="md" disabled>Placed</Tag> },
      ],
    },
    {
      id: 'color', label: 'Color', note: 'Pick by meaning',
      groups: [
        { id: 'c-neutral', label: 'Neutral', leaves: [{ id: 'c-n', label: 'neutral', note: 'Exchange, segment labels.', preview: <Tag size="md" variant="secondary">NSE</Tag> }] },
        { id: 'c-market', label: 'Market indicators', note: 'Price direction only', leaves: [
          { id: 'c-up', label: 'profit', preview: <Tag size="md" variant="secondary" color="profit">+2.4%</Tag> },
          { id: 'c-down', label: 'loss', preview: <Tag size="md" variant="secondary" color="loss">−1.1%</Tag> },
        ] },
        { id: 'c-status', label: 'Status', note: 'Outcomes and states', leaves: [
          { id: 'c-ok', label: 'success', preview: <Tag size="md" variant="secondary" color="success">Placed</Tag> },
          { id: 'c-warn', label: 'warning', preview: <Tag size="md" variant="secondary" color="warning">Pending</Tag> },
          { id: 'c-err', label: 'error', preview: <Tag size="md" variant="secondary" color="error">Failed</Tag> },
          { id: 'c-info', label: 'discover', preview: <Tag size="md" variant="secondary" color="discover">New</Tag> },
          { id: 'c-proc', label: 'processing', preview: <Tag size="md" variant="secondary" color="processing">Open</Tag> },
        ] },
        { id: 'c-sub', label: 'Sub-brands', leaves: [{ id: 'c-zing', label: 'zing', preview: <Tag size="md" variant="secondary" color="zing">Zing</Tag> }] },
        { id: 'c-misc', label: 'Miscellaneous', note: 'Exceptional cases only', leaves: [
          { id: 'c-purple', label: 'purple', preview: <Tag size="md" variant="secondary" color="purple">F&O</Tag> },
          { id: 'c-indigo', label: 'indigo', preview: <Tag size="md" variant="secondary" color="indigo">MF</Tag> },
          { id: 'c-teal', label: 'teal', preview: <Tag size="md" variant="secondary" color="teal">ETF</Tag> },
        ] },
      ],
    },
    {
      id: 'size', label: 'Size',
      leaves: [
        { id: 's-sm', label: 'sm · 16', preview: <Tag size="sm" variant="secondary" color="profit">+2.4%</Tag> },
        { id: 's-md', label: 'md · 20', preview: <Tag size="md" variant="secondary" color="profit">+2.4%</Tag> },
        { id: 's-lg', label: 'lg · 24', preview: <Tag size="lg" variant="secondary" color="profit">+2.4%</Tag> },
      ],
    },
    {
      id: 'content', label: 'Content',
      leaves: [
        { id: 'ct-label', label: 'label', note: 'One or two words.', preview: <Tag size="md" variant="secondary">LABEL</Tag> },
        { id: 'ct-icon', label: 'icon + label', preview: <Tag size="md" variant="secondary" iconLeft={<TagPlaceholderIcon />}>LABEL</Tag> },
        { id: 'ct-only', label: 'hideLabel', note: 'Icon only; the label stays as screen-reader text.', preview: <Tag size="md" variant="secondary" hideLabel iconLeft={<TagPlaceholderIcon />}>Featured</Tag> },
      ],
    },
  ],
}

const brandLogo: ComponentTreeSpec = {
  title: 'Brand logo',
  note: 'Figma artwork — never redraw or recolor',
  branches: [
    {
      id: 'brand', label: 'Brand',
      leaves: [
        { id: 'b-lemonn', label: 'lemonn', preview: <BrandLogo brand="lemonn" size={32} decorative /> },
        { id: 'b-zing', label: 'zing', preview: <BrandLogo brand="zing" size={32} decorative /> },
      ],
    },
    {
      id: 'variant', label: 'Variant',
      leaves: [
        { id: 'v-full', label: 'full', note: 'Mark + wordmark.', preview: <BrandLogo brand="lemonn" size={32} decorative /> },
        { id: 'v-icon', label: 'icon', note: 'The mark only.', preview: <BrandLogo brand="lemonn" variant="icon" size={32} decorative /> },
      ],
    },
    {
      id: 'size', label: 'Size', note: 'Height',
      leaves: [24, 32, 40, 48].map((h) => ({ id: `s-${h}`, label: `${h}`, preview: <BrandLogo brand="lemonn" size={h as 24 | 32 | 40 | 48} decorative /> })),
    },
  ],
}

/** Page id → tree spec. */
export const componentTrees: Record<string, ComponentTreeSpec> = {
  button: buttonTree,
  'button-group': buttonGroup,
  checkbox,
  'text-field': textField,
  switch: toggle,
  tabs,
  actionbar,
  'bottom-navbar': bottomNavbar,
  card,
  'bottom-sheet': bottomSheet,
  aerobar,
  'empty-state': emptyState,
  'list-cell': listCell,
  tag,
  'brand-logo': brandLogo,
}
