import { useState } from 'react'
import { Tab, Tabs } from '../components/Tabs'
import { PlaceholderIcon } from '../components/Button'

const labels = ['Holdings', 'Positions', 'Orders', 'Baskets', 'SIPs']
const baseItems = labels.map((l) => ({ value: l.toLowerCase(), label: l }))
const noop = () => {}

export function TabsVariants() {
  const [underline, setUnderline] = useState('holdings')
  const [pill, setPill] = useState('holdings')
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)
  const icons = {
    iconLeft: showLeft ? <PlaceholderIcon /> : undefined,
    iconRight: showRight ? <PlaceholderIcon /> : undefined,
  }
  const items = baseItems.map((item) => ({ ...item, ...icons }))

  return (
    <>
      <div className="btn-controls">
        <label className="check">
          <input type="checkbox" checked={showLeft} onChange={(e) => setShowLeft(e.target.checked)} /> Icon - l
        </label>
        <label className="check">
          <input type="checkbox" checked={showRight} onChange={(e) => setShowRight(e.target.checked)} /> Icon - r
        </label>
      </div>

      <section>
        <h2>L3: Tabs</h2>
        <p className="grid-note">isPill=False</p>
        <Tabs aria-label="Underline tabs" items={items} value={underline} onChange={setUnderline} />
        <p className="grid-note">isPill=True</p>
        <Tabs aria-label="Pill tabs" appearance="pill" items={items} value={pill} onChange={setPill} />
      </section>

      <section>
        <h2>L3: base tab (all 12 variants)</h2>
        <div className="btn-grid-scroll">
          <table className="tag-grid">
            <thead>
              <tr><th /><th scope="col">Selected</th><th scope="col">Unselected</th><th scope="col">Selected · isPrimary=False</th></tr>
            </thead>
            <tbody>
              {(['md', 'sm'] as const).map((size) => (
                <tr key={`u-${size}`}>
                  <th scope="row">Underline · {size === 'md' ? '40' : 'isSmall 36'}</th>
                  <td><div role="tablist" aria-label="demo"><Tab size={size} selected {...icons} onClick={noop}>Label</Tab></div></td>
                  <td><div role="tablist" aria-label="demo"><Tab size={size} {...icons} onClick={noop}>Label</Tab></div></td>
                  <td className="grid-note">— (underline is always primary)</td>
                </tr>
              ))}
              {(['md', 'sm'] as const).map((size) => (
                <tr key={`p-${size}`}>
                  <th scope="row">Pill · {size === 'md' ? '32' : 'isSmall 24'}</th>
                  <td><div role="tablist" aria-label="demo"><Tab appearance="pill" size={size} selected {...icons} onClick={noop}>Label</Tab></div></td>
                  <td><div role="tablist" aria-label="demo"><Tab appearance="pill" size={size} {...icons} onClick={noop}>Label</Tab></div></td>
                  <td><div role="tablist" aria-label="demo"><Tab appearance="pill" emphasis="secondary" size={size} selected {...icons} onClick={noop}>Label</Tab></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="grid-note">Unselected pills look the same for isPrimary True and False, so they're one cell here.</p>
      </section>
    </>
  )
}
