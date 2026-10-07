import { useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { ListCell } from '../components/ListCell'
import { Switch } from '../components/Switch'
import { Tabs } from '../components/Tabs'
import { TextField } from '../components/TextField'
import { msRestartAlt } from '../icons/material'
import { PhoneFrame } from './PhoneFrame'
import styles from './Docs.module.css'

type ControlBase = {
  name: string
  /** Readable label; defaults to the prop name split into words ("fullWidth" → "Full width"). */
  label?: string
  /** Only show the control when it applies (e.g. indeterminate only for a checkbox). */
  showIf?: (v: Values) => boolean
  /** The code prop it sets (for reference; the site shows Figma names only). `false` = demo-only control. */
  prop?: string | false
}

export type Control =
  | (ControlBase & { type: 'select'; options: readonly string[]; default: string; /** Figma names for the options; default: capitalized value. */ optionLabels?: Record<string, string> })
  | (ControlBase & { type: 'boolean'; default: boolean })
  | (ControlBase & { type: 'text'; default: string })

export type Values = Record<string, string | boolean>

export type PlaygroundDef = {
  controls: Control[]
  render: (v: Values) => ReactNode
  code: (v: Values) => string
  /** Overrides for the home-page card preview (e.g. a simpler variant than the playground's default). */
  thumbnail?: Values
}

export const defaults = (def: PlaygroundDef): Values => Object.fromEntries(def.controls.map((c) => [c.name, c.default]))

const humanize = (name: string) => {
  const words = name.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()
  return words[0].toUpperCase() + words.slice(1)
}

// Controls are grouped by what they change, in this order.
const groups: { type: Control['type']; title: string }[] = [
  { type: 'select', title: 'Variant' },
  { type: 'text', title: 'Content' },
  { type: 'boolean', title: 'Options' },
]

/** Live preview + controls, labelled with Figma property names (designer-facing: no code). */
export function Playground({ def }: { def: PlaygroundDef }) {
  const initial = defaults(def)
  const [values, setValues] = useState<Values>(initial)
  const set = (name: string, value: string | boolean) => setValues((v) => ({ ...v, [name]: value }))
  const visible = def.controls.filter((c) => !c.showIf || c.showIf(values))
  const changed = def.controls.filter((c) => values[c.name] !== initial[c.name]).length

  return (
    <div className={styles.playground}>
      <PhoneFrame compact label="Playground preview">
        <div className={styles.playgroundCanvas}>{def.render(values)}</div>
      </PhoneFrame>
      <aside className={styles.controls} aria-label="Properties">
        <div className={styles.controlsHeader}>
          <h3>Properties</h3>
          <Button
            size="sm"
            variant="ghost"
            iconLeft={<Icon icon={msRestartAlt} size={16} />}
            disabled={changed === 0}
            onClick={() => setValues(initial)}
          >
            Reset{changed > 0 ? ` (${changed})` : ''}
          </Button>
        </div>
        {groups.map(({ type, title }) => {
          const controls = visible.filter((c) => c.type === type)
          if (controls.length === 0) return null
          return (
            <section key={type} className={styles.controlGroup} data-type={type}>
              <h4>{title}</h4>
              {controls.map((c) => (
                <ControlInput key={c.name} control={c} value={values[c.name]} onChange={(v) => set(c.name, v)} />
              ))}
            </section>
          )
        })}
      </aside>
    </div>
  )
}

function ControlInput({ control, value, onChange }: { control: Control; value: string | boolean; onChange: (v: string | boolean) => void }) {
  const label = control.label ?? humanize(control.name)

  if (control.type === 'boolean') {
    // The whole row is the label, so tapping anywhere on it flips the switch.
    return (
      <ListCell
        as="label"
        size="sm"
        className={styles.controlCell}
        label={label}
        trailing={<Switch size="sm" checked={value as boolean} onChange={(e) => onChange(e.target.checked)} />}
      />
    )
  }

  if (control.type === 'select') {
    return (
      <div className={styles.controlField}>
        <span className={styles.controlLabel} aria-hidden="true">{label}</span>
        <Tabs
          appearance="pill"
          size="md"
          className={styles.controlChoices}
          aria-label={label}
          items={control.options.map((o) => ({ value: o, label: control.optionLabels?.[o] ?? o[0].toUpperCase() + o.slice(1) }))}
          value={value as string}
          onChange={onChange}
        />
      </div>
    )
  }

  return (
    <TextField
      className={styles.controlText}
      label={label}
      value={value as string}
      placeholder="Empty"
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ---- JSX string helpers (playground `code`: kept for reference, not shown on the site) -------------------------------------------------------

type Attr = [name: string, value: string | boolean | undefined, defaultValue?: string | boolean]

/** Prints an attribute list, skipping values equal to their default. Strings starting with { are raw. */
export function attrs(list: Attr[]): string {
  return list
    .filter(([, v, d]) => v !== undefined && v !== d && v !== false && v !== '')
    .map(([n, v]) => (v === true ? n : typeof v === 'string' && v.startsWith('{') ? `${n}=${v}` : `${n}=${JSON.stringify(v)}`))
    .join(' ')
}

export function jsx(tag: string, attrList: Attr[], children?: string, indent = ''): string {
  const a = attrs(attrList)
  const open = a ? `<${tag} ${a}` : `<${tag}`
  if (!children) return `${indent}${open} />`
  if (!children.includes('\n') && children.length < 40) return `${indent}${open}>${children}</${tag}>`
  return `${indent}${open}>\n${children}\n${indent}</${tag}>`
}
