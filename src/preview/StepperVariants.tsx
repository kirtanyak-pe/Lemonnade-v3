import { useState } from 'react'
import { Stepper } from '../components/Stepper'

function Demo(props: { size: 'sm' | 'lg'; start: number; min?: number; max?: number; step?: number; sublabel?: (v: number) => string }) {
  const [v, setV] = useState(props.start)
  return <Stepper label="Quantity" size={props.size} value={v} onChange={setV} min={props.min} max={props.max} step={props.step} sublabel={props.sublabel?.(v)} />
}

/** Small and Large, and each button at its limit. */
export function StepperVariants() {
  const frames = [
    { caption: 'Small · order-pad row', el: <Demo size="sm" start={200} min={100} step={100} /> },
    { caption: 'Small · at the minimum (− disabled)', el: <Demo size="sm" start={100} min={100} step={100} /> },
    { caption: 'Large · with a sublabel', el: <Demo size="lg" start={10000} min={110} step={110} sublabel={(v) => `${Math.floor(v / 110)} Lots`} /> },
    { caption: 'Large · at the maximum (+ disabled)', el: <Demo size="lg" start={50} max={50} /> },
  ]
  return (
    <div className="bg-row">
      {frames.map((f) => <figure key={f.caption} className="bg-frame"><figcaption>{f.caption}</figcaption>{f.el}</figure>)}
    </div>
  )
}
