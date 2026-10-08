import { PriceChange } from '../components/PriceChange'

/** Direction comes from the value; sizes; arrow; absolute + percent. */
export function PriceChangeVariants() {
  const frames = [
    { caption: 'Up · Small · in a row', el: <PriceChange value={0.68} /> },
    { caption: 'Down · Small · absolute + percent', el: <PriceChange value={-252.89} unit="number" percent={0.05} /> },
    { caption: 'Up · Large · arrow (Total P&L)', el: <PriceChange value={12.4} size="lg" arrow decimals={1} /> },
    { caption: 'Down · Medium · currency · arrow', el: <PriceChange value={-1240.5} unit="currency" size="md" arrow /> },
    { caption: 'Flat · no sign, secondary', el: <PriceChange value={0} /> },
  ]
  return (
    <div className="bg-row">
      {frames.map((f) => <figure key={f.caption} className="bg-frame"><figcaption>{f.caption}</figcaption>{f.el}</figure>)}
    </div>
  )
}
