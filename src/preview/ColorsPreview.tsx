import { themeTokenVars, type ThemeToken } from '../tokens'

const groups: { title: string; prefix: string }[] = [
  { title: 'Surface', prefix: 'surface/' },
  { title: 'Content', prefix: 'content/' },
  { title: 'Border', prefix: 'border/' },
  { title: 'Button', prefix: 'component/button/' },
  { title: 'State layer', prefix: 'component/state-layer/' },
  { title: 'Static', prefix: 'static/' },
]

const tokenNames = Object.keys(themeTokenVars) as ThemeToken[]

const grouped = new Set(tokenNames.filter((n) => groups.some((g) => n.startsWith(g.prefix))))
const others = tokenNames.filter((n) => !grouped.has(n))
if (others.length) groups.push({ title: 'Other', prefix: '' })

export function ColorsPreview() {
  return groups.map(({ title, prefix }) => (
    <section key={title}>
      <h2>{title}</h2>
      <ul className="swatches">
        {(prefix ? tokenNames.filter((n) => n.startsWith(prefix)) : others).map((name) => (
          <li key={name} data-token={name}>
            <span className="chip" style={{ background: `var(${themeTokenVars[name]})` }} />
            <span className="name">{name.slice(prefix.length)}</span>
          </li>
        ))}
      </ul>
    </section>
  ))
}
