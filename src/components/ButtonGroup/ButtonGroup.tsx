import type { HTMLAttributes, ReactNode } from 'react'
import styles from './ButtonGroup.module.css'

/** Figma "L3: Button Group" (node 4471:29456). */
export type ButtonGroupDirection = 'vertical' | 'horizontal'

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** Figma Direction: vertical stacks full-width buttons; horizontal shares the width equally. */
  direction?: ButtonGroupDirection
  /** Figma "Scroll indicator": lifts the bar with a shadow while content scrolls underneath it. */
  scrollIndicator?: boolean
  /** Figma "wrapper" slot — usually two or more <Button size="lg" /> (primary first in vertical, last in horizontal). */
  children: ReactNode
}

/** Bottom action bar for a screen or sheet. Put it at the end of the layout (or make it sticky). */
export function ButtonGroup({
  direction = 'vertical',
  scrollIndicator = false,
  className,
  children,
  ...rest
}: ButtonGroupProps) {
  return (
    <div
      role="group"
      {...rest}
      className={[styles.group, className].filter(Boolean).join(' ')}
      data-direction={direction}
      data-scrolled={scrollIndicator || undefined}
    >
      {children}
    </div>
  )
}
