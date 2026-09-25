import { useSyncExternalStore } from 'react'

// Hash routes (#/button/variants) — shareable, back-button friendly, no router dependency.
const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

export function useHashRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  const [page = '', tab = ''] = hash.replace(/^#\/?/, '').split('/')
  return { page, tab }
}

export const href = (page: string, tab?: string) => `#/${page}${tab ? `/${tab}` : ''}`
