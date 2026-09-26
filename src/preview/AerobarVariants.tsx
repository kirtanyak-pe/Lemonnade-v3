import { useState } from 'react'
import { Aerobar, type AerobarType } from '../components/Aerobar'

const types: AerobarType[] = ['primary', 'discover', 'danger', 'success', 'warning']
const noop = () => {}

// The Figma frame's 4 columns: soft strip, solid strip, soft floating, solid floating.
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
      {/* One block per Figma column; the 5 types wrap to the available width (no sideways scroll). */}
      {columns.map((c) => (
        <section key={c.label} className="ab-group">
          <h3>{c.label}</h3>
          <div className="ab-list">
            {types.map((t) => (
              <figure key={t} className="ab-item">
                <figcaption>Type={t[0].toUpperCase() + t.slice(1)}</figcaption>
                <Aerobar
                  type={t}
                  emphasis={c.emphasis}
                  floating={c.floating}
                  role="status"
                  icon={show.icon ? undefined : false}
                  heading={show.heading && 'Heading text'}
                  paragraph={show.paragraph && 'Paragraph text'}
                  action={show.action ? { label: 'Label', onClick: noop } : undefined}
                />
              </figure>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
