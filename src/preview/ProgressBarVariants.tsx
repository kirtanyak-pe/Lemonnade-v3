import { ProgressBar } from '../components/ProgressBar'

const row = { display: 'flex', justifyContent: 'space-between', font: 'var(--l3-text-label-12)', color: 'var(--l3-content-secondary)', marginBottom: 'var(--l3-spacing-08)' } as const

/** Progress and Range, sizes and statuses. */
export function ProgressBarVariants() {
  const frames = [
    { caption: 'Progress · Small · Default', label: 'Funds used', value: '₹3,42,000 of ₹5,00,000', el: <ProgressBar label="Funds used" value={68} valueText="₹3,42,000 of ₹5,00,000" /> },
    { caption: 'Progress · Small · Warning (near the limit)', label: 'Margin used', value: '92%', el: <ProgressBar label="Margin used" value={92} status="warning" /> },
    { caption: 'Progress · Medium · Success', label: 'KYC steps', value: '3 of 4', el: <ProgressBar label="KYC steps" value={75} size="md" status="success" valueText="3 of 4 steps" /> },
    { caption: 'Range · Small · 24H low/high', label: '24H Low ₹1,57,000', value: '₹1,60,000 High', el: <ProgressBar type="range" label="Last traded price in today's range" value={67} valueText="₹1,59,000, between ₹1,57,000 and ₹1,60,000" /> },
  ]
  return (
    <div className="bg-row">
      {frames.map((f) => (
        <figure key={f.caption} className="bg-frame card-frame">
          <figcaption>{f.caption}</figcaption>
          <span style={{ width: '100%' }}><span style={row} aria-hidden><span>{f.label}</span><strong style={{ color: 'var(--l3-content-primary)' }}>{f.value}</strong></span>{f.el}</span>
        </figure>
      ))}
    </div>
  )
}
