import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { PhoneFrame } from '../docs/PhoneFrame'
import { useViewportWidth } from '../docs/viewport'
import { useTheme } from '../theme'
import { productLabels, productModes, products, resolveMode, type Mode, type Product } from '../tokens/themes'
import {
  msAdd, msArrowBack, msArrowForward, msArrowSelectorTool, msArrowSelectorToolFill, msArrowUpward, msAttachFile, msChat,
  msChevronRight, msCode, msDarkMode, msDragIndicator, msFolder, msKeyboardArrowDown, msLanguage, msLightMode, msMic,
  msOpenInFull, msPlayArrow, msRefresh, msSettings, msThumbDown, msThumbUp, msViewSidebar,
} from '../icons/material'
import {
  baseIdOf, colorVar, findNode, flatten, moveNode, partLabels, partOf, partsOf, radiusVar, spacingVar, textFont, updateNode,
  type DesignNode, type IconSpec,
} from './design'
import { Inspector } from './Inspector'
import { useIconCatalog } from './useIconCatalog'
import { IconButton } from './ui'
import styles from './Build.module.css'

type Message = { role: 'user' | 'assistant'; text: string; target?: string }
type Tab = 'browser' | 'files'

/** Sample screen. Generated screens will produce the same tree. */
const initialTree: DesignNode[] = [
  {
    id: 'hero', kind: 'section', name: 'Hero', gap: '08',
    children: [
      { id: 'title', kind: 'heading', name: 'Heading', text: 'Sample screen', weight: 'semibold', size: 20, color: 'primary' },
      { id: 'body', kind: 'text', name: 'Text', text: 'Turn on the cursor in the chat box, then click a part to edit it. Drag the handle to move it.', weight: 'regular', size: 14, color: 'secondary' },
    ],
  },
  {
    id: 'actions', kind: 'section', name: 'Actions', gap: '12',
    children: [
      { id: 'cta', kind: 'button', name: 'Button', text: 'Continue', variant: 'primary', iconRight: {} },
      { id: 'skip', kind: 'button', name: 'Button', text: 'Skip for now', variant: 'tertiary' },
    ],
  },
]

const welcome: Message = {
  role: 'assistant',
  text: 'Hey! Upload a PRD or describe a screen and I will design it with Lemonnade components. (Generation is not connected yet, so the canvas shows a sample.)',
}

const alignItems = { stretch: 'stretch', start: 'flex-start', center: 'center', end: 'flex-end' } as const

type Drop = { container: string | null; index: number; line: { top: number; left: number; width: number } }

/**
 * A selectable box in the design. Every node the renderer draws carries `data-node`; sections also carry
 * `data-container`, which is where things can be dropped. Keyboard access is through the Layers list in the inspector.
 */
function Pickable({ id, container, selected, hover, dragging, dropTarget, style, children }: {
  id: string; container?: boolean; selected: boolean; hover: boolean; dragging: boolean; dropTarget: boolean; style?: CSSProperties; children: ReactNode
}) {
  return (
    <div
      data-node={id}
      data-container={container ? id : undefined}
      data-selected={selected || undefined}
      data-hover={hover || undefined}
      data-dragging={dragging || undefined}
      data-drop={dropTarget || undefined}
      style={style}
    >
      {children}
    </div>
  )
}

/**
 * A selectable part inside a node (a button's label or icon). Mouse only: it sits inside a <button>, which can't hold
 * focusable children, so the keyboard reaches parts through the Layers list.
 */
function PartMark({ id, selected, hover, color, children }: { id: string; selected: boolean; hover: boolean; color?: string; children: ReactNode }) {
  return (
    <span className={styles.part} data-node={id} data-selected={selected || undefined} data-hover={hover || undefined} style={color ? { color } : undefined}>
      {children}
    </span>
  )
}

/** Text that becomes editable in place while its node is selected. Enter or clicking away saves, Esc cancels. */
function EditableText({ as, editing, value, style, className, onCommit }: {
  as: 'h2' | 'p'; editing: boolean; value: string; style: CSSProperties; className: string; onCommit: (text: string) => void
}) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!editing || !el) return
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [editing])

  const props = {
    ref: (el: HTMLElement | null) => { ref.current = el },
    className,
    style,
    contentEditable: editing ? ('plaintext-only' as const) : undefined,
    suppressContentEditableWarning: true,
    spellCheck: false,
    onBlur: () => { if (editing && ref.current) onCommit(ref.current.textContent ?? '') },
    onKeyDown: (e: KeyboardEvent) => {
      if (!editing || !ref.current) return
      if (e.key === 'Enter') { e.preventDefault(); ref.current.blur() }
      if (e.key === 'Escape') { ref.current.textContent = value; ref.current.blur() }
    },
  }
  return as === 'h2' ? <h2 {...props}>{value}</h2> : <p {...props}>{value}</p>
}

/**
 * Build: PM uploads a PRD, screens are generated on the canvas, edited inline, then exported.
 * Generation and export are placeholders; selecting, editing and moving the sample design works.
 */
export function BuildPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('Untitled design')
  const [tab, setTab] = useState<Tab>('browser')
  const [prd, setPrd] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Message[]>([welcome])
  // The canvas has its own product theme and light/dark mode (they start from the app theme) — the app chrome is not affected.
  const { product: appProduct, mode: appMode } = useTheme()
  const [canvasProduct, setCanvasProduct] = useState<Product | null>(null)
  const [canvasMode, setCanvasMode] = useState<Mode | null>(null)
  const product = canvasProduct ?? appProduct
  const mode = resolveMode(product, canvasMode ?? appMode) // e.g. CS PRO is dark-only
  const canToggleMode = productModes[product].length > 1

  // Cursor tool: off = normal canvas. On = hover outlines, click selects (drilling into sections, then parts),
  // the inspector edits the selection, and a selected node can be dragged to a new position.
  const [tree, setTree] = useState<DesignNode[]>(initialTree)
  const [picking, setPicking] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [drag, setDrag] = useState<{ id: string; drop: Drop | null } | null>(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  // Where the edit box goes: floating next to the selection, or docked in a panel on the right.
  const [docked, setDocked] = useState(false)
  const [panelPos, setPanelPos] = useState<{ left: number; top?: number; bottom?: number; maxHeight: number }>({ left: 0, maxHeight: 320 })
  const panelRef = useRef<HTMLDivElement>(null)
  // Boxes drawn over the items inside the selection, so each one visibly stands alone and can be clicked.
  const [tags, setTags] = useState<{ id: string; label: string; left: number; top: number; width: number; height: number }[]>([])
  const stageRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const viewportWidth = useViewportWidth()
  const selected = selectedId ? findNode(tree, baseIdOf(selectedId)) : null
  const part = selectedId ? partOf(selectedId) : null
  // The full icon set loads when an icon is being chosen, or once a design uses a non-default icon.
  const usesCustomIcon = flatten(tree).some((n) => n.iconLeft?.name || n.iconRight?.name)
  const catalog = useIconCatalog(part === 'iconLeft' || part === 'iconRight' || usesCustomIcon)

  const canSend = prompt.trim() !== '' || prd !== null
  const send = () => {
    if (!canSend) return
    setMessages((m) => [
      ...m,
      { role: 'user', text: prompt.trim() || `Generate designs from ${prd!.name}` },
      { role: 'assistant', text: 'Design generation is coming in the next step.' },
    ])
    setPrompt('')
  }
  const newChat = () => setMessages([welcome])

  const changeNode = (id: string, patch: Partial<DesignNode>) => setTree((t) => updateNode(t, id, patch))
  const select = (id: string | null) => setSelectedId(id)
  const stopPicking = () => { setPicking(false); select(null); setHoverId(null); setDrag(null) }
  const changeTab = (next: Tab) => { setTab(next); stopPicking() }

  const describe = (id: string) => {
    const n = findNode(tree, baseIdOf(id))
    const p = partOf(id)
    if (!n) return ''
    const base = n.kind === 'button' ? `${n.name} · ${n.text}` : n.kind === 'section' ? n.name : `${n.name} · ${(n.text ?? '').slice(0, 24)}`
    return p ? `${base} › ${partLabels[p]}` : base
  }
  const ask = (text: string) => {
    if (!selectedId) return
    setMessages((m) => [
      ...m,
      { role: 'user', text, target: describe(selectedId) },
      { role: 'assistant', text: 'Free-form edits to a single layer will work once generation is connected. Everything in the inspector already applies.' },
    ])
  }

  // What a click on `target` would select. The first click takes the outermost node (a section, or the whole button);
  // clicking inside what is already selected drills one level down, and clicking a sibling selects that sibling.
  const resolvePick = (target: HTMLElement): string | null => {
    const chain: string[] = []
    for (let el = target.closest<HTMLElement>('[data-node]'); el; el = el.parentElement?.closest<HTMLElement>('[data-node]') ?? null) {
      chain.unshift(el.dataset.node!)
    }
    if (!chain.length) return null
    if (selectedId) {
      const at = chain.indexOf(selectedId)
      if (at >= 0) return chain[Math.min(at + 1, chain.length - 1)]
      // Siblings share a parent: the item after the parent in the chain is the sibling under the pointer.
      const el = stageRef.current?.querySelector<HTMLElement>(`[data-node="${selectedId}"]`)
      const parentId = el?.parentElement?.closest<HTMLElement>('[data-node]')?.dataset.node
      const parent = parentId ? chain.indexOf(parentId) : -1
      if (parent >= 0) return chain[Math.min(parent + 1, chain.length - 1)]
    }
    return chain[0]
  }

  // Cursor tool on: capture clicks on the canvas so the design's own buttons don't fire, and select the node instead.
  const onStageClick = (e: MouseEvent) => {
    if (!picking) return
    const target = e.target as HTMLElement
    if (target.closest('[contenteditable]')) return // caret placement inside the text being edited
    e.preventDefault()
    e.stopPropagation()
    select(resolvePick(target))
  }
  const onStageMove = (e: MouseEvent) => {
    if (picking && !drag) setHoverId(resolvePick(e.target as HTMLElement))
  }

  /* ---- Drag to move ---- */

  // Where would `dragId` land if dropped at the pointer? The deepest section under it (or the top level), and the
  // index among that container's other children, by comparing with their midpoints.
  const computeDrop = (x: number, y: number, dragId: string): Drop | null => {
    const stage = stageRef.current
    const wrap = wrapRef.current
    const dragged = findNode(tree, dragId)
    if (!stage || !wrap || !dragged) return null
    const options = Array.from(stage.querySelectorAll<HTMLElement>('[data-container]')).filter((el) => {
      const id = el.dataset.container!
      if (id === dragId || el.closest(`[data-node="${dragId}"]`)) return false // not into itself
      if (dragged.kind === 'section' && id !== 'root') return false // sections stay at the top level
      return true
    })
    const under = options
      .filter((el) => { const r = el.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom })
      .sort((a, b) => a.offsetWidth * a.offsetHeight - b.offsetWidth * b.offsetHeight)[0]
    const target = under ?? options.find((el) => el.dataset.container === 'root')
    if (!target) return null

    const kids = Array.from(target.querySelectorAll<HTMLElement>(':scope > [data-node]')).filter((k) => k.dataset.node !== dragId)
    const index = kids.filter((k) => { const r = k.getBoundingClientRect(); return y > r.top + r.height / 2 }).length
    const w = wrap.getBoundingClientRect()
    const c = target.getBoundingClientRect()
    const top = !kids.length ? c.top + 8 : index < kids.length ? kids[index].getBoundingClientRect().top - 4 : kids[kids.length - 1].getBoundingClientRect().bottom + 4
    const id = target.dataset.container!
    return { container: id === 'root' ? null : id, index, line: { top: top - w.top, left: c.left - w.left + 4, width: c.width - 8 } }
  }

  const startDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!selectedId || part) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ id: selectedId, drop: null })
  }
  const moveDrag = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (drag) setDrag({ id: drag.id, drop: computeDrop(e.clientX, e.clientY, drag.id) })
  }
  const endDrag = () => {
    if (drag?.drop) setTree((t) => moveNode(t, drag.id, drag.drop!.container, drag.drop!.index))
    setDrag(null)
  }

  // Items to mark: what is inside the selection (a section's items, a button's label and icons), or, when a button part is
  // selected, its sibling parts.
  const tagTargets = (): { id: string; label: string }[] => {
    if (!selected || !selectedId) return []
    const partIds = (n: DesignNode) => partsOf(n).map((p) => ({ id: `${n.id}:${p}`, label: partLabels[p] }))
    if (part || selected.kind === 'button') return partIds(selected)
    if (selected.kind === 'section') return (selected.children ?? []).map((c) => ({ id: c.id, label: c.kind === 'button' ? c.text || 'Button' : c.name }))
    return []
  }

  // Position the selection badge above the selected node (or inside its top edge when there is no room above), the tags over
  // its items, and the edit box beside the phone at the selection's height (or under/over the node if the phone fills the view).
  const place = useCallback(() => {
    const wrap = wrapRef.current
    const badge = badgeRef.current
    const stage = stageRef.current
    const el = selectedId ? stage?.querySelector<HTMLElement>(`[data-node="${selectedId}"]`) : null
    if (!wrap || !stage || !badge || !el) { setTags([]); return }
    const w = wrap.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    const gap = 4
    const above = r.top - w.top - badge.offsetHeight - gap
    setPos({
      left: Math.max(gap, Math.min(r.left - w.left, w.width - badge.offsetWidth - gap)),
      top: above >= gap ? above : r.top - w.top + gap,
    })

    setTags(
      tagTargets().flatMap((t) => {
        const target = stage.querySelector<HTMLElement>(`[data-node="${t.id}"]`)
        if (!target || t.id === selectedId) return []
        const tr = target.getBoundingClientRect()
        return [{ ...t, left: tr.left - w.left, top: tr.top - w.top, width: tr.width, height: tr.height }]
      }),
    )

    const panel = panelRef.current
    if (panel) {
      const g = 16
      const screen = stage.querySelector<HTMLElement>('[data-container="root"]')?.getBoundingClientRect()
      const bezel = 24
      const maxHeight = Math.max(160, w.height - g * 2)
      const height = Math.min(panel.offsetHeight, maxHeight)
      const sideTop = Math.max(g, Math.min(r.top - w.top, w.height - height - g))
      if (screen && w.width - (screen.right - w.left + bezel) - g >= panel.offsetWidth) {
        setPanelPos({ left: screen.right - w.left + bezel + g, top: sideTop, maxHeight })
      } else if (screen && screen.left - w.left - bezel - g >= panel.offsetWidth) {
        setPanelPos({ left: screen.left - w.left - bezel - g - panel.offsetWidth, top: sideTop, maxHeight })
      } else {
        const spaceBelow = w.height - (r.bottom - w.top) - g
        const spaceAbove = r.top - w.top - g
        const left = Math.max(g, Math.min(r.left - w.left, w.width - panel.offsetWidth - g))
        setPanelPos(
          spaceBelow >= 260 || spaceBelow >= spaceAbove
            ? { left, top: r.bottom - w.top + g / 2, maxHeight: Math.max(160, spaceBelow) }
            : { left, bottom: w.height - (r.top - w.top) + g / 2, maxHeight: Math.max(160, spaceAbove) },
        )
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, tree])

  useLayoutEffect(() => { place() }, [place, viewportWidth, tab, product, mode, tree, picking, docked])

  useEffect(() => {
    if (!selectedId) return
    const stage = stageRef.current
    const observer = new ResizeObserver(place)
    if (stage) observer.observe(stage)
    stage?.addEventListener('scroll', place)
    window.addEventListener('resize', place)
    return () => {
      observer.disconnect()
      stage?.removeEventListener('scroll', place)
      window.removeEventListener('resize', place)
    }
  }, [selectedId, place])

  // Esc: cancel a drag, else deselect, else leave the cursor tool.
  useEffect(() => {
    if (!picking) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (drag) setDrag(null)
      else if (selectedId) select(null)
      else setPicking(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [picking, selectedId, drag])

  /* ---- Rendering the tree ---- */

  // A button's icon on one side: its chosen Material Symbol (defaults: + on the left, an arrow on the right), sized for the
  // button per the Button rules.
  const iconMark = (n: DesignNode, side: 'iconLeft' | 'iconRight', spec: IconSpec) => {
    const url = spec.name ? catalog?.iconUrl(spec.name, !!spec.fill) : undefined
    return (
      <PartMark id={`${n.id}:${side}`} selected={selectedId === `${n.id}:${side}`} hover={hoverId === `${n.id}:${side}`} color={colorVar(spec.color)}>
        <Icon icon={url || (side === 'iconLeft' ? msAdd : msArrowForward)} size={{ sm: 16, md: 20, lg: 24 }[n.buttonSize ?? 'lg'] as 16 | 20 | 24} />
      </PartMark>
    )
  }

  const renderNode = (n: DesignNode, parentAlign: string): ReactNode => {
    const isSelected = selectedId === n.id
    const box: CSSProperties = { marginTop: spacingVar(n.before), marginBottom: spacingVar(n.after) }

    if (n.kind === 'section') {
      Object.assign(box, {
        display: 'flex',
        flexDirection: 'column',
        gap: spacingVar(n.gap),
        padding: spacingVar(n.padding),
        alignItems: alignItems[n.align ?? 'stretch'],
        background: n.background && n.background !== 'none' ? `var(--l3-surface-${n.background})` : undefined,
        borderRadius: radiusVar(n.radius),
        border: n.border ? '1px solid var(--l3-border-light)' : undefined,
      })
    } else if (n.kind === 'button') {
      // Fill spans the section; Hug shrinks to the label (starting at the edge unless the section centres or ends items).
      box.alignSelf = n.fill === false ? (parentAlign === 'stretch' ? 'flex-start' : undefined) : 'stretch'
    }

    return (
      <Pickable
        key={n.id}
        id={n.id}
        container={n.kind === 'section'}
        selected={isSelected}
        hover={hoverId === n.id}
        dragging={drag?.id === n.id}
        dropTarget={drag?.drop?.container === n.id}
        style={box}
      >
        {n.kind === 'section' && n.children?.map((c) => renderNode(c, n.align ?? 'stretch'))}

        {n.kind === 'button' && (
          <Button
            variant={n.variant}
            size={n.buttonSize ?? 'lg'}
            fullWidth={n.fill !== false}
            tabIndex={picking ? -1 : undefined}
            iconLeft={n.iconLeft ? iconMark(n, 'iconLeft', n.iconLeft) : undefined}
            iconRight={n.iconRight ? iconMark(n, 'iconRight', n.iconRight) : undefined}
          >
            <PartMark id={`${n.id}:label`} selected={selectedId === `${n.id}:label`} hover={hoverId === `${n.id}:label`} color={colorVar(n.labelColor)}>
              {n.text || ' '}
            </PartMark>
          </Button>
        )}

        {(n.kind === 'heading' || n.kind === 'text') && (
          <EditableText
            as={n.kind === 'heading' ? 'h2' : 'p'}
            className={n.kind === 'heading' ? styles.sampleTitle : styles.sampleBody}
            style={{
              font: textFont(n.weight ?? 'regular', n.size ?? 14),
              color: colorVar(n.color ?? (n.kind === 'heading' ? 'primary' : 'secondary')),
              textAlign: n.textAlign,
            }}
            value={n.text ?? ''}
            editing={picking && isSelected}
            onCommit={(text) => changeNode(n.id, { text: text.trim() || n.text })}
          />
        )}
      </Pickable>
    )
  }

  const badgeName = selected ? (part ? `${selected.name} › ${partLabels[part]}` : selected.name) : ''

  return (
    <div className={styles.build}>
      {/* ---- Top bar ---- */}
      <header className={styles.topbar}>
        <div className={styles.topLeft}>
          <input
            className={styles.titleInput}
            value={title}
            aria-label="Design name"
            onChange={(e) => setTitle(e.target.value)}
            size={Math.max(title.length, 8)}
          />
          <span className={styles.badge}>AI</span>
        </div>

        <div className={styles.topMain}>
          <div className={styles.tabs} role="tablist" aria-label="View">
            <button type="button" role="tab" aria-selected={tab === 'browser'} className={styles.tab} onClick={() => changeTab('browser')}>
              <Icon icon={msLanguage} size={18} /> Browser
            </button>
            <button type="button" role="tab" aria-selected={tab === 'files'} className={styles.tab} onClick={() => changeTab('files')}>
              <Icon icon={msFolder} size={18} /> Files
            </button>
          </div>

          <div className={styles.topActions}>
            <IconButton icon={msSettings} label="Settings" disabled />
            <IconButton icon={msPlayArrow} label="Preview" disabled />
            <Button variant="secondary" size="sm" disabled>
              Share
            </Button>
            <Button variant="primary" size="sm" disabled iconRight={<Icon icon={msKeyboardArrowDown} size={18} />}>
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {/* ---- Chat ---- */}
        <section className={styles.chat} aria-label="Conversation">
          <div className={styles.chatHeader}>
            <Icon icon={msViewSidebar} size={20} />
            <h1 className={styles.chatTitle}>Initiate conversation</h1>
            <IconButton icon={msAdd} label="New conversation" onClick={newChat} />
            <IconButton icon={msOpenInFull} label="Expand" disabled />
          </div>

          <ol className={styles.messages}>
            {messages.map((m, i) => (
              <li key={i} className={styles.message} data-role={m.role}>
                {m.role === 'assistant' ? (
                  <>
                    <p className={styles.worked}>
                      Worked for 1s <Icon icon={msChevronRight} size={16} />
                    </p>
                    <p className={styles.reply}>{m.text}</p>
                    <div className={styles.feedback}>
                      <IconButton icon={msThumbUp} label="Good response" />
                      <IconButton icon={msThumbDown} label="Bad response" />
                    </div>
                  </>
                ) : (
                  <span className={styles.bubble}>
                    {m.target && <span className={styles.target}>{m.target}</span>}
                    {m.text}
                  </span>
                )}
              </li>
            ))}
          </ol>

          <div className={styles.composer}>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.md,.txt,.doc,.docx"
              className={styles.fileInput}
              aria-label="Upload PRD"
              onChange={(e) => setPrd(e.target.files?.[0] ?? null)}
            />
            {prd && (
              <div className={styles.fileChip}>
                <Icon icon={msAttachFile} size={16} />
                <span className={styles.fileName}>{prd.name}</span>
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remove ${prd.name}`}
                  onClick={() => { setPrd(null); if (fileRef.current) fileRef.current.value = '' }}
                >
                  Remove
                </button>
              </div>
            )}
            <textarea
              className={styles.prompt}
              rows={3}
              placeholder="Ask for changes"
              aria-label="Ask for changes"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            />
            <div className={styles.composerRow}>
              <IconButton icon={msAdd} label="Upload PRD" onClick={() => fileRef.current?.click()} />
              <span className={styles.spacer} />
              <label className={styles.select}>
                <span className={styles.srOnly}>Mode</span>
                <select defaultValue="build">
                  <option value="build">Build</option>
                  <option value="plan">Plan</option>
                </select>
              </label>
              <label className={styles.select}>
                <span className={styles.srOnly}>Theme</span>
                <select value={product} onChange={(e) => setCanvasProduct(e.target.value as Product)}>
                  {products.map((p) => (
                    <option key={p} value={p}>
                      {productLabels[p]}
                    </option>
                  ))}
                </select>
              </label>
              <IconButton
                icon={picking ? msArrowSelectorToolFill : msArrowSelectorTool}
                label={picking ? 'Stop selecting elements' : 'Select an element to edit'}
                pressed={picking}
                disabled={tab !== 'browser'}
                onClick={() => (picking ? stopPicking() : setPicking(true))}
              />
              <IconButton icon={msMic} label="Dictate" disabled />
              <button type="button" className={styles.send} aria-label="Send" disabled={!canSend} onClick={send}>
                <Icon icon={msArrowUpward} size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* ---- Preview ---- */}
        <section className={styles.preview} aria-label="Preview">
          <div className={styles.previewBar}>
            <IconButton icon={msArrowBack} label="Back" disabled />
            <IconButton icon={msArrowForward} label="Forward" disabled />
            <IconButton icon={msRefresh} label="Reload" disabled />
            <span className={styles.url}>/</span>
            <span className={styles.spacer} />
            <IconButton
              icon={mode === 'dark' ? msLightMode : msDarkMode}
              label={mode === 'dark' ? 'Switch canvas to light theme' : 'Switch canvas to dark theme'}
              disabled={!canToggleMode}
              onClick={() => setCanvasMode(mode === 'dark' ? 'light' : 'dark')}
            />
            <IconButton
              icon={msViewSidebar}
              label={docked ? 'Show the edit box next to the selection' : 'Dock the edit box on the right'}
              pressed={docked}
              onClick={() => setDocked((d) => !d)}
            />
            <IconButton icon={msChat} label="Comments" disabled />
            <IconButton icon={msCode} label="View code" disabled />
          </div>

          <div className={styles.previewBody}>
            <div ref={wrapRef} className={styles.canvasArea}>
              <div
                ref={stageRef}
                className={styles.stage}
                data-product={product}
                data-mode={mode}
                data-picking={picking || undefined}
                data-moving={drag ? true : undefined}
                onClickCapture={onStageClick}
                onMouseMove={onStageMove}
                onMouseLeave={() => setHoverId(null)}
              >
                {tab === 'browser' ? (
                  <PhoneFrame label="Generated screen">
                    <div className={styles.sample} data-container="root" data-drop={drag?.drop && drag.drop.container === null ? true : undefined}>
                      {tree.map((n) => renderNode(n, 'stretch'))}
                    </div>
                  </PhoneFrame>
                ) : (
                  <div className={styles.files}>
                    <h2 className={styles.filesTitle}>Files</h2>
                    {prd ? (
                      <p className={styles.filesRow}><Icon icon={msAttachFile} size={18} /> {prd.name}</p>
                    ) : (
                      <p className={styles.filesEmpty}>No files yet. Upload a PRD from the chat.</p>
                    )}
                  </div>
                )}
              </div>

              {picking && !selected && (
                <p className={styles.pickHint} role="status">
                  Click a part of the design to edit it. Esc to stop.
                </p>
              )}

              {/* Selection badge: what is selected, and (for whole nodes) the handle to drag it. */}
              {selected && (
                <div ref={badgeRef} className={styles.selBadge} style={{ left: pos.left, top: pos.top }}>
                  {!part && (
                    <button
                      type="button"
                      className={styles.grip}
                      aria-label={`Drag ${selected.name} to move it`}
                      title="Drag to move"
                      onPointerDown={startDrag}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={() => setDrag(null)}
                    >
                      <Icon icon={msDragIndicator} size={16} />
                    </button>
                  )}
                  <span className={styles.selName}>{badgeName}</span>
                </div>
              )}

              {picking && selected && !drag && tags.map((t) => (
                <button key={t.id} type="button" className={styles.tagBox} style={{ left: t.left, top: t.top, width: t.width, height: t.height }} onClick={() => select(t.id)} aria-label={`Edit ${t.label}`}>
                  <span className={styles.tagName}>{t.label}</span>
                </button>
              ))}

              {picking && !docked && selected && !drag && (
                <div ref={panelRef} className={styles.floatPanel} style={panelPos}>
                  <Inspector
                    variant="floating"
                    tree={tree}
                    selectedId={selectedId}
                    theme={{ product, mode }}
                    catalog={catalog}
                    onSelect={select}
                    onChange={changeNode}
                    onAsk={ask}
                  />
                </div>
              )}

              {drag?.drop && (
                <div className={styles.dropLine} style={{ top: drag.drop.line.top, left: drag.drop.line.left, width: drag.drop.line.width }} aria-hidden="true" />
              )}
            </div>

            {picking && docked && (
              <Inspector
                variant="docked"
                tree={tree}
                selectedId={selectedId}
                theme={{ product, mode }}
                catalog={catalog}
                onSelect={select}
                onChange={changeNode}
                onAsk={ask}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
