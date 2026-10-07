import { Tag, type TagColor } from '../components/Tag'
import { changeKindLabels, type ChangeKind, type Release } from './changelog'
import styles from './Docs.module.css'

const kindColors: Record<ChangeKind, TagColor> = {
  added: 'success',
  changed: 'discover',
  fixed: 'processing',
  figma: 'purple',
  a11y: 'teal',
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

/** Version history as a vertical progress line: newest at the top, the shipped version highlighted. */
export function ReleaseTimeline({ releases }: { releases: Release[] }) {
  const shipped = releases.filter((r) => r.version !== 'unreleased')
  const current = shipped[0]
  const first = shipped[shipped.length - 1]

  return (
    <div className={styles.releases}>
      {current && (
        <p className={styles.tabIntro}>
          Current version <strong>v{current.version}</strong> · {shipped.length} {shipped.length === 1 ? 'release' : 'releases'} since {formatDate(first.date)}
        </p>
      )}
      <ol className={styles.timeline}>
        {releases.map((r) => {
          const state = r.version === 'unreleased' ? 'upcoming' : r === current ? 'current' : 'past'
          return (
            <li key={r.version + r.date} className={styles.release} data-state={state}>
              <span className={styles.releaseMarker} aria-hidden="true" />
              <div className={styles.releaseHeader}>
                <h3>{state === 'upcoming' ? 'In progress' : `v${r.version}`}</h3>
                {state === 'current' && <Tag variant="primary" color="success" size="sm">Current</Tag>}
                {state === 'upcoming' && <Tag variant="secondary" color="neutral" size="sm">Not in code yet</Tag>}
                <span className={styles.releaseMeta}>
                  <time dateTime={r.date}>{formatDate(r.date)}</time>
                </span>
              </div>
              <p className={styles.releaseSummary}>{r.summary}</p>
              {r.changes.some((c) => !c.dev) && <ul className={styles.releaseChanges}>
                {r.changes.filter((c) => !c.dev).map((c) => (
                  <li key={c.text}>
                    <Tag variant="secondary" color={kindColors[c.kind]} size="sm">{changeKindLabels[c.kind]}</Tag>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
