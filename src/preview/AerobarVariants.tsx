import { useState } from 'react'
import { Aerobar, type AerobarType } from '../components/Aerobar'

const types: AerobarType[] = ['primary', 'discover', 'danger', 'success', 'warning']
const noop = () => {}

// Same 4 columns as the Figma frame: soft strip, solid strip, soft floating, solid floating.
const columns = [
  { label: 'isPrimary=False', emphasis: 'secondary', floating: false },
  { label: 'isPrimary=True', emphasis: 'primary', floating: false },
  { label: 'isPrimary=False · isFloating', emphasis: 'secondary', floating: true },
  { label: 'isPrimary=True · isFloating', emphasis: 'primary', floating: true },
] as const

export function AerobarVariants() {
  const [show, setShow] = useState({ icon: true, heading: true, paragraph: true, action: true })
  const toggle = (k: keyof typeof show) => setShow((s) => ({ ...s, [k]: !s[k] }))

  return (
    <>
      <div className="btn-controls">
        {(['icon', 'heading', 'paragraph', 'action'] as const).map((k) => (
          <label key={k} className="check">
            <input type="checkbox" checked={show[k]} onChange={() => toggle(k)} /> {k}
          </label>
        ))}
      </div>
      <div className="btn-grid-scroll">
        <table className="ab-grid">
          <thead>
            <tr><th />{columns.map((c) => <th key={c.label} scope="col">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {types.map((t) => (
              <tr key={t}>
                <th scope="row">{t[0].toUpperCase() + t.slice(1)}</th>
                {columns.map((c) => (
                  <td key={c.label}>
                    <Aerobar
                      type={t}
                      emphasis={c.emphasis}
                      floating={c.floating}
                      icon={show.icon ? undefined : false}
                      heading={show.heading && 'Heading text'}
                      paragraph={show.paragraph && 'Paragraph text'}
                      action={show.action ? { label: 'Label', onClick: noop } : undefined}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
