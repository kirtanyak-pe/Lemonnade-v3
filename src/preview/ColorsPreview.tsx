import { themeTokenVars, type ThemeToken } from '../tokens'

const groups: { title: string; prefix: string }[] = [
  { title: 'Surface', prefix: 'surface/' },
  { title: 'Content', prefix: 'content/' },
  { title: 'Border', prefix: 'border/' },
  { title: 'Button', prefix: 'component/button/' },
]

const tokenNames = Object.keys(themeTokenVars) as ThemeToken[]

export function ColorsPreview() {
  return groups.map(({ title, prefix }) => (
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
  ))
}
