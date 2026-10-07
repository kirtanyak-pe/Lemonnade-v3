import type { ReactNode } from 'react'

/**
 * Developer notes (code, props, accessibility wiring) inside a docs page. Hidden on the site, which is for
 * designers; still published in the AI-agent docs (llms.txt), whose generator includes every component's children.
 */
export function DevOnly(_props: { children: ReactNode }) {
  return null
}
