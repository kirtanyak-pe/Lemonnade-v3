// Draws the components that hold no other items: each node becomes the real Lemonnade component with its real props.
// Interaction is local to the canvas (a tab or a switch can be tried), and nothing here is wired to anything.
import { useState } from 'react'
import { Actionbar, ActionbarAction } from '../components/Actionbar'
import { Aerobar } from '../components/Aerobar'
import { BottomNavbar, NavIcon } from '../components/BottomNavbar'
import { BrandLogo } from '../components/BrandLogo'
import { Button } from '../components/Button'
import { Checkbox, Radio } from '../components/Checkbox'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { ListCell } from '../components/ListCell'
import { Switch } from '../components/Switch'
import { Tabs } from '../components/Tabs'
import { Tag } from '../components/Tag'
import { TextField } from '../components/TextField'
import { msChevronRight } from '../icons/material'
import type { DesignNode } from './design'
import { iconSrc, specSrc } from './iconSrc'
import type { IconCatalog } from './useIconCatalog'
import styles from './Build.module.css'

const noop = () => {}
const labelOf = (icon: string) => icon.replaceAll('_', ' ')

/** Tabs you can click through on the canvas. Re-created when the design changes the labels or the selected tab. */
function TabsView({ items, active, appearance, label }: { items: string[]; active: number; appearance: 'underline' | 'pill'; label: string }) {
  const tabs = items.filter(Boolean)
  const [value, setValue] = useState(String(Math.min(active, tabs.length - 1)))
  return (
    <Tabs
      aria-label={label}
      appearance={appearance}
      items={tabs.map((t, i) => ({ value: String(i), label: t }))}
      value={value}
      onChange={setValue}
    />
  )
}

function NavView({ node }: { node: DesignNode }) {
  const items = node.navItems ?? []
  const [value, setValue] = useState(String(Math.min(node.active ?? 0, items.length - 1)))
  return (
    <BottomNavbar
      aria-label="Main"
      items={items.map((it, i) => ({
        value: String(i),
        label: it.label,
        icon: <NavIcon name={it.icon} />,
        selectedIcon: <NavIcon name={it.icon} selected />,
      }))}
      value={value}
      onChange={setValue}
    />
  )
}

function CellView({ node, catalog }: { node: DesignNode; catalog: IconCatalog | null }) {
  const [on, setOn] = useState(!!node.checked)
  const left = specSrc(node.iconLeft, 'info', catalog)
  const control =
    node.control === 'switch' ? <Switch checked={on} onChange={(e) => setOn(e.target.checked)} aria-label={node.text} /> :
    node.control === 'checkbox' ? <Checkbox checked={on} onChange={(e) => setOn(e.target.checked)} aria-label={node.text} /> :
    null
  const trailing = (
    <>
      {node.value && <span className={styles.cellValue}>{node.value}</span>}
      {control}
    </>
  )
  return (
    <ListCell
      label={node.text}
      description={node.description}
      variant={node.cellVariant ?? 'plain'}
      iconLeft={node.iconLeft && left ? <Icon icon={left} size={24} /> : undefined}
      iconRight={node.chevron ? <Icon icon={msChevronRight} size={24} /> : undefined}
      trailing={node.value || control ? trailing : undefined}
      as={control ? 'label' : 'div'}
    />
  )
}

/** A switch, checkbox or radio with its label. */
function Choice({ node, group }: { node: DesignNode; group: string }) {
  const text = node.text ?? ''
  return (
    <label className={styles.choice}>
      {node.kind === 'switch' && <Switch defaultChecked={!!node.checked} aria-label={text} />}
      {node.kind === 'checkbox' && <Checkbox defaultChecked={!!node.checked} aria-label={text} />}
      {node.kind === 'radio' && <Radio name={group} defaultChecked={!!node.checked} aria-label={text} />}
      <span>{text}</span>
    </label>
  )
}

export function Leaf({ node, catalog, group }: { node: DesignNode; catalog: IconCatalog | null; group: string }) {
  switch (node.kind) {
    case 'actionbar': {
      const tabs = node.items?.filter(Boolean)
      return (
        <Actionbar
          key={`${node.text}-${tabs?.join('|')}-${node.active}`}
          title={node.text}
          description={node.description}
          onBack={node.back ? noop : undefined}
          actions={node.actions?.map((a) => <ActionbarAction key={a} icon={iconSrc(a, false, catalog) ?? ''} label={labelOf(a)} onClick={noop} />)}
          bottom={tabs && tabs.length >= 2 ? <TabsView items={tabs} active={node.active ?? 0} appearance="underline" label={`${node.text ?? 'Screen'} sections`} /> : undefined}
        />
      )
    }
    case 'tabs':
      return <TabsView key={`${node.items?.join('|')}-${node.active}-${node.appearance}`} items={node.items ?? []} active={node.active ?? 0} appearance={node.appearance ?? 'underline'} label="Sections" />
    case 'tag':
      return <Tag color={node.tagColor ?? 'neutral'} variant={node.tagVariant} size={node.tagSize ?? 'md'}>{node.text}</Tag>
    case 'listcell':
      return <CellView key={`${node.checked}-${node.control}`} node={node} catalog={catalog} />
    case 'textfield':
      return <TextField label={node.text} placeholder={node.placeholder} helperText={node.helper} status={node.status === 'error' || node.status === 'success' ? node.status : undefined} />
    case 'switch':
    case 'checkbox':
    case 'radio':
      return <Choice key={String(node.checked)} node={node} group={group} />
    case 'aerobar':
      return <Aerobar type={node.tone ?? 'primary'} floating={node.floating} heading={node.text} paragraph={node.description} />
    case 'emptystate':
      return (
        <EmptyState
          title={node.text}
          description={node.description}
          action={node.value ? <Button size="sm">{node.value}</Button> : undefined}
        />
      )
    case 'bottomnav':
      return <NavView key={`${node.navItems?.map((i) => i.label + i.icon).join('|')}-${node.active}`} node={node} />
    case 'brandlogo':
      return <BrandLogo brand={node.brand ?? 'lemonn'} variant={node.logoVariant ?? 'full'} />
    case 'icon': {
      const src = specSrc(node.iconLeft, 'info', catalog)
      return src ? <Icon icon={src} size={24} label={node.iconLeft?.name ? labelOf(node.iconLeft.name) : undefined} /> : null
    }
    default:
      return null
  }
}
