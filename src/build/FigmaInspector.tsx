// The edit box for a layer of a Figma board: its text, type, colors, size and position, visibility and deletion.
import { msArrowDownward, msArrowForward, msClose, msDelete, msFormatAlignCenter, msFormatAlignLeft, msFormatAlignRight, msVisibility, msVisibilityOff } from '../icons/material'
import { Group, Mini, Segmented, Select } from './controls'
import { plainText, solidColor, type AutoLayout, type Layer, type Sizing, type TextStyle } from './figmaLayers'
import type { Theme } from './controls'
import { textTokenStyle, textTokens } from './figmaTokens'
import { TokenColors } from './TokenColors'
import { IconButton } from './ui'
import styles from './Build.module.css'

const typeLabels: Record<Layer['type'], string> = { frame: 'Frame', group: 'Group', rect: 'Rectangle', vector: 'Vector', text: 'Text' }
const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const

type Props = {
  layer: Layer
  /** The layer that holds this one, to step up to; null for the board's root. */
  parent: Layer | null
  isRoot: boolean
  /** `key` groups quick successive edits of one field into a single undo step. */
  onChange: (change: (l: Layer) => Layer, key: string) => void
  onSelect: (id: string | null) => void
  onDelete: () => void
  /** Add auto layout (worked out from where the children are), or remove it (children keep their places). */
  onAutoLayout: (on: boolean) => void
  /** The canvas theme: color swatches show the token in it. */
  theme: Theme
}

const sizingLabels: Record<Sizing, string> = { fixed: 'Fixed', hug: 'Hug', fill: 'Fill' }

function NumberField({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <Mini label={label}>
      <input
        className={styles.fieldInput}
        type="number"
        value={Math.round(value * 100) / 100}
        min={min}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (e.target.value !== '' && Number.isFinite(v)) onChange(min !== undefined ? Math.max(min, v) : v)
        }}
      />
    </Mini>
  )
}

export function FigmaInspector({ layer, parent, isRoot, onChange, onSelect, onDelete, onAutoLayout, theme }: Props) {
  const text = layer.text
  // A style change applies to the whole text: set it on the base style and drop per-run overrides of that property.
  // Typing a size or weight by hand unlinks the text from its L3 text style (as detaching a style does in Figma).
  const setTextStyle = <K extends keyof TextStyle>(prop: K, value: TextStyle[K]) =>
    onChange((l) => {
      if (!l.text) return l
      const detach = prop === 'size' || prop === 'weight'
      const style = { ...l.text.style, [prop]: value, ...(detach ? { token: undefined } : {}) }
      return { ...l, text: { ...l.text, style, runs: l.text.runs.map((r) => ({ ...r, style: { ...r.style, [prop]: undefined, ...(detach ? { token: undefined } : {}) } })) } }
    }, `text-${prop}`)
  const tokenName = (t: string) => t.replace(/^(\w)/, (c) => c.toUpperCase()).replace('-', ' ')
  const fill = solidColor(layer.fills)
  const inFlow = !!parent?.layout && !layer.absolute
  const canHug = !!layer.layout || layer.type === 'text'
  const sizings: Sizing[] = ['fixed', ...(canHug ? ['hug' as const] : []), ...(inFlow ? ['fill' as const] : [])]
  const setLayout = (patch: Partial<AutoLayout>, key: string) => onChange((l) => (l.layout ? { ...l, layout: { ...l.layout, ...patch } } : l), key)
  const a = layer.layout
  const otherFill = layer.fills?.find((p) => p.kind !== 'solid')
  const strokeColor = solidColor(layer.strokes)

  return (
    <aside className={styles.inspector} data-variant="floating" aria-label="Layer properties">
      <div className={styles.floatHeader}>
        <span className={styles.popoverTitle} title={layer.name}>
          {layer.name.length > 24 ? `${layer.name.slice(0, 23)}…` : layer.name}
        </span>
        {parent && (
          <button type="button" className={styles.chip} onClick={() => onSelect(parent.id)} title="Select the layer that holds this one (Esc)">
            ‹ {parent.name.length > 14 ? `${parent.name.slice(0, 13)}…` : parent.name}
          </button>
        )}
        <IconButton icon={msClose} label="Deselect" onClick={() => onSelect(null)} />
      </div>
      <p className={styles.layerKind}>
        {typeLabels[layer.type]}
        {layer.component && ` · ${layer.component}`}
      </p>

      {text && (
        <Group title="Text">
          <textarea
            className={styles.fieldInput}
            aria-label="Text"
            rows={Math.min(6, Math.max(2, plainText(layer).split('\n').length))}
            value={plainText(layer)}
            onChange={(e) => {
              const value = e.target.value
              onChange((l) => (l.text ? { ...l, text: { ...l.text, runs: [{ text: value, style: l.text.runs[0]?.style ?? {} }] } } : l), 'text')
            }}
          />
          <Mini label={text.style.token ? 'Text style · L3' : 'Text style · not linked'}>
            <Select
              value={text.style.token ?? ''}
              options={['', ...textTokens]}
              format={(t) => (t ? tokenName(t) : 'None (Figma values)')}
              onChange={(t) =>
                onChange((l) => (l.text ? { ...l, text: { ...l.text, style: { ...l.text.style, ...(t ? textTokenStyle(t) : { token: undefined }) }, runs: l.text.runs.map((r) => ({ ...r, style: { ...r.style, token: undefined, size: undefined, weight: undefined, family: undefined, lineHeight: undefined } })) } } : l), 'text-token')
              }
            />
          </Mini>
          <div className={styles.pair}>
            <NumberField label="Size" value={text.style.size} min={1} onChange={(v) => setTextStyle('size', v)} />
            <Mini label="Weight">
              <Select value={(fontWeights as readonly number[]).includes(text.style.weight) ? text.style.weight : 400} options={fontWeights} onChange={(v) => setTextStyle('weight', v)} />
            </Mini>
          </div>
          <TokenColors label="Text color" role="text" value={text.style.color ?? text.runs[0]?.style.color} theme={theme} onPick={(c) => setTextStyle('color', c)} />
          <div className={styles.pair}>
            <Mini label="Align">
              <Segmented
                label="Text alignment"
                value={text.style.align === 'justify' ? 'left' : text.style.align}
                options={[
                  { value: 'left', label: 'Left', icon: msFormatAlignLeft },
                  { value: 'center', label: 'Centre', icon: msFormatAlignCenter },
                  { value: 'right', label: 'Right', icon: msFormatAlignRight },
                ]}
                onChange={(v) => setTextStyle('align', v)}
              />
            </Mini>
          </div>
          <p className={styles.hint} data-level="info">Font in Figma: {text.style.family}. Double-click the text on the canvas to type in place.</p>
        </Group>
      )}

      {layer.type !== 'text' && layer.type !== 'group' && (
        <Group title="Fill">
          {fill || !otherFill ? (
            <TokenColors
              label={layer.type === 'vector' ? 'Icon / shape color' : 'Fill'}
              role={layer.type === 'vector' ? 'icon' : 'fill'}
              value={fill}
              theme={theme}
              onPick={(c) => onChange((l) => {
                const fills = l.fills ?? []
                const i = fills.findIndex((p) => p.kind === 'solid')
                return { ...l, fills: i >= 0 ? fills.map((p, j) => (j === i ? { kind: 'solid', color: c } : p)) : [...fills, { kind: 'solid', color: c }] }
              }, 'fill')}
            />
          ) : (
            <Mini label="Fill">
              <span className={styles.fieldValue}>{otherFill.kind === 'image' ? 'Image' : 'Gradient'}</span>
            </Mini>
          )}
          {strokeColor && (
            <TokenColors
              label="Border"
              role={layer.type === 'vector' ? 'icon' : 'stroke'}
              value={strokeColor}
              theme={theme}
              onPick={(c) => onChange((l) => ({ ...l, strokes: l.strokes?.map((p, j) => (j === l.strokes!.findIndex((q) => q.kind === 'solid') ? { kind: 'solid', color: c } : p)) }), 'stroke')}
            />
          )}
          {(layer.type === 'frame' || layer.type === 'rect') && (
            <div className={styles.pair}>
              <NumberField label="Corner radius" value={typeof layer.radius === 'number' ? layer.radius : layer.radius?.[0] ?? 0} min={0} onChange={(v) => onChange((l) => ({ ...l, radius: v }), 'radius')} />
            </div>
          )}
        </Group>
      )}

      {(layer.type === 'frame' || layer.type === 'group') && (
        <Group title="Auto layout">
          {a ? (
            <>
              <div className={styles.pair}>
                <Mini label="Direction">
                  <Segmented
                    label="Direction"
                    value={a.dir}
                    options={[{ value: 'column', label: 'Vertical', icon: msArrowDownward }, { value: 'row', label: 'Horizontal', icon: msArrowForward }]}
                    onChange={(dir) => setLayout({ dir }, 'dir')}
                  />
                </Mini>
                <NumberField label={a.spaceBetween ? 'Gap (auto)' : 'Gap'} value={a.gap} min={0} onChange={(gap) => setLayout({ gap, spaceBetween: undefined }, 'gap')} />
              </div>
              <div className={styles.pair}>
                <NumberField label="Padding top" value={a.padding[0]} min={0} onChange={(v) => setLayout({ padding: [v, a.padding[1], a.padding[2], a.padding[3]] }, 'pt')} />
                <NumberField label="Padding bottom" value={a.padding[2]} min={0} onChange={(v) => setLayout({ padding: [a.padding[0], a.padding[1], v, a.padding[3]] }, 'pb')} />
              </div>
              <div className={styles.pair}>
                <NumberField label="Padding left" value={a.padding[3]} min={0} onChange={(v) => setLayout({ padding: [a.padding[0], a.padding[1], a.padding[2], v] }, 'pl')} />
                <NumberField label="Padding right" value={a.padding[1]} min={0} onChange={(v) => setLayout({ padding: [a.padding[0], v, a.padding[2], a.padding[3]] }, 'pr')} />
              </div>
              <div className={styles.pair}>
                <Mini label="Align items">
                  <Select value={a.align === 'baseline' ? 'start' : a.align} options={['start', 'center', 'end'] as const} format={(v) => ({ start: a.dir === 'row' ? 'Top' : 'Left', center: 'Centre', end: a.dir === 'row' ? 'Bottom' : 'Right' })[v]} onChange={(align) => setLayout({ align }, 'align')} />
                </Mini>
                <Mini label="Distribute">
                  <Select
                    value={a.spaceBetween ? 'between' : a.justify}
                    options={['start', 'center', 'end', 'between'] as const}
                    format={(v) => ({ start: 'Packed at start', center: 'Packed in centre', end: 'Packed at end', between: 'Space between' })[v]}
                    onChange={(v) => setLayout(v === 'between' ? { spaceBetween: true } : { justify: v, spaceBetween: undefined }, 'justify')}
                  />
                </Mini>
              </div>
              <button type="button" className={styles.chip} onClick={() => onAutoLayout(false)}>Remove auto layout</button>
            </>
          ) : (
            <>
              <p className={styles.hint} data-level="info">Stack the items inside in a row or column, so dragging one reorders the rest.</p>
              <button type="button" className={styles.chip} onClick={() => onAutoLayout(true)} disabled={!layer.children?.length}>Add auto layout</button>
            </>
          )}
        </Group>
      )}

      <Group title="Layout">
        {inFlow && (
          <div className={styles.pair}>
            <Mini label="Width resizing">
              <Select value={layer.sizeW ?? 'fixed'} options={sizings} format={(v) => sizingLabels[v]} onChange={(v) => onChange((l) => ({ ...l, sizeW: v === 'fixed' ? undefined : v }), 'sizeW')} />
            </Mini>
            <Mini label="Height resizing">
              <Select value={layer.sizeH ?? 'fixed'} options={sizings} format={(v) => sizingLabels[v]} onChange={(v) => onChange((l) => ({ ...l, sizeH: v === 'fixed' ? undefined : v }), 'sizeH')} />
            </Mini>
          </div>
        )}
        {inFlow && <p className={styles.hint} data-level="info">Placed by auto layout: drag it, or use the arrow keys, to change its place.</p>}
        {!isRoot && !inFlow && (
          <div className={styles.pair}>
            <NumberField label="X" value={layer.t[4]} onChange={(v) => onChange((l) => ({ ...l, t: [l.t[0], l.t[1], l.t[2], l.t[3], v, l.t[5]] }), 'x')} />
            <NumberField label="Y" value={layer.t[5]} onChange={(v) => onChange((l) => ({ ...l, t: [l.t[0], l.t[1], l.t[2], l.t[3], l.t[4], v] }), 'y')} />
          </div>
        )}
        <div className={styles.pair}>
          <NumberField label="Width" value={layer.w} min={0} onChange={(v) => onChange((l) => ({ ...l, w: v, ...(l.text ? { text: { ...l.text, autoWidth: false } } : {}) }), 'w')} />
          <NumberField label="Height" value={layer.h} min={0} onChange={(v) => onChange((l) => ({ ...l, h: v }), 'h')} />
        </div>
        <Mini label={`Opacity · ${Math.round((layer.opacity ?? 1) * 100)}%`}>
          <input type="range" min={0} max={100} value={Math.round((layer.opacity ?? 1) * 100)} onChange={(e) => onChange((l) => ({ ...l, opacity: Number(e.target.value) / 100 }), 'opacity')} />
        </Mini>
      </Group>

      {!isRoot && (
        <Group title="Layer">
          <div className={styles.layerActions}>
            <IconButton icon={layer.hidden ? msVisibility : msVisibilityOff} label={layer.hidden ? 'Show layer' : 'Hide layer'} onClick={() => onChange((l) => ({ ...l, hidden: !l.hidden }), 'hidden')} />
            <IconButton icon={msDelete} label="Delete layer (Delete key)" onClick={onDelete} />
          </div>
        </Group>
      )}
    </aside>
  )
}
