import { Switch } from '../components/Switch'

const noop = () => {}

export function SwitchVariants() {
  return (
    <div className="btn-grid-scroll">
      <table className="tag-grid">
        <thead>
          <tr>
            <th />
            <th scope="col">On</th>
            <th scope="col">Off</th>
            <th scope="col">Disabled on*</th>
            <th scope="col">Disabled off*</th>
          </tr>
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
      <p className="grid-note">* Not drawn in Figma — only State=Enabled exists.</p>
    </div>
  )
}
