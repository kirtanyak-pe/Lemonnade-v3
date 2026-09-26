import { useId, useState, type ReactNode } from 'react'
import { PhoneFrame } from './PhoneFrame'
import styles from './Docs.module.css'

export type Control =
  | { name: string; label?: string; type: 'select'; options: readonly string[]; default: string }
  | { name: string; label?: string; type: 'boolean'; default: boolean }
  | { name: string; label?: string; type: 'text'; default: string }

export type Values = Record<string, string | boolean>

export type PlaygroundDef = {
  controls: Control[]
  render: (v: Values) => ReactNode
  code: (v: Values) => string
}

export const defaults = (def: PlaygroundDef): Values => Object.fromEntries(def.controls.map((c) => [c.name, c.default]))

/** Live preview + controls + the matching JSX, with a copy button. */
export function Playground({ def }: { def: PlaygroundDef }) {
  const [values, setValues] = useState<Values>(() => defaults(def))
  const set = (name: string, value: string | boolean) => setValues((v) => ({ ...v, [name]: value }))
  const code = def.code(values)

  return (
    <div className={styles.playground}>
      <PhoneFrame compact label="Playground preview">
        <div className={styles.playgroundCanvas}>{def.render(values)}</div>
      </PhoneFrame>
      <fieldset className={styles.controls}>
        <legend>Props</legend>
        {def.controls.map((c) => (
          <ControlInput key={c.name} control={c} value={values[c.name]} onChange={(v) => set(c.name, v)} />
        ))}
        <button type="button" className={styles.resetButton} onClick={() => setValues(defaults(def))}>
          Reset
        </button>
      </fieldset>
      <CodeBlock code={code} />
    </div>
  )
}

function ControlInput({ control, value, onChange }: { control: Control; value: string | boolean; onChange: (v: string | boolean) => void }) {
  const id = useId()
  const label = control.label ?? control.name
  if (control.type === 'boolean') {
    return (
      <label className={styles.controlRow} htmlFor={id}>
        <span>{label}</span>
        <input id={id} type="checkbox" checked={value as boolean} onChange={(e) => onChange(e.target.checked)} />
      </label>
    )
  }
  return (
    <label className={styles.controlRow} htmlFor={id}>
      <span>{label}</span>
      {control.type === 'select' ? (
        <select id={id} value={value as string} onChange={(e) => onChange(e.target.value)}>
          {control.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input id={id} type="text" value={value as string} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}

/** Code sample with a Copy button (announces "Copied"). */
export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className={styles.codeWrap}>
      <pre className={styles.codeBlock}><code>{code}</code></pre>
      <button type="button" className={styles.copyButton} onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span className={styles.visuallyHidden} aria-live="polite">{copied ? 'Code copied' : ''}</span>
    </div>
  )
}

// ---- JSX string helpers -------------------------------------------------------

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
