import { useState } from 'react'
import { Button, PlaceholderIcon } from '../components/Button'
import { ButtonGroup } from '../components/ButtonGroup'
import { BottomSheetHeader, BottomSheetSurface } from '../components/BottomSheet'
import { SearchIcon } from '../components/icons'
import { Tabs } from '../components/Tabs'
import { Tag } from '../components/Tag'

const noop = () => {}

// Figma's dashed "replace me - Place your content here" placeholder.
const Placeholder = () => <div className="sheet-placeholder">Place your content here</div>

const FigmaButtons = () => (
  <ButtonGroup aria-label="Sheet actions">
    <Button>Label</Button>
    <Button variant="secondary">Label</Button>
    <Button variant="ghost">Label</Button>
    <p className="sheet-helper">Optional Helper text</p>
  </ButtonGroup>
)

export function BottomSheetVariants() {
  const [tab, setTab] = useState('delivery')
  const tabs = (
    <Tabs aria-label="Order type" value={tab} onChange={setTab} items={[{ value: 'delivery', label: 'Delivery' }, { value: 'intraday', label: 'Intraday' }]} />
  )
  return (
    <>
      <section>
        <h2>L3: Bottom sheet header</h2>
        <div className="sheet-stack">
          <p className="grid-note">isSmall=True · Back · Info</p>
          <BottomSheetHeader heading="Heading" info onBack={noop} />
          <p className="grid-note">isSmall=True · Back · Info · Button</p>
          <BottomSheetHeader heading="Heading" info onBack={noop} trailing={<Button size="sm" variant="tertiary" iconLeft={<SearchIcon />}>Search</Button>} />
          <p className="grid-note">isSmall=True · Description · two Buttons</p>
          <BottomSheetHeader
            heading="Heading"
            info
            description="Description goes here"
            trailing={
              <span className="sheet-actions">
                <Button size="sm" variant="tertiary" iconLeft={<SearchIcon />}>Search</Button>
                <Button size="sm" variant="tertiary" iconLeft={<SearchIcon />}>Search</Button>
              </span>
            }
          />
          <p className="grid-note">isSmall=True · Tag</p>
          <BottomSheetHeader heading="Heading" onBack={noop} trailing={<Tag variant="tertiary" size="sm">LABEL</Tag>} />
          <p className="grid-note">isSmall=True · Content bottom (tabs)</p>
          <BottomSheetHeader heading="Heading" info bottom={tabs} />
          <p className="grid-note">isSmall=False · H-Icon · Header tag · Description</p>
          <BottomSheetHeader size="lg" heading="Heading" description="Description goes here" icon={<PlaceholderIcon />} tag={<Tag size="sm">LABEL</Tag>} />
        </div>
      </section>

      <section>
        <h2>L3: Bottom sheet</h2>
        <div className="bg-row">
          <figure className="bg-frame">
            <figcaption>isBottom = True</figcaption>
            <BottomSheetSurface header={<BottomSheetHeader heading="Heading" onBack={noop} />} footer={<FigmaButtons />}>
              <Placeholder />
            </BottomSheetSurface>
          </figure>
          <figure className="bg-frame">
            <figcaption>isBottom = False (top sheet)</figcaption>
            <BottomSheetSurface placement="top" header={<BottomSheetHeader heading="Heading" onBack={noop} />} footer={<FigmaButtons />}>
              <Placeholder />
            </BottomSheetSurface>
          </figure>
        </div>
      </section>
    </>
  )
}
