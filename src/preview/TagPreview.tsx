import { useState } from 'react'
import { Tag, TagChevronIcon, TagPlaceholderIcon, type TagColor, type TagSize, type TagVariant } from '../components/Tag'

// Order matches the Figma "D2: Tags" frame.
const colors: TagColor[] = ['neutral', 'green', 'purple', 'yellow', 'red', 'indigo', 'teal', 'discover', 'orange']
const rows: { label: string; variant: TagVariant; disabled?: boolean }[] = [
  { label: 'Primary', variant: 'primary' },
  { label: 'Secondary', variant: 'secondary' },
  { label: 'Tertiary', variant: 'tertiary' },
  { label: 'Disabled', variant: 'primary', disabled: true },
]
const sizes: { id: TagSize; label: string }[] = [
  { id: 'sm', label: 'Small → 16' },
  { id: 'md', label: 'Medium → 20' },
  { id: 'lg', label: 'Large → 24' },
]

export function TagPreview() {
  const [label, setLabel] = useState('LABEL')
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)

  const icons = {
    iconLeft: showLeft ? <TagPlaceholderIcon /> : undefined,
    iconRight: showRight ? <TagChevronIcon /> : undefined,
  }

  return (
    <>
      <div className="btn-controls">
        <label>
          Label
          <input value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="check">
          <input type="checkbox" checked={showLeft} onChange={(e) => setShowLeft(e.target.checked)} /> left icon
        </label>
        <label className="check">
          <input type="checkbox" checked={showRight} onChange={(e) => setShowRight(e.target.checked)} /> right icon
        </label>
      </div>

      {sizes.map((size) => (
        <section key={size.id}>
          <h2>{size.label}</h2>
          <div className="btn-grid-scroll">
            <table className="tag-grid">
              <thead>
                <tr>
                  <th />
                  {colors.map((c) => <th key={c} scope="col">{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {colors.map((c) => (
                      <td key={c}>
                        {/* Figma only draws Disabled in Neutral; the prop works for any color. */}
                        {(!row.disabled || c === 'neutral') && (
                          <Tag variant={row.variant} color={c} size={size.id} disabled={row.disabled} {...icons}>
                            {label}
                          </Tag>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  )
}
