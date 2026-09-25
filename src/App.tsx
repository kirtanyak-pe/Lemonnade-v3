// Throwaway token preview for checking tokens and theme switching — replace once real components exist.
import { useState } from 'react'
import { productLabels, products } from './tokens'
import { useTheme, type ModePreference } from './theme'
import { ColorsPreview } from './preview/ColorsPreview'
import { TypographyPreview } from './preview/TypographyPreview'
import { NumbersPreview } from './preview/NumbersPreview'
import { ButtonPreview } from './preview/ButtonPreview'
import { TagPreview } from './preview/TagPreview'
import { ControlsPreview } from './preview/ControlsPreview'
import './App.css'

const tabs = { button: 'Button', tag: 'Tag', controls: 'Toggle & checkbox', colors: 'Colors', typography: 'Typography', numbers: 'Spacing & radius' } as const
type Tab = keyof typeof tabs

function App() {
  const { product, mode, modePreference, availableModes, setProduct, setModePreference } = useTheme()
  const [tab, setTab] = useState<Tab>('controls')

  return (
    <main className="preview">
      <header className="preview-header">
        <h1>L3 tokens</h1>
        <label>
          Product
          <select value={product} onChange={(e) => setProduct(e.target.value as typeof product)}>
            {products.map((p) => <option key={p} value={p}>{productLabels[p]}</option>)}
          </select>
        </label>
        <label>
          Mode
          <select value={modePreference} onChange={(e) => setModePreference(e.target.value as ModePreference)}>
            <option value="system">System</option>
            <option value="light" disabled={!availableModes.includes('light')}>Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <code>data-product="{product}" data-mode="{mode}"</code>
      </header>

      <nav className="tabs" role="tablist">
        {(Object.keys(tabs) as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{tabs[t]}</button>
        ))}
      </nav>

      {tab === 'button' && <ButtonPreview />}
      {tab === 'tag' && <TagPreview />}
      {tab === 'controls' && <ControlsPreview />}
      {tab === 'colors' && <ColorsPreview />}
      {tab === 'typography' && <TypographyPreview />}
      {tab === 'numbers' && <NumbersPreview />}
    </main>
  )
}

export default App
