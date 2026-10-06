// Dragging layers of Figma boards, measured on the page itself. Over an auto-layout frame the layer goes where the
// insertion line shows; over any other frame or group it lands where it is dropped. Any board can be the target.

export type Rect = { left: number; top: number; width: number; height: number }

export type Drop =
  /** Into an auto-layout frame, before `beforeId` (null: at the end). `line` is the insertion line on screen. */
  | { kind: 'flow'; boardId: string; parentId: string; beforeId: string | null; line: Rect; box: Rect }
  /** Into a frame or group without auto layout, at the dropped position. `box` is the container on screen. */
  | { kind: 'free'; boardId: string; parentId: string; box: Rect }

const rectOf = (el: Element): Rect => {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, width: r.width, height: r.height }
}

/**
 * The container under the pointer. The dragged layer ignores the pointer while it moves, so the deepest frame or
 * group found is always somewhere else. Over a sibling inside the layer's own auto-layout frame, the layer is
 * reordered among its siblings, unless the pointer is in the middle of that sibling: then it goes inside it (as in
 * Figma).
 */
export function findDrop(x: number, y: number, home: HTMLElement | null): Drop | null {
  let container = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-container]') ?? null
  if (container && home?.dataset.flow && container !== home && home.contains(container)) {
    const sibling = [...home.children].find((c) => c.contains(container))
    const r = sibling?.getBoundingClientRect()
    const column = home.dataset.flow === 'column'
    const middle = r && (column ? Math.abs(y - (r.top + r.height / 2)) < r.height / 4 : Math.abs(x - (r.left + r.width / 2)) < r.width / 4)
    if (!middle) container = home
  }
  const board = container?.closest<HTMLElement>('[data-board]')
  if (!container || !board) return null
  const parentId = container.dataset.layer!
  const boardId = board.dataset.board!
  const box = rectOf(container)
  const dir = container.dataset.flow as 'row' | 'column' | undefined
  if (!dir) return { kind: 'free', boardId, parentId, box }

  const kids = [...container.children].filter((c): c is HTMLElement => c instanceof HTMLElement && c.hasAttribute('data-inflow') && !c.hasAttribute('data-dragging'))
  const column = dir === 'column'
  const before = kids.find((k) => {
    const r = k.getBoundingClientRect()
    return column ? y < r.top + r.height / 2 : x < r.left + r.width / 2
  })
  const T = 3 // line thickness in screen pixels
  let line: Rect
  if (before) {
    const r = rectOf(before)
    line = column ? { left: box.left, top: r.top - T / 2, width: box.width, height: T } : { left: r.left - T / 2, top: box.top, width: T, height: box.height }
  } else if (kids.length) {
    const r = rectOf(kids[kids.length - 1])
    line = column ? { left: box.left, top: r.top + r.height - T / 2, width: box.width, height: T } : { left: r.left + r.width - T / 2, top: box.top, width: T, height: box.height }
  } else {
    line = column ? { left: box.left, top: box.top + T, width: box.width, height: T } : { left: box.left + T, top: box.top, width: T, height: box.height }
  }
  return { kind: 'flow', boardId, parentId, beforeId: before?.dataset.layer ?? null, line, box }
}

/** Same target as before? Used to skip re-rendering the hint on every pointer move. */
export const sameDrop = (a: Drop | null, b: Drop | null) =>
  a === b || (!!a && !!b && a.kind === b.kind && a.parentId === b.parentId && a.boardId === b.boardId && (a.kind !== 'flow' || (b.kind === 'flow' && a.beforeId === b.beforeId)))

export const layerElement = (boardId: string, layerId: string) =>
  document.querySelector<HTMLElement>(`[data-board="${CSS.escape(boardId)}"] [data-layer="${CSS.escape(layerId)}"]`)

/** Canvas zoom, from an element's drawn size against its own. */
export function zoomOf(el: HTMLElement): number {
  const board = el.closest<HTMLElement>('[data-board]') ?? el
  const target = el.offsetWidth ? el : board
  return target.getBoundingClientRect().width / (target.offsetWidth || 1)
}

/**
 * A see-through copy of the layer that follows the pointer. It lives on `host` (outside the zoomed canvas) and is
 * scaled to the canvas zoom; `themeStyle` carries the board's own colors when it shows the design as in Figma.
 */
export function makeGhost(el: HTMLElement, host: HTMLElement, zoom: number, themeStyle: string): HTMLElement {
  const r = el.getBoundingClientRect()
  const wrap = document.createElement('div')
  wrap.style.cssText = `${themeStyle};position:fixed;left:${r.left}px;top:${r.top}px;width:${el.offsetWidth}px;height:${el.offsetHeight}px;transform-origin:0 0;transform:scale(${zoom});pointer-events:none;z-index:1000;opacity:0.85`
  const copy = el.cloneNode(true) as HTMLElement
  copy.removeAttribute('data-layer')
  Object.assign(copy.style, { position: 'absolute', left: '0', top: '0', transform: 'none', width: `${el.offsetWidth}px`, height: `${el.offsetHeight}px`, margin: '0', outline: 'none' })
  wrap.appendChild(copy)
  host.appendChild(wrap)
  return wrap
}
