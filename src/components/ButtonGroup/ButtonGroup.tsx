import { Children, isValidElement, useEffect, type HTMLAttributes, type ReactNode } from 'react'
import styles from './ButtonGroup.module.css'

/** Figma "L3: Button Group" (node 4471:29456). */
export type ButtonGroupDirection = 'vertical' | 'horizontal'

export type ButtonGroupProps = HTMLAttributes<HTMLDivElement> & {
  /** Figma Direction: vertical stacks full-width buttons; horizontal shares the width equally. */
  direction?: ButtonGroupDirection
  /** Figma "Scroll indicator": lifts the bar with a shadow while content scrolls underneath it. */
  scrollIndicator?: boolean
  /** Figma "wrapper" slot — Large buttons only (primary first in vertical, last in horizontal). */
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
  // Dock rules (see USAGE.md): Large buttons only, at least one strong button, secondary only beside it,
  // and a name for the group.
  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label']
  const labelledBy = (rest as { 'aria-labelledby'?: string })['aria-labelledby']
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const variants: string[] = []
    Children.forEach(children, (child) => {
      if (!isValidElement<{ size?: string; variant?: string }>(child)) return
      const { size, variant = 'primary' } = child.props
      variants.push(variant)
      if (size && size !== 'lg') console.warn(`[L3] <ButtonGroup> buttons are always size="lg" (found size="${size}").`)
    })
    if (variants.length && !variants.some((v) => ['primary', 'buy', 'sell', 'brand'].includes(v))) {
      console.warn('[L3] <ButtonGroup> needs a strong button (primary, buy, sell or brand); secondary only goes next to one.')
    }
    if (!ariaLabel && !labelledBy) console.warn('[L3] <ButtonGroup> needs an aria-label naming the task, e.g. "Order actions".')
  }, [children, ariaLabel, labelledBy])

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
