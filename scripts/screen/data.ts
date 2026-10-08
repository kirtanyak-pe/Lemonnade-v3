// Realistic, deterministic Indian-market sample data + formatters for generated screens (code AND Figma).
// Same input → same output, so screenshots, reviews and tests are stable. Formatting follows docs/DESIGN_LANGUAGE.md §3.

export const inr = (n: number, decimals = 2) => `${n < 0 ? '−' : ''}₹${new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Math.abs(n))}`
export const num = (n: number, decimals = 0) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n)
export const pct = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}%`
/** Tight spaces: ₹12.4L · ₹3.2Cr (lakh / crore). */
export const short = (n: number) => (Math.abs(n) >= 1e7 ? `₹${(n / 1e7).toFixed(1)}Cr` : Math.abs(n) >= 1e5 ? `₹${(n / 1e5).toFixed(1)}L` : inr(n, 0))

export type Instrument = { symbol: string; name: string; exchange: string; price: number; change: number; spark: 'up' | 'down'; qty?: number; avg?: number }

const BASE: [string, string, string, number][] = [
  ['NIFTY 50', 'Nifty 50 index', 'NSE', 25312.4], ['SENSEX', 'BSE Sensex', 'BSE', 82890.95], ['BANKNIFTY', 'Nifty Bank', 'NSE', 55420.1],
  ['RELIANCE', 'Reliance Industries', 'NSE', 2938.55], ['HDFCBANK', 'HDFC Bank', 'NSE', 1712.3], ['TCS', 'Tata Consultancy Services', 'NSE', 4120.75],
  ['INFY', 'Infosys', 'NSE', 1856.2], ['ICICIBANK', 'ICICI Bank', 'NSE', 1288.45], ['GOLD MINI', 'Gold Mini · 5 Dec Fut', 'MCX', 157500], ['SILVER', 'Silver · 5 Dec Fut', 'MCX', 188420],
  ['CRUDEOIL', 'Crude Oil · 19 Nov Fut', 'MCX', 6012], ['ITC', 'ITC', 'NSE', 468.9], ['SBIN', 'State Bank of India', 'NSE', 812.65], ['TATAMOTORS', 'Tata Motors', 'NSE', 941.1],
]
const seeded = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }

/** `count` instruments starting at `offset`, with stable changes (mixed up/down). */
export function instruments(count = 6, offset = 0, seed = 11): Instrument[] {
  const r = seeded(seed)
  return Array.from({ length: count }, (_, i) => {
    const [symbol, name, exchange, price] = BASE[(offset + i) % BASE.length]
    const change = Number(((r() - 0.42) * 4).toFixed(2))
    return { symbol, name, exchange, price, change, spark: change >= 0 ? 'up' : 'down', qty: Math.round(1 + r() * 40) * 5, avg: Number((price * (1 - change / 100 - (r() - 0.5) * 0.04)).toFixed(2)) }
  })
}

/** Holdings-style P&L for a list of instruments. */
export const pnl = (i: Instrument) => Number((((i.price - (i.avg ?? i.price)) * (i.qty ?? 1))).toFixed(2))

/** Named data sources a screen spec can reference: "data:watchlist:6", "data:holdings:4", "data:indices:3". */
export function source(ref: string): Instrument[] {
  const [, kind, n] = ref.split(':')
  const count = Number(n) || 5
  if (kind === 'indices') return instruments(count, 0, 5)
  if (kind === 'commodities') return instruments(count, 8, 9)
  if (kind === 'holdings') return instruments(count, 3, 21)
  return instruments(count, 3, 11)
}
