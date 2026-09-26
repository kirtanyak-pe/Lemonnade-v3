import { useSyncExternalStore } from 'react'

// Hash routes (#/button/variants, #/colors?token=surface/default) — shareable, back-button
// friendly, no router dependency.
const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [path, search = ''] = hash.replace(/^#\/?/, '').split('?')
  const [page = '', tab = ''] = path.split('/')
  return { page, tab, query: new URLSearchParams(search) }
}

export const href = (page: string, tab?: string, query?: Record<string, string>) =>
  `#/${page}${tab ? `/${tab}` : ''}${query ? `?${new URLSearchParams(query)}` : ''}`
