// Playground definitions per docs page id: controls, a live render and the matching JSX.
import { useState } from 'react'
import { Actionbar, ActionbarAction } from '../components/Actionbar'
import { Aerobar, type AerobarType } from '../components/Aerobar'
import { BottomNavbar } from '../components/BottomNavbar'
import { BottomSheetHeader, BottomSheetSurface } from '../components/BottomSheet'
import { Button, type ButtonSize, type ButtonVariant } from '../components/Button'
import { ButtonGroup, type ButtonGroupDirection } from '../components/ButtonGroup'
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
import styles from './Docs.module.css'

const noop = () => {}
const s = (v: Values, k: string) => v[k] as string
const b = (v: Values, k: string) => v[k] as boolean

const buttonVariants = ['primary', 'secondary', 'tertiary', 'ghost', 'brand', 'buy', 'sell'] as const
const tagColors = ['neutral', 'green', 'purple', 'yellow', 'red', 'indigo', 'teal', 'discover', 'orange'] as const
const aerobarTypes = ['primary', 'discover', 'danger', 'success', 'warning'] as const

// ---- Stateful wrappers (the playground render can't hold hooks itself) ----------

function TabsPlay({ count, ...rest }: { count: number; appearance: 'underline' | 'pill'; emphasis: TabEmphasis; size: TabSize; icons: boolean }) {
  const labels = ['Overview', 'Financials', 'News', 'Events'].slice(0, count)
  const [value, setValue] = useState(labels[0])
  return (
    <Tabs
      aria-label="Sections"
      appearance={rest.appearance}
      emphasis={rest.emphasis}
      size={rest.size}
      items={labels.map((l) => ({ value: l, label: l, iconLeft: rest.icons ? <Icon icon={msBlurOn} size={16} /> : undefined }))}
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

// ---- Definitions ---------------------------------------------------------------

export const playgrounds: Record<string, PlaygroundDef> = {
  button: {
    controls: [
      { name: 'variant', type: 'select', options: buttonVariants, default: 'primary' },
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'lg' },
      { name: 'label', type: 'text', default: 'Place order' },
      { name: 'iconLeft', type: 'boolean', default: false },
      { name: 'iconRight', type: 'boolean', default: false },
      { name: 'loading', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
      { name: 'fullWidth', type: 'boolean', default: false },
    ],
    render: (v) => (
      <Button
        variant={s(v, 'variant') as ButtonVariant}
        size={s(v, 'size') as ButtonSize}
        iconLeft={b(v, 'iconLeft') ? <Icon icon={msAdd} /> : undefined}
        iconRight={b(v, 'iconRight') ? <Icon icon={msArrowForward} /> : undefined}
        loading={b(v, 'loading')}
        disabled={b(v, 'disabled')}
        fullWidth={b(v, 'fullWidth')}
        aria-label={s(v, 'label') ? undefined : 'Add'}
      >
        {s(v, 'label') || undefined}
      </Button>
    ),
    code: (v) =>
      jsx('Button', [
        ['variant', s(v, 'variant'), 'primary'],
        ['size', s(v, 'size'), 'lg'],
        ['iconLeft', b(v, 'iconLeft') ? '{<Icon icon={msAdd} />}' : undefined],
        ['iconRight', b(v, 'iconRight') ? '{<Icon icon={msArrowForward} />}' : undefined],
        ['loading', b(v, 'loading')],
        ['disabled', b(v, 'disabled')],
        ['fullWidth', b(v, 'fullWidth')],
        ['aria-label', s(v, 'label') ? undefined : 'Add'],
        ['onClick', '{placeOrder}'],
      ], s(v, 'label')),
  },

  'button-group': {
    controls: [
      { name: 'direction', type: 'select', options: ['vertical', 'horizontal'], default: 'horizontal' },
      { name: 'scrollIndicator', type: 'boolean', default: false },
      { name: 'primary', label: 'primary label', type: 'text', default: 'Confirm' },
      { name: 'secondary', label: 'secondary label', type: 'text', default: 'Cancel' },
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
      { name: 'color', type: 'select', options: tagColors, default: 'green' },
      { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
      { name: 'label', type: 'text', default: '+1.24%' },
      { name: 'iconLeft', type: 'boolean', default: false },
      { name: 'disabled', type: 'boolean', default: false },
    ],
    render: (v) => (
      <Tag variant={s(v, 'variant') as TagVariant} color={s(v, 'color') as TagColor} size={s(v, 'size') as TagSize} disabled={b(v, 'disabled')} iconLeft={b(v, 'iconLeft') ? <Icon icon={msStar} /> : undefined}>
        {s(v, 'label')}
      </Tag>
    ),
    code: (v) =>
      jsx('Tag', [
        ['variant', s(v, 'variant'), 'primary'],
        ['color', s(v, 'color'), 'neutral'],
        ['size', s(v, 'size'), 'sm'],
        ['iconLeft', b(v, 'iconLeft') ? '{<Icon icon={msStar} />}' : undefined],
        ['disabled', b(v, 'disabled')],
      ], s(v, 'label')),
  },

  switch: {
    controls: [
      { name: 'size', type: 'select', options: ['md', 'sm'], default: 'md' },
      { name: 'label', type: 'text', default: 'Price alerts' },
      { name: 'defaultChecked', type: 'boolean', default: true },
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
      { name: 'kind', type: 'select', options: ['Checkbox', 'Radio'], default: 'Checkbox' },
      { name: 'label', type: 'text', default: 'Equity' },
      { name: 'defaultChecked', type: 'boolean', default: true },
      { name: 'indeterminate', label: 'indeterminate (checkbox)', type: 'boolean', default: false },
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
      { name: 'multiline', label: 'multiline (text box)', type: 'boolean', default: false },
      { name: 'label', type: 'text', default: 'Quantity' },
      { name: 'placeholder', type: 'text', default: 'Enter quantity' },
      { name: 'helperText', type: 'text', default: 'Lot size is 25' },
      { name: 'status', type: 'select', options: ['none', 'error', 'success'], default: 'none' },
      { name: 'maxLength', label: 'maxLength (text box)', type: 'select', options: ['none', '50', '140'], default: '140' },
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
      { name: 'count', label: 'tabs', type: 'select', options: ['2', '3', '4'], default: '3' },
      { name: 'icons', label: 'iconLeft', type: 'boolean', default: false },
    ],
    render: (v) => (
      <TabsPlay count={Number(s(v, 'count'))} appearance={s(v, 'appearance') as 'underline' | 'pill'} emphasis={s(v, 'emphasis') as TabEmphasis} size={s(v, 'size') as TabSize} icons={b(v, 'icons')} />
    ),
    code: (v) => {
      const labels = ['Overview', 'Financials', 'News', 'Events'].slice(0, Number(s(v, 'count')))
      const icon = b(v, 'icons') ? ', iconLeft: <Icon icon={msBlurOn} size={16} />' : ''
      const items = labels.map((l) => `    { value: '${l.toLowerCase()}', label: '${l}'${icon} },`).join('\n')
      return `<Tabs\n  ${attrs([['aria-label', 'Sections'], ['appearance', s(v, 'appearance'), 'underline'], ['emphasis', s(v, 'emphasis'), 'primary'], ['size', s(v, 'size'), 'md']])}\n  items={[\n${items}\n  ]}\n  value={tab}\n  onChange={setTab}\n/>`
    },
  },

  actionbar: {
    controls: [
      { name: 'title', type: 'text', default: 'RELIANCE' },
      { name: 'description', type: 'text', default: 'NSE · Equity' },
      { name: 'back', label: 'onBack', type: 'boolean', default: true },
      { name: 'actions', type: 'select', options: ['0', '1', '2'], default: '2' },
      { name: 'search', label: 'search mode', type: 'boolean', default: false },
      { name: 'bottom', label: 'bottom (tabs)', type: 'boolean', default: false },
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
    controls: [{ name: 'nav', type: 'select', options: ['Main', 'Mutual fund', 'F&O'], default: 'Main' }],
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
    controls: [
      { name: 'size', label: 'header size', type: 'select', options: ['sm', 'lg'], default: 'sm' },
      { name: 'heading', type: 'text', default: 'Buy RELIANCE' },
      { name: 'description', label: 'description (lg)', type: 'text', default: 'NSE · Delivery' },
      { name: 'back', label: 'onBack (sm)', type: 'boolean', default: false },
      { name: 'info', label: 'info (sm)', type: 'boolean', default: true },
      { name: 'close', label: 'onClose', type: 'boolean', default: true },
      { name: 'dragHandle', type: 'boolean', default: true },
    ],
    render: (v) => (
      <div className={styles.playSheet}>
        <BottomSheetSurface
          dragHandle={b(v, 'dragHandle')}
          header={
            <BottomSheetHeader
              size={s(v, 'size') as 'sm' | 'lg'}
              heading={s(v, 'heading')}
              description={s(v, 'size') === 'lg' ? s(v, 'description') : undefined}
              onBack={b(v, 'back') ? noop : undefined}
              info={b(v, 'info')}
              onClose={b(v, 'close') ? noop : undefined}
            />
          }
          footer={<Button size="lg" variant="buy" fullWidth>Buy</Button>}
        >
          <p className={styles.playSheetBody}>Sheet content goes here.</p>
        </BottomSheetSurface>
      </div>
    ),
    code: (v) => {
      const lg = s(v, 'size') === 'lg'
      const header = jsx('BottomSheetHeader', [
        ['size', s(v, 'size'), 'sm'],
        ['heading', s(v, 'heading')],
        ['headingId', 'buy-heading'],
        ['description', lg ? s(v, 'description') : undefined],
        ['onBack', !lg && b(v, 'back') ? '{goBack}' : undefined],
        ['info', !lg && b(v, 'info')],
        ['onClose', b(v, 'close') ? '{close}' : undefined],
      ])
      return `<BottomSheet\n  open={open}\n  onClose={close}\n  aria-labelledby="buy-heading"${b(v, 'dragHandle') ? '\n  dragHandle' : ''}\n  header={${header}}\n  footer={<Button size="lg" variant="buy" fullWidth>Buy</Button>}\n>\n  …\n</BottomSheet>`
    },
  },

  aerobar: {
    controls: [
      { name: 'type', type: 'select', options: aerobarTypes, default: 'success' },
      { name: 'emphasis', type: 'select', options: ['primary', 'secondary'], default: 'primary' },
      { name: 'floating', type: 'boolean', default: true },
      { name: 'heading', type: 'text', default: 'Order placed' },
      { name: 'paragraph', type: 'text', default: 'Buy 10 RELIANCE at market' },
      { name: 'icon', type: 'boolean', default: true },
      { name: 'action', type: 'boolean', default: true },
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
      { name: 'illustration', type: 'boolean', default: true },
      { name: 'action', label: 'action (Clear)', type: 'boolean', default: true },
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
      { name: 'as', type: 'select', options: ['div', 'button'], default: 'button' },
      { name: 'iconLeft', type: 'boolean', default: false },
      { name: 'trailing', type: 'select', options: ['none', 'chevron', 'tag', 'switch'], default: 'chevron' },
      { name: 'dotLeft', type: 'boolean', default: false },
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
          trailing={trailing === 'tag' ? <Tag variant="secondary" color="green" size="sm">+4.2%</Tag> : trailing === 'switch' ? <Switch defaultChecked /> : undefined}
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
        ['trailing', trailing === 'tag' ? '{<Tag variant="secondary" color="green" size="sm">+4.2%</Tag>}' : trailing === 'switch' ? '{<Switch defaultChecked />}' : undefined],
        ['dotLeft', b(v, 'dotLeft')],
        ['dotLabel', b(v, 'dotLeft') ? 'New' : undefined],
      ])
    },
  },
}
