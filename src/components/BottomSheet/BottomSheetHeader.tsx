import type { ReactNode } from 'react'
import { BackIcon, InfoIcon } from '../icons'
import styles from './BottomSheet.module.css'

/** Figma "L3: Bottom sheet header" (node 4543:63897). Figma isSmall → `size="sm"`. */
export type BottomSheetHeaderProps = {
  heading: string
  size?: 'sm' | 'lg'
  /** Figma 👁️ Description. */
  description?: string
  /** Id for the heading, so a dialog can point aria-labelledby at it. */
  headingId?: string
  /** sm: Figma 👁️ Info — the ⓘ after the heading. Decorative unless `onInfo` is set. Pass a node to replace it. */
  info?: boolean | ReactNode
  /** sm: makes the ⓘ a button (e.g. to open an explainer). */
  onInfo?: () => void
  /** Accessible name for the ⓘ button. */
  infoLabel?: string
  /** sm: Figma action-left "⬅️ Back". Shows the back button. */
  onBack?: () => void
  /** sm: Figma right slot for "🏷️ Tag" / "🔲 Button" actions (Figma's "❌ Cross" isn't used), e.g. <Tag> or <Button size="sm">. */
  trailing?: ReactNode
  /** sm: Figma "Content bottom" slot — full-width content under the header row, e.g. <Tabs> or a search field. */
  bottom?: ReactNode
  /** lg: Figma H-Icon slot (64px). */
  icon?: ReactNode
  /** lg: Figma 👁️ Header tag, usually <Tag size="sm">. */
  tag?: ReactNode
  className?: string
}

export function BottomSheetHeader({
  heading,
  size = 'sm',
  description,
  headingId,
  info = false,
  onInfo,
  infoLabel = 'More information',
  onBack,
  trailing,
  bottom,
  icon,
  tag,
  className,
}: BottomSheetHeaderProps) {
  const cls = [styles.header, className].filter(Boolean).join(' ')

  if (size === 'lg') {
    return (
      <header className={cls} data-size="lg">
        {icon && <div className={styles.headerIcon}>{icon}</div>}
        <div className={styles.headerCenter}>
          {tag}
          <h2 id={headingId} className={styles.heading}>{heading}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </header>
    )
  }

  // No ✕: sheets close by dragging or tapping the backdrop (BottomSheet also renders a screen-reader close button).
  const right = trailing

  return (
    <header className={cls} data-size="sm">
      <div className={styles.headerRow}>
        <div className={styles.headerLeading}>
          {onBack && (
            <button type="button" className={styles.iconButton} onClick={onBack} aria-label="Back">
              <BackIcon />
            </button>
          )}
        </div>
        <div className={styles.headerText}>
          <div className={styles.headingRow}>
            <h2 id={headingId} className={styles.heading}>{heading}</h2>
            {info && onInfo && (
              <button type="button" className={`${styles.iconButton} ${styles.infoButton}`} onClick={onInfo} aria-label={infoLabel}>
                {info === true ? <InfoIcon /> : info}
              </button>
            )}
            {info && !onInfo && (
              <span className={styles.info} aria-hidden={info === true || undefined}>{info === true ? <InfoIcon /> : info}</span>
            )}
          </div>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.headerTrailing} data-has-action={right ? '' : undefined}>
          {right}
        </div>
      </div>
      {bottom && <div className={styles.headerBottom}>{bottom}</div>}
    </header>
  )
}
