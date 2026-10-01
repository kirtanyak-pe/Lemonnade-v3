import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '../../components/Button'
import { Icon } from '../../components/Icon'
import { Tabs } from '../../components/Tabs'
import { Tag } from '../../components/Tag'
import { TextField } from '../../components/TextField'
import { msAccountTree, msSearch, msViewList } from '../../icons/material'
import { productLabels, productModes, products, type ThemeToken } from '../../tokens'
import { useTheme } from '../../theme'
import {
  accentGroups, accentSlots, accents, aliasOf, allTokens, baseVar, borders, buttonParts, buttonStates, buttonVariants,
  contents, cssVar, displayName, isToken, opacityScale, ramps, stateLayers, statics, surfaces, themeId, type Role,
} from './colorData'
import styles from './ColorsPage.module.css'
import { TokenNaming } from './TokenNaming'
import { TokenFlow } from './TokenFlow'
import { SemanticTree } from './SemanticTree'

// ---- Helpers -------------------------------------------------------------------------------------

/** Computed color → "#RRGGBB" (+ alpha %). Handles rgb(), rgba() and color(srgb …) from color-mix. */
function toHex(css: string): string {
  const nums = css.match(/[\d.]+/g)?.map(Number) ?? []
  if (!nums.length) return ''
  const srgb = css.startsWith('color(')
  const [r, g, b] = (srgb ? nums.slice(0, 3).map((n) => n * 255) : nums.slice(0, 3)).map((n) => Math.round(n))
  const a = nums.length > 3 ? nums[3] : 1
  const hex = '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('').toUpperCase()
  return a < 1 ? `${hex} · ${Math.round(a * 100)}%` : hex
}

function useThemeKey() {
  const { product, mode, contrast } = useTheme()
  return { key: `${product}-${mode}-${contrast}`, id: themeId(product, mode, contrast), product, mode, contrast }
}

/** Border tokens are previewed as an outline, everything else as a fill. */
const isBorder = (token: string) => token.startsWith('border/') || /\/border(-|$)/.test(token)

/** Chip color goes in `color` (painted with currentColor as a fill or an outline); read back after every theme change. */
function useResolved(theme: string) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState('')
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const raf = requestAnimationFrame(() => setValue(toHex(getComputedStyle(el).color)))
    return () => cancelAnimationFrame(raf)
  }, [theme])
  return [ref, value] as const
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(null), 1600)
    return () => clearTimeout(t)
  }, [copied])
  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(text)
  }
  return { copied, copy }
}

type CopyApi = ReturnType<typeof useCopy>

const matches = (filter: string, ...texts: string[]) => !filter || texts.some((t) => t.toLowerCase().includes(filter))

// ---- Swatch rows ----------------------------------------------------------------------------------

function TokenRow({ role, filter, theme, copy }: { role: Role; filter: string; theme: ReturnType<typeof useThemeKey>; copy: CopyApi }) {
  const [ref, hex] = useResolved(theme.key)
  const v = cssVar(role.token)
  if (!matches(filter, role.token, displayName(role.token), role.role, role.use)) return null
  const copied = copy.copied === `var(${v})`
  return (
    <li className={styles.row} data-token={role.token}>
      <button type="button" className={styles.rowButton} onClick={() => copy.copy(`var(${v})`)} aria-label={`Copy var(${v})`}>
        <span ref={ref} className={styles.chip} data-kind={isBorder(role.token) ? 'border' : 'fill'} style={{ color: `var(${v})` }} aria-hidden="true" />
        <span className={styles.rowText}>
          <span className={styles.tokenName}>
            {displayName(role.token)} <span className={styles.roleTag}>({role.role})</span>
          </span>
          <span className={styles.use}>{role.use}</span>
        </span>
        <span className={styles.rowMeta}>
          <code className={styles.var}>{copied ? 'Copied' : v}</code>
          <span className={styles.value}>{hex}{aliasOf(role.token, theme.id) && <> → {aliasOf(role.token, theme.id)}</>}</span>
        </span>
      </button>
    </li>
  )
}

function RoleList({ roles, ...rest }: { roles: Role[]; filter: string; theme: ReturnType<typeof useThemeKey>; copy: CopyApi }) {
  const visible = roles.filter((r) => matches(rest.filter, r.token, displayName(r.token), r.role, r.use))
  if (!visible.length) return <p className={styles.empty}>No tokens match.</p>
  return <ul className={styles.rows}>{roles.map((r) => <TokenRow key={r.token} role={r} {...rest} />)}</ul>
}

function MiniChip({ token, theme, copy, label }: { token: ThemeToken; theme: ReturnType<typeof useThemeKey>; copy: CopyApi; label?: string }) {
  const [ref, hex] = useResolved(theme.key)
  const v = cssVar(token)
  return (
    <button
      type="button"
      className={styles.mini}
      data-token={token}
      onClick={() => copy.copy(`var(${v})`)}
      title={`${token}\n${hex}${aliasOf(token, theme.id) ? ' → ' + aliasOf(token, theme.id) : ''}\nClick to copy var(${v})`}
      aria-label={`${label ?? token}: ${hex}. Copy var(${v})`}
    >
      <span ref={ref} className={styles.miniChip} data-kind={isBorder(token) ? 'border' : 'fill'} style={{ color: `var(${v})` }} aria-hidden="true" />
      <span className={styles.miniHex}>{copy.copied === `var(${v})` ? 'Copied' : hex}</span>
    </button>
  )
}

// ---- Sections ---------------------------------------------------------------------------------------

const sections = [
  { id: 'how', label: 'How colors are mapped' },
  { id: 'naming', label: 'Token naming' },
  { id: 'surface', label: 'Surface' },
  { id: 'content', label: 'Content' },
  { id: 'border', label: 'Border' },
  { id: 'accents', label: 'Accents' },
  { id: 'components', label: 'Component tokens' },
  { id: 'more', label: 'Static, gradients & extras' },
  { id: 'palette', label: 'Base palette' },
  { id: 'compare', label: 'Compare themes' },
] as const

function Section({ id, title, lede, children }: { id: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={`colors-${id}`} className={styles.section} aria-labelledby={`colors-${id}-title`}>
      <h2 id={`colors-${id}-title`}>{title}</h2>
      {lede && <p className={styles.lede}>{lede}</p>}
      {children}
    </section>
  )
}

/** One real token followed through the three layers, live for the current theme. */
function HowItWorks({ theme }: { theme: ReturnType<typeof useThemeKey> }) {
  return (
    <Section id="how" title="How colors are mapped" lede="Pick a color to see every token it feeds in the current theme, the components that use them, and the result. Build UI with semantic tokens.">
      <div className={styles.legend}>
        <span><strong>Base</strong> <Tag size="sm" variant="tertiary" color="error">Don't use</Tag></span>
        <span><strong>Semantic</strong> <Tag size="sm" variant="tertiary" color="success">Use in UI</Tag></span>
        <span><strong>Component</strong> <Tag size="sm" variant="tertiary" color="discover">Components only</Tag></span>
      </div>
      <TokenFlow themeId={theme.id} themeKey={theme.key} />
      <p className={styles.lede}>
        One green feeds two meanings — profit (market indicator) and success (status) — through different semantic tokens.
        The Buy button follows the brand, so its path changes with the brand you pick in the header.
      </p>

      <ul className={styles.ruleCards}>
        <li className={styles.ruleCard}>
          <div className={styles.ruleVisual} aria-hidden="true">
            <span className={styles.pairDemo}>Aa</span>
            <Tag size="sm" variant="secondary" color="discover">Info</Tag>
          </div>
          <strong>Pair by role</strong>
          <span>content on surface · an accent's content on its own light surface</span>
        </li>
        <li className={styles.ruleCard}>
          <div className={styles.ruleVisual} aria-hidden="true">
            <Tag size="sm" variant="secondary" color="profit">+2.4%</Tag>
            <Tag size="sm" variant="secondary" color="success">Placed</Tag>
          </div>
          <strong>Price ≠ outcome</strong>
          <span>profit / loss for prices · success / error for results</span>
        </li>
        <li className={styles.ruleCard}>
          <div className={`${styles.ruleVisual} ${styles.raisedDemo}`} aria-hidden="true">
            <span />
          </div>
          <strong>Raised = border</strong>
          <span>light mode: default and primary are both white — add border/light</span>
        </li>
        <li className={styles.ruleCard}>
          <div className={`${styles.ruleVisual} ${styles.overlayDemo}`} aria-hidden="true">
            <span />
          </div>
          <strong>Overlays</strong>
          <span>backdrops use surface/overlay</span>
        </li>
      </ul>
    </Section>
  )
}

/** Text on a solid accent fill, as the Tag component does: black on warning, white on profit / loss / success / error. */
const onSolid = (id: string): ThemeToken => (id === 'warning' ? 'static/black' : ['up', 'down', 'success', 'error'].includes(id) ? 'static/white' : 'content/inverted')

function AccentMatrix({ filter, theme, copy }: { filter: string; theme: ReturnType<typeof useThemeKey>; copy: CopyApi }) {
  const rows = accents.filter((a) => matches(filter, a.id, a.label, a.use, a.group, accentGroups.find((g) => g.id === a.group)?.label ?? '', ...accentSlots.map((s) => s.make(a.path))))
  return (
    <Section id="accents" title="Accents" lede="13 accent colors in 5 groups. Pick the group by meaning first, then the color. Every color has the same five slots: soft (light) pairs for tags and banners, default for solid fills and text.">
      {rows.length === 0 && <p className={styles.empty}>No tokens match.</p>}
      {accentGroups.map((g) => {
        const groupRows = rows.filter((a) => a.group === g.id)
        if (!groupRows.length) return null
        return (
          <div key={g.id} className={styles.group} data-group={g.id}>
            <div className={styles.groupHead}>
              <h3 className={styles.groupName}>{g.label}</h3>
              <p className={styles.groupUse}>{g.use}</p>
            </div>
            <div className={styles.tableScroll}>
              <table className={styles.matrix}>
                <caption className={styles.visuallyHidden}>{g.label} accent tokens</caption>
                <thead>
                  <tr>
                    <th scope="col">Color</th>
                    {accentSlots.map((s) => <th key={s.id} scope="col">{s.label}</th>)}
                    <th scope="col">Soft · solid</th>
                  </tr>
                </thead>
                <tbody>
                  {groupRows.map((a) => (
                    <tr key={a.id}>
                      <th scope="row">
                        <span className={styles.familyName}>{a.label}</span>
                        <span className={styles.familyUse}>{a.use}</span>
                      </th>
                      {accentSlots.map((s) => {
                        const t = s.make(a.path)
                        return <td key={s.id}>{isToken(t) ? <MiniChip token={t} theme={theme} copy={copy} label={`${a.label} ${s.label}`} /> : <span className={styles.na}>—</span>}</td>
                      })}
                      <td>
                        <span className={styles.samples}>
                          <span
                            className={styles.sample}
                            style={{
                              background: `var(${cssVar(`surface/accent/${a.path}-light` as ThemeToken)})`,
                              color: `var(${cssVar(`content/accent/${a.path}-default` as ThemeToken)})`,
                              boxShadow: `inset 0 0 0 1px var(${cssVar(`border/accent/${a.path}-light` as ThemeToken)})`,
                            }}
                          >
                            Label
                          </span>
                          <span className={styles.sample} style={{ background: `var(${cssVar(`surface/accent/${a.path}-default` as ThemeToken)})`, color: `var(${cssVar(onSolid(a.id))})` }}>
                            Label
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </Section>
  )
}

function ComponentTokens({ filter, theme, copy }: { filter: string; theme: ReturnType<typeof useThemeKey>; copy: CopyApi }) {
  const variants = buttonVariants.filter((v) => matches(filter, `component/button/${v}`, v, 'button'))
  const layers = stateLayers.filter((t) => matches(filter, t, 'state layer'))
  return (
    <Section id="components" title="Component tokens" lede="Used inside the components. Reach for them only when you build or extend that component.">
      <h3 className={styles.h3}>Button</h3>
      {variants.length === 0 ? <p className={styles.empty}>No tokens match.</p> : (
        <div className={styles.tableScroll}>
          <table className={styles.matrix}>
            <thead>
              <tr>
                <th scope="col">Variant</th>
                {buttonStates.map((st) => <th key={st.id} scope="col" colSpan={3}>{st.label}</th>)}
              </tr>
              <tr className={styles.subhead}>
                <th scope="col"><span className={styles.visuallyHidden}>Part</span></th>
                {buttonStates.flatMap((st) => buttonParts.map((p) => <th key={st.id + p} scope="col">{p}</th>))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v}>
                  <th scope="row">
                    <span className={styles.familyName}>{v}</span>
                    <Button size="sm" variant={v} tabIndex={-1} aria-hidden="true">Label</Button>
                  </th>
                  {buttonStates.flatMap((st) => buttonParts.map((p) => {
                    const t = `component/button/${v}/${p}${st.id}`
                    return <td key={st.id + p}>{isToken(t) ? <MiniChip token={t} theme={theme} copy={copy} /> : <span className={styles.na}>—</span>}</td>
                  }))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className={styles.h3}>State layers</h3>
      <p className={styles.lede}>Painted over a fill on hover and press. <code>dark</code> layers go on light fills, <code>light</code> layers on dark fills.</p>
      {layers.length > 0 && (
        <div className={styles.layerDemo}>
          {(['dark', 'light'] as const).map((tone) => (
            <div key={tone} className={styles.layerGroup} data-tone={tone}>
              <span className={styles.familyName}>{tone} · on {tone === 'dark' ? 'surface/primary' : 'surface/inverted'}</span>
              <div className={styles.layerRow}>
                {(['default', 'hover', 'pressed'] as const).map((state) => {
                  const t = `component/state-layer/${tone}/${state}` as ThemeToken
                  return (
                    <div key={state} className={styles.layerCell} data-token={t}>
                      <span className={styles.layerSwatch} style={{ backgroundImage: `linear-gradient(var(${cssVar(t)}), var(${cssVar(t)}))` }}>{state}</span>
                      <MiniChip token={t} theme={theme} copy={copy} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

function MoreTokens({ filter, theme, copy }: { filter: string; theme: ReturnType<typeof useThemeKey>; copy: CopyApi }) {
  const gradients = allTokens.filter((t) => t.startsWith('gradient-stop-0/') && matches(filter, t))
  const gold = allTokens.filter((t) => t.startsWith('extra/gold/') && matches(filter, t))
  return (
    <Section id="more" title="Static, gradients & extras">
      <h3 className={styles.h3}>Static</h3>
      <RoleList roles={statics} filter={filter} theme={theme} copy={copy} />

      <h3 className={styles.h3}>Gradient stops</h3>
      <p className={styles.lede}>
        <code>gradient-stop-0/x</code> is token <code>x</code> at 0% opacity — the transparent end of a fade, so the gradient stays in the
        same hue (no grey band). Fade a surface: <code>linear-gradient(var(--l3-gradient-stop-0-surface-primary), var(--l3-surface-primary))</code>.
      </p>
      <div className={styles.fades}>
        {['surface/primary', 'surface/inverted', 'accent/brand-default', 'accent/discover-light'].map((n) => {
          const end = n.startsWith('accent/') ? `surface/${n}` : n
          const stop = `gradient-stop-0/${n}`
          if (!isToken(stop) || !isToken(end) || !matches(filter, stop, end)) return null
          return (
            <div key={n} className={styles.fade} data-token={stop}>
              <span style={{ backgroundImage: `linear-gradient(90deg, var(${cssVar(stop)}), var(${cssVar(end)}))` }} />
              <code>{displayName(stop)}</code>
            </div>
          )
        })}
      </div>
      {gradients.length > 0 && (
        <details className={styles.details}>
          <summary>All {gradients.length} gradient stops</summary>
          <div className={styles.miniGrid}>
            {gradients.map((t) => <div key={t} className={styles.miniLabelled}><MiniChip token={t} theme={theme} copy={copy} /><code>{displayName(t.replace('gradient-stop-0/', ''))}</code></div>)}
          </div>
        </details>
      )}

      <h3 className={styles.h3}>extra/gold</h3>
      <p className={styles.lede}>A copy of the honey ramp, reversed in dark mode. <strong>Known gap</strong> — no values of its own yet; don't rely on it.</p>
      <div className={styles.rampRow}>
        {gold.map((t) => <div key={t} className={styles.miniLabelled}><MiniChip token={t} theme={theme} copy={copy} /><code>{t.split('/').pop()}</code></div>)}
      </div>
    </Section>
  )
}

function Palette({ filter, copy }: { filter: string; copy: CopyApi }) {
  const shown = ramps.filter((r) => matches(filter, r.ramp))
  return (
    <Section id="palette" title="Base palette" lede={<>The primitives every theme is built from. <strong>Reference only — don't use these in UI</strong>; the same ramps exist in every theme (only <code>BrandLogo</code> uses them directly).</>}>
      <div className={styles.ramps}>
        {shown.map(({ ramp, steps }) => (
          <div key={ramp} className={styles.ramp}>
            <span className={styles.rampName}>{ramp.replace(/^(hue|neutral)\//, '')}</span>
            <div className={styles.rampSteps}>
              {steps.map((s) => {
                const v = baseVar(s)
                const step = s.split('/').pop()
                return (
                  <button key={s} type="button" className={styles.step} style={{ background: `var(${v})` }} onClick={() => copy.copy(`var(${v})`)} aria-label={`${s}. Copy var(${v})`} title={`${s}\n${v}`} data-step={step}>
                    <span className={styles.stepLabel}>{copy.copied === `var(${v})` ? '✓' : step}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <h3 className={styles.h3}>Opacity</h3>
      <p className={styles.lede}>Opacity steps used by tokens such as content/secondary (60%) and surface/overlay (80%).</p>
      <div className={styles.opacityRow}>
        {opacityScale.map((o) => (
          <div key={o.step} className={styles.opacityStep}>
            <span style={{ opacity: o.value }} />
            <code>{o.step}</code>
          </div>
        ))}
      </div>
    </Section>
  )
}

const compareGroups = [
  { value: 'surface', label: 'Surface', tokens: surfaces.map((r) => r.token) },
  { value: 'content', label: 'Content', tokens: contents.map((r) => r.token) },
  { value: 'border', label: 'Border', tokens: borders.map((r) => r.token) },
  { value: 'accents', label: 'Accents', tokens: accents.map((a) => `surface/accent/${a.path}-default` as ThemeToken) },
  { value: 'button', label: 'Button', tokens: buttonVariants.map((v) => `component/button/${v}/surface` as ThemeToken).filter(isToken) },
]

const allThemes = [false, true].flatMap((accessible) =>
  products.flatMap((product) => productModes[product].map((mode) => ({ product, mode, accessible }))),
)

function CompareThemes({ filter }: { filter: string }) {
  const [group, setGroup] = useState('surface')
  const tokens = (compareGroups.find((g) => g.value === group)?.tokens ?? []).filter((t) => matches(filter, t))
  return (
    <Section id="compare" title="Compare themes" lede="One token across all 10 themes, including the ♿ Accessible versions.">
      <Tabs aria-label="Token group" appearance="pill" size="md" items={compareGroups.map(({ value, label }) => ({ value, label }))} value={group} onChange={setGroup} />
      <div className={styles.tableScroll}>
        <table className={`${styles.matrix} ${styles.compare}`}>
          <thead>
            <tr>
              <th scope="col">Token</th>
              {allThemes.map((t) => (
                <th key={`${t.product}-${t.mode}-${t.accessible}`} scope="col">
                  {t.accessible && '♿ '}{productLabels[t.product]}<br /><span className={styles.familyUse}>{t.mode}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokens.map((tok) => (
              <tr key={tok}>
                <th scope="row"><code className={styles.var}>{displayName(tok)}</code></th>
                {allThemes.map((t) => (
                  <td key={`${t.product}-${t.mode}-${t.accessible}`} data-product={t.product} data-mode={t.mode} data-contrast={t.accessible ? 'accessible' : undefined} className={styles.compareCell}>
                    <span className={styles.compareChip} data-kind={isBorder(tok) ? 'border' : 'fill'} style={{ color: `var(${cssVar(tok)})` }} title={`${tok} · ${aliasOf(tok, themeId(t.product, t.mode, t.accessible ? 'accessible' : 'default'))}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

// ---- Page ---------------------------------------------------------------------------------------------

export function ColorsPage() {
  const theme = useThemeKey()
  const copy = useCopy()
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'list' | 'tree'>(() => {
    try { return localStorage.getItem('l3-colors-view') === 'list' ? 'list' : 'tree' } catch { return 'tree' }
  })
  useEffect(() => {
    try { localStorage.setItem('l3-colors-view', view) } catch { /* storage unavailable */ }
  }, [view])
  const filter = query.trim().toLowerCase()
  const goTo = (id: string) => {
    document.getElementById(`colors-${id}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <TextField
          aria-label="Filter color tokens"
          placeholder="Filter tokens — e.g. border, profit, overlay"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          iconLeft={<Icon icon={msSearch} size={16} />}
        />
        <p className={styles.current}>
          Values shown for <strong>{theme.contrast === 'accessible' ? '♿ ' : ''}{productLabels[theme.product]} · {theme.mode === 'light' ? 'Light' : 'Dark'}</strong>.
          Change brand, mode or ♿ in the header. Click any color to copy its variable.
        </p>
        <nav className={styles.jump} aria-label="On this page">
          {sections.map((s) => (
            <Button key={s.id} size="sm" variant="tertiary" onClick={() => goTo(s.id)}>{s.label}</Button>
          ))}
        </nav>
      </div>

      <HowItWorks theme={theme} />
      <Section id="naming" title="Token naming" lede="Every name is built from the same parts, in the same order. Read a name left to right: what it paints, then which color, then how strong.">
        <TokenNaming />
      </Section>
      <div className={styles.viewToggle}>
        <div className={styles.viewText}>
          <span className={styles.viewLabel}>Surface, content, border & accents</span>
          <span className={styles.viewHint}>{view === 'list' ? 'Every token with its role, value and usage.' : 'How the roles branch into tokens.'}</span>
        </div>
        <Tabs
          aria-label="Semantic tokens view"
          appearance="pill"
          size="md"
          items={[
            { value: 'list', label: 'List', iconLeft: <Icon icon={msViewList} size={16} /> },
            { value: 'tree', label: 'Tree', iconLeft: <Icon icon={msAccountTree} size={16} /> },
          ]}
          value={view}
          onChange={setView}
        />
      </div>
      {view === 'list' ? (
        <>
          <Section id="surface" title="Surface" lede="Fills behind content, from the page background up to the most emphatic fill.">
            <RoleList roles={surfaces} filter={filter} theme={theme} copy={copy} />
          </Section>
          <Section id="content" title="Content" lede="Text and icons. Pick by importance, not by color.">
            <RoleList roles={contents} filter={filter} theme={theme} copy={copy} />
          </Section>
          <Section id="border" title="Border" lede="Hairlines (1px) and outlines.">
            <RoleList roles={borders} filter={filter} theme={theme} copy={copy} />
          </Section>
        </>
      ) : (
        <Section id="surface" title="Color roles" lede="Every neutral color token starts from one of four roles. Icons and text share the same content tokens. Hover a box to trace it; click a token to copy it.">
          {/* Jump targets for the Content / Border buttons in the toolbar. */}
          <span id="colors-content" aria-hidden="true" />
          <span id="colors-border" aria-hidden="true" />
          <SemanticTree filter={filter} copied={copy.copied} onCopy={copy.copy} />
        </Section>
      )}
      <AccentMatrix filter={filter} theme={theme} copy={copy} />
      <ComponentTokens filter={filter} theme={theme} copy={copy} />
      <MoreTokens filter={filter} theme={theme} copy={copy} />
      <Palette filter={filter} copy={copy} />
      <CompareThemes filter={filter} />

      <p className={styles.visuallyHidden} aria-live="polite">{copy.copied ? `Copied ${copy.copied}` : ''}</p>
    </div>
  )
}
