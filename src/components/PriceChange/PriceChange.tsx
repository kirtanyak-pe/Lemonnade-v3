import { Icon } from '../Icon'
import { msArrowDropDown, msArrowDropUp } from '../../icons/material'
import styles from './PriceChange.module.css'

export type PriceChangeSize = 'sm' | 'md' | 'lg'

export type PriceChangeProps = {
  /** The signed change. Its sign sets the direction, colour, sign and arrow — they can never disagree. */
  value: number
  /** How the absolute value is written. `percent` → "0.68%", `currency` → "₹252.89", `number` → "252.89". */
  unit?: 'percent' | 'currency' | 'number'
  /** Optional percentage shown in brackets after an absolute change: +252.89 (0.05%). */
  percent?: number
  /** Decimal places. Default 2. */
  decimals?: number
  /** Figma Size: Small (Label/12, rows) · Medium (Label/14) · Large (Label/16, next to big numbers). */
  size?: PriceChangeSize
  /** Figma 👁️ Arrow: ▲ / ▼ before the value (headline numbers like Total P&L). */
  arrow?: boolean
  className?: string
}

const iconSize = { sm: 16, md: 20, lg: 24 } as const
const fmt = (n: number, unit: PriceChangeProps['unit'], decimals: number) => {
  const s = new Intl.NumberFormat('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Math.abs(n))
  return unit === 'percent' ? `${s}%` : unit === 'currency' ? `₹${s}` : s
}

/**
 * L3 Price change (Figma L3: Price change): a signed change in the indicator colours.
 * Up: content/accent/indicator/up-default with "+"; Down: indicator/down-default with "−" (U+2212); Flat: content/secondary, no sign.
 * Screen readers hear "up" / "down" first, so the meaning never relies on colour.
 */
export function PriceChange({ value, unit = 'percent', percent, decimals = 2, size = 'sm', arrow = false, className }: PriceChangeProps) {
  const rounded = Number(value.toFixed(decimals))
  const direction = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat'
  const sign = direction === 'up' ? '+' : direction === 'down' ? '−' : ''
  const text = `${sign}${fmt(value, unit, decimals)}${percent !== undefined ? ` (${fmt(percent, 'percent', decimals)})` : ''}`
  const spoken = `${direction === 'flat' ? 'unchanged' : direction} ${fmt(value, unit, decimals)}${percent !== undefined ? `, ${fmt(percent, 'percent', decimals)}` : ''}`
  return (
    <span className={[styles.change, className].filter(Boolean).join(' ')} data-direction={direction} data-size={size}>
      {arrow && direction !== 'flat' && <Icon icon={direction === 'up' ? msArrowDropUp : msArrowDropDown} size={iconSize[size]} />}
      <span aria-hidden="true">{text}</span>
      <span className={styles.srOnly}>{spoken}</span>
    </span>
  )
}
