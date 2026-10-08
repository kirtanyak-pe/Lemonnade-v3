import { useState } from 'react'
import { DatePicker, type DateRange } from '../components/DatePicker'

const today = new Date()
const daysAgo = (n: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - n)

function Single() {
  const [v, setV] = useState<Date | null>(daysAgo(3))
  return <DatePicker label="Statement date" value={v} onChange={setV} max={today} />
}

function Range() {
  const [v, setV] = useState<DateRange>({ start: daysAgo(8), end: today })
  return <DatePicker mode="range" label="Report period" value={v} onChange={setV} max={today} />
}

/** Single and Range; days after today are disabled (reports). */
export function DatePickerVariants() {
  return (
    <div className="bg-row">
      <figure className="bg-frame card-frame"><figcaption>Single · one day · future days disabled</figcaption><Single /></figure>
      <figure className="bg-frame card-frame"><figcaption>Range · start → end with a band between</figcaption><Range /></figure>
    </div>
  )
}
