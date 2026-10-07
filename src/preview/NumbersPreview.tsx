import { numberVars, type NumberToken } from '../tokens'
import { docName } from '../docs/names'

const names = Object.keys(numberVars) as NumberToken[]
const byGroup = (prefix: string) => names.filter((n) => n.startsWith(prefix))

export function NumbersPreview() {
  return (
    <>
      <section>
        <h2>Spacing</h2>
        <ul className="num-list">
          {byGroup('spacing/').map((n) => (
            <li key={n} data-token={n}>
              <span className="num-name">{docName(n)}</span>
              <span className="num-bar" style={{ width: `var(${numberVars[n]})` }} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Radius</h2>
        <ul className="num-grid">
          {byGroup('radius/').map((n) => (
            <li key={n} data-token={n}>
              <span className="num-box" style={{ borderRadius: `var(${numberVars[n]})` }} />
              <span className="num-name">{docName(n)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Size & icon size</h2>
        <ul className="num-grid">
          {[...byGroup('size/'), ...byGroup('icon-size/')].map((n) => (
            <li key={n} data-token={n}>
              <span className="num-square" style={{ width: `var(${numberVars[n]})`, height: `var(${numberVars[n]})` }} />
              <span className="num-name">{docName(n)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
