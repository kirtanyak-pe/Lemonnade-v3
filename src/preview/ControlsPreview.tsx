import { useState } from 'react'
import { Switch } from '../components/Switch'
import { Checkbox, Radio } from '../components/Checkbox'

const noop = () => {}

const segments = ['Equity', 'F&O', 'Commodity']

export function ControlsPreview() {
  const [picked, setPicked] = useState<string[]>(['Equity'])
  const [plan, setPlan] = useState('monthly')
  const [alerts, setAlerts] = useState(true)
  const [compact, setCompact] = useState(false)

  const all = picked.length === segments.length
  const some = picked.length > 0 && !all
  const toggle = (f: string) => setPicked((p) => (p.includes(f) ? p.filter((x) => x !== f) : [...p, f]))

  return (
    <>
      <section>
        <h2>Toggle switch (Figma grid)</h2>
        <table className="tag-grid">
          <thead>
            <tr><th /><th scope="col">On</th><th scope="col">Off</th><th scope="col">Disabled on (not in Figma)</th><th scope="col">Disabled off (not in Figma)</th></tr>
          </thead>
          <tbody>
            {(['md', 'sm'] as const).map((size) => (
              <tr key={size}>
                <th scope="row">{size === 'md' ? 'Default · 34×20' : 'isSmall · 28×16'}</th>
                <td><Switch size={size} checked onChange={noop} aria-label="On" /></td>
                <td><Switch size={size} checked={false} onChange={noop} aria-label="Off" /></td>
                <td><Switch size={size} checked disabled onChange={noop} aria-label="Disabled on" /></td>
                <td><Switch size={size} checked={false} disabled onChange={noop} aria-label="Disabled off" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Radio button &amp; check box (Figma grid)</h2>
        <table className="tag-grid">
          <thead>
            <tr><th /><th scope="col">Checkbox</th><th scope="col">Checkbox disabled</th><th scope="col">Radio</th><th scope="col">Radio disabled</th></tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">default</th>
              <td><Checkbox checked={false} onChange={noop} aria-label="Off" /></td>
              <td><Checkbox checked={false} disabled onChange={noop} aria-label="Off disabled" /></td>
              <td><Radio checked={false} onChange={noop} aria-label="Off" /></td>
              <td><Radio checked={false} disabled onChange={noop} aria-label="Off disabled" /></td>
            </tr>
            <tr>
              <th scope="row">Intermediate</th>
              <td><Checkbox indeterminate checked={false} onChange={noop} aria-label="Some" /></td>
              <td><Checkbox indeterminate checked={false} disabled onChange={noop} aria-label="Some disabled" /></td>
              <td /><td />
            </tr>
            <tr>
              <th scope="row">selected</th>
              <td><Checkbox checked onChange={noop} aria-label="On" /></td>
              <td><Checkbox checked disabled onChange={noop} aria-label="On disabled" /></td>
              <td><Radio checked onChange={noop} aria-label="On" /></td>
              <td><Radio checked disabled onChange={noop} aria-label="On disabled" /></td>
            </tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>Try it</h2>
        <div className="controls-demo">
          <fieldset>
            <legend>Segments</legend>
            <label className="control-row">
              <Checkbox
                checked={all}
                indeterminate={some}
                onChange={() => setPicked(all ? [] : [...segments])}
              />
              Select all
            </label>
            {segments.map((f) => (
              <label key={f} className="control-row indent">
                <Checkbox checked={picked.includes(f)} onChange={() => toggle(f)} />
                {f}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Plan</legend>
            {['monthly', 'yearly', 'lifetime'].map((p) => (
              <label key={p} className="control-row">
                <Radio name="plan" value={p} checked={plan === p} onChange={() => setPlan(p)} />
                {p}
              </label>
            ))}
            <label className="control-row">
              <Radio name="plan" value="enterprise" disabled />
              enterprise (disabled)
            </label>
          </fieldset>

          <fieldset>
            <legend>Settings</legend>
            <label className="control-row">
              <Switch checked={alerts} onChange={(e) => setAlerts(e.target.checked)} />
              Price alerts
            </label>
            <label className="control-row">
              <Switch size="sm" checked={compact} onChange={(e) => setCompact(e.target.checked)} />
              Compact view
            </label>
          </fieldset>
        </div>
      </section>
    </>
  )
}
