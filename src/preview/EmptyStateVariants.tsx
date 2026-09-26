import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Icon } from '../components/Icon'
import { msDeleteForever } from '../icons/material'

const clear = <Button size="sm" variant="primary" iconLeft={<Icon icon={msDeleteForever} size={12} />} onClick={() => {}}>Clear</Button>

export function EmptyStateVariants() {
  const frames = [
    { caption: 'Figma default · illustration · heading · description · Clear CTA', state: <EmptyState headingLevel={3} title="No results found" description="Description goes here" action={clear} /> },
    { caption: 'Without CTA', state: <EmptyState headingLevel={3} title="No results found" description="Try a different name or symbol." /> },
    { caption: 'Heading only', state: <EmptyState headingLevel={3} title="No orders yet" /> },
    { caption: 'Without illustration (illustration={null})', state: <EmptyState headingLevel={3} illustration={null} title="Nothing here yet" description="Your executed orders will show up here." /> },
  ]

  return (
    <div className="bg-row">
      {frames.map((f) => (
        <figure key={f.caption} className="bg-frame">
          <figcaption>{f.caption}</figcaption>
          {f.state}
        </figure>
      ))}
    </div>
  )
}
