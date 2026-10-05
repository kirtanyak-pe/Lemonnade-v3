// The inspector's controls for the components beyond headings, text, buttons and sections. Every option maps to a real
// prop of the component, and the hints come from DESIGN_SYSTEM.md and the component docs.
import type { ReactNode } from 'react'
import { Button } from '../components/Button'
import {
  actionIcons, aerobarTones, cardSurfaces, cellControls, fieldStatuses, navIconNames, tagColors,
} from './schema'
import type { DesignNode, Hint } from './design'
import { IconPicker, More, Mini, Group, Segmented, Select, Warn, type Theme } from './controls'
import { stepLabel, steps } from './design'
import type { IconCatalog } from './useIconCatalog'
import styles from './Build.module.css'

type Props = {
  node: DesignNode
  set: (patch: Partial<DesignNode>) => void
  theme: Theme
  catalog: IconCatalog | null
}

const human = (s: string) => s.replaceAll('_', ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

function TextRow({ label, value, onChange, placeholder }: { label: string; value: string | undefined; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Mini label={label}>
      <input className={styles.fieldInput} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Mini>
  )
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

/** One item per line, for tab labels. */
function Lines({ label, value, onChange, max }: { label: string; value: string[] | undefined; onChange: (v: string[]) => void; max: number }) {
  return (
    <Mini label={`${label} (one per line, up to ${max})`}>
      <textarea
        className={styles.fieldInput}
        rows={Math.min(max, Math.max(3, (value?.length ?? 0) + 1))}
        value={(value ?? []).join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n').slice(0, max))}
      />
    </Mini>
  )
}

function ActivePicker({ label, count, value, onChange }: { label: string; count: number; value: number | undefined; onChange: (v: number) => void }) {
  const options = Array.from({ length: Math.max(count, 1) }, (_, i) => i)
  return (
    <Mini label={label}>
      <Select value={Math.min(value ?? 0, options.length - 1)} options={options} format={(i) => `${i + 1}`} onChange={onChange} />
    </Mini>
  )
}

const dockHint = (n: DesignNode): Hint | null => {
  const buttons = (n.children ?? []).filter((c) => c.kind === 'button')
  if (buttons.length && !buttons.some((b) => b.variant && ['primary', 'buy', 'sell', 'brand'].includes(b.variant))) {
    return { level: 'warn', text: 'A button dock needs at least one strong button (primary, buy, sell or brand).' }
  }
  return null
}

const cardHint = (n: DesignNode): Hint | null => {
  const kids = n.children ?? []
  if (kids.length === 1 && kids[0].kind === 'button') {
    return { level: 'warn', text: 'A card with one button in it should be a clickable card instead. The whole card is the action.' }
  }
  return null
}

export function KindFields({ node, set, catalog }: Props): ReactNode {
  const spacing = (
    <More>
      <div className={styles.pair}>
        <Mini label="Space above">
          <Select value={node.before ?? '00'} options={steps} format={stepLabel} onChange={(before) => set({ before })} />
        </Mini>
        <Mini label="Space below">
          <Select value={node.after ?? '00'} options={steps} format={stepLabel} onChange={(after) => set({ after })} />
        </Mini>
      </div>
    </More>
  )

  switch (node.kind) {
    case 'actionbar': {
      const [a1, a2] = node.actions ?? []
      const setAction = (i: 0 | 1, v: string) => {
        const next = [...(node.actions ?? [])]
        next[i] = v
        set({ actions: next.filter(Boolean).slice(0, 2) })
      }
      const iconOptions = ['', ...actionIcons] as const
      return (
        <>
          <Group>
            <TextRow label="Title" value={node.text} onChange={(text) => set({ text })} />
            <TextRow label="Subtitle" value={node.description} onChange={(description) => set({ description })} />
            <Check label="Back button" checked={!!node.back} onChange={(back) => set({ back })} />
            <div className={styles.pair}>
              <Mini label="Action 1">
                <Select value={a1 ?? ''} options={iconOptions} format={(v) => (v ? human(v) : 'None')} onChange={(v) => setAction(0, v)} />
              </Mini>
              <Mini label="Action 2">
                <Select value={a2 ?? ''} options={iconOptions} format={(v) => (v ? human(v) : 'None')} onChange={(v) => setAction(1, v)} />
              </Mini>
            </div>
            <Warn hint={{ level: 'warn', text: node.actions && node.actions.length > 2 ? 'An action bar holds at most two actions.' : '' }} />
          </Group>
          <Group>
            <Lines label="Tabs under the bar" value={node.items} max={5} onChange={(items) => set({ items: items.length ? items : undefined })} />
            {node.items && <ActivePicker label="Selected tab" count={node.items.filter(Boolean).length} value={node.active} onChange={(active) => set({ active })} />}
            <p className={styles.hint} data-level="info">Flat tabs at the top of a screen go inside the action bar, never as a separate layer.</p>
          </Group>
          {spacing}
        </>
      )
    }

    case 'tabs':
      return (
        <>
          <Group>
            <Segmented label="Tab style" value={node.appearance ?? 'underline'} options={[{ value: 'underline', label: 'Underline' }, { value: 'pill', label: 'Pill' }]} onChange={(appearance) => set({ appearance })} />
            <Lines label="Tabs" value={node.items} max={6} onChange={(items) => set({ items })} />
            <ActivePicker label="Selected tab" count={node.items?.filter(Boolean).length ?? 1} value={node.active} onChange={(active) => set({ active })} />
            <p className={styles.hint} data-level="info">Two to four short, parallel labels. Use pills for filters and chips, underline for sections.</p>
          </Group>
          {spacing}
        </>
      )

    case 'tag':
      return (
        <>
          <Group>
            <TextRow label="Text" value={node.text} onChange={(text) => set({ text })} />
            <Mini label="Color">
              <Select value={node.tagColor ?? 'neutral'} options={tagColors} format={human} onChange={(tagColor) => set({ tagColor })} />
            </Mini>
            <Segmented label="Tag style" value={node.tagVariant ?? 'secondary'} options={[{ value: 'primary', label: 'Solid' }, { value: 'secondary', label: 'Soft' }, { value: 'tertiary', label: 'Outline' }]} onChange={(tagVariant) => set({ tagVariant })} />
            <Segmented label="Tag size" value={node.tagSize ?? 'md'} options={[{ value: 'sm', label: 'S' }, { value: 'md', label: 'M' }, { value: 'lg', label: 'L' }]} onChange={(tagSize) => set({ tagSize })} />
            <p className={styles.hint} data-level="info">Profit and loss are for price moves and P&L. Success and error are outcomes. Tags are never tappable.</p>
          </Group>
          {spacing}
        </>
      )

    case 'listcell':
      return (
        <>
          <Group>
            <TextRow label="Label" value={node.text} onChange={(text) => set({ text })} />
            <TextRow label="Description" value={node.description} onChange={(description) => set({ description })} />
            <TextRow label="Value on the right" value={node.value} onChange={(value) => set({ value })} />
            <Segmented label="Row style" value={node.cellVariant ?? 'plain'} options={[{ value: 'plain', label: 'Plain' }, { value: 'card', label: 'Card' }]} onChange={(cellVariant) => set({ cellVariant })} />
            <Segmented label="Control" value={node.control ?? 'none'} options={cellControls.map((c) => ({ value: c, label: human(c) }))} onChange={(control) => set({ control })} />
            {node.control && node.control !== 'none' && <Check label="Turned on" checked={!!node.checked} onChange={(checked) => set({ checked })} />}
            <Check label="Chevron" checked={!!node.chevron} onChange={(chevron) => set({ chevron })} />
            <Check label="Left icon" checked={!!node.iconLeft} onChange={(on) => set({ iconLeft: on ? {} : undefined })} />
          </Group>
          {node.iconLeft && (
            <Group>
              <IconPicker spec={node.iconLeft} fallback="info" catalog={catalog} onPick={(patch) => set({ iconLeft: { ...node.iconLeft, ...patch } })} />
            </Group>
          )}
          {spacing}
        </>
      )

    case 'textfield':
      return (
        <>
          <Group>
            <TextRow label="Label" value={node.text} onChange={(text) => set({ text })} />
            <TextRow label="Placeholder" value={node.placeholder} onChange={(placeholder) => set({ placeholder })} />
            <TextRow label="Helper text" value={node.helper} onChange={(helper) => set({ helper })} />
            <Segmented label="State" value={node.status ?? 'default'} options={fieldStatuses.map((s) => ({ value: s, label: human(s) }))} onChange={(status) => set({ status })} />
            <p className={styles.hint} data-level="info">Keep a visible label. Errors should say what went wrong and how to fix it.</p>
          </Group>
          {spacing}
        </>
      )

    case 'switch':
    case 'checkbox':
    case 'radio':
      return (
        <>
          <Group>
            <TextRow label="Label" value={node.text} onChange={(text) => set({ text })} />
            <Check label={node.kind === 'switch' ? 'Turned on' : 'Selected'} checked={!!node.checked} onChange={(checked) => set({ checked })} />
            <p className={styles.hint} data-level="info">
              {node.kind === 'switch' ? 'A setting that applies as soon as it flips.' : node.kind === 'radio' ? 'Use radios when exactly one option can be chosen.' : 'Use checkboxes when several options can be chosen.'}
            </p>
          </Group>
          {spacing}
        </>
      )

    case 'aerobar':
      return (
        <>
          <Group>
            <TextRow label="Heading" value={node.text} onChange={(text) => set({ text })} />
            <TextRow label="Paragraph" value={node.description} onChange={(description) => set({ description })} />
            <Mini label="Tone">
              <Select value={node.tone ?? 'primary'} options={aerobarTones} format={human} onChange={(tone) => set({ tone })} />
            </Mini>
            <Check label="Floating toast" checked={!!node.floating} onChange={(floating) => set({ floating })} />
            <p className={styles.hint} data-level="info">A message about the page is a full-width bar. The result of an action is a floating toast.</p>
          </Group>
          {spacing}
        </>
      )

    case 'emptystate':
      return (
        <>
          <Group>
            <TextRow label="Title" value={node.text} onChange={(text) => set({ text })} />
            <TextRow label="Description" value={node.description} onChange={(description) => set({ description })} />
            <TextRow label="Button label" value={node.value} onChange={(value) => set({ value })} placeholder="No button" />
            <p className={styles.hint} data-level="info">Say what happened and give a way to recover. Never a blank screen.</p>
          </Group>
          {spacing}
        </>
      )

    case 'bottomnav': {
      const items = node.navItems ?? []
      const update = (i: number, patch: Partial<{ label: string; icon: (typeof navIconNames)[number] }>) =>
        set({ navItems: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) })
      return (
        <>
          <Group>
            {items.map((it, i) => (
              <div key={i} className={styles.pair}>
                <TextRow label={`Item ${i + 1}`} value={it.label} onChange={(label) => update(i, { label })} />
                <Mini label="Icon">
                  <Select value={it.icon} options={navIconNames} format={human} onChange={(icon) => update(i, { icon })} />
                </Mini>
              </div>
            ))}
            <div className={styles.moveRow}>
              <Button variant="tertiary" size="sm" disabled={items.length >= 5} onClick={() => set({ navItems: [...items, { label: 'New', icon: 'market' }] })}>
                Add item
              </Button>
              <Button variant="tertiary" size="sm" disabled={items.length <= 3} onClick={() => set({ navItems: items.slice(0, -1), active: Math.min(node.active ?? 0, items.length - 2) })}>
                Remove last
              </Button>
            </div>
            <ActivePicker label="Selected item" count={items.length} value={node.active} onChange={(active) => set({ active })} />
            <p className={styles.hint} data-level="info">Three to five top-level sections, always labelled. Never actions like Buy.</p>
          </Group>
          {spacing}
        </>
      )
    }

    case 'brandlogo':
      return (
        <>
          <Group>
            <Segmented label="Brand" value={node.brand ?? 'lemonn'} options={[{ value: 'lemonn', label: 'Lemonn' }, { value: 'zing', label: 'Zing' }]} onChange={(brand) => set({ brand })} />
            <Segmented label="Logo style" value={node.logoVariant ?? 'full'} options={[{ value: 'full', label: 'Full' }, { value: 'icon', label: 'Mark only' }]} onChange={(logoVariant) => set({ logoVariant })} />
          </Group>
          {spacing}
        </>
      )

    case 'icon':
      return (
        <>
          <Group>
            <IconPicker spec={node.iconLeft ?? {}} fallback="info" catalog={catalog} onPick={(patch) => set({ iconLeft: { ...node.iconLeft, ...patch } })} />
          </Group>
          {spacing}
        </>
      )

    case 'card':
      return (
        <>
          <Group>
            <Mini label="Surface">
              <Select value={node.surface ?? 'default'} options={cardSurfaces} format={human} onChange={(surface) => set({ surface })} />
            </Mini>
            <Check label="Flat (no border or shadow)" checked={!!node.flat} onChange={(flat) => set({ flat })} />
            <Mini label="Gap between items">
              <Select value={node.gap ?? '08'} options={steps} format={stepLabel} onChange={(gap) => set({ gap })} />
            </Mini>
            <Warn hint={cardHint(node)} />
            <p className={styles.hint} data-level="info">A card with one action is a clickable card: the whole card is the tap target.</p>
          </Group>
          {spacing}
        </>
      )

    case 'dock':
      return (
        <>
          <Group>
            <Segmented label="Direction" value={node.direction ?? 'horizontal'} options={[{ value: 'horizontal', label: 'Side by side' }, { value: 'vertical', label: 'Stacked' }]} onChange={(direction) => set({ direction })} />
            <Warn hint={dockHint(node)} />
            <p className={styles.hint} data-level="info">The screen’s main action. Buttons here are always Large. Strong button on the right, or on top when stacked.</p>
          </Group>
          {spacing}
        </>
      )

    default:
      return null
  }
}
