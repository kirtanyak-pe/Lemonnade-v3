import { useState } from 'react'
import { Actionbar, ActionbarAction } from '../components/Actionbar'
import { Tabs } from '../components/Tabs'
import { msBlurOn, msSearch } from '../icons/material'

const noop = () => {}

export function ActionbarVariants() {
  const [typed, setTyped] = useState('Sear')
  const [empty, setEmpty] = useState('')
  const [tab, setTab] = useState('one')

  const frames = [
    { caption: 'Figma default · back · heading · content right', bar: <Actionbar headingLevel={2} title="Heading" onBack={noop} actions={<ActionbarAction icon={msBlurOn} label="Action" onClick={noop} />} /> },
    { caption: 'Base content Type=Content · description', bar: <Actionbar headingLevel={2} title="Heading" description="Description" onBack={noop} actions={<ActionbarAction icon={msBlurOn} label="Action" onClick={noop} />} /> },
    { caption: 'Base content Type=Search (placeholder)', bar: <Actionbar onBack={noop} search={{ value: empty, onChange: setEmpty, placeholder: 'Search for a company' }} /> },
    { caption: 'Base content Type=Searched (typed)', bar: <Actionbar onBack={noop} search={{ value: typed, onChange: setTyped, placeholder: 'Search for a company' }} /> },
    { caption: 'No back · two actions', bar: <Actionbar headingLevel={2} title="Watchlist" actions={<><ActionbarAction icon={msSearch} label="Search" onClick={noop} /><ActionbarAction icon={msBlurOn} label="More" onClick={noop} /></>} /> },
    {
      caption: '↓ Content bottom (Tabs)',
      bar: (
        <Actionbar
          headingLevel={2}
          title="Heading"
          onBack={noop}
          bottom={<Tabs aria-label="Sections" items={[{ value: 'one', label: 'Overview' }, { value: 'two', label: 'Financials' }, { value: 'three', label: 'News' }]} value={tab} onChange={setTab} />}
        />
      ),
    },
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
