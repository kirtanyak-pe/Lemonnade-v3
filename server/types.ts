// Request / result of the Build chat API. Separate from generate.ts so the dev server can use them without loading
// @anthropic-ai/sdk (an optional package).
import type { DesignNode } from '../src/build/design.ts'

export type GenerateRequest = {
  /** Claude model id from the picker; checked against the allowlist in schema.ts. */
  model?: string
  prompt: string
  /** Product theme name, for tone: Lemonn, Kuber or CS PRO. */
  product: string
  /** The design on the canvas now (empty on the first request). */
  tree: DesignNode[]
  /** The item the user has selected, when the request is about one item. */
  selectedId?: string | null
  /** Earlier turns of the chat, oldest first. */
  history: { role: 'user' | 'assistant'; text: string }[]
  /** An attached PRD: plain text, or a PDF as base64. */
  prd?: { name: string; kind: 'text' | 'pdf'; data: string } | null
}

export type GenerateResult = {
  reply: string
  /** The new design, or null when nothing changed (Plan mode, demo notes). */
  tree: DesignNode[] | null
  warnings: string[]
  live: boolean
}
