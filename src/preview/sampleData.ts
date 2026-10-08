import type { ChartCandle, Trend } from '../components/Chart'

/** Deterministic sample prices for docs and previews (same series every render). */
export function sampleCandles(trend: Trend = 'up', count = 40, start = 157000): ChartCandle[] {
  let seed = trend === 'up' ? 7 : 11
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  const out: ChartCandle[] = []
  let p = start
  for (let i = 0; i < count; i++) {
    const open = p
    const close = open + (trend === 'up' ? 60 : -60) + (rnd() - 0.5) * 420
    const high = Math.max(open, close) + rnd() * 160
    const low = Math.min(open, close) - rnd() * 160
    out.push({ open, high, low, close, volume: 200 + rnd() * 800 })
    p = close
  }
  return out
}

export const sampleSpark = (trend: Trend = 'up') => sampleCandles(trend, 20).map((c) => c.close)
