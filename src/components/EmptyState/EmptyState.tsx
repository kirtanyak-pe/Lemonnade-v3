import type { ReactNode } from 'react'
import { NoResultsIllustration } from './NoResultsIllustration'
import styles from './EmptyState.module.css'

/** Figma "L3 → Empty state" (node 4543:66488). */
export type EmptyStateProps = {
  /** Figma ✏️ Heading. */
  title: ReactNode
  /** Figma ✏️ Description. */
  description?: ReactNode
  /** Figma Illustration slot (120px). Defaults to the no-results magnifier; pass `null` to hide it. */
  illustration?: ReactNode
  /** Figma Clear CTA: usually a small primary <Button>, e.g. "Clear" with a delete icon. */
  action?: ReactNode
  headingLevel?: 2 | 3
  className?: string
}

/** Shown when a list or search has nothing to show. Centres itself in the space it's given. */
export function EmptyState({ title, description, illustration = <NoResultsIllustration />, action, headingLevel = 2, className }: EmptyStateProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <section className={[styles.emptyState, className].filter(Boolean).join(' ')}>
      {illustration && <div className={styles.illustration}>{illustration}</div>}
      <div className={styles.content}>
        <Heading className={styles.title}>{title}</Heading>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action}
    </section>
  )
}
