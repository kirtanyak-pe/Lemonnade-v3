import { useEffect, type RefObject } from 'react'

/** Development-only warning when a form control would be announced without a name. */
export function useAccessibleNameWarning(ref: RefObject<HTMLInputElement | null>, component: string) {
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const el = ref.current
    if (!el) return
    const named =
      el.getAttribute('aria-label')?.trim() ||
      el.getAttribute('aria-labelledby') ||
      el.title ||
      (el.labels && el.labels.length > 0)
    if (!named) {
      console.warn(`[L3] <${component}> has no accessible name. Wrap it in a <label>, point a <label htmlFor> at it, or pass aria-label.`, el)
    }
  })
}
