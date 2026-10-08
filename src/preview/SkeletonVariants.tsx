import { Card } from '../components/Card'
import { Skeleton, SkeletonCard, SkeletonListRow } from '../components/Skeleton'

/** Shapes, on white and on grey, and the two patterns. */
export function SkeletonVariants() {
  const frames = [
    { caption: 'Line · Circle · Box', el: <span style={{ display: 'flex', gap: 'var(--l3-spacing-12)', alignItems: 'center', width: '100%' }}><Skeleton width="var(--l3-size-96)" /><Skeleton shape="circle" /><Skeleton shape="box" width="var(--l3-size-96)" height="var(--l3-size-48)" /></span> },
    { caption: 'On grey (isOnGrey) inside a filled card', el: <Card variant="filled"><Skeleton onGrey width="60%" /><Skeleton onGrey width="40%" /></Card> },
    { caption: 'Pattern · list row ×3', el: <span aria-busy="true" aria-label="Loading watchlist" style={{ width: '100%' }}><SkeletonListRow /><SkeletonListRow /><SkeletonListRow /></span> },
    { caption: 'Pattern · card', el: <SkeletonCard /> },
  ]
  return (
    <div className="bg-row">
      {frames.map((f) => <figure key={f.caption} className="bg-frame card-frame"><figcaption>{f.caption}</figcaption>{f.el}</figure>)}
    </div>
  )
}
