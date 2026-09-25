import type { PropRow } from './types'
import styles from './Docs.module.css'

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.propsTable}>
        <thead>
          <tr>
            <th scope="col">Prop</th>
            <th scope="col">Type</th>
            <th scope="col">Default</th>
            <th scope="col">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td><code>{r.name}</code></td>
              <td><code>{r.type}</code></td>
              <td>{r.default ? <code>{r.default}</code> : '—'}</td>
              <td>{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
