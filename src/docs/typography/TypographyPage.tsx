import { useMemo, useState, type ReactNode } from 'react'
import { textStyles } from '../../tokens'
import { ComponentTree, type ComponentTreeSpec, type TreeLeaf } from '../ComponentTree'
import { Switch } from '../../components/Switch'
import styles from './TypographyPage.module.css'

// Typography foundation page: three roles — Heading (750), Label (650), Description (500) — each a size scale,
// every style one token: --l3-text-<role>-<size>. Usage rules per role are still a draft.

type Style = (typeof textStyles)[number]
type Role = Style['role']

const roles: { role: Role; title: string; weight: string; note: string; use: string; example: string; exampleSize: number }[] = [
  { role: 'heading', title: 'Heading', weight: '750', note: 'Main headings and key numbers', use: 'The main heading of a page or section, or the most prominent number on the page when it is 18px or larger.', example: '₹24,812.35', exampleSize: 24 },
  { role: 'label', title: 'Label', weight: '650', note: 'Labels, input text, small numbers', use: 'A literal label — a tab, tag or field label — the text typed into an input field, or a small number.', example: 'Buy · NIFTY 50', exampleSize: 14 },
  { role: 'description', title: 'Description', weight: '500', note: 'Describes a heading or label', use: 'The description of a heading or a label. Never use it to show a number — numbers are Label, or Heading when prominent and 18px or larger.', example: 'Orders go through on the next trading day.', exampleSize: 14 },
]

const sizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36]
const inScale = textStyles.filter((s) => !('local' in s))
const styleFor = (role: Role, size: number) => inScale.find((s) => s.role === role && s.size === String(size))
const lineHeight = (size: number) => inScale.find((s) => s.fontSize === size)?.lineHeight
const short = (cssVar: string) => cssVar.replace('--l3-text-', '')

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
  const [showExamples, setShowExamples] = useState(false)

  const tree = useMemo<ComponentTreeSpec>(() => ({
    title: 'Typography',
    note: `Manrope · ${roles.length} roles · ${inScale.length} styles`,
    // The branch names the role, so a leaf only shows its size; LH and PS sit on the right.
    branches: roles.map((r) => ({
      id: r.role,
      label: r.title,
      note: `${r.note} · ${r.weight}`,
      leaves: inScale.filter((s) => s.role === r.role).map((s): TreeLeaf => ({
        id: s.cssVar,
        label: s.size,
        note: `LH ${s.lineHeight}${s.paragraphSpacing ? ` · PS ${s.paragraphSpacing}` : ''}`,
        preview: <span className={styles.treeSample} style={{ font: `var(${s.cssVar})` }}>{sample}</span>,
      })),
    })),
  }), [sample])

  const local = textStyles.filter((s) => 'local' in s)

  return (
    <div className={styles.page}>
      <p className={styles.wip}>
        <strong>Work in progress.</strong> The styles match Figma; the rules for when to use each role are still being defined, so the guidance below may change.
      </p>

      <Section id="roles" title="Type roles" lede="Every style is Manrope. The role says what the text is (Heading, Label, Description) and sets the weight; the size says how loud it is. LH = line height, PS = paragraph spacing. Hover a box to trace it.">
        <ComponentTree
          spec={tree}
          inlineNotes
          largeText
          showPreviews={showExamples}
          controls={
            <>
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
            </>
          }
        />
      </Section>

      <Section id="use" title="Which role to use" lede="Pick the role by what the text is. Size rules come later.">
        <ul className={styles.roleCards}>
          {roles.map((r) => {
            const example = styleFor(r.role, r.exampleSize)
            return (
              <li key={r.role} className={styles.roleCard}>
                <span className={styles.roleExample} style={{ font: example ? `var(${example.cssVar})` : undefined }}>{r.example}</span>
                <span className={styles.roleTitle}>{r.title} <span className={styles.roleWeight}>{r.weight}</span></span>
                <span className={styles.roleUse}>{r.use}</span>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section id="scale" title="Type scale" lede="One size scale for every role: the line height belongs to the size. A dash means the role doesn't have that size.">
        <div className={styles.tableScroll}>
          <table className={styles.scale}>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">Line height</th>
                {roles.map((r) => <th key={r.role} scope="col">{r.title} · {r.weight}</th>)}
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size}>
                  <th scope="row">{size}</th>
                  <td>{lineHeight(size)}</td>
                  {roles.map((r) => {
                    const s = styleFor(r.role, size)
                    return (
                      <td key={r.role} data-token={s?.cssVar.replace('--l3-', '')}>
                        {s
                          ? <span className={styles.cell} style={{ font: `var(${s.cssVar})` }} title={`${s.cssVar} · ${s.figmaName}${s.paragraphSpacing ? ` · paragraph spacing ${s.paragraphSpacing}` : ''}`}>Aa</span>
                          : <span className={styles.none} aria-label="Not available">—</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="code" title="Using it in code" lede="Each style is one font shorthand token: --l3-text-<role>-<size>. Never set font-size, weight or line-height on their own.">
        <pre className={styles.code}><code>{`.title {
  font: var(--l3-text-heading-14);        /* section title, 750 */
}

.price {
  font: var(--l3-text-heading-24);        /* key number, 750 */
}

.tab {
  font: var(--l3-text-label-14);          /* UI label, 650 */
}

.helper p + p {
  font: var(--l3-text-description-12);    /* reading text, 500 */
  margin-top: var(--l3-text-description-12-paragraph-spacing);
}`}</code></pre>
        <p className={styles.lede}>Every style also has parts: <code>-size</code>, <code>-weight</code>, <code>-line-height</code>, <code>-letter-spacing</code> and <code>-paragraph-spacing</code>. The base values are tokens too: <code>--l3-font-size-200</code>, <code>--l3-line-height-200</code>, <code>--l3-font-weight-750</code>.</p>
      </Section>

      {local.length > 0 && (
        <Section id="local" title="Local styles" lede="Used in code but not part of the scale — set directly on one layer in Figma.">
          <ul className={styles.legacy}>
            {local.map((s) => (
              <li key={s.cssVar} data-token={s.cssVar.replace('--l3-', '')}>
                <span className={styles.legacySample} style={{ font: `var(${s.cssVar})` }}>Aa</span>
                <code>{short(s.cssVar)}</code>
                <span>{s.fontSize}/{s.lineHeight}</span>
                <span className={styles.legacyNote}>{'local' in s ? s.local : ''}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
