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
  /**
   * Lifecycle, shown as a tag in the page header and as the sidebar marker. Defaults to done when status is 'Figma synced'.
   * done = Completed · wip = in progress · next-wip = shipped, next version in progress ·
   * discarded = not in use · replaced = superseded by `replacedBy`.
   */
  progress?: 'done' | 'wip' | 'next-wip' | 'discarded' | 'replaced'
  /** Page id of the replacement, for progress: 'replaced'. */
  replacedBy?: string
  altNames?: string
  /** Component pages: shown as Overview / Variants / API / Resources tabs. */
  overview?: ReactNode
  variants?: ReactNode
  props?: PropRow[]
  /** Component pages: the options as a tree (Tree tab). */
  tree?: import('./ComponentTree').ComponentTreeSpec
  figmaNodeId?: string
  source?: string
  /** Named exports to show in the import snippet. */
  exports?: string[]
  /** Token families the component reads, shown under Resources. */
  tokens?: string[]
  /** Foundation pages: a single body, no tabs. */
  content?: ReactNode
}
