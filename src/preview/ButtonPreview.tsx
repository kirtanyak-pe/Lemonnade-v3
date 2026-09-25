import { useState } from 'react'
import { ArrowRightIcon, Button, PlaceholderIcon, type ButtonSize, type ButtonVariant } from '../components/Button'

// Column / row order matches the Figma "L3: Button" frame.
const variants: { id: ButtonVariant; label: string }[] = [
  { id: 'primary', label: 'Primary' },
  { id: 'secondary', label: 'Secondary' },
  { id: 'tertiary', label: 'Tertiary' },
  { id: 'ghost', label: 'Ghost' },
  { id: 'buy', label: 'Buy' },
  { id: 'sell', label: 'Sell' },
  { id: 'brand', label: 'Brand' },
]
const states = ['default', 'loading', 'disabled'] as const
const sizes: { id: ButtonSize; label: string }[] = [
  { id: 'lg', label: 'Large' },
  { id: 'md', label: 'Medium' },
  { id: 'sm', label: 'Small' },
]

export function ButtonPreview() {
  const [label, setLabel] = useState('Label')
  const [showLeft, setShowLeft] = useState(true)
  const [showRight, setShowRight] = useState(true)
  const [pending, setPending] = useState<ButtonVariant | null>(null)

  const icons = {
    iconLeft: showLeft ? <PlaceholderIcon /> : undefined,
    iconRight: showRight ? <ArrowRightIcon /> : undefined,
  }

  const simulate = (variant: ButtonVariant) => {
    setPending(variant)
    setTimeout(() => setPending(null), 1500)
  }

  return (
    <>
      <div className="btn-controls">
        <label>
          Label
          <input value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="check">
          <input type="checkbox" checked={showLeft} onChange={(e) => setShowLeft(e.target.checked)} /> icon-l
        </label>
        <label className="check">
          <input type="checkbox" checked={showRight} onChange={(e) => setShowRight(e.target.checked)} /> icon-r
        </label>
      </div>

      <section>
        <h2>Try it — hover, press, click to load</h2>
        <div className="btn-row">
          {variants.map((v) => (
            <Button key={v.id} variant={v.id} size="md" loading={pending === v.id} onClick={() => simulate(v.id)} {...icons}>
              {label || v.label}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <h2>All variants (Figma grid)</h2>
        <div className="btn-grid-scroll">
          <table className="btn-grid">
            <thead>
              <tr>
                <th />
                {variants.map((v) => <th key={v.id} scope="col">{v.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {states.flatMap((state) =>
                sizes.map((size) => (
                  <tr key={`${state}-${size.id}`}>
                    <th scope="row">{state} · {size.label}</th>
                    {variants.map((v) => (
                      <td key={v.id}>
                        <Button
                          variant={v.id}
                          size={size.id}
                          loading={state === 'loading'}
                          disabled={state === 'disabled'}
                          fullWidth
                          {...icons}
                        >
                          {label}
                        </Button>
                      </td>
                    ))}
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
