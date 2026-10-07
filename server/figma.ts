// Figma links pasted into the Build chat, read with the Figma REST API and a personal access token (FIGMA_TOKEN in
// .env.local). Server only. Two uses: placing a frame on the canvas as editable layers (importFigmaLink, free), and
// giving Claude a frame to rebuild with L3 components (readFigmaLinks: a rendered image plus an outline of its layers).
import { findFigmaLinks, type FigmaBoard, type FigmaLink } from '../src/build/figmaLinks.ts'
import { UserError } from './errors.ts'
import { newBudget, toLayer, usesImages, type RawNode } from './figmaLayers.ts'

export { findFigmaLinks }

const API = 'https://api.figma.com/v1'
/** Links read per message, and frames rendered per section: more images cost tokens without helping much. */
const MAX_LINKS = 3
const MAX_FRAMES = 4
/** Longest side of a rendered image, in px. Claude downsizes anything bigger, so larger only costs time. */
const MAX_SIDE = 1600
const MAX_OUTLINE_LINES = 700
/** Frames placed per link when importing a section or page. */
const MAX_BOARDS = 24

export type FigmaFrame = {
  link: FigmaLink
  name: string
  type: string
  /** The layer tree as indented text. */
  outline: string
  /** PNGs as base64: the node itself, or each top-level frame of a section. */
  images: { name: string; data: string }[]
}

type Paint = { type: string; visible?: boolean; color?: { r: number; g: number; b: number } }
type FigmaNode = {
  id: string
  name: string
  type: string
  visible?: boolean
  children?: FigmaNode[]
  characters?: string
  style?: { fontSize?: number; fontWeight?: number }
  componentId?: string
  componentProperties?: Record<string, { type: string; value: string | boolean }>
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number } | null
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL'
  itemSpacing?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  fills?: Paint[]
}
type NodesResponse = {
  nodes: Record<string, {
    document: FigmaNode
    components: Record<string, { name: string; componentSetId?: string }>
    componentSets: Record<string, { name: string }>
  } | null>
}

async function figmaGet<T>(path: string, token: string): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, { headers: { 'X-Figma-Token': token } })
  } catch {
    throw new UserError('Could not reach Figma. Check your connection and try again.')
  }
  if (res.status === 403) throw new UserError('Figma refused access. Check FIGMA_TOKEN in .env.local, and that its account can open this file.')
  if (res.status === 404) throw new UserError('Figma could not find that file. Check the link.')
  if (res.status === 429) throw new UserError('Figma’s rate limit was hit. Wait a minute and try again.')
  if (!res.ok) throw new UserError(`Figma returned an error (${res.status}). Please try again.`)
  return (await res.json()) as T
}

/** Fetch a linked node: its layer outline and a rendered image (one per top-level frame for a section or page). */
export async function readFigmaLink(link: FigmaLink, token: string): Promise<FigmaFrame> {
  const data = await figmaGet<NodesResponse>(`/files/${link.fileKey}/nodes?ids=${encodeURIComponent(link.nodeId)}`, token)
  const entry = data.nodes[link.nodeId]
  if (!entry) throw new UserError('That Figma layer no longer exists. Copy the link to the frame again.')
  const root = entry.document

  const componentName = (id?: string) => {
    const c = id ? entry.components[id] : undefined
    if (!c) return undefined
    const set = c.componentSetId ? entry.componentSets[c.componentSetId]?.name : undefined
    return set ? `${set} [${c.name}]` : c.name
  }

  // A section or page holds several screens: render each one separately so every image stays legible.
  const isGroup = root.type === 'SECTION' || root.type === 'CANVAS'
  const targets = isGroup
    ? (root.children ?? []).filter((c) => c.visible !== false && ['FRAME', 'COMPONENT', 'INSTANCE'].includes(c.type)).slice(0, MAX_FRAMES)
    : [root]
  if (!targets.length) throw new UserError('That Figma section has no frames in it to read.')

  const longest = Math.max(...targets.map((t) => Math.max(t.absoluteBoundingBox?.width ?? 0, t.absoluteBoundingBox?.height ?? 0)), 1)
  const scale = Math.min(2, Math.max(0.1, MAX_SIDE / longest)).toFixed(2)
  const ids = targets.map((t) => t.id).join(',')
  const rendered = await figmaGet<{ err: string | null; images: Record<string, string | null> }>(
    `/images/${link.fileKey}?ids=${encodeURIComponent(ids)}&format=png&scale=${scale}`,
    token,
  )
  if (rendered.err) throw new UserError(`Figma could not render that frame: ${rendered.err}`)

  const images = await Promise.all(
    targets.map(async (t) => {
      const src = rendered.images[t.id]
      if (!src) return null
      const res = await fetch(src).catch(() => null)
      if (!res?.ok) return null
      return { name: t.name, data: Buffer.from(await res.arrayBuffer()).toString('base64') }
    }),
  )

  return {
    link,
    name: root.name,
    type: root.type,
    outline: outline(root, componentName),
    images: images.filter((i): i is { name: string; data: string } => i !== null),
  }
}

/** The layer tree as indented lines: type, name, size, auto layout, component and its properties, and text content. */
function outline(root: FigmaNode, componentName: (id?: string) => string | undefined): string {
  const lines: string[] = []
  const walk = (node: FigmaNode, depth: number) => {
    if (node.visible === false || lines.length >= MAX_OUTLINE_LINES) return
    const box = node.absoluteBoundingBox
    const bits = [`${node.type} "${node.name}"`]
    if (box) bits.push(`${Math.round(box.width)}x${Math.round(box.height)}`)
    if (node.layoutMode && node.layoutMode !== 'NONE') {
      const pad = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].map((p) => p ?? 0).join(' ')
      bits.push(`${node.layoutMode.toLowerCase()} gap ${node.itemSpacing ?? 0} padding ${pad}`)
    }
    if (node.type === 'INSTANCE') {
      const name = componentName(node.componentId)
      if (name) bits.push(`component: ${name}`)
      const props = Object.entries(node.componentProperties ?? {})
        .filter(([, p]) => p.type !== 'INSTANCE_SWAP')
        .map(([k, p]) => `${k.split('#')[0]}=${JSON.stringify(p.value)}`)
      if (props.length) bits.push(`props: ${props.join(', ')}`)
    }
    if (node.type === 'TEXT' && node.characters) {
      const style = node.style ? ` (${node.style.fontSize ?? '?'}px/${node.style.fontWeight ?? '?'})` : ''
      bits.push(`text${style}: ${JSON.stringify(node.characters.slice(0, 300))}`)
    }
    lines.push(`${'  '.repeat(depth)}${bits.join(' · ')}`)
    // Library components carry their content in props and text overrides; their inner structure is the component's own.
    const children = node.type === 'INSTANCE' ? (node.children ?? []).filter(hasText) : (node.children ?? [])
    for (const child of children) walk(child, depth + 1)
  }
  walk(root, 0)
  if (lines.length >= MAX_OUTLINE_LINES) lines.push('… (outline truncated)')
  return lines.join('\n')
}

const hasText = (node: FigmaNode): boolean => node.visible !== false && (node.type === 'TEXT' || (node.children ?? []).some(hasText))

/** Read every Figma link in a message. Returns nothing when there are no links. */
export async function readFigmaLinks(text: string, token: string | undefined): Promise<FigmaFrame[]> {
  const links = findFigmaLinks(text).slice(0, MAX_LINKS)
  if (!links.length) return []
  if (!token) throw new UserError('To read Figma links, add a Figma personal access token to .env.local as FIGMA_TOKEN, then restart npm run dev.')
  return Promise.all(links.map((l) => readFigmaLink(l, token)))
}

/**
 * Place a linked layer on the canvas as editable layers that look exactly as in Figma: a frame becomes one board; a
 * section or page becomes one board per top-level frame, laid out as in Figma. Only the Figma API is used (no Claude),
 * so this is free.
 */
export async function importFigmaLink(link: FigmaLink, token: string): Promise<{ name: string; boards: Omit<FigmaBoard, 'id'>[]; notes: string[] }> {
  // geometry=paths: vectors come with their SVG paths, so icons and shapes can be drawn without rendering images.
  const data = await figmaGet<{ nodes: Record<string, { document: RawNode; components: Record<string, { name: string; componentSetId?: string }>; componentSets: Record<string, { name: string }> } | null> }>(
    `/files/${link.fileKey}/nodes?ids=${encodeURIComponent(link.nodeId)}&geometry=paths`,
    token,
  )
  const entry = data.nodes[link.nodeId]
  if (!entry) throw new UserError('That Figma layer no longer exists. Copy the link to the frame again.')
  const root = entry.document

  const isGroup = root.type === 'SECTION' || root.type === 'CANVAS'
  const targets = (isGroup ? (root.children ?? []).filter((c) => c.visible !== false && c.absoluteBoundingBox) : [root]).slice(0, MAX_BOARDS)
  if (!targets.length || !targets.every((t) => t.absoluteBoundingBox)) throw new UserError('There is nothing in that Figma layer to show.')

  // Image fills come as references; one call turns every reference in the file into a URL.
  let images: Record<string, string> = {}
  if (targets.some(usesImages)) {
    const res = await figmaGet<{ meta?: { images?: Record<string, string> } }>(`/files/${link.fileKey}/images`, token)
    images = res.meta?.images ?? {}
  }
  const componentName = (id?: string) => {
    const c = id ? entry.components[id] : undefined
    if (!c) return undefined
    const set = c.componentSetId ? entry.componentSets[c.componentSetId]?.name : undefined
    return set ?? c.name
  }

  const left = Math.min(...targets.map((t) => t.absoluteBoundingBox!.x))
  const top = Math.min(...targets.map((t) => t.absoluteBoundingBox!.y))
  const notes = new Set<string>()
  const boards = targets.flatMap((t) => {
    const budget = newBudget()
    const layer = toLayer(t, { images, componentName }, budget, true)
    budget.notes.forEach((n) => notes.add(n))
    const box = t.absoluteBoundingBox!
    if (!layer) return []
    return [{ name: t.name, url: link.url, width: Math.round(box.width), height: Math.round(box.height), x: Math.round(box.x - left), y: Math.round(box.y - top), root: layer }]
  })
  if (!boards.length) throw new UserError('There is nothing visible in that Figma layer to show.')
  return { name: root.name, boards, notes: [...notes] }
}
