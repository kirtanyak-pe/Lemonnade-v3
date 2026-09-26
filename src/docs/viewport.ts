import { useSyncExternalStore } from 'react'

// Preview width shared by every phone frame on the site, remembered per browser.
export const viewportWidths = [360, 392, 412] as const
export type ViewportWidth = (typeof viewportWidths)[number]

const STORAGE_KEY = 'l3-docs-viewport'
const listeners = new Set<() => void>()

function read(): ViewportWidth {
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY))
    return (viewportWidths as readonly number[]).includes(n) ? (n as ViewportWidth) : 360
  } catch {
    return 360
  }
}

let current = read()

export function setViewportWidth(width: ViewportWidth) {
  current = width
  try {
    localStorage.setItem(STORAGE_KEY, String(width))
  } catch {
    // Storage unavailable: the choice still applies for this visit.
  }
  listeners.forEach((l) => l())
}

export function useViewportWidth() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
  )
}
