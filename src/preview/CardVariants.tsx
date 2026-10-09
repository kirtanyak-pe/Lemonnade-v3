import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { msStar } from '../icons/material'
import { Tag } from '../components/Tag'

const noop = () => {}

function Content({ title, meta }: { title: string; meta: string }) {
  return (
    <>
      <span className="card-demo-row"><span className="card-demo-meta">{meta}</span><Tag variant="secondary" color="profit" size="md">Buy</Tag></span>
      <span className="card-demo-title">{title}</span>
    </>
  )
}

/** Clickable vs static, selected, flat, and padding. */
export function CardVariants() {
  const frames = [
    { caption: 'Clickable · surface-primary · border-light · elevation-low · press 0.98', card: <Card onClick={noop}><Content title="NHPC" meta="Delivery" /></Card> },
    { caption: 'Clickable, opens a link', card: <Card href="#/card"><Content title="Tata motors" meta="Intraday" /></Card> },
    { caption: 'Selected (isSelected) · border-dark instead of border-light', card: <Card onClick={noop} selected><Content title="Gold Guinea" meta="Commodities" /></Card> },
    { caption: 'Static (no action) · surface-default · border-light', card: <Card><Content title="₹48,210 margin used" meta="Today" /></Card> },
    { caption: 'Flat, clickable · no radius, border or shadow · transparent', card: <Card variant="flat" onClick={noop}><Content title="Settings" meta="Account" /></Card> },
    { caption: 'Flat, selected · surface-secondary background', card: <Card variant="flat" onClick={noop} selected><Content title="Notifications" meta="Account" /></Card> },
    { caption: 'Flat with a background set manually (surface-secondary)', card: <Card variant="flat" surface="secondary"><Content title="₹1,20,000 available" meta="Funds" /></Card> },
    { caption: 'Clickable with an action footer — the body is the tap target, the footer holds the buttons (no fill)', card: <Card onClick={noop} footer={<Button variant="tertiary" size="sm">Set alert</Button>}><Content title="NIFTY 24900 CE" meta="Signal by Vikram" /></Card> },
    { caption: 'Action footer as a grey strip — only when it should stand out', card: <Card onClick={noop} footerFilled footer={<><Button variant="secondary" size="sm" aria-label="Save" iconLeft={<Icon icon={msStar} />} /><Button variant="secondary" size="sm">Learn in 30 secs</Button><Button size="sm">Apply</Button></>}><Content title="EMA Cross 9" meta="Built with DASH AI" /></Card> },
    { caption: 'Clickable, no padding — its sections bring the 12 (body + grey strip)', card: <Card onClick={noop} padding="none"><span className="card-demo-section"><Content title="Gold 5 Dec Fut" meta="MCX" /></span><span className="card-demo-footer">Expires in 41 days</span></Card> },
    { caption: 'Flat, no padding (edge-to-edge content)', card: <Card variant="flat" padding="none"><span className="card-demo-bleed">Full-bleed media or a list goes here</span></Card> },
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
