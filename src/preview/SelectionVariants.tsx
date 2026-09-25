import { Checkbox, Radio } from '../components/Checkbox'

const noop = () => {}

export function SelectionVariants() {
  return (
    <div className="btn-grid-scroll">
      <table className="tag-grid">
        <thead>
          <tr>
            <th />
            <th scope="col">Checkbox</th>
            <th scope="col">Checkbox disabled</th>
            <th scope="col">Radio</th>
            <th scope="col">Radio disabled</th>
          </tr>
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
            <td />
            <td />
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
    </div>
  )
}
