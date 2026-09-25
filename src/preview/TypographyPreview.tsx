import { useState } from 'react'
import { textStyles } from '../tokens'

const groups = [
  { weight: 'extrabold', title: 'Extrabold — Heading' },
  { weight: 'bold', title: 'Bold' },
  { weight: 'semibold', title: 'Semibold — Label' },
  { weight: 'medium', title: 'Medium — Body' },
  { weight: 'regular', title: 'Regular' },
] as const

export function TypographyPreview() {
  const [sample, setSample] = useState('Buy NIFTY 50 at ₹24,812.35')

  return (
    <>
      <label className="sample-input">
        Sample text
        <input value={sample} onChange={(e) => setSample(e.target.value)} />
      </label>

      {groups.map(({ weight, title }) => (
        <section key={weight}>
          <h2>{title}</h2>
          <ul className="type-list">
            {textStyles.filter((s) => s.weight === weight).map((s) => (
              <li key={s.cssVar}>
                <div className="type-meta">
                  <span className="type-name">{s.figmaName}</span>
                  <code>{s.fontSize}/{s.lineHeight} · {s.cssVar}</code>
                </div>
                <p className="type-sample" style={{ font: `var(${s.cssVar})` }}>{sample}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
