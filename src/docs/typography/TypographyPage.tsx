import { useMemo, useState, type ReactNode } from 'react'
import { textRoles, textStyles } from '../../tokens'
import { ComponentTree, type ComponentTreeSpec, type TreeGroup } from '../ComponentTree'
import { Switch } from '../../components/Switch'
import styles from './TypographyPage.module.css'

// Typography foundation page. Roles (Display · Heading · Label · Paragraph) are the Figma text style names;
// in code each is an alias of a weight-named style (--l3-text-label-12 → --l3-text-semibold-12).
// The roles are still a draft in Figma — guidance below will change.

type RoleId = 'display' | 'heading' | 'label' | 'paragraph'

const roles: { id: RoleId; title: string; weight: string; note: string; use: string; example: string }[] = [
  { id: 'display', title: 'Display', weight: 'ExtraBold 800', note: 'Numbers & big titles', use: 'Data people look for first: prices, P&L, balances, the main number on a screen. Larger sizes for screen titles.', example: '₹24,812.35' },
  { id: 'heading', title: 'Heading', weight: 'Bold 700', note: 'Section titles', use: 'Titles of sections and cards. Heading / Section (ExtraBold 14) is the standard section heading on a screen.', example: 'Open positions' },
  { id: 'label', title: 'Label', weight: 'SemiBold 600', note: 'UI text', use: 'Text on and around controls: buttons, tabs, tags, list titles, field labels. Label 10 for small roles and meta.', example: 'Buy · NIFTY 50' },
  { id: 'paragraph', title: 'Paragraph', weight: 'Medium 500', note: 'Reading text', use: 'Descriptions, helper text and anything people read as sentences. 10–18 only.', example: 'Orders placed after 3:30 pm go through the next trading day.' },
]

const scales = [
  { id: 'sm', label: 'Small', note: '10–14', sizes: [10, 12, 14] },
  { id: 'md', label: 'Medium', note: '16–20', sizes: [16, 18, 20] },
  { id: 'lg', label: 'Large', note: '24–36', sizes: [24, 28, 32, 36] },
]

const sizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36]
const lineHeight = (size: number) => textStyles.find((s) => s.fontSize === size)?.lineHeight
const roleVar = (role: RoleId, size: number | 'section') => textRoles.find((r) => r.role === `${role}/${size}`)

function Section({ id, title, lede, children }: { id: string; title: string; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={`type-${id}`} className={styles.section} aria-labelledby={`type-${id}-title`}>
      <div className={styles.sectionHead}>
        <h2 id={`type-${id}-title`}>{title}</h2>
        {lede && <p className={styles.lede}>{lede}</p>}
      </div>
      {children}
    </section>
  )
}

export function TypographyPage() {
  const [sample, setSample] = useState('Aa ₹24,812')
  const [showExamples, setShowExamples] = useState(true)

  const tree = useMemo<ComponentTreeSpec>(() => ({
    title: 'Typography',
    note: 'Manrope · 4 roles · 34 styles',
    branches: roles.map((r) => {
      const groups: TreeGroup[] = scales
        .map((sc) => ({
          id: `${r.id}-${sc.id}`,
          label: sc.label,
          note: sc.note,
          leaves: sc.sizes.flatMap((size) => {
            const t = roleVar(r.id, size)
            if (!t) return []
            return [{
              id: t.cssVar,
              label: t.cssVar.replace('--l3-text-', ''),
              note: `${size}/${lineHeight(size)}`,
              preview: <span className={styles.treeSample} style={{ font: `var(${t.cssVar})` }}>{sample}</span>,
            }]
          }),
        }))
        .filter((g) => g.leaves.length > 0)
      const section = r.id === 'heading' ? roleVar('heading', 'section') : undefined
      if (section) groups.unshift({ id: 'heading-special', label: 'Section', note: 'ExtraBold 14/20', leaves: [{ id: section.cssVar, label: 'heading-section', note: 'Standard section heading', preview: <span className={styles.treeSample} style={{ font: `var(${section.cssVar})` }}>{sample}</span> }] })
      return { id: r.id, label: r.title, note: r.weight, groups }
    }),
  }), [sample])

  const legacy = textStyles.filter((s) => 'legacy' in s)

  return (
    <div className={styles.page}>
      <p className={styles.wip}>
        <strong>Work in progress.</strong> The roles come from Figma but their rules are still being defined — sizes and usage below may change.
      </p>

      <Section id="roles" title="Type roles" lede="Every style is Manrope. A role sets the weight and what the text is for; the size sets how loud it is. Hover a box to trace it.">
        <div className={styles.controls}>
          <label className={styles.toggle}>
            <Switch checked={showExamples} onChange={(e) => setShowExamples(e.target.checked)} />
            <span>Show examples</span>
          </label>
          {showExamples && (
            <label className={styles.sample}>
              <span>Sample text</span>
              <input value={sample} onChange={(e) => setSample(e.target.value)} />
            </label>
          )}
        </div>
        <ComponentTree spec={tree} showPreviews={showExamples} />
      </Section>

      <Section id="use" title="Which role to use" lede="Pick the role by what the text does, then the size by how important it is. Draft guidance from the Figma annotations.">
        <ul className={styles.roleCards}>
          {roles.map((r) => (
            <li key={r.id} className={styles.roleCard}>
              <span className={styles.roleExample} style={{ font: `var(--l3-text-${r.id === 'paragraph' ? 'paragraph-14' : r.id === 'heading' ? 'heading-section' : r.id === 'display' ? 'display-24' : 'label-14'})` }}>{r.example}</span>
              <span className={styles.roleTitle}>{r.title} <span className={styles.roleWeight}>{r.weight}</span></span>
              <span className={styles.roleUse}>{r.use}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="scale" title="Type scale" lede="One size scale for every role: the line height belongs to the size. A dash means the role doesn't have that size in Figma.">
        <div className={styles.tableScroll}>
          <table className={styles.scale}>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">Line height</th>
                {roles.map((r) => <th key={r.id} scope="col">{r.title}</th>)}
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size}>
                  <th scope="row">{size}</th>
                  <td>{lineHeight(size)}</td>
                  {roles.map((r) => {
                    const t = roleVar(r.id, size)
                    return (
                      <td key={r.id} data-token={t?.cssVar.replace('--l3-', '')}>
                        {t ? <span className={styles.cell} style={{ font: `var(${t.cssVar})` }} title={`${t.cssVar} = ${t.alias}`} data-token={t.alias.replace('--l3-', '')}>Aa</span> : <span className={styles.none} aria-label="Not available">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="code" title="Using it in code" lede="Each style is one font shorthand token. Use the role name; the weight names still work and point to the same values.">
        <pre className={styles.code}><code>{`.title {\n  font: var(--l3-text-heading-section); /* Figma L3/Heading - B/Section */\n}\n\n.price {\n  font: var(--l3-text-display-24);     /* = var(--l3-text-extrabold-24) */\n}`}</code></pre>
        <p className={styles.lede}>Parts are available too, e.g. <code>--l3-text-semibold-12-size</code>, <code>-line-height</code>, <code>-weight</code> and <code>-letter-spacing</code>.</p>
      </Section>

      <Section id="legacy" title="Legacy styles" lede="In code but no longer a Figma text style. Don't use them in new work; they stay until the code that uses them moves to a role.">
        <ul className={styles.legacy}>
          {legacy.map((s) => (
            <li key={s.cssVar} data-token={s.cssVar.replace('--l3-', '')}>
              <span className={styles.legacySample} style={{ font: `var(${s.cssVar})` }}>Aa</span>
              <code>{s.cssVar.replace('--l3-', '')}</code>
              <span>{s.fontSize}/{s.lineHeight}</span>
              <span className={styles.legacyNote}>{'legacy' in s ? s.legacy : ''}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  )
}
