import { useMemo, useState, type ReactNode } from 'react'
import { textStyles } from '../../tokens'
import { ComponentTree, type ComponentTreeSpec, type TreeLeaf } from '../ComponentTree'
import { Switch } from '../../components/Switch'
import styles from './TypographyPage.module.css'

// Typography foundation page, mirroring Figma "🅰️ Typography": three families (Heading · Label · Description), each
// split into the Figma sub-categories, every style one token: --l3-text-<role>-<size>.
// Usage rules for each role are still being defined in Figma — the guidance below is a draft.

type Style = (typeof textStyles)[number]
type Role = Style['role']

/** Figma families → sub-categories (each a role in code). */
const families: { id: string; title: string; note: string; roles: { role: Role; label: string; weight: string; use: string; example: string }[] }[] = [
  {
    id: 'heading', title: 'Heading', note: 'Titles and key numbers',
    roles: [
      { role: 'heading-primary', label: 'Primary', weight: 'ExtraBold 800', use: 'Screen and sheet titles, and the numbers people look for first — prices, P&L, balances.', example: '₹24,812.35' },
      { role: 'heading-secondary', label: 'Secondary', weight: 'Bold 700', use: 'Section and card titles. Section (ExtraBold 14) is the standard section heading on a screen.', example: 'Open positions' },
    ],
  },
  {
    id: 'label', title: 'Label', note: 'UI text',
    roles: [
      { role: 'label-primary', label: 'Primary', weight: 'SemiBold 600', use: 'Text on and around controls: buttons, tabs, tags, list titles, field labels.', example: 'Buy · NIFTY 50' },
      { role: 'label-secondary', label: 'Secondary', weight: 'Medium 500', use: 'A quieter label next to a primary one: input text, values in key–value rows, meta.', example: 'Qty 25 · LTP' },
    ],
  },
  {
    id: 'description', title: 'Description', note: 'Supporting & reading text',
    roles: [
      { role: 'description', label: 'Description', weight: 'Medium 500', use: 'Descriptions, helper text, captions and any text read as sentences. Comes with paragraph spacing between paragraphs.', example: 'Orders placed after 3:30 pm go through the next trading day.' },
    ],
  },
]
const allRoles = families.flatMap((f) => f.roles)

const sizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36]
const inFigma = textStyles.filter((s) => !('local' in s))
const styleFor = (role: Role, size: number | 'section') => inFigma.find((s) => s.role === role && s.size === String(size))
const lineHeight = (size: number) => inFigma.find((s) => s.fontSize === size)?.lineHeight
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

  const tree = useMemo<ComponentTreeSpec>(() => {
    // The branch and group already name the role, so a leaf only shows its size (or "Section").
    const leaf = (s: Style): TreeLeaf => ({
      id: s.cssVar,
      label: s.size === 'section' ? 'Section' : s.size,
      // Short note shown on the right of the label: Section's font size, line height (LH), paragraph spacing (PS).
      note: `${s.size === 'section' ? `${s.fontSize} · ` : ''}LH ${s.lineHeight}${s.paragraphSpacing ? ` · PS ${s.paragraphSpacing}` : ''}`,
      preview: <span className={styles.treeSample} style={{ font: `var(${s.cssVar})` }}>{sample}</span>,
    })
    return {
      title: 'Typography',
      note: `Manrope · ${allRoles.length} roles · ${inFigma.length} styles`,
      branches: families.map((f) => {
        const groups = f.roles.map((r) => {
          const list = inFigma.filter((s) => s.role === r.role)
          return { id: r.role, label: r.label, note: `${r.weight} · ${list.length} styles`, leaves: list.map(leaf) }
        })
        // A family with one role (Description) hangs its styles straight off the branch.
        return groups.length === 1
          ? { id: f.id, label: f.title, note: `${f.note} · ${f.roles[0].weight}`, leaves: groups[0].leaves }
          : { id: f.id, label: f.title, note: f.note, groups }
      }),
    }
  }, [sample])

  const local = textStyles.filter((s) => 'local' in s)

  return (
    <div className={styles.page}>
      <p className={styles.wip}>
        <strong>Work in progress.</strong> The styles match Figma; the rules for when to use each role are still being defined, so the guidance below may change.
      </p>

      <Section id="roles" title="Type roles" lede="Every style is Manrope. The family says what the text is (Heading, Label, Description), the sub-category how strong it is, and the size how loud. LH = line height, PS = paragraph spacing. Hover a box to trace it.">
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

      <Section id="use" title="Which role to use" lede="Pick the role by what the text does, then the size by how important it is. Draft guidance.">
        <ul className={styles.roleCards}>
          {allRoles.map((r) => {
            const example = styleFor(r.role, r.role === 'heading-primary' ? 24 : r.role === 'heading-secondary' ? 'section' : 14)
            return (
              <li key={r.role} className={styles.roleCard}>
                <span className={styles.roleExample} style={{ font: example ? `var(${example.cssVar})` : undefined }}>{r.example}</span>
                <span className={styles.roleTitle}>
                  {families.find((f) => f.roles.includes(r))?.title}{r.role !== 'description' && ` · ${r.label}`} <span className={styles.roleWeight}>{r.weight}</span>
                </span>
                <span className={styles.roleUse}>{r.use}</span>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section id="scale" title="Type scale" lede="One size scale for every role: the line height belongs to the size. A dash means the role doesn't have that size in Figma.">
        <div className={styles.tableScroll}>
          <table className={styles.scale}>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">Line height</th>
                {allRoles.map((r) => <th key={r.role} scope="col">{r.role === 'description' ? 'Description' : `${families.find((f) => f.roles.includes(r))?.title} ${r.label.toLowerCase()}`}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...sizes, 'section' as const].map((size) => (
                <tr key={size}>
                  <th scope="row">{size === 'section' ? 'Section' : size}</th>
                  <td>{size === 'section' ? lineHeight(14) : lineHeight(size)}</td>
                  {allRoles.map((r) => {
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

      <Section id="code" title="Using it in code" lede="Each style is one font shorthand token named after its Figma style. Never set font-size, weight or line-height on their own.">
        <pre className={styles.code}><code>{`.title {
  font: var(--l3-text-heading-secondary-section); /* 🔷 L3/Heading/secondary/Section */
}

.price {
  font: var(--l3-text-heading-primary-24);        /* 🔷 L3/Heading/primary/24 */
}

.helper p + p {
  font: var(--l3-text-description-12);            /* 🔷 L3/Description - M/12 */
  margin-top: var(--l3-text-description-12-paragraph-spacing);
}`}</code></pre>
        <p className={styles.lede}>Every style also has parts: <code>-size</code>, <code>-weight</code>, <code>-line-height</code>, <code>-letter-spacing</code> and <code>-paragraph-spacing</code>. The base values are tokens too: <code>--l3-font-size-200</code>, <code>--l3-line-height-200</code>, <code>--l3-font-weight-bold</code>.</p>
      </Section>

      {local.length > 0 && (
        <Section id="local" title="Local styles" lede="Used in code but not a Figma text style — Figma sets these values directly on one layer.">
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
