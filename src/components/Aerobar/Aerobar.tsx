import type { HTMLAttributes, ReactNode } from 'react'
import { Button } from '../Button'
import { InfoIcon } from '../icons'
import styles from './Aerobar.module.css'

/** Figma "L3: aerobar - toast" (node 4543:65562). */
export type AerobarType = 'primary' | 'discover' | 'danger' | 'success' | 'warning'

export type AerobarProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Figma Type. */
  type?: AerobarType
  /** Figma isPrimary: `primary` is the solid colour, `secondary` (default) the light tint. */
  emphasis?: 'primary' | 'secondary'
  /** Figma isFloating: a rounded, shadowed card inset 16px (a toast) instead of a full-width strip. */
  floating?: boolean
  /** Figma "Headline text" (👁️ Heading). */
  heading?: ReactNode
  /** Figma "Paragraph text" (👁️ Paragraph). */
  paragraph?: ReactNode
  /** Figma icon-L slot (24px). Defaults to the info icon; pass `false` to hide it (👁️ Icon-L). */
  icon?: ReactNode | false
  /** Figma 👁️ Action-r: a small borderless secondary button. */
  action?: { label: string; onClick: () => void }
}

/**
 * Inline status bar or floating toast. Announced politely (role="status");
 * danger uses role="alert" so it's read out straight away.
 */
export function Aerobar({
  type = 'primary',
  emphasis = 'secondary',
  floating = false,
  heading,
  paragraph,
  icon,
  action,
  className,
  ...rest
}: AerobarProps) {
  const iconNode = icon === false ? null : (icon ?? <InfoIcon />)
  return (
    <div
      role={type === 'danger' ? 'alert' : 'status'}
      {...rest}
      className={[styles.aerobar, className].filter(Boolean).join(' ')}
      data-type={type}
      data-emphasis={emphasis}
      data-floating={floating || undefined}
    >
      <div className={styles.body}>
        {iconNode && <span className={styles.icon}>{iconNode}</span>}
        <div className={styles.content}>
          {heading && <p className={styles.heading}>{heading}</p>}
          {paragraph && <p className={styles.paragraph}>{paragraph}</p>}
        </div>
        {action && (
          <Button size="sm" variant="secondary" className={styles.action} onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
