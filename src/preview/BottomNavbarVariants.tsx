import { BottomNavbar, NavIcon, type BottomNavbarItem, type NavIconName } from '../components/BottomNavbar'

const item = (value: string, label: string, icon: NavIconName): BottomNavbarItem => ({
  value,
  label,
  icon: <NavIcon name={icon} />,
  selectedIcon: <NavIcon name={icon} selected />,
})

export const mainNavItems = [
  item('stocks', 'Stocks', 'stocks'),
  item('market', 'Market', 'market'),
  item('portfolio', 'Portfolio', 'portfolio'),
  item('mf', 'Mutual Fund', 'mutualFund'),
  item('fno', 'F&O', 'fno'),
]

export const mfNavItems = [
  item('mf', 'Mutual Fund', 'mutualFund'),
  item('funds', 'Funds', 'mfFunds'),
  item('dashboard', 'Dashboard', 'mfDashboard'),
  item('sips', 'SIPs', 'mfSips'),
]

export const fnoNavItems = [
  item('fno', 'F&O', 'fno'),
  item('chain', 'Option Chain', 'fnoOptionChain'),
  item('positions', 'Positions', 'fnoPositions'),
  item('scalper', 'Scalper', 'fnoScalper'),
]

const noop = () => {}

/** All 11 Figma "Tab" variants of L3: Bottom Navbar. */
export function BottomNavbarVariants() {
  const frames = [
    ...['stocks', 'market', 'portfolio'].map((v) => ({ caption: `Tab=${mainNavItems.find((i) => i.value === v)!.label}`, bar: <BottomNavbar aria-label="Main" items={mainNavItems} value={v} /> })),
    ...['mf', 'funds', 'dashboard', 'sips'].map((v) => ({ caption: `Tab=MF${v === 'mf' ? '' : ` - ${mfNavItems.find((i) => i.value === v)!.label}`}`, bar: <BottomNavbar aria-label="Mutual funds" items={mfNavItems} value={v} home={{ onClick: noop }} /> })),
    ...['fno', 'chain', 'positions', 'scalper'].map((v) => ({ caption: `Tab=F&O${v === 'fno' ? '' : ` - ${fnoNavItems.find((i) => i.value === v)!.label}`}`, bar: <BottomNavbar aria-label="F&O" items={fnoNavItems} value={v} home={{ onClick: noop }} /> })),
  ]

  return (
    <div className="bg-row">
      {frames.map((f) => (
        <figure key={f.caption} className="bg-frame">
          <figcaption>{f.caption}</figcaption>
          {f.bar}
        </figure>
      ))}
    </div>
  )
}
