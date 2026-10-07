// Figma links in the Build chat. Shared by the browser (to tell a pasted link from a request) and the server.
import type { Layer } from './figmaLayers.ts'

export type FigmaLink = { url: string; fileKey: string; nodeId: string }

/** Find Figma design links that point at a layer. Links without `node-id` (a whole file) are ignored. */
export function findFigmaLinks(text: string): FigmaLink[] {
  const links: FigmaLink[] = []
  for (const match of text.matchAll(/https?:\/\/(?:www\.)?figma\.com\/[^\s<>()"']+/g)) {
    const raw = match[0].replace(/[.,;:!?]+$/, '') // a link at the end of a sentence
    let url: URL
    try {
      url = new URL(raw)
    } catch {
      continue
    }
    // /design/:key/:title, /file/:key/:title, /proto/:key/:title, or /design/:key/branch/:branchKey/:title
    const parts = url.pathname.split('/').filter(Boolean)
    if (!['design', 'file', 'proto'].includes(parts[0]) || !parts[1]) continue
    const fileKey = parts[2] === 'branch' && parts[3] ? parts[3] : parts[1]
    const nodeId = url.searchParams.get('node-id')?.replace('-', ':')
    if (!nodeId || !/^\d+:\d+$/.test(nodeId)) continue
    if (!links.some((l) => l.fileKey === fileKey && l.nodeId === nodeId)) links.push({ url: raw, fileKey, nodeId })
  }
  return links
}

/** True when a message is nothing but Figma links: those are placed on the canvas as they are, without Claude. */
export const isOnlyFigmaLinks = (text: string) =>
  findFigmaLinks(text).length > 0 && !text.replace(/https?:\/\/(?:www\.)?figma\.com\/[^\s<>()"']+/g, '').trim()

/** A Figma frame placed on the canvas as editable layers, at its real size and place. */
export type FigmaBoard = {
  id: string
  name: string
  /** The link it came from, to open it in Figma. */
  url: string
  width: number
  height: number
  /** Position on the canvas, in canvas units. */
  x: number
  y: number
  root: Layer
}
