import type { CSSProperties } from 'react'
import { LemonnMark, LemonnWordmark, ZingArt, lemonnMarkOffset } from './BrandArt.tsx'
import styles from './BrandLogo.module.css'

export type Brand = 'lemonn' | 'zing'

/** Figma "L3 → Brand logo" (node 4735:1466): Brand = 🍋 Lemonn | ⭐ Zing, isFull = True | False. */
export type BrandLogoProps = {
  brand: Brand
  /** Figma isFull: `full` = mark + wordmark (default), `icon` = the 24×24 mark only. */
  variant?: 'full' | 'icon'
  /** Height in px, from the size tokens. Width follows the logo's proportions. */
  size?: 24 | 32 | 40 | 48
  /** Accessible name. Defaults to the brand name. */
  label?: string
  /** Hide from assistive tech when the brand name is already written next to the logo. */
  decorative?: boolean
  className?: string
}

const names: Record<Brand, string> = { lemonn: 'Lemonn', zing: 'Zing' }

// Figma frame sizes (viewBox) per brand and variant.
const viewBoxes: Record<Brand, Record<'full' | 'icon', string>> = {
  lemonn: { full: '0 0 92 24', icon: '0 0 24 24' },
  zing: { full: '0 0 44 24', icon: '0 0 24 24' },
}

export function BrandLogo({ brand, variant = 'full', size = 24, label, decorative = false, className }: BrandLogoProps) {
  const full = variant === 'full'
  return (
    <svg
      className={[styles.logo, className].filter(Boolean).join(' ')}
      style={{ '--logo-height': `var(--l3-size-${size})` } as CSSProperties}
      viewBox={viewBoxes[brand][variant]}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-brand={brand}
      {...(decorative ? { 'aria-hidden': true, focusable: false } : { role: 'img', 'aria-label': label ?? names[brand] })}
    >
      {brand === 'lemonn' ? (
        full ? (
          <>
            <LemonnWordmark />
            {/* Figma places the mark after the wordmark, raised by a fraction of a pixel. */}
            <g transform={`translate(${lemonnMarkOffset} -0.17742)`}>
              <LemonnMark />
            </g>
          </>
        ) : (
          <LemonnMark />
        )
      ) : (
        <ZingArt full={full} />
      )}
    </svg>
  )
}
