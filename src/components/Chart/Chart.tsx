import { useId } from 'react'
import styles from './Chart.module.css'
import { trendOf, type Trend } from './trend'

export type ChartCandle = { open: number; high: number; low: number; close: number; volume?: number }
export type ChartType = 'candle' | 'line' | 'area'

export type ChartProps = {
  /** Oldest first. Line and Area plot `close`. */
  data: ChartCandle[]
  /** Figma Type. */
  type?: ChartType
  /** Figma Trend: line colour. Defaults to the direction from the first to the last close. */
  trend?: Trend
  /** Time labels spread along the x axis, e.g. ['9:15', '11:15', '1:15', '3:15']. */
  timeLabels?: string[]
  /** Figma 👁️ toggles. */
  showVolume?: boolean
  showGrid?: boolean
  showAxes?: boolean
  showLastPrice?: boolean
  /** Price formatting for the axis and the last-price tag. */
  format?: (value: number) => string
  /** What the chart shows, e.g. "Gold 5 Dec Fut, today". Screen readers get it with the trend and the range. */
  label: string
  className?: string
}

const W = 360, H = 200, PW = 304, PH = 168, AXIS = 56, TOP = 12, VOL = 24
const indian = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 })

/**
 * L3 Chart (Figma L3: Chart): price chart — Candle (trading views), Line (simple history), Area (portfolio / P&L over time).
 * 360×200 viewBox: a 304-wide plot with a 56px price axis on the right and time labels below. Scales to its container width.
 */
export function Chart({ data, type = 'candle', trend, timeLabels = [], showVolume = true, showGrid = true, showAxes = true, showLastPrice = true, format = (v) => indian.format(v), label, className }: ChartProps) {
  const gid = useId()
  const closes = data.map((d) => d.close)
  const t = trend ?? trendOf(closes)
  const hi = Math.max(...data.map((d) => d.high)), lo = Math.min(...data.map((d) => d.low))
  const bottom = PH - (showVolume ? VOL + 4 : 4)
  const y = (v: number) => TOP + ((hi - v) / (hi - lo || 1)) * (bottom - TOP)
  const step = PW / data.length
  const x = (i: number) => i * step + step / 2
  const maxVol = Math.max(1, ...data.map((d) => d.volume ?? 0))
  const ticks = Array.from({ length: 5 }, (_, k) => hi - (k * (hi - lo)) / 4)
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.close).toFixed(1)}`).join(' ')
  const last = data[data.length - 1]
  const summary = `${label}: ${t === 'up' ? 'up' : 'down'} from ${format(closes[0])} to ${format(last.close)}, range ${format(lo)} to ${format(hi)}`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={summary} className={[styles.chart, className].filter(Boolean).join(' ')} data-trend={t}>
      {showGrid && (
        <g className={styles.grid}>
          {ticks.map((v) => <line key={v} x1={0} x2={PW} y1={y(v)} y2={y(v)} />)}
        </g>
      )}
      {showAxes && (
        <g className={styles.axis}>
          {ticks.map((v) => <text key={v} x={PW + 8} y={y(v)} dominantBaseline="middle">{format(Math.round(v))}</text>)}
          {timeLabels.map((s, k) => <text key={s + k} x={(k + 0.5) * (PW / timeLabels.length)} y={PH + 18} textAnchor="middle">{s}</text>)}
        </g>
      )}
      {showVolume && (
        <g>
          {data.map((d, i) => {
            const h = Math.max(2, ((d.volume ?? 0) / maxVol) * (VOL - 4))
            return <rect key={i} className={d.close >= d.open ? styles.volUp : styles.volDown} x={x(i) - Math.max(1, step - 3) / 2} y={PH - h} width={Math.max(1, step - 3)} height={h} />
          })}
        </g>
      )}
      {type === 'candle' ? (
        <g>
          {data.map((d, i) => {
            const up = d.close >= d.open
            const bw = Math.max(1, step - 3)
            const top = y(Math.max(d.open, d.close))
            return (
              <g key={i} className={up ? styles.up : styles.down}>
                <rect x={x(i) - 0.5} y={y(d.high)} width={1} height={Math.max(1, y(d.low) - y(d.high))} />
                <rect x={x(i) - bw / 2} y={top} width={bw} height={Math.max(1, y(Math.min(d.open, d.close)) - top)} />
              </g>
            )
          })}
        </g>
      ) : (
        <g>
          {type === 'area' && (
            <>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" className={styles.areaTop} />
                  <stop offset="1" className={styles.areaEnd} />
                </linearGradient>
              </defs>
              <path d={`${path} L${x(data.length - 1)} ${bottom} L${x(0)} ${bottom} Z`} fill={`url(#${CSS.escape(gid)})`} />
            </>
          )}
          <path d={path} className={styles.line} />
        </g>
      )}
      {showLastPrice && (
        <g className={styles.last}>
          <line x1={x(data.length - 1)} x2={PW} y1={y(last.close)} y2={y(last.close)} />
          <rect x={PW + 2} y={y(last.close) - 8} width={AXIS - 4} height={16} rx={4} />
          <text x={PW + 2 + (AXIS - 4) / 2} y={y(last.close)} dominantBaseline="middle" textAnchor="middle">{format(last.close)}</text>
        </g>
      )}
    </svg>
  )
}

export type SparklineProps = {
  /** Oldest first. */
  data: number[]
  /** Figma Trend. Defaults to the direction from the first to the last value. */
  trend?: Trend
  /** Leave out when the price and change are shown next to it (it's decorative then). */
  label?: string
  className?: string
}

/** L3 Sparkline (Figma L3: Sparkline): a 64×24 trend line for list rows and cards. Pair it with the price and % change. */
export function Sparkline({ data, trend, label, className }: SparklineProps) {
  const t = trend ?? trendOf(data)
  const hi = Math.max(...data), lo = Math.min(...data)
  const d = data.map((v, i) => `${i ? 'L' : 'M'}${(1 + (i * 62) / Math.max(1, data.length - 1)).toFixed(1)} ${(2 + ((hi - v) / (hi - lo || 1)) * 20).toFixed(1)}`).join(' ')
  return (
    <svg viewBox="0 0 64 24" className={[styles.sparkline, className].filter(Boolean).join(' ')} data-trend={t} {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}>
      <path d={d} className={styles.line} />
    </svg>
  )
}
