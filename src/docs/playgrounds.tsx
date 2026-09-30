// Playground definitions per docs page id: controls, a live render and the matching JSX.
import { useState } from 'react'
import { Actionbar, ActionbarAction } from '../components/Actionbar'
import { Aerobar, type AerobarType } from '../components/Aerobar'
import { BottomNavbar } from '../components/BottomNavbar'
import { BrandLogo, type Brand } from '../components/BrandLogo'
import { BottomSheetHeader, BottomSheetSurface } from '../components/BottomSheet'
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from '../components/Button'
import { ButtonGroup, type ButtonGroupDirection } from '../components/ButtonGroup'
import { Card } from '../components/Card'
import { Checkbox, Radio } from '../components/Checkbox'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ListCell } from '../components/ListCell'
import { Switch, type SwitchSize } from '../components/Switch'
import { Tabs, type TabEmphasis, type TabSize } from '../components/Tabs'
import { Tag, type TagColor, type TagSize, type TagVariant } from '../components/Tag'
import { TextField } from '../components/TextField'
import { msAdd, msArrowForward, msBlurOn, msChevronRight, msDeleteForever, msSearch, msStar } from '../icons/material'
import { fnoNavItems, mainNavItems, mfNavItems } from '../preview/BottomNavbarVariants'
import { attrs, jsx, type PlaygroundDef, type Values } from './Playground'
import { AutoTpSlSheet } from './demos'
import styles from './Docs.module.css'

const noop = () => {}
const s = (v: Values, k: string) => v[k] as string
const b = (v: Values, k: string) => v[k] as boolean

const buttonVariants = ['primary', 'secondary', 'tertiary', 'ghost', 'brand', 'buy', 'sell'] as const
const tagColors = ['neutral', 'profit', 'loss', 'success', 'error', 'warning', 'discover', 'processing', 'indigo', 'teal', 'purple', 'zing'] as const
const aerobarTypes = ['primary', 'discover', 'danger', 'success', 'warning'] as const

// ---- Stateful wrappers (the playground render can't hold hooks itself) ----------

function TabsPlay({ count, ...rest }: { count: number; appearance: 'underline' | 'pill'; emphasis: TabEmphasis; size: TabSize; icons: boolean; hideLabel?: boolean; subLabel?: string }) {
  const labels = ['Overview', 'Financials', 'News', 'Events'].slice(0, count)
  const [value, setValue] = useState(labels[0])
  return (
    <Tabs
      aria-label="Sections"
      appearance={rest.appearance}
      emphasis={rest.emphasis}
      size={rest.size}
      items={labels.map((l) => ({
        value: l,
        label: l,
        iconLeft: rest.icons || rest.hideLabel ? <Icon icon={msBlurOn} size={16} /> : undefined,
        hideLabel: rest.hideLabel,
        subLabel: rest.appearance === 'pill' ? rest.subLabel || undefined : undefined,
      }))}
      value={labels.includes(value) ? value : labels[0]}
      onChange={setValue}
    />
  )
}

function NavPlay({ nav }: { nav: string }) {
  const items = nav === 'Mutual fund' ? mfNavItems : nav === 'F&O' ? fnoNavItems : mainNavItems
  const [value, setValue] = useState<string>(items[0].value)
  return (
    <BottomNavbar
      aria-label={nav}
      items={items}
      value={items.some((i) => i.value === value) ? value : items[0].value}
      onChange={setValue}
      home={nav === 'Main' ? undefined : { onClick: noop }}
    />
  )
}

function SearchBarPlay(props: { back: boolean }) {
  const [q, setQ] = useState('')
  return <Actionbar headingLevel={2} onBack={props.back ? noop : undefined} search={{ value: q, onChange: setQ, placeholder: 'Search for a company' }} />
}

function TextFieldPlay(v: Values) {
  const [value, setValue] = useState('')
  const common = {
    label: s(v, 'label') || undefined,
    placeholder: s(v, 'placeholder'),
    helperText: s(v, 'helperText') || undefined,
    status: s(v, 'status') === 'none' ? undefined : (s(v, 'status') as 'error' | 'success'),
    required: b(v, 'required'),
    disabled: b(v, 'disabled'),
  }
  return b(v, 'multiline') ? (
    <TextField {...common} multiline maxLength={s(v, 'maxLength') === 'none' ? undefined : Number(s(v, 'maxLength'))} value={value} onChange={(e) => setValue(e.target.value)} />
  ) : (
    <TextField {...common} value={value} onChange={(e) => setValue(e.target.value)} />
  )
}

/**
 * Button content rule: at least one of label / iconLeft / iconRight, and an icon-only button has exactly one icon.
 * With no label and no icon we show the left icon; with no label and both icons, only the left one.
 */
function buttonContent(v: Values) {
  const label = b(v, 'showLabel') ? s(v, 'label') : ''
  let left = b(v, 'iconLeft')
  let right = b(v, 'iconRight')
  if (!label && left && right) right = false
  if (!label && !left && !right) left = true
  return { label, left, right }
}

// ---- Definitions ---------------------------------------------------------------

// Bottom sheet playground: a real use case (Figma "Set Auto TP/SL", Dev handoff 4292:34429) or custom properties.
const custom = (v: Values) => v.useCase === 'Custom'
const autoTpSlCode = `<BottomSheet
  open={open}
  onClose={close}
  aria-labelledby="tpsl-heading"
  header={<BottomSheetHeader headingId="tpsl-heading" heading="Set Auto TP/SL" description="Applies to all new orders only." />}
  footer={<ButtonGroup aria-label="Auto TP/SL"><Button loading={saving} onClick={save}>Save</Button></ButtonGroup>}
>
  <Stack gap={16}>
    <Card as="section" aria-label="Auto TP">
      <Row>Auto TP <TextAction>LMT ⇅</TextAction> <Switch aria-label="Auto TP" checked={tp} onChange={…} /></Row>
      <Card surface="secondary">
        <Row>Trigger at <TextAction>Points ⇅</TextAction> <Stepper value={15} /></Row>   {/* −/+ = Button sm tertiary */}
        <hr />
        <Row>Limit <Icon icon={msInfo} label="…" /> <Stepper value={17} /></Row>
      </Card>
      <p>Target: <strong>+17.00 pts</strong></p>   {/* content/accent/indicator-up */}
      <hr />                                     {/* dashed border-light */}
      <Row><label><Checkbox checked={trail} /> Trail 1.0 Pts</label> <Icon icon={msInfo} label="…" /> <TextAction>Edit</TextAction></Row>
    </Card>
    <Card as="section" aria-label="Auto SL">
      <Row>Auto SL <Switch aria-label="Auto SL" checked={sl} onChange={…} /></Row>
    </Card>
  </Stack>
</BottomSheet>
// Stack / Row / TextAction / Stepper are layout stand-ins (see src/docs/demos.tsx → AutoTpSlSheet).
// There's no Stepper or Select component yet.`

export const playgrounds: Record<string, PlaygroundDef> = {
  card: {
    controls: [
      { name: 'kind', label: 'Kind', prop: 'onClick · href', type: 'select', options: ['clickable', 'link', 'static'], default: 'clickable' },
      { name: 'variant', type: 'select', options: ['default', 'flat'], default: 'default' },
      { name: 'surface', label: 'Surface (manual bg)', type: 'select', options: ['none', 'primary', 'secondary', 'tertiary'], default: 'none' },
      { name: 'padding', type: 'select', options: ['default', 'none'], default: 'default' },
      { name: 'title', label: 'Title', prop: false, type: 'text', default: 'NHPC' },
      { name: 'meta', label: 'Meta', prop: false, type: 'text', default: 'Delivery • Boost (5x)' },
    ],
    render: (v) => {
      const content = (
        <>
          <span className={styles.cardRow}><span className={styles.cardMeta}>{s(v, 'meta')}</span><Tag variant="secondary" color="profit" size="md">Buy</Tag></span>
          <span className={styles.cardTitle}>{s(v, 'title')}</span>
        </>
      )
      const kind = s(v, 'kind')
      const common = {
        padding: s(v, 'padding') as 'default' | 'none',
        variant: s(v, 'variant') as 'default' | 'flat',
        surface: s(v, 'surface') === 'none' ? undefined : (s(v, 'surface') as 'primary' | 'secondary' | 'tertiary'),
      }
      return kind === 'static' ? <Card {...common}>{content}</Card> : kind === 'link' ? <Card href="#/card" {...common}>{content}</Card> : <Card onClick={noop} {...common}>{content}</Card>
    },
    code: (v) => {
      const kind = s(v, 'kind')
      const body = `  <span className={styles.row}>\n    <span className={styles.meta}>${s(v, 'meta')}</span>\n    <Tag variant="secondary" color="profit" size="md">Buy</Tag>\n  </span>\n  <span className={styles.title}>${s(v, 'title')}</span>`
      return jsx('Card', [
        ['onClick', kind === 'clickable' ? '{openOrder}' : undefined],
        ['href', kind === 'link' ? '/orders/nhpc' : undefined],
        ['variant', s(v, 'variant'), 'default'],
        ['surface', s(v, 'surface'), 'none'],
        ['padding', s(v, 'padding'), 'default'],
      ], body)
    },
  },

  'brand-logo': {
    controls: [
      { name: 'brand', type: 'select', options: ['lemonn', 'zing'], default: 'lemonn' },
      { name: 'variant', type: 'select', options: ['full', 'icon'], default: 'full' },
      { name: 'size', type: 'select', options: ['24', '32', '40', '48'], default: '40' },
      { name: 'decorative', type: 'boolean', default: false },
    ],
    render: (v) => <BrandLogo brand={s(v, 'brand') as Brand} variant={s(v, 'variant') as 'full' | 'icon'} size={Number(s(v, 'size')) as 24 | 32 | 40 | 48} decorative={b(v, 'decorative')} />,
    code: (v) =>
      jsx('BrandLogo', [
        ['brand', s(v, 'brand')],
        ['variant', s(v, 'variant'), 'full'],
        ['size', s(v, 'size') === '24' ? undefined : `{${s(v, 'size')}}`],
        ['decorative', b(v, 'decorative')],
      ]),
  },

  button: {
    controls: [
      { name: 'variant', type: 'select', options: buttonVariants, default: 'primary' },
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'lg' },
      { name: 'showLabel', label: 'Show label (off = icon button)', prop: 'children', type: 'boolean', default: true },
      { name: 'label', label: 'Label', prop: 'children', type: 'text', default: 'Place order', showIf: (v) => v.showLabel === true },
      { name: 'iconLeft', type: 'boolean', default: false },
      // Icon buttons show exactly one icon: hide the right toggle when the label is hidden and the left icon is on.
      { name: 'iconRight', type: 'boolean', default: false, showIf: (v) => v.showLabel === true || v.iconLeft !== true },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'fullWidth', type: 'boolean', default: false },
    ],
    render: (v) => {
      const c = buttonContent(v)
      const props = {
        variant: s(v, 'variant') as ButtonVariant,
        size: s(v, 'size') as ButtonSize,
        loading: b(v, 'loading'),
        disabled: b(v, 'disabled'),
        fullWidth: b(v, 'fullWidth'),
        iconLeft: c.left ? <Icon icon={msAdd} /> : undefined,
        iconRight: c.right ? <Icon icon={msArrowForward} /> : undefined,
        'aria-label': c.label ? undefined : 'Add',
        children: c.label || undefined,
      } as ButtonProps
      return <Button {...props} />
    },
    code: (v) => {
      const c = buttonContent(v)
      return jsx('Button', [
        ['variant', s(v, 'variant'), 'primary'],
        ['size', s(v, 'size'), 'lg'],
        ['iconLeft', c.left ? '{<Icon icon={msAdd} />}' : undefined],
        ['iconRight', c.right ? '{<Icon icon={msArrowForward} />}' : undefined],
        ['loading', b(v, 'loading')],
        ['disabled', b(v, 'disabled')],
        ['fullWidth', b(v, 'fullWidth')],
        ['aria-label', c.label ? undefined : 'Add'],
        ['onClick', '{placeOrder}'],
      ], c.label)
    },
  },

  'button-group': {
    controls: [
      { name: 'direction', type: 'select', options: ['vertical', 'horizontal'], default: 'horizontal' },
      { name: 'scrollIndicator', type: 'boolean', default: false },
      { name: 'primary', label: 'Primary button text', prop: false, type: 'text', default: 'Confirm' },
      { name: 'secondary', label: 'Secondary button text', prop: false, type: 'text', default: 'Cancel' },
    ],
    render: (v) => {
      const primary = <Button key="p" size="lg">{s(v, 'primary')}</Button>
      const secondary = <Button key="s" size="lg" variant="secondary">{s(v, 'secondary')}</Button>
      const vertical = s(v, 'direction') === 'vertical'
      return (
        <ButtonGroup direction={s(v, 'direction') as ButtonGroupDirection} scrollIndicator={b(v, 'scrollIndicator')} aria-label="Order actions">
          {vertical ? [primary, secondary] : [secondary, primary]}
        </ButtonGroup>
      )
    },
    code: (v) => {
      const vertical = s(v, 'direction') === 'vertical'
      const p = `  <Button size="lg">${s(v, 'primary')}</Button>`
      const sec = `  <Button size="lg" variant="secondary">${s(v, 'secondary')}</Button>`
      return jsx('ButtonGroup', [
        ['direction', s(v, 'direction'), 'vertical'],
        ['scrollIndicator', b(v, 'scrollIndicator')],
        ['aria-label', 'Order actions'],
      ], (vertical ? [p, sec] : [sec, p]).join('\n'))
    },
  },

  tag: {
    controls: [
      { name: 'variant', type: 'select', options: ['primary', 'secondary', 'tertiary'], default: 'secondary' },
      { name: 'color', type: 'select', options: tagColors, default: 'profit' },
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { name: 'showLabel', label: 'Label', prop: 'hideLabel', type: 'boolean', default: true },
      { name: 'label', label: 'Label text (screen-reader text when hidden)', prop: 'children', type: 'text', default: '+1.24%' },
      { name: 'iconLeft', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (v) => (
      <Tag variant={s(v, 'variant') as TagVariant} color={s(v, 'color') as TagColor} size={s(v, 'size') as TagSize} disabled={b(v, 'disabled')} iconLeft={b(v, 'iconLeft') || !b(v, 'showLabel') ? <Icon icon={msStar} /> : undefined} hideLabel={!b(v, 'showLabel')}>
        {s(v, 'label')}
      </Tag>
    ),
    code: (v) =>
      jsx('Tag', [
        ['variant', s(v, 'variant'), 'primary'],
        ['color', s(v, 'color'), 'neutral'],
        ['size', s(v, 'size'), 'sm'],
        ['iconLeft', b(v, 'iconLeft') || !b(v, 'showLabel') ? '{<Icon icon={msStar} />}' : undefined],
        ['hideLabel', !b(v, 'showLabel')],
        ['disabled', b(v, 'disabled')],
      ], s(v, 'label')),
  },

  switch: {
    controls: [
      { name: 'size', type: 'select', options: ['md', 'sm'], default: 'md' },
      { name: 'label', label: 'Label text', prop: false, type: 'text', default: 'Price alerts' },
      { name: 'defaultChecked', label: 'On', type: 'boolean', default: true },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (v) => (
      <label className={styles.playRow}>
        <span>{s(v, 'label')}</span>
        <Switch key={String(b(v, 'defaultChecked'))} size={s(v, 'size') as SwitchSize} defaultChecked={b(v, 'defaultChecked')} disabled={b(v, 'disabled')} />
      </label>
    ),
    code: (v) =>
      `<label>\n  ${s(v, 'label')}\n  ${jsx('Switch', [['size', s(v, 'size'), 'md'], ['defaultChecked', b(v, 'defaultChecked')], ['disabled', b(v, 'disabled')]])}\n</label>`,
  },

  checkbox: {
    controls: [
      { name: 'kind', label: 'Component', prop: false, type: 'select', options: ['Checkbox', 'Radio'], default: 'Checkbox' },
      { name: 'label', label: 'Label text', prop: false, type: 'text', default: 'Equity' },
      { name: 'defaultChecked', label: 'Checked', type: 'boolean', default: true },
      { name: 'indeterminate', type: 'boolean', default: false, showIf: (v) => v.kind === 'Checkbox' },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (v) => {
      const key = `${s(v, 'kind')}${b(v, 'defaultChecked')}`
      return (
        <label className={styles.playRow}>
          {s(v, 'kind') === 'Radio' ? (
            <Radio key={key} name="segment" defaultChecked={b(v, 'defaultChecked')} disabled={b(v, 'disabled')} />
          ) : (
            <Checkbox key={key} defaultChecked={b(v, 'defaultChecked')} indeterminate={b(v, 'indeterminate')} disabled={b(v, 'disabled')} />
          )}
          <span>{s(v, 'label')}</span>
        </label>
      )
    },
    code: (v) => {
      const radio = s(v, 'kind') === 'Radio'
      const control = jsx(s(v, 'kind'), [
        ['name', radio ? 'segment' : undefined],
        ['defaultChecked', b(v, 'defaultChecked')],
        ['indeterminate', !radio && b(v, 'indeterminate')],
        ['disabled', b(v, 'disabled')],
      ])
      return `<label>\n  ${control}\n  ${s(v, 'label')}\n</label>`
    },
  },

  'text-field': {
    controls: [
      { name: 'multiline', label: 'Multiline (text box)', type: 'boolean', default: false },
      { name: 'label', type: 'text', default: 'Quantity' },
      { name: 'placeholder', type: 'text', default: 'Enter quantity' },
      { name: 'helperText', label: 'Helper text', type: 'text', default: 'Lot size is 25' },
      { name: 'status', type: 'select', options: ['none', 'error', 'success'], default: 'none' },
      { name: 'maxLength', label: 'Character limit', type: 'select', options: ['none', '50', '140'], default: '140', showIf: (v) => v.multiline === true },
      { name: 'required', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (v) => <TextFieldPlay key={String(b(v, 'multiline'))} {...v} />,
    code: (v) =>
      jsx('TextField', [
        ['multiline', b(v, 'multiline')],
        ['label', s(v, 'label')],
        ['placeholder', s(v, 'placeholder')],
        ['helperText', s(v, 'helperText')],
        ['status', s(v, 'status'), 'none'],
        ['maxLength', b(v, 'multiline') && s(v, 'maxLength') !== 'none' ? `{${s(v, 'maxLength')}}` : undefined],
        ['required', b(v, 'required')],
        ['disabled', b(v, 'disabled')],
        ['value', '{value}'],
        ['onChange', '{(e) => setValue(e.target.value)}'],
      ]),
  },

  tabs: {
    controls: [
      { name: 'appearance', type: 'select', options: ['underline', 'pill'], default: 'underline' },
      { name: 'emphasis', type: 'select', options: ['primary', 'secondary'], default: 'primary' },
      { name: 'size', type: 'select', options: ['md', 'sm'], default: 'md' },
      { name: 'count', label: 'Number of tabs', prop: 'items', type: 'select', options: ['2', '3', '4'], default: '3' },
      { name: 'showLabel', label: 'Label', prop: 'items[].hideLabel', type: 'boolean', default: true },
      { name: 'icons', label: 'Icon left', prop: 'items[].iconLeft', type: 'boolean', default: false, showIf: (v) => v.showLabel !== false },
      { name: 'subLabel', label: 'Sub label', prop: 'items[].subLabel', type: 'text', default: '', showIf: (v) => v.appearance === 'pill' && v.showLabel !== false },
    ],
    render: (v) => (
      <TabsPlay count={Number(s(v, 'count'))} appearance={s(v, 'appearance') as 'underline' | 'pill'} emphasis={s(v, 'emphasis') as TabEmphasis} size={s(v, 'size') as TabSize} icons={b(v, 'icons')} hideLabel={!b(v, 'showLabel')} subLabel={s(v, 'subLabel')} />
    ),
    code: (v) => {
      const labels = ['Overview', 'Financials', 'News', 'Events'].slice(0, Number(s(v, 'count')))
      const hide = !b(v, 'showLabel')
      const icon = b(v, 'icons') || hide ? ', iconLeft: <Icon icon={msBlurOn} size={16} />' : ''
      const extra = (hide ? ', hideLabel: true' : '') + (!hide && s(v, 'appearance') === 'pill' && s(v, 'subLabel') ? `, subLabel: '${s(v, 'subLabel')}'` : '')
      const items = labels.map((l) => `    { value: '${l.toLowerCase()}', label: '${l}'${icon}${extra} },`).join('\n')
      return `<Tabs\n  ${attrs([['aria-label', 'Sections'], ['appearance', s(v, 'appearance'), 'underline'], ['emphasis', s(v, 'emphasis'), 'primary'], ['size', s(v, 'size'), 'md']])}\n  items={[\n${items}\n  ]}\n  value={tab}\n  onChange={setTab}\n/>`
    },
  },

  actionbar: {
    controls: [
      { name: 'title', type: 'text', default: 'RELIANCE', showIf: (v) => v.search !== true },
      { name: 'description', type: 'text', default: 'NSE · Equity', showIf: (v) => v.search !== true },
      { name: 'back', label: 'Back button', prop: 'onBack', type: 'boolean', default: true },
      { name: 'actions', label: 'Actions', type: 'select', options: ['0', '1', '2'], default: '2', showIf: (v) => v.search !== true },
      { name: 'search', label: 'Search mode', type: 'boolean', default: false },
      { name: 'bottom', label: 'Tabs below', type: 'boolean', default: false, showIf: (v) => v.search !== true },
    ],
    render: (v) =>
      b(v, 'search') ? (
        <SearchBarPlay back={b(v, 'back')} />
      ) : (
        <Actionbar
          headingLevel={2}
          title={s(v, 'title')}
          description={s(v, 'description') || undefined}
          onBack={b(v, 'back') ? noop : undefined}
          actions={
            s(v, 'actions') === '0' ? undefined : (
              <>
                <ActionbarAction icon={msSearch} label="Search" onClick={noop} />
                {s(v, 'actions') === '2' && <ActionbarAction icon={msStar} label="Add to watchlist" onClick={noop} />}
              </>
            )
          }
          bottom={b(v, 'bottom') ? <TabsPlay count={3} appearance="underline" emphasis="primary" size="md" icons={false} /> : undefined}
        />
      ),
    code: (v) => {
      if (b(v, 'search')) return jsx('Actionbar', [['onBack', b(v, 'back') ? '{goBack}' : undefined], ['search', "{{ value: query, onChange: setQuery, placeholder: 'Search for a company' }}"]])
      const n = s(v, 'actions')
      const actions = n === '0' ? undefined : `{<>\n    <ActionbarAction icon={msSearch} label="Search" onClick={openSearch} />${n === '2' ? '\n    <ActionbarAction icon={msStar} label="Add to watchlist" onClick={toggleWatchlist} />' : ''}\n  </>}`
      const a = attrs([
        ['title', s(v, 'title')],
        ['description', s(v, 'description')],
        ['onBack', b(v, 'back') ? '{goBack}' : undefined],
      ])
      const lines = [a, actions && `actions=${actions}`, b(v, 'bottom') && 'bottom={<Tabs aria-label="Sections" items={tabs} value={tab} onChange={setTab} />}'].filter(Boolean)
      return `<Actionbar\n  ${lines.join('\n  ')}\n/>`
    },
  },

  'bottom-navbar': {
    controls: [{ name: 'nav', label: 'Navbar', prop: 'items · home', type: 'select', options: ['Main', 'Mutual fund', 'F&O'], default: 'Main' }],
    render: (v) => <NavPlay key={s(v, 'nav')} nav={s(v, 'nav')} />,
    code: (v) => {
      const nav = s(v, 'nav')
      const items = nav === 'Mutual fund' ? 'mfNavItems' : nav === 'F&O' ? 'fnoNavItems' : 'mainNavItems'
      const example = nav === 'Main'
        ? "// const mainNavItems = [{ value: 'stocks', label: 'Stocks', icon: <NavIcon name=\"stocks\" />, selectedIcon: <NavIcon name=\"stocks\" selected /> }, …]\n"
        : ''
      return `${example}${jsx('BottomNavbar', [['aria-label', nav], ['items', `{${items}}`], ['value', '{section}'], ['onChange', '{setSection}'], ['home', nav === 'Main' ? undefined : '{{ onClick: goHome }}'], ['fixed', true]])}`
    },
  },

  'bottom-sheet': {
    // One control per Figma property: L3: Bottom sheet · L3: Bottom sheet header (Version=Latest).
    controls: [
      { name: 'useCase', label: 'Use case', prop: false, type: 'select', options: ['Auto TP/SL', 'Custom'], default: 'Auto TP/SL' },
      { name: 'placement', label: 'Position (isBottom)', prop: 'placement', type: 'select', options: ['bottom', 'top'], default: 'bottom', showIf: custom },
      { name: 'header', label: '👁️ Header', prop: 'header', type: 'boolean', default: true, showIf: custom },
      { name: 'size', label: 'Header size (isSmall)', prop: 'BottomSheetHeader size', type: 'select', options: ['sm', 'lg'], default: 'sm', showIf: (v) => custom(v) && (v.header !== false) },
      { name: 'heading', label: '✏️ Heading', prop: 'heading', type: 'text', default: 'Buy RELIANCE', showIf: (v) => custom(v) && (v.header !== false) },
      { name: 'showDescription', label: '👁️ Description', prop: 'description', type: 'boolean', default: false, showIf: (v) => custom(v) && (v.header !== false) },
      { name: 'description', label: '✏️ Description', prop: 'description', type: 'text', default: 'NSE · Delivery', showIf: (v) => custom(v) && (v.header !== false && v.showDescription === true) },
      { name: 'back', label: '👁️ Back button (2nd stacked sheet only)', prop: 'onBack', type: 'boolean', default: false, showIf: (v) => custom(v) && (v.header !== false && v.size !== 'lg') },
      { name: 'info', label: '👁️ info', prop: 'info', type: 'boolean', default: true, showIf: (v) => custom(v) && (v.header !== false && v.size !== 'lg') },
      { name: 'right', label: '👁️ Action - right (right slot)', prop: 'trailing', type: 'select', options: ['none', 'button', 'tag'], default: 'button', showIf: (v) => custom(v) && (v.header !== false && v.size !== 'lg') },
      { name: 'bottom', label: '👁️ Content bottom', prop: 'bottom', type: 'boolean', default: false, showIf: (v) => custom(v) && (v.header !== false && v.size !== 'lg') },
      { name: 'icon', label: '👁️ H-Icon', prop: 'icon', type: 'boolean', default: true, showIf: (v) => custom(v) && (v.header !== false && v.size === 'lg') },
      { name: 'tag', label: '👁️ header tag', prop: 'tag', type: 'boolean', default: false, showIf: (v) => custom(v) && (v.header !== false && v.size === 'lg') },
      { name: 'content', label: '👁️ Content slot', prop: 'children', type: 'boolean', default: true, showIf: custom },
      { name: 'footer', label: 'Buttons (dock)', prop: 'footer', type: 'boolean', default: true, showIf: custom },
      { name: 'utility', label: '👁️ Utility slot', prop: 'utility', type: 'boolean', default: false, showIf: (v) => custom(v) && (v.placement !== 'top') },
    ],
    render: (v) => {
      if (!custom(v)) return <div className={styles.playSheet}><AutoTpSlSheet /></div>
      const lg = s(v, 'size') === 'lg'
      const right = s(v, 'right')
      return (
        <div className={styles.playSheet}>
          <BottomSheetSurface
            placement={s(v, 'placement') as 'bottom' | 'top'}
            header={
              b(v, 'header') ? (
                <BottomSheetHeader
                  size={lg ? 'lg' : 'sm'}
                  heading={s(v, 'heading')}
                  description={b(v, 'showDescription') ? s(v, 'description') : undefined}
                  onBack={!lg && b(v, 'back') ? noop : undefined}
                  info={!lg && b(v, 'info')}
                  trailing={
                    lg ? undefined
                    : right === 'button' ? <Button size="sm" variant="ghost" aria-label="Search" iconLeft={<Icon icon={msSearch} />} />
                    : right === 'tag' ? <Tag variant="tertiary" size="sm">LABEL</Tag>
                    : undefined
                  }
                  bottom={!lg && b(v, 'bottom') ? <TabsPlay count={2} appearance="underline" emphasis="primary" size="md" icons={false} /> : undefined}
                  icon={lg && b(v, 'icon') ? <Icon icon={msBlurOn} /> : undefined}
                  tag={lg && b(v, 'tag') ? <Tag size="sm">LABEL</Tag> : undefined}
                />
              ) : undefined
            }
            footer={b(v, 'footer') ? <ButtonGroup aria-label="Order actions"><Button variant="buy">Buy</Button></ButtonGroup> : undefined}
            utility={s(v, 'placement') !== 'top' && b(v, 'utility') ? <p className={styles.playSheetBody}>Utility slot</p> : undefined}
          >
            {b(v, 'content') ? <p className={styles.playSheetBody}>Sheet content goes here.</p> : undefined}
          </BottomSheetSurface>
        </div>
      )
    },
    code: (v) => {
      if (!custom(v)) return autoTpSlCode
      const lg = s(v, 'size') === 'lg'
      const right = s(v, 'right')
      const header = jsx('BottomSheetHeader', [
        ['size', s(v, 'size'), 'sm'],
        ['heading', s(v, 'heading')],
        ['headingId', 'buy-heading'],
        ['description', b(v, 'showDescription') ? s(v, 'description') : undefined],
        ['onBack', !lg && b(v, 'back') ? '{goBack}' : undefined],
        ['info', !lg && b(v, 'info')],
        ['trailing', lg ? undefined : right === 'button' ? '{<Button size="sm" variant="ghost" aria-label="Search" iconLeft={<Icon icon={msSearch} />} />}' : right === 'tag' ? '{<Tag variant="tertiary" size="sm">LABEL</Tag>}' : undefined],
        ['bottom', !lg && b(v, 'bottom') ? '{<Tabs aria-label="Order type" items={orderTypes} value={type} onChange={setType} />}' : undefined],
        ['icon', lg && b(v, 'icon') ? '{<Icon icon={msBlurOn} />}' : undefined],
        ['tag', lg && b(v, 'tag') ? '{<Tag size="sm">LABEL</Tag>}' : undefined],
      ])
      const lines = [
        'open={open}',
        'onClose={close}',
        s(v, 'placement') === 'top' && 'placement="top"',
        b(v, 'header') ? 'aria-labelledby="buy-heading"' : 'aria-label="Buy RELIANCE"',
        b(v, 'header') && `header={${header}}`,
        b(v, 'footer') && 'footer={<ButtonGroup aria-label="Order actions"><Button variant="buy">Buy</Button></ButtonGroup>}',
        s(v, 'placement') !== 'top' && b(v, 'utility') && 'utility={…}',
      ].filter(Boolean)
      return `<BottomSheet\n  ${lines.join('\n  ')}\n>${b(v, 'content') ? '\n  …\n' : ''}</BottomSheet>`
    },
  },

  aerobar: {
    controls: [
      { name: 'type', type: 'select', options: aerobarTypes, default: 'success' },
      { name: 'emphasis', type: 'select', options: ['primary', 'secondary'], default: 'primary' },
      { name: 'floating', label: 'Floating (toast)', type: 'boolean', default: true },
      { name: 'heading', type: 'text', default: 'Order placed' },
      { name: 'paragraph', type: 'text', default: 'Buy 10 RELIANCE at market' },
      { name: 'icon', type: 'boolean', default: true },
      { name: 'action', label: 'Action button', type: 'boolean', default: true },
    ],
    render: (v) => (
      <Aerobar
        type={s(v, 'type') as AerobarType}
        emphasis={s(v, 'emphasis') as 'primary' | 'secondary'}
        floating={b(v, 'floating')}
        heading={s(v, 'heading')}
        paragraph={s(v, 'paragraph') || undefined}
        icon={b(v, 'icon') ? undefined : false}
        action={b(v, 'action') ? { label: 'View', onClick: noop } : undefined}
      />
    ),
    code: (v) =>
      jsx('Aerobar', [
        ['type', s(v, 'type'), 'primary'],
        ['emphasis', s(v, 'emphasis'), 'secondary'],
        ['floating', b(v, 'floating')],
        ['heading', s(v, 'heading')],
        ['paragraph', s(v, 'paragraph')],
        ['icon', b(v, 'icon') ? undefined : '{false}'],
        ['action', b(v, 'action') ? "{{ label: 'View', onClick: openOrder }}" : undefined],
      ]),
  },

  'empty-state': {
    controls: [
      { name: 'title', type: 'text', default: 'No results found' },
      { name: 'description', type: 'text', default: 'Try a different name or symbol.' },
      { name: 'illustration', label: 'Illustration', type: 'boolean', default: true },
      { name: 'action', label: 'Clear button', type: 'boolean', default: true },
    ],
    render: (v) => (
      <EmptyState
        headingLevel={3}
        title={s(v, 'title')}
        description={s(v, 'description') || undefined}
        illustration={b(v, 'illustration') ? undefined : null}
        action={b(v, 'action') ? <Button size="sm" iconLeft={<Icon icon={msDeleteForever} size={12} />}>Clear</Button> : undefined}
      />
    ),
    code: (v) =>
      jsx('EmptyState', [
        ['title', s(v, 'title')],
        ['description', s(v, 'description')],
        ['illustration', b(v, 'illustration') ? undefined : '{null}'],
        ['action', b(v, 'action') ? '{<Button size="sm" iconLeft={<Icon icon={msDeleteForever} size={12} />} onClick={clear}>Clear</Button>}' : undefined],
      ]),
  },

  'list-cell': {
    controls: [
      { name: 'variant', type: 'select', options: ['plain', 'card'], default: 'plain' },
      { name: 'size', type: 'select', options: ['md', 'sm'], default: 'md' },
      { name: 'label', type: 'text', default: 'RELIANCE' },
      { name: 'description', type: 'text', default: '12 shares · ₹35,365' },
      { name: 'as', label: 'Element', type: 'select', options: ['div', 'button'], default: 'button', showIf: (v) => v.trailing !== 'switch' },
      { name: 'iconLeft', type: 'boolean', default: false },
      { name: 'trailing', label: 'Right side', prop: 'iconRight · trailing', type: 'select', options: ['none', 'chevron', 'tag', 'switch'], default: 'chevron' },
      { name: 'dotLeft', label: 'New dot', type: 'boolean', default: false },
    ],
    render: (v) => {
      const trailing = s(v, 'trailing')
      return (
        <ListCell
          variant={s(v, 'variant') as 'plain' | 'card'}
          size={s(v, 'size') as 'md' | 'sm'}
          label={s(v, 'label')}
          description={s(v, 'description') || undefined}
          as={trailing === 'switch' ? 'label' : (s(v, 'as') as 'div' | 'button')}
          onClick={s(v, 'as') === 'button' && trailing !== 'switch' ? noop : undefined}
          iconLeft={b(v, 'iconLeft') ? <Icon icon={msBlurOn} /> : undefined}
          iconRight={trailing === 'chevron' ? <Icon icon={msChevronRight} /> : undefined}
          trailing={trailing === 'tag' ? <Tag variant="secondary" color="profit" size="sm">+4.2%</Tag> : trailing === 'switch' ? <Switch defaultChecked /> : undefined}
          dotLeft={b(v, 'dotLeft')}
          dotLabel={b(v, 'dotLeft') ? 'New' : undefined}
        />
      )
    },
    code: (v) => {
      const trailing = s(v, 'trailing')
      return jsx('ListCell', [
        ['variant', s(v, 'variant'), 'plain'],
        ['size', s(v, 'size'), 'md'],
        ['label', s(v, 'label')],
        ['description', s(v, 'description')],
        ['as', trailing === 'switch' ? 'label' : s(v, 'as'), 'div'],
        ['onClick', s(v, 'as') === 'button' && trailing !== 'switch' ? '{openHolding}' : undefined],
        ['iconLeft', b(v, 'iconLeft') ? '{<Icon icon={msBlurOn} />}' : undefined],
        ['iconRight', trailing === 'chevron' ? '{<Icon icon={msChevronRight} />}' : undefined],
        ['trailing', trailing === 'tag' ? '{<Tag variant="secondary" color="profit" size="sm">+4.2%</Tag>}' : trailing === 'switch' ? '{<Switch defaultChecked />}' : undefined],
        ['dotLeft', b(v, 'dotLeft')],
        ['dotLabel', b(v, 'dotLeft') ? 'New' : undefined],
      ])
    },
  },
}
