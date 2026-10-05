import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { ButtonGroup } from '../components/ButtonGroup'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { useViewportWidth } from '../docs/viewport'
import { useTheme } from '../theme'
import { productLabels, productModes, products, resolveMode, type Mode, type Product } from '../tokens/themes'
import {
  msAdd, msArrowBack, msArrowForward, msArrowSelectorTool, msArrowSelectorToolFill, msArrowUpward, msAttachFile, msChat,
  msChevronRight, msCode, msDarkMode, msDragIndicator, msFolder, msKeyboardArrowDown, msLanguage, msLightMode, msMic,
  msOpenInFull, msPlayArrow, msRefresh, msSettings, msThumbDown, msThumbUp, msViewSidebar,
} from '../icons/material'
import {
  baseIdOf, colorVar, findNode, flatten, isBleed, isContainer, isFooter, kindLabels, moveNode, nodeTitle, partLabels, partOf, partsOf,
  radiusVar, spacingVar, textFont, updateNode,
  type DesignNode, type IconSpec, type NodeKind,
} from './design'
import { readPrd, requestDesign, type PrdFile } from './generateClient'
import { Canvas } from './Canvas'
import { Inspector } from './Inspector'
import { Leaf } from './leaves'
import { defaultModel, models } from './schema'
import { useIconCatalog } from './useIconCatalog'
import { IconButton } from './ui'
import styles from './Build.module.css'

type Message = {
  id: number
  role: 'user' | 'assistant'
  text: string
  /** The item a request was about, e.g. "Button · Continue". */
  target?: string
  pending?: boolean
  failed?: boolean
  seconds?: number
  /** Things Build changed to keep the design within the rules. */
  warnings?: string[]
  /** The design before this reply changed it, so it can be undone. */
  restore?: DesignNode[]
  undone?: boolean
}
type Tab = 'browser' | 'files'

/** Builds a node named after its kind, so the sample below stays readable. */
const node = (n: Omit<DesignNode, 'name'> & { name?: string }): DesignNode => ({ name: kindLabels[n.kind], ...n })

/**
 * Sample screen: a Lemonn asset (stock) page, drawn with every component from the guidelines. Generated screens produce
 * the same kind of tree.
 */
const initialTree: DesignNode[] = [
  node({ id: 'bar', kind: 'actionbar', text: 'Reliance Industries', description: 'NSE · RELIANCE', back: true, actions: ['share', 'notifications'], items: ['Overview', 'Chart', 'News', 'F&O'], active: 0 }),
  node({
    id: 'price', kind: 'section', name: 'Price', gap: '08',
    children: [
      node({ id: 'ltp', kind: 'heading', text: '₹2,914.35', weight: 'bold', size: 32, color: 'primary' }),
      node({ id: 'move', kind: 'tag', text: '+₹35.60 (1.24%) today', tagColor: 'profit', tagVariant: 'secondary', tagSize: 'md' }),
    ],
  }),
  node({ id: 'range', kind: 'tabs', items: ['1D', '1W', '1M', '1Y', '5Y'], active: 0, appearance: 'pill' }),
  node({ id: 'results', kind: 'aerobar', tone: 'discover', text: 'Q2 results on 24 Oct', description: 'Earnings are due after market hours.' }),
  node({
    id: 'position', kind: 'card', name: 'Your position', gap: '04',
    children: [
      node({ id: 'pos-title', kind: 'text', text: 'Your position', weight: 'semibold', size: 14, color: 'secondary' }),
      node({ id: 'qty', kind: 'listcell', text: 'Quantity', value: '24 shares', iconLeft: { name: 'account_balance_wallet' } }),
      node({ id: 'avg', kind: 'listcell', text: 'Average buy price', value: '₹2,610.00' }),
      node({ id: 'ret', kind: 'listcell', text: 'Total returns', description: 'Since 12 Mar', value: '+₹7,304.40' }),
    ],
  }),
  node({
    id: 'prefs', kind: 'section', name: 'Preferences', gap: '08',
    children: [
      node({ id: 'alerts', kind: 'switch', text: 'Alert me on ±5% moves', checked: true }),
      node({ id: 'digest', kind: 'checkbox', text: 'Include in my weekly digest', checked: true }),
      node({ id: 'delivery', kind: 'radio', text: 'Delivery (hold long term)', checked: true }),
      node({ id: 'intraday', kind: 'radio', text: 'Intraday (square off today)' }),
    ],
  }),
  node({ id: 'shares', kind: 'textfield', text: 'Quantity', placeholder: 'Number of shares', helper: 'You can buy up to 500 shares per order.' }),
  node({ id: 'news', kind: 'emptystate', text: 'No news today', description: 'We’ll show headlines here when there’s something to read.', value: 'Set a news alert' }),
  node({
    id: 'about', kind: 'section', name: 'About', gap: '08', align: 'start',
    children: [
      node({ id: 'logo', kind: 'brandlogo', brand: 'lemonn', logoVariant: 'full' }),
      node({ id: 'verified', kind: 'icon', iconLeft: { name: 'verified' } }),
      node({ id: 'risk', kind: 'text', text: 'Investments in securities are subject to market risk. Read all scheme-related documents carefully.', weight: 'regular', size: 12, color: 'tertiary' }),
    ],
  }),
  node({
    id: 'trade', kind: 'dock', name: 'Trade', direction: 'horizontal',
    children: [
      node({ id: 'sell', kind: 'button', text: 'Sell', variant: 'sell' }),
      node({ id: 'buy', kind: 'button', text: 'Buy', variant: 'buy' }),
    ],
  }),
  node({
    id: 'nav', kind: 'bottomnav',
    navItems: [{ label: 'Stocks', icon: 'stocks' }, { label: 'Market', icon: 'market' }, { label: 'Portfolio', icon: 'portfolio' }, { label: 'Mutual funds', icon: 'mutualFund' }],
    active: 0,
  }),
]

const welcome: Message = {
  id: 0,
  role: 'assistant',
  text: 'Hey! Describe a screen, or attach a PRD (.pdf, .md or .txt), and I’ll design it with Lemonnade components. Turn on the cursor in the chat box to edit any part of it.',
}

const alignItems = { stretch: 'stretch', start: 'flex-start', center: 'center', end: 'flex-end' } as const


type Parent = { id: string; kind: NodeKind | 'root'; align: string }

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
  const [prd, setPrd] = useState<PrdFile | null>(null)
  // Which Claude model answers. Remembered on this browser.
  const [model, setModel] = useState(() => {
    try {
      const saved = localStorage.getItem('l3-build-model')
      return models.some((m) => m.id === saved) ? (saved as string) : defaultModel
    } catch {
      return defaultModel
    }
  })
  const chooseModel = (id: string) => {
    setModel(id)
    try { localStorage.setItem('l3-build-model', id) } catch { /* storage unavailable: the choice still holds for this session */ }
  }
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const nextId = useRef(1)
  const listRef = useRef<HTMLOListElement>(null)
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

  const canSend = (prompt.trim() !== '' || prd !== null) && !busy

  const patchMessage = (id: number, patch: Partial<Message>) => setMessages((all) => all.map((m) => (m.id === id ? { ...m, ...patch } : m)))

  // Ask Claude: send the request with the current design (and the selected item, if any), then replace the canvas with what
  // comes back. The previous design is kept on the reply, so one click undoes it.
  const run = async (text: string, opts: { selectedId?: string | null; target?: string } = {}) => {
    if (busy) return
    const history = messages
      .filter((m) => !m.pending && !m.failed && m.text)
      .map((m) => ({ role: m.role, text: m.target ? `[about ${m.target}] ${m.text}` : m.text }))
    const userId = nextId.current++
    const replyId = nextId.current++
    setMessages((all) => [...all, { id: userId, role: 'user', text, target: opts.target }, { id: replyId, role: 'assistant', text: '', pending: true }])
    setBusy(true)
    const controller = new AbortController()
    abortRef.current = controller
    const started = Date.now()
    const before = tree
    try {
      const result = await requestDesign(
        { model, prompt: text, product: productLabels[product], tree, selectedId: opts.selectedId ?? null, history, prd },
        controller.signal,
      )
      const seconds = Math.max(1, Math.round((Date.now() - started) / 1000))
      if (result.tree) {
        setTree(result.tree)
        select(null)
        patchMessage(replyId, { text: result.reply, pending: false, seconds, warnings: result.warnings, restore: before })
      } else {
        patchMessage(replyId, { text: result.reply, pending: false, seconds })
      }
      setPrd(null) // the design now carries what the PRD said; attach it again to add more
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setMessages((all) => all.filter((m) => m.id !== replyId))
      } else {
        patchMessage(replyId, { text: err instanceof Error ? err.message : 'Something went wrong.', pending: false, failed: true })
      }
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  const send = () => {
    if (!canSend) return
    const text = prompt.trim() || `Design the screens described in ${prd?.name}.`
    setPrompt('')
    void run(text)
  }
  const newChat = () => {
    abortRef.current?.abort()
    setMessages([welcome])
    setBusy(false)
  }
  const undo = (m: Message) => {
    if (!m.restore) return
    setTree(m.restore)
    select(null)
    patchMessage(m.id, { undone: true })
  }
  const attach = async (file: File | undefined) => {
    if (!file) return
    try {
      setPrd(await readPrd(file))
    } catch (err) {
      setMessages((all) => [...all, { id: nextId.current++, role: 'assistant', text: err instanceof Error ? err.message : 'Could not read that file.', failed: true }])
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const changeNode = (id: string, patch: Partial<DesignNode>) => setTree((t) => updateNode(t, id, patch))
  const select = (id: string | null) => setSelectedId(id)
  const stopPicking = () => { setPicking(false); select(null); setHoverId(null); setDrag(null) }
  const changeTab = (next: Tab) => { setTab(next); stopPicking() }

  const describe = (id: string) => {
    const n = findNode(tree, baseIdOf(id))
    const p = partOf(id)
    if (!n) return ''
    return p ? `${nodeTitle(n)} › ${partLabels[p]}` : nodeTitle(n)
  }
  const ask = (text: string) => {
    if (!selectedId) return
    void run(text, { selectedId, target: describe(selectedId) })
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

    // Direct items of this container only: not the parts inside a button, and not items of a container nested in a wrapper.
    const kids = Array.from(target.querySelectorAll<HTMLElement>('[data-node]')).filter(
      (k) => k.dataset.node !== dragId && !k.dataset.node!.includes(':') && k.parentElement?.closest('[data-container]') === target,
    )
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
    const screen = stage?.querySelector<HTMLElement>('[data-container="root"]') // a long screen scrolls inside the phone
    const observer = new ResizeObserver(place)
    if (stage) observer.observe(stage)
    stage?.addEventListener('scroll', place)
    screen?.addEventListener('scroll', place)
    window.addEventListener('resize', place)
    return () => {
      observer.disconnect()
      stage?.removeEventListener('scroll', place)
      screen?.removeEventListener('scroll', place)
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

  // The first footer (button dock, bottom navigation) is pushed to the bottom of the screen; footers stay pinned while it scrolls.
  const firstFooter = tree.find(isFooter)?.id
  const navBelow = tree.some((n) => n.kind === 'bottomnav')
  const hugs = (n: DesignNode) => n.kind === 'tag' || n.kind === 'brandlogo' || n.kind === 'icon'

  const renderNode = (n: DesignNode, parent: Parent): ReactNode => {
    const isSelected = selectedId === n.id
    const atRoot = parent.kind === 'root'
    const inDock = parent.kind === 'dock'
    const box: CSSProperties = { marginTop: spacingVar(n.before), marginBottom: spacingVar(n.after) }

    // Most components sit inside the 16px side gutter; full-width ones (action bar, tabs, dock, navigation…) touch the edges.
    if (atRoot && !isBleed(n)) box.marginInline = spacingVar('16')
    if (atRoot && isFooter(n)) {
      Object.assign(box, { position: 'sticky', bottom: n.kind === 'dock' && navBelow ? 'var(--l3-size-64)' : 0, zIndex: 2, marginTop: n.id === firstFooter ? 'auto' : box.marginTop })
    }
    if (inDock) Object.assign(box, { flex: 1, minWidth: 0 })
    if (hugs(n)) box.alignSelf = parent.align === 'stretch' ? 'flex-start' : undefined

    const inner = { id: n.id, kind: n.kind, align: n.align ?? 'stretch' }
    const stack: CSSProperties = { display: 'flex', flexDirection: 'column', gap: spacingVar(n.gap), alignItems: alignItems[n.align ?? 'stretch'] }

    if (n.kind === 'section') {
      Object.assign(box, stack, {
        padding: spacingVar(n.padding),
        background: n.background && n.background !== 'none' ? `var(--l3-surface-${n.background})` : undefined,
        borderRadius: radiusVar(n.radius),
        border: n.border ? '1px solid var(--l3-border-light)' : undefined,
      })
    } else if (n.kind === 'button') {
      // Fill spans the section; Hug shrinks to the label (starting at the edge unless the section centres or ends items).
      box.alignSelf = n.fill === false && !inDock ? (parent.align === 'stretch' ? 'flex-start' : undefined) : 'stretch'
    }

    return (
      <Pickable
        key={n.id}
        id={n.id}
        container={isContainer(n.kind)}
        selected={isSelected}
        hover={hoverId === n.id}
        dragging={drag?.id === n.id}
        dropTarget={drag?.drop?.container === n.id}
        style={box}
      >
        {n.kind === 'section' && n.children?.map((c) => renderNode(c, inner))}

        {n.kind === 'card' && (
          <Card variant={n.flat ? 'flat' : 'default'} surface={n.surface === 'default' ? undefined : n.surface}>
            <div style={stack}>{n.children?.map((c) => renderNode(c, inner))}</div>
          </Card>
        )}

        {n.kind === 'dock' && (
          <ButtonGroup direction={n.direction ?? 'horizontal'} aria-label={n.name}>
            {n.children?.map((c) => renderNode(c, inner))}
          </ButtonGroup>
        )}

        {n.kind === 'button' && (
          <Button
            variant={n.variant}
            size={inDock ? 'lg' : n.buttonSize ?? 'lg'}
            fullWidth={inDock || n.fill !== false}
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

        {!isContainer(n.kind) && n.kind !== 'button' && n.kind !== 'heading' && n.kind !== 'text' && <Leaf node={n} catalog={catalog} group={parent.id} />}
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

          <ol ref={listRef} className={styles.messages}>
            {messages.map((m) => (
              <li key={m.id} className={styles.message} data-role={m.role}>
                {m.role === 'assistant' ? (
                  <>
                    <p className={styles.worked} data-pending={m.pending || undefined}>
                      {m.pending ? 'Designing…' : m.failed ? 'Could not finish' : m.seconds ? `Worked for ${m.seconds}s` : 'Build'} <Icon icon={msChevronRight} size={16} />
                    </p>
                    {!m.pending && <p className={styles.reply} data-failed={m.failed || undefined}>{m.text}</p>}
                    {m.warnings && m.warnings.length > 0 && (
                      <ul className={styles.adjusted}>
                        {m.warnings.map((w) => (
                          <li key={w}>{w}</li>
                        ))}
                      </ul>
                    )}
                    {m.restore && !m.undone && (
                      <div className={styles.replyActions}>
                        <Button variant="tertiary" size="sm" onClick={() => undo(m)}>
                          Undo this change
                        </Button>
                      </div>
                    )}
                    {m.undone && <p className={styles.adjusted}>Undone. The design is back to how it was.</p>}
                    {!m.pending && !m.failed && (
                      <div className={styles.feedback}>
                        <IconButton icon={msThumbUp} label="Good response" />
                        <IconButton icon={msThumbDown} label="Bad response" />
                      </div>
                    )}
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
              accept=".pdf,.md,.txt"
              className={styles.fileInput}
              aria-label="Upload PRD"
              onChange={(e) => void attach(e.target.files?.[0])}
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
              placeholder={busy ? 'Working…' : 'Describe a screen, or ask for changes'}
              aria-label="Message"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            />
            <div className={styles.composerRow}>
              <IconButton icon={msAdd} label="Upload PRD" onClick={() => fileRef.current?.click()} />
              <span className={styles.spacer} />
              <label className={styles.select} title={models.find((m) => m.id === model)?.note}>
                <span className={styles.srOnly}>Claude model</span>
                <select value={model} onChange={(e) => chooseModel(e.target.value)}>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
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
                  <Canvas onViewChange={place}>
                    <div
                      className={styles.sample}
                      data-container="root"
                      data-drop={drag?.drop && drag.drop.container === null ? true : undefined}
                      style={{
                        paddingBlockStart: tree[0] && !isBleed(tree[0]) ? spacingVar('16') : 0,
                        paddingBlockEnd: tree[tree.length - 1] && isFooter(tree[tree.length - 1]) ? 0 : spacingVar('16'),
                      }}
                    >
                      {tree.map((n) => renderNode(n, { id: 'root', kind: 'root', align: 'stretch' }))}
                    </div>
                  </Canvas>
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
