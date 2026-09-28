import { Card } from '../components/Card'
import { Tag } from '../components/Tag'

const noop = () => {}

function Content({ title, meta }: { title: string; meta: string }) {
  return (
    <>
      <span className="card-demo-row"><span className="card-demo-meta">{meta}</span><Tag variant="secondary" color="green" size="md">Buy</Tag></span>
      <span className="card-demo-title">{title}</span>
    </>
  )
}

/** Clickable vs static, and padding. */
export function CardVariants() {
  const frames = [
    { caption: 'Clickable (onClick) · surface/primary · border/light · elevation-low · press 0.98', card: <Card onClick={noop}><Content title="NHPC" meta="Delivery" /></Card> },
    { caption: 'Clickable link (href)', card: <Card href="#/card"><Content title="Tata motors" meta="Intraday" /></Card> },
    { caption: 'Static (no action) · surface/primary · border/light', card: <Card><Content title="₹48,210 margin used" meta="Today" /></Card> },
    { caption: 'padding="none" (edge-to-edge content)', card: <Card padding="none"><span className="card-demo-bleed">Full-bleed media or a list goes here</span></Card> },
  ]
  return (
    <div className="bg-row">
      {frames.map((f) => (
        <figure key={f.caption} className="bg-frame card-frame">
          <figcaption>{f.caption}</figcaption>
          {f.card}
        </figure>
      ))}
    </div>
  )
}
