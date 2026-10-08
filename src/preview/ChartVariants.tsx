import { Chart, Sparkline } from '../components/Chart'
import { sampleCandles, sampleSpark } from './sampleData'

const times = ['9:15', '11:15', '1:15', '3:15']

/** Candle, Line, Area and the sparkline. */
export function ChartVariants() {
  const frames = [
    { caption: 'Candle · falling', el: <Chart label="Gold 5 Dec Fut, today" data={sampleCandles('down')} timeLabels={times} /> },
    { caption: 'Line · rising', el: <Chart type="line" label="NIFTY 50, today" data={sampleCandles('up')} timeLabels={times} /> },
    { caption: 'Area · rising · no volume (P&L over time)', el: <Chart type="area" label="Portfolio value, 1 month" data={sampleCandles('up')} timeLabels={['1 Sep', '10 Sep', '20 Sep', '30 Sep']} showVolume={false} /> },
    { caption: 'Sparkline · up / down (with the price as text)', el: <span style={{ display: 'flex', gap: 'var(--l3-spacing-24)' }}><Sparkline data={sampleSpark('up')} /><Sparkline data={sampleSpark('down')} /></span> },
  ]
  return (
    <div className="bg-row">
      {frames.map((f) => <figure key={f.caption} className="bg-frame card-frame"><figcaption>{f.caption}</figcaption>{f.el}</figure>)}
    </div>
  )
}
