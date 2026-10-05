import { createContext } from 'react'

/**
 * Open-sheet stack. Rule: at most 2 sheets — the first over the screen, and one on top of it.
 * The first sheet has no back button; the second one does (it goes back to the first).
 */
export const MAX_SHEETS = 2

let stack: string[] = []
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((l) => l())

export const sheetStack = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },
  /** 1 = first sheet over the screen, 2 = stacked on it. A sheet that's opening but not registered yet gets the next level. */
  depthOf(id: string) {
    const i = stack.indexOf(id)
    return i >= 0 ? i + 1 : stack.length + 1
  },
  push(id: string) {
    if (stack.includes(id)) return
    stack = [...stack, id]
    if (import.meta.env.DEV && stack.length > MAX_SHEETS) {
      console.warn(`[L3] ${stack.length} bottom sheets are open. At most ${MAX_SHEETS}: the first over the screen and one on top of it. Replace the second sheet instead of stacking a third.`)
    }
    notify()
  },
  remove(id: string) {
    stack = stack.filter((s) => s !== id)
    notify()
  },
}

/** Level of the sheet a header is in (null outside a modal <BottomSheet>, e.g. a static BottomSheetSurface). */
export const SheetDepthContext = createContext<number | null>(null)
