import { SegmentedControl } from '../components/SegmentedControl'
import { Icon } from '../components/Icon'
import { msAccountTree, msViewList, msGridView } from '../icons/material'

const noop = () => {}
const two = [{ value: 'tree', label: 'Tree' }, { value: 'list', label: 'List' }]
const three = [...two, { value: 'grid', label: 'Grid' }]
const icons = [
  { value: 'tree', label: 'Tree view', hideLabel: true, iconLeft: <Icon icon={msAccountTree} size={16} /> },
  { value: 'list', label: 'List view', hideLabel: true, iconLeft: <Icon icon={msViewList} size={16} /> },
  { value: 'grid', label: 'Grid view', hideLabel: true, iconLeft: <Icon icon={msGridView} size={16} /> },
]

export function SegmentedVariants() {
  return (
    <div className="btn-grid-scroll">
      <table className="tag-grid">
        <thead>
          <tr>
            <th />
            <th scope="col">2 options</th>
            <th scope="col">3 options</th>
            <th scope="col">Icon only</th>
          </tr>
        </thead>
        <tbody>
          {(['md', 'sm'] as const).map((size) => (
            <tr key={size}>
              <th scope="row">{size === 'md' ? 'Default · 32' : 'isSmall · 24'}</th>
              <td><SegmentedControl aria-label={`${size} two`} size={size} items={two} value="tree" onChange={noop} /></td>
              <td><SegmentedControl aria-label={`${size} three`} size={size} items={three} value="list" onChange={noop} /></td>
              <td><SegmentedControl aria-label={`${size} icons`} size={size} items={icons} value="tree" onChange={noop} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="grid-note">Selected: surface/inverted (black fill) · unselected: no fill, on a surface/primary track.</p>
    </div>
  )
}
