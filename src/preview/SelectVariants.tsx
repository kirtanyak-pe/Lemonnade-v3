import { Select } from '../components/Select'

const noop = () => {}

/** Sizes, subtle, and the two icons. */
export function SelectVariants() {
  const frames = [
    { caption: 'Small · ↕ · form row', el: <Select onClick={noop}>Quantity</Select> },
    { caption: 'Small · subtle', el: <Select onClick={noop} subtle>Commodity</Select> },
    { caption: 'Medium · subtle · chevron · filter', el: <Select onClick={noop} size="md" subtle icon="chevron">Deposit &amp; Credits</Select> },
    { caption: 'Large · ↕ · asset switcher', el: <Select onClick={noop} size="lg">Gold</Select> },
  ]
  return (
    <div className="bg-row">
      {frames.map((f) => <figure key={f.caption} className="bg-frame"><figcaption>{f.caption}</figcaption>{f.el}</figure>)}
    </div>
  )
}
