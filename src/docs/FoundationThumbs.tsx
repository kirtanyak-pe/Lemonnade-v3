import type { ReactNode } from 'react'
import { BrandLogo } from '../components/BrandLogo'
import { Icon } from '../components/Icon'
import { msAccountBalanceWallet, msCandlestickChart, msNotifications, msSearch, msShowChart, msStar } from '../icons/material'
import { numberVars, textStyles, themeTokenVars } from '../tokens'
import styles from './FoundationThumbs.module.css'

// Small live previews for the Foundations cards on the home page (instead of a paragraph each).

const themeTokenCount = Object.keys(themeTokenVars).length
const spacingSteps = ['04', '08', '12', '16', '24', '32'] as const

const ColorsThumb = () => (
  <div className={styles.colors}>
    {['surface-inverted', 'surface-accent-brand-default', 'surface-accent-indicator-up-default', 'surface-accent-indicator-down-default', 'surface-accent-warning-default', 'surface-accent-discover-default', 'surface-accent-zing-default', 'surface-accent-purple-default'].map((t) => (
      <span key={t} style={{ background: `var(--l3-${t})` }} />
    ))}
  </div>
)

const TypographyThumb = () => (
  <div className={styles.type}>
    <span className={styles.typeBig}>Aa</span>
    <span className={styles.typeScale}>
      <span style={{ font: 'var(--l3-text-heading-primary-14)' }}>Heading</span>
      <span style={{ font: 'var(--l3-text-label-primary-14)' }}>Label</span>
      <span style={{ font: 'var(--l3-text-description-14)' }}>Description</span>
    </span>
  </div>
)

const SpacingThumb = () => (
  <div className={styles.spacing}>
    {spacingSteps.map((s) => <span key={s} style={{ width: `var(--l3-spacing-${s})` }} />)}
  </div>
)

const IconsThumb = () => (
  <div className={styles.icons}>
    {[msSearch, msStar, msNotifications, msShowChart, msCandlestickChart, msAccountBalanceWallet].map((icon, i) => <Icon key={i} icon={icon} size={24} />)}
  </div>
)

const LogoThumb = () => (
  <div className={styles.logos}>
    <BrandLogo brand="lemonn" size={32} decorative />
    <BrandLogo brand="zing" size={32} decorative />
  </div>
)

export const foundationThumbs: Record<string, { thumb: ReactNode; meta: string }> = {
  colors: { thumb: <ColorsThumb />, meta: `${themeTokenCount} tokens · 10 themes` },
  typography: { thumb: <TypographyThumb />, meta: `Manrope · ${new Set(textStyles.map((s) => s.role)).size} roles · ${textStyles.filter((s) => !('local' in s)).length} styles` },
  spacing: { thumb: <SpacingThumb />, meta: `${Object.keys(numberVars).length} spacing, radius & size tokens` },
  icons: { thumb: <IconsThumb />, meta: 'Material Symbols · 3,900+' },
  'brand-logo': { thumb: <LogoThumb />, meta: 'Lemonn · Zing' },
}
