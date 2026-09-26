import { MaskIcon } from '../MaskIcon'
import styles from './BottomNavbar.module.css'
import backHome from './assets/back-home.svg'
import fno from './assets/fno.svg'
import fnoSelected from './assets/fno-selected.svg'
import fnoOptionChain from './assets/fno-option-chain.svg'
import fnoOptionChainSelected from './assets/fno-option-chain-selected.svg'
import fnoScalper from './assets/fno-scalper.svg'
import fnoScalperSelected from './assets/fno-scalper-selected.svg'
import market from './assets/market.svg'
import marketSelected from './assets/market-selected.svg'
import mfSips from './assets/mf-sips.svg'
import mfSipsSelected from './assets/mf-sips-selected.svg'
import mutualFund from './assets/mutual-fund.svg'
import mutualFundSelected from './assets/mutual-fund-selected.svg'
import portfolio from './assets/portfolio.svg'
import portfolioSelected from './assets/portfolio-selected.svg'
import stocks from './assets/stocks.svg'
import stocksSelected from './assets/stocks-selected.svg'

/**
 * Figma ".L3: base navicons" (node 4543:61823). Unselected icons are single-colour with
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
