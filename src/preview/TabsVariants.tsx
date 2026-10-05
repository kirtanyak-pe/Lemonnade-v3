import { useState } from 'react'
import { Tab, Tabs } from '../components/Tabs'
import { PlaceholderIcon } from '../components/Button'

const labels = ['Holdings', 'Positions', 'Orders', 'Baskets', 'SIPs']
const baseItems = labels.map((l) => ({ value: l.toLowerCase(), label: l }))
const noop = () => {}

export function TabsVariants() {
  const [underline, setUnderline] = useState('holdings')
  const [pill, setPill] = useState('holdings')
  const [group, setGroup] = useState('holdings')
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const [showLabel, setShowLabel] = useState(true)
  const [showSub, setShowSub] = useState(false)
  const hideLabel = !showLabel
  const icons = {
    // Icon-only needs an icon: with the label off, the left icon is always on.
    iconLeft: showLeft || hideLabel ? <PlaceholderIcon /> : undefined,
    iconRight: showRight ? <PlaceholderIcon /> : undefined,
    hideLabel,
  }
  const sub = showSub ? 'Sub label' : undefined
  const items = baseItems.map((item) => ({ ...item, ...icons }))
  const pillItems = items.map((item) => ({ ...item, subLabel: sub }))

  return (
    <>
      <div className="btn-controls">
        <label className="check">
          <input type="checkbox" checked={showLabel} onChange={(e) => setShowLabel(e.target.checked)} /> 👁️ Label
        </label>
        <label className="check">
          <input type="checkbox" checked={showSub} onChange={(e) => setShowSub(e.target.checked)} /> 👁️ Sub label (pills)
        </label>
        <label className="check">
          <input type="checkbox" checked={showLeft} onChange={(e) => setShowLeft(e.target.checked)} /> Icon - l
        </label>
        <label className="check">
          <input type="checkbox" checked={showRight} onChange={(e) => setShowRight(e.target.checked)} /> Icon - r
        </label>
      </div>

      <section>
        <h2>L3: Tabs</h2>
        <p className="grid-note">Type=Flat tabs</p>
        <Tabs aria-label="Underline tabs" items={items} value={underline} onChange={setUnderline} />
        <p className="grid-note">Type=Pill tabs (primary)</p>
        <Tabs aria-label="Pill tabs" appearance="pill" items={pillItems} value={pill} onChange={setPill} />
        <p className="grid-note">Type=Pill group (2–4 options, always tertiary)</p>
        <Tabs aria-label="Pill group" appearance="pill-group" items={pillItems.slice(0, 3)} value={group} onChange={setGroup} />
      </section>

      <section>
        <h2>L3: base tab (all 16 variants)</h2>
        <div className="btn-grid-scroll">
          <table className="tag-grid">
            <thead>
              <tr><th /><th scope="col">Selected</th><th scope="col">Unselected</th></tr>
            </thead>
            <tbody>
              {(['md', 'sm'] as const).map((size) => (
                <tr key={`u-${size}`}>
                  <th scope="row">Underline · {size === 'md' ? '40' : 'isSmall 36'}</th>
                  <td><div role="tablist" aria-label={`Underline ${size} selected`}><Tab size={size} selected {...icons} onClick={noop}>Label</Tab></div></td>
                  <td><div role="tablist" aria-label={`Underline ${size} unselected`}><Tab size={size} {...icons} onClick={noop}>Label</Tab></div></td>
                </tr>
              ))}
              {(['primary', 'secondary', 'tertiary'] as const).flatMap((emphasis) => (['md', 'sm'] as const).map((size) => (
                <tr key={`p-${emphasis}-${size}`}>
                  <th scope="row">Chip · {emphasis} · {size === 'md' ? '32' : 'isSmall 24'}</th>
                  <td><div role="tablist" aria-label={`Chip ${emphasis} ${size} selected`}><Tab appearance="pill" emphasis={emphasis} size={size} selected {...icons} subLabel={sub} onClick={noop}>Label</Tab></div></td>
                  <td><div role="tablist" aria-label={`Chip ${emphasis} ${size} unselected`}><Tab appearance="pill" emphasis={emphasis} size={size} {...icons} subLabel={sub} onClick={noop}>Label</Tab></div></td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        <p className="grid-note">Figma Type is the style of a whole chip row — never mix styles in one row. Primary and secondary look the same when unselected. Sub label is for chips only; with the label off a tab shows one icon.</p>
      </section>
    </>
  )
}
