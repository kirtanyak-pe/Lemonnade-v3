import type { ReactNode } from 'react'
import { Button } from '../Button'
import { Icon } from '../Icon'
import { Select } from '../Select'
import { msChevronRight, msInfo } from '../icons/glyphs'
import styles from './SectionHeader.module.css'

/**
 * L3 Section header (Figma "L3: Section header"): the heading row of a section. Figma 👁️ CTA shows the action; the
 * nested "L3 base: section header cta" is Type = Button (View all) or Time Switcher.
 * - `title` (Heading/14) is required.
 * - `tag`, `onInfo` (ⓘ icon button) and `description` (Description/12 — keep it to one line; it never goes past two)
 *   are optional.
 * - `action` (optional) is one of two kinds: "view all" (Figma Type=Button: a Ghost button with a chevron, hugging its
 *   16px label) or a switcher (Figma Type=Time Switcher: an L3: Select switcher that opens a sheet, e.g. "Day P&L ↕").
 * Every tappable part has a touch area of at least 48 × 48, without changing the row's height.
 * Spacing around it belongs to the screen: 16 to its card, sections 24 (or 32) apart — see the Layout page.
 */
export type SectionHeaderAction =
  /** Figma CTA Type=Button. */
  | { type: 'view-all'; onClick: () => void; /** Default "View all". */ label?: string }
  /** Figma CTA Type=Time Switcher. */
  | { type: 'switcher'; /** Current choice, e.g. "Day P&L". */ label: string; onClick: () => void; expanded?: boolean; /** Only if the visible label isn't a good name on its own. */ 'aria-label'?: string }

export type SectionHeaderProps = {
  /** Figma ✏️ Heading — required. */
  title: ReactNode
  /** Figma ✏️ Description — one line ideally, two at most (longer text is cut with an ellipsis). */
  description?: ReactNode
  /** Figma 👁️ Tag: a `<Tag size="sm">` next to the title. */
  tag?: ReactNode
  /** Figma 👁️ Info: shows an ⓘ button after the title. */
  onInfo?: () => void
  /** Screen-reader name for the ⓘ button. Default "About <title>". */
  infoLabel?: string
  /** Figma 👁️ CTA + its Type: View all (Button) or Time Switcher. */
  action?: SectionHeaderAction
  /** Heading level for the title (default 2). */
  headingLevel?: 2 | 3 | 4
  className?: string
}

export function SectionHeader({ title, description, tag, onInfo, infoLabel, action, headingLevel = 2, className }: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as const
  const name = typeof title === 'string' ? title : 'this section'
  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')}>
      <div className={styles.content}>
        <div className={styles.headingRow}>
          <Heading className={styles.title}>{title}</Heading>
          {tag && <span className={styles.tag}>{tag}</span>}
          {onInfo && (
            <button type="button" className={styles.info} onClick={onInfo} aria-label={infoLabel ?? `About ${name}`}>
              <Icon icon={msInfo} size={16} />
            </button>
          )}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {action && (
        <span className={styles.action}>
          {action.type === 'view-all' ? (
            <Button variant="ghost" size="sm" className={styles.viewAll} onClick={action.onClick} iconRight={<Icon icon={msChevronRight} />}>
              {action.label ?? 'View all'}
            </Button>
          ) : (
            <Select size="sm" onClick={action.onClick} expanded={action.expanded} aria-label={action['aria-label']}>
              {action.label}
            </Select>
          )}
        </span>
      )}
    </div>
  )
}
