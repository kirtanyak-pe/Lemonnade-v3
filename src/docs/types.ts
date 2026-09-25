import type { ReactNode } from 'react'

export type PropRow = { name: string; type: string; default?: string; description: string }

export type DocPage = {
  id: string
  title: string
  /** Nav rail group, e.g. "Action". */
  group: string
  description: string
  /** Badge next to the title. */
  status?: string
  altNames?: string
  /** Component pages: shown as Overview / Variants / API / Resources tabs. */
  overview?: ReactNode
  variants?: ReactNode
  props?: PropRow[]
  figmaNodeId?: string
  source?: string
  /** Named exports to show in the import snippet. */
  exports?: string[]
  /** Token families the component reads, shown under Resources. */
  tokens?: string[]
  /** Foundation pages: a single body, no tabs. */
  content?: ReactNode
}
