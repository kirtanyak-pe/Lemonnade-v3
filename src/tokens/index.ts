import './generated/base.css'
import './generated/themes.css'
import './generated/typography.css'
import './generated/effects.css'
import { themeTokenVars, type ThemeToken } from './generated/tokens'

export * from './themes'
export * from './generated/tokens'

/** `token('surface/primary')` → `var(--l3-surface-primary)` for inline styles / CSS-in-JS. */
export const token = (name: ThemeToken) => `var(${themeTokenVars[name]})`
