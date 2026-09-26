import type { ChangeEvent, ReactNode } from 'react'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { BackIcon } from '../icons'
import styles from './Actionbar.module.css'

/** Figma "L3: Actionbar" (node 4543:65480) + "L3: Base actionbar content" (node 4543:65466). */
export type ActionbarProps = {
  /** Figma ✏️ Heading. Rendered as the screen's heading (h1 by default). */
  title?: ReactNode
  /** Figma ✏️ Description. */
  description?: ReactNode
  headingLevel?: 1 | 2
  /** Figma 👁️ Action - left: shows the back button. */
  onBack?: () => void
  backLabel?: string
  /** Figma → content right: usually one or two <ActionbarAction>s. */
  actions?: ReactNode
  /** Figma ↓ Content bottom: e.g. <Tabs> or filters under the bar. */
  bottom?: ReactNode
  /**
   * Figma Base content Type=Search / Searched: the middle becomes a search input
   * (placeholder = Search, typed value = Searched). The title is hidden while searching.
   */
  search?: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
    autoFocus?: boolean
  }
  /** Stick to the top while the page scrolls. */
  sticky?: boolean
  className?: string
}

/** Top app bar for a screen. Leaves room for the status bar / notch (safe area). */
export function Actionbar({
  title,
  description,
  headingLevel = 1,
  onBack,
  backLabel = 'Back',
  actions,
  bottom,
  search,
  sticky = false,
  className,
}: ActionbarProps) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2'

  return (
    <header className={[styles.actionbar, className].filter(Boolean).join(' ')} data-sticky={sticky || undefined}>
      <div className={styles.row}>
        {onBack && (
          <button type="button" className={styles.back} onClick={onBack} aria-label={backLabel}>
            <BackIcon />
          </button>
        )}
        <div className={styles.content}>
          {search ? (
            <input
              type="search"
              className={styles.search}
              value={search.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? 'Search'}
              aria-label={search.label ?? search.placeholder ?? 'Search'}
              autoFocus={search.autoFocus}
              enterKeyHint="search"
            />
          ) : (
            <>
              {title && <Heading className={styles.title}>{title}</Heading>}
              {description && <p className={styles.description}>{description}</p>}
            </>
          )}
        </div>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
      {bottom && <div className={styles.bottom}>{bottom}</div>}
    </header>
  )
}

/** Figma's → content right button: a round 32px icon button (small Secondary Button, border/light). */
export function ActionbarAction({ icon, label, onClick, pressed }: { icon: string; label: string; onClick: () => void; pressed?: boolean }) {
  return (
    <Button
      size="sm"
      variant="secondary"
      className={styles.action}
      iconLeft={<Icon icon={icon} size={16} />}
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
    />
  )
}
