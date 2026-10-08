import { useState, type CSSProperties } from 'react'
import { ListCell } from '../../components/ListCell'
import styles from './LayeringPage.module.css'

// Layering foundation page: how L3 surfaces stack, bottom → top, taken from the components (surfaces, effect styles,
// sticky / fixed positioning). Shown as an exploded 3D stack drawn with the real tokens, plus the rules.

type Layer = { id: string; n: number; name: string; what: string; surface: string; shadow: string; note: string }

const layers: Layer[] = [
  { id: 'screen', n: 0, name: 'Screen', what: 'The page background', surface: 'surface/default', shadow: 'none', note: 'Everything starts here. The 16 page margin is measured from its edges.' },
  { id: 'inset', n: 1, name: 'Inset', what: 'Filled cards — grey panels of details', surface: 'surface/secondary', shadow: 'none', note: 'Sits into the layer it is on, not above it: no border, no shadow. Never grey on grey.' },
  { id: 'content', n: 2, name: 'Content', what: 'Static cards, list rows, text, charts', surface: 'surface/default + border/light', shadow: 'none', note: 'Information only. The border separates it — it is not lifted.' },
  { id: 'raised', n: 3, name: 'Raised', what: 'Clickable cards, chip tabs, text fields', surface: 'surface/primary + border/light', shadow: 'elevation-low', note: 'Lifted because it can be tapped. Pressing it sinks it back (scale 0.98).' },
  { id: 'bars', n: 4, name: 'Bars', what: 'Action bar (top), bottom navbar, button dock', surface: 'surface/default · surface/primary', shadow: 'elevation-low · medium · high', note: 'Stay put while content scrolls under them. The action bar gets elevation-low only once something scrolls under it.' },
  { id: 'toast', n: 5, name: 'Floating', what: 'Toast (floating Aerobar)', surface: 'surface/inverted', shadow: 'elevation-medium', note: 'Floats over content and bars to report the result of an action, then goes away.' },
  { id: 'scrim', n: 6, name: 'Scrim', what: 'Overlay', surface: 'surface/overlay', shadow: 'none', note: 'Dims everything below and blocks it. It only ever appears under a sheet.' },
  { id: 'sheet', n: 7, name: 'Sheet', what: 'Bottom sheet', surface: 'surface/primary', shadow: 'elevation-high', note: 'The top of the stack: a task on top of the screen. Closes by tapping the scrim or dragging down.' },
  { id: 'sheet2', n: 8, name: 'Second sheet', what: 'A bottom sheet on a bottom sheet', surface: 'surface/primary', shadow: 'elevation-high', note: 'At most two sheets. Only this one has a back button. Never a third.' },
]

function Plane({ layer, active }: { layer: Layer; active: string | null }) {
  return (
    <div className={styles.plane} data-layer={layer.id} data-dim={active !== null && active !== layer.id ? '' : undefined} style={{ '--n': layer.n } as CSSProperties} aria-hidden="true">
      {layer.id === 'inset' && <span className={styles.miniInset} />}
      {layer.id === 'content' && <span className={styles.miniStatic} />}
      {layer.id === 'raised' && <><span className={styles.miniRaised} /><span className={styles.miniChip} /></>}
      {layer.id === 'bars' && <><span className={styles.miniTopBar} /><span className={styles.miniDock} /></>}
      {layer.id === 'toast' && <span className={styles.miniToast} />}
      {layer.id === 'scrim' && <span className={styles.miniScrim} />}
      {layer.id === 'sheet' && <span className={styles.miniSheet} />}
      {layer.id === 'sheet2' && <span className={styles.miniSheetTwo} />}
    </div>
  )
}

export function LayeringPage() {
  const [active, setActive] = useState<string | null>(null)
  return (
    <>
      <section className={styles.intro}>
        <div className={styles.stage} role="img" aria-label="An exploded 3D view of a screen: nine layers from the screen background up to a second bottom sheet">
          <div className={styles.stack}>
            {layers.map((l) => <Plane key={l.id} layer={l} active={active} />)}
          </div>
        </div>
        <ol className={styles.list} reversed>
          {[...layers].reverse().map((l) => (
            <li key={l.id}>
              <span onMouseEnter={() => setActive(l.id)} onMouseLeave={() => setActive(null)}>
                <ListCell size="sm" label={l.name} description={l.what} iconLeft={<span className={styles.num}>{l.n}</span>} selected={active === l.id} onClick={() => setActive((a) => (a === l.id ? null : l.id))} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.block}>
        <h2>Layers, bottom to top</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Layer</th><th>What lives there</th><th>Surface</th><th>Shadow</th><th>Notes</th></tr></thead>
            <tbody>
              {layers.map((l) => (
                <tr key={l.id}><td><strong>{l.n} · {l.name}</strong></td><td>{l.what}</td><td><code>{l.surface}</code></td><td><code>{l.shadow}</code></td><td>{l.note}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.block}>
        <h2>Rules</h2>
        <ul className={styles.rules}>
          <li><strong>Higher means more shadow.</strong> elevation-low for things you can tap, medium for bars and toasts, high for docks and sheets. Never give a lower layer a heavier shadow than the one above it.</li>
          <li><strong>Lifted means tappable.</strong> Only raised things (clickable cards, chips, fields) get a shadow on the page; information stays flat with a border.</li>
          <li><strong>Inset sinks, it doesn't float.</strong> Filled cards are grey with no border or shadow, and nothing grey goes inside them.</li>
          <li><strong>In light mode, border and shadow do the work.</strong> surface/default and surface/primary are both white, so the 1px border-light and the shadow separate layers. In dark mode higher surfaces are also lighter.</li>
          <li><strong>Only the scrim dims,</strong> and only a sheet sits above it. At most two sheets; the second has the back button.</li>
          <li><strong>Bars stay, content moves.</strong> Content scrolls under the action bar and above-the-dock area, never over them.</li>
          <li><strong>In Figma,</strong> use the effect styles shadow/elevation-low, medium and high, never a custom shadow.</li>
        </ul>
      </section>
    </>
  )
}
