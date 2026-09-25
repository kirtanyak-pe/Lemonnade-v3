import { useState } from 'react'
import { PlaceholderIcon } from '../components/Button'
import { ChevronDownIcon } from '../components/icons'
import { ListCell } from '../components/ListCell'

// Same 2×2 grid as the Figma frame: plain / card × default / isSmall.
const cells = [
  { title: 'isPlain=True', variant: 'plain', size: 'md' },
  { title: 'isPlain=True · isSmall', variant: 'plain', size: 'sm' },
  { title: 'isPlain=False', variant: 'card', size: 'md' },
  { title: 'isPlain=False · isSmall', variant: 'card', size: 'sm' },
] as const

export function ListCellVariants() {
  const [show, setShow] = useState({ iconLeft: true, iconRight: true, description: true, dotLeft: false, dotRight: false })
  const toggle = (k: keyof typeof show) => setShow((s) => ({ ...s, [k]: !s[k] }))

  return (
    <>
      <div className="btn-controls">
        {(Object.keys(show) as (keyof typeof show)[]).map((k) => (
          <label key={k} className="check">
            <input type="checkbox" checked={show[k]} onChange={() => toggle(k)} /> {k}
          </label>
        ))}
      </div>
      <div className="cell-grid">
        {cells.map((c) => (
          <figure key={c.title} className="cell-frame">
            <figcaption>{c.title}</figcaption>
            <ListCell
              variant={c.variant}
              size={c.size}
              label="Label goes here"
              description={show.description ? 'Type description' : undefined}
              iconLeft={show.iconLeft ? <PlaceholderIcon /> : undefined}
              iconRight={show.iconRight ? <ChevronDownIcon /> : undefined}
              dotLeft={show.dotLeft}
              dotRight={show.dotRight}
            />
          </figure>
        ))}
      </div>
    </>
  )
}
