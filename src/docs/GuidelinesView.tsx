import type { ReactNode } from 'react'
import styles from './Docs.module.css'

export type Guideline = { title: string; do: { text: string; example: ReactNode }; dont: { text: string; example: ReactNode } }

/** Do / Don't pairs: a live example over a short rule, green for do, red for don't. */
export function Guidelines({ items }: { items: Guideline[] }) {
  return (
    <section className={styles.section}>
      <h2>Usage guidelines</h2>
      {items.map((g) => (
        <div key={g.title} className={styles.guideline}>
          <h3>{g.title}</h3>
          <div className={styles.guidelinePair}>
            <Card kind="do" text={g.do.text} example={g.do.example} />
            <Card kind="dont" text={g.dont.text} example={g.dont.example} />
          </div>
        </div>
      ))}
    </section>
  )
}

function Card({ kind, text, example }: { kind: 'do' | 'dont'; text: string; example: ReactNode }) {
  return (
    <figure className={styles.guidelineCard} data-kind={kind}>
      {/* Examples are illustrations: not reachable by keyboard or announced as controls. */}
      <div className={styles.guidelineExample} inert>{example}</div>
      <figcaption>
        <strong>{kind === 'do' ? '✓ Do' : '✕ Don’t'}</strong>
        {text}
      </figcaption>
    </figure>
  )
}
