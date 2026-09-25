import type { ReactNode } from 'react'
import { BackIcon, CloseIcon, InfoIcon } from '../icons'
import styles from './BottomSheet.module.css'

/** Figma "L3: Bottom sheet header" (node 4543:63897). Figma isSmall → `size="sm"`. */
export type BottomSheetHeaderProps = {
  heading: string
  size?: 'sm' | 'lg'
  /** Figma 👁️ Description. */
  description?: string
  /** Id for the heading, so a dialog can point aria-labelledby at it. */
  headingId?: string
  /** sm: Figma 👁️ Info — the ⓘ after the heading. Pass a node (e.g. a button) to replace the icon. */
  info?: boolean | ReactNode
  /** sm: Figma action-left "⬅️ Back". Shows the back button. */
  onBack?: () => void
  /** sm: Figma action-right "❌ Cross". Shows the close button (unless `trailing` is set). */
  onClose?: () => void
  /** sm: Figma right slot for "🏷️ Tag" / "🔲 Button" actions, e.g. <Tag> or <Button size="sm">. */
  trailing?: ReactNode
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
  onBack,
  onClose,
  trailing,
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

  const right = trailing ?? (onClose && (
    <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
      <CloseIcon />
    </button>
  ))

  return (
    <header className={cls} data-size="sm">
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
          {info && <span className={styles.info}>{info === true ? <InfoIcon /> : info}</span>}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.headerTrailing} data-has-action={right ? '' : undefined}>
        {right}
      </div>
    </header>
  )
}
