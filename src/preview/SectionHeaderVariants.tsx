import { SectionHeader } from '../components/SectionHeader'
import { Tag } from '../components/Tag'

const noop = () => {}

/** CTA None / View all / Switcher; tag + info; a long description (cut after two lines). */
export function SectionHeaderVariants() {
  const frames = [
    { caption: 'CTA = None · heading only', el: <SectionHeader title="Buy" /> },
    { caption: 'CTA = None · with description', el: <SectionHeader title="Contract info" description="Gold 5 Dec Fut · expires 05 Dec" /> },
    { caption: 'CTA = View all · tag + info', el: <SectionHeader title="Open positions" description="3 positions · updated 10:42 AM" tag={<Tag variant="primary" color="neutral" size="sm">New</Tag>} onInfo={noop} action={{ type: 'view-all', onClick: noop }} /> },
    { caption: 'CTA = Switcher · description cut after two lines', el: <SectionHeader title="Returns" description="Realised and unrealised returns across all your positions this week, including charges and taxes" onInfo={noop} action={{ type: 'switcher', label: 'Day P&L', onClick: noop }} /> },
  ]
  return (
    <div className="bg-row">
      {frames.map((f) => <figure key={f.caption} className="bg-frame card-frame"><figcaption>{f.caption}</figcaption>{f.el}</figure>)}
    </div>
  )
}
