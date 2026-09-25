// Throwaway token preview for checking theme switching — replace once real components exist.
import { productLabels, products, themeTokenVars, type ThemeToken } from './tokens'
import { useTheme, type ModePreference } from './theme'
import './App.css'

const groups: { title: string; prefix: string }[] = [
  { title: 'Surface', prefix: 'surface/' },
  { title: 'Content', prefix: 'content/' },
  { title: 'Border', prefix: 'border/' },
  { title: 'Button', prefix: 'component/button/' },
]

const tokenNames = Object.keys(themeTokenVars) as ThemeToken[]

function App() {
  const { product, mode, modePreference, availableModes, setProduct, setModePreference } = useTheme()

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

      {groups.map(({ title, prefix }) => (
        <section key={title}>
          <h2>{title}</h2>
          <ul className="swatches">
            {tokenNames.filter((n) => n.startsWith(prefix)).map((name) => (
              <li key={name}>
                <span className="chip" style={{ background: `var(${themeTokenVars[name]})` }} />
                <span className="name">{name.slice(prefix.length)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}

export default App
