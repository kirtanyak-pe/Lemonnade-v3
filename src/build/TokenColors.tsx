// Color choice for Figma board layers: only Lemonnade (L3) color tokens, grouped by role, each swatch painted in the
// canvas theme. Picking one links the layer to that token, so it follows Lemonn, Kuber and CS PRO.
import type { CSSProperties } from 'react'
import type { Theme } from './controls'
import { themeVariables } from './figmaThemeVariables'
import { tokenColor, tokenLabel, tokenOf } from './figmaTokens'
import styles from './Build.module.css'

export type ColorRole = 'text' | 'fill' | 'icon' | 'stroke'

const tokenNames = [...new Set(Object.values(themeVariables))]
const plain = (prefix: string) => new RegExp(`^--l3-${prefix}-(?!accent|disabled|overlay|inverted-secondary)`)

const groups: Record<ColorRole, [string, RegExp][]> = {
  text: [['Content', plain('content')], ['Accent', /^--l3-content-accent-/], ['Static', /^--l3-static-/]],
  fill: [['Surface', plain('surface')], ['Accent', /^--l3-surface-accent-/], ['Buttons', /^--l3-button-[a-z]+-surface$/], ['Static', /^--l3-static-/]],
  icon: [['Content', plain('content')], ['Accent', /^--l3-content-accent-/], ['Surface', plain('surface')], ['Static', /^--l3-static-/]],
  stroke: [['Border', plain('border')], ['Accent', /^--l3-border-accent-/], ['Static', /^--l3-static-/]],
}

export function TokenColors({ label, role, value, theme, onPick }: {
  label: string
  role: ColorRole
  value: string | undefined
  theme: Theme
  onPick: (color: string) => void
}) {
  const current = tokenOf(value)
  return (
    <div className={styles.field} role="radiogroup" aria-label={label}>
      <span className={styles.fieldLabel}>
        {label}
        <span className={styles.fieldValue}> · {current ? tokenLabel(current) : value ? 'Figma color, not a token' : 'None'}</span>
      </span>
      {!current && value && (
        <span className={styles.tokenCurrent}>
          <span className={styles.swatchDot} data-unlinked="" style={{ '--dot': value, '--dot-border': 'var(--l3-border-dark)' } as CSSProperties} />
          Pick a token below to link it to Lemonnade.
        </span>
      )}
      {groups[role].map(([title, match]) => {
        const names = tokenNames.filter((n) => match.test(n))
        if (!names.length) return null
        return (
          <div key={title} className={styles.tokenGroup}>
            <span className={styles.tokenGroupTitle}>{title}</span>
            <div className={styles.dots}>
              {names.map((n) => (
                <button key={n} type="button" role="radio" aria-checked={n === current} aria-label={tokenLabel(n)} title={tokenLabel(n)} className={styles.dotButton} onClick={() => onPick(tokenColor(n, theme.product, theme.mode))}>
                  <span className={styles.swatchDot} data-product={theme.product} data-mode={theme.mode} style={{ '--dot': `var(${n})`, '--dot-border': 'var(--l3-border-light)' } as CSSProperties} />
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
