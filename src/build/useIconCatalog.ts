import { useEffect, useState } from 'react'

export type IconCatalog = typeof import('./iconCatalog')
let loaded: IconCatalog | null = null

/** Loads the full icon set the first time `needed` is true (an icon is being chosen, or a design uses one). */
export function useIconCatalog(needed: boolean): IconCatalog | null {
  const [catalog, setCatalog] = useState(loaded)
  useEffect(() => {
    if (!needed || catalog) return
    let cancelled = false
    import('./iconCatalog').then((m) => {
      loaded = m
      if (!cancelled) setCatalog(m)
    })
    return () => { cancelled = true }
  }, [needed, catalog])
  return catalog
}
