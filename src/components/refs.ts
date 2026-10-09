import { useCallback, type MutableRefObject, type Ref } from 'react'

const assign = <T,>(ref: Ref<T> | undefined, node: T | null) => {
  if (typeof ref === 'function') ref(node)
  else if (ref) (ref as MutableRefObject<T | null>).current = node
}

/**
 * One ref callback that fills two refs — the component's own (for its checks) and the one the app passed (for focus,
 * measuring, or form libraries like react-hook-form). Works with React 18 and 19.
 */
export function useMergedRefs<T>(own: Ref<T> | undefined, forwarded: Ref<T> | undefined) {
  return useCallback(
    (node: T | null) => {
      assign(own, node)
      assign(forwarded, node)
    },
    [own, forwarded],
  )
}
