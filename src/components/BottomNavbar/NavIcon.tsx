import { MaskIcon } from '../MaskIcon'
import {
  backHome,
  fno,
  fnoOptionChain,
  fnoOptionChainSelected,
  fnoScalper,
  fnoScalperSelected,
  fnoSelected,
  market,
  marketSelected,
  mfSips,
  mfSipsSelected,
  mutualFund,
  mutualFundSelected,
  portfolio,
  portfolioSelected,
  stocks,
  stocksSelected,
} from './glyphs'
import styles from './BottomNavbar.module.css'

/**
 * Figma ".L3: base navicons" (node 4543:61823). Unselected icons are single-color with
 * content/tertiary (40%) and content/secondary (60%) parts baked in as opacity, so they're masked
 * with content/primary and stay theme-aware. Selected icons are two-tone brand illustrations
 * (raw greens + gradients in Figma, no variables) and render as-is.
 */
const icons = {
  stocks: [stocks, stocksSelected],
  market: [market, marketSelected],
  portfolio: [portfolio, portfolioSelected],
  mutualFund: [mutualFund, mutualFundSelected],
  fno: [fno, fnoSelected],
  // Figma reuses the Market / Portfolio artwork for these.
  mfFunds: [market, marketSelected],
  mfDashboard: [portfolio, portfolioSelected],
  mfSips: [mfSips, mfSipsSelected],
  fnoOptionChain: [fnoOptionChain, fnoOptionChainSelected],
  fnoPositions: [portfolio, portfolioSelected],
  fnoScalper: [fnoScalper, fnoScalperSelected],
  backHome: [backHome, backHome],
} as const

export type NavIconName = keyof typeof icons
export const navIconNames = Object.keys(icons) as NavIconName[]

export function NavIcon({ name, selected = false }: { name: NavIconName; selected?: boolean }) {
  const [off, on] = icons[name]
  if (selected && on !== off) return <img className={styles.brandIcon} src={on} alt="" aria-hidden="true" />
  return <MaskIcon src={off} className={styles.navMask} />
}
