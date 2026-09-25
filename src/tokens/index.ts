import './generated/base.css'
import './generated/themes.css'
import './generated/typography.css'
import { themeTokenVars, type ThemeToken } from './generated/tokens.ts'

export * from './themes.ts'
export * from './generated/tokens.ts'

/** `token('surface/primary')` → `var(--l3-surface-primary)` for inline styles / CSS-in-JS. */
export const token = (name: ThemeToken) => `var(${themeTokenVars[name]})`
