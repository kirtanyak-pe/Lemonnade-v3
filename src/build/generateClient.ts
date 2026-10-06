// Browser side of the Build chat: reads the attached PRD, calls the generation endpoint, and imports Figma links.
import type { DesignNode } from './design'
import type { FigmaBoard } from './figmaLinks'

export type PrdFile = { name: string; kind: 'text' | 'pdf'; data: string }

export type GenerateBody = {
  /** Claude model id, one of `models` in schema.ts. */
  model: string
  prompt: string
  product: string
  tree: DesignNode[]
  selectedId: string | null
  history: { role: 'user' | 'assistant'; text: string }[]
  prd: PrdFile | null
}

export type GenerateResponse = { reply: string; tree: DesignNode[] | null; warnings: string[]; live: boolean }

// Set VITE_GENERATE_URL to point at a deployed backend; the default is the dev server's own endpoint.
const ENDPOINT = import.meta.env.VITE_GENERATE_URL ?? '/api/generate'
const MAX_PRD_BYTES = 15 * 1024 * 1024

/** Read a PRD: .txt and .md as text, .pdf as base64 (Claude reads PDFs directly). */
export async function readPrd(file: File): Promise<PrdFile> {
  if (file.size > MAX_PRD_BYTES) throw new Error('That file is too large (15 MB max).')
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'txt' || ext === 'md') return { name: file.name, kind: 'text', data: await file.text() }
  if (ext === 'pdf') {
    const url = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('Could not read that file.'))
      reader.readAsDataURL(file)
    })
    return { name: file.name, kind: 'pdf', data: url.slice(url.indexOf(',') + 1) }
  }
  throw new Error('Only .pdf, .md and .txt files are supported for now. Word files: save as PDF first.')
}

export async function requestDesign(body: GenerateBody, signal: AbortSignal): Promise<GenerateResponse> {
  let res: Response
  try {
    res = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new Error('Could not reach the design service. Check your connection and try again.')
  }
  if (!(res.headers.get('content-type') ?? '').includes('application/json')) {
    // A static copy of the site (no backend) answers with its home page instead of JSON.
    throw new Error('Generation is not available on this copy of Build: it has no backend connected yet.')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.')
  return data as GenerateResponse
}

const FIGMA_ENDPOINT = '/api/figma'

/** Ask the server to read a Figma link as editable layers: one board per frame, positioned as in Figma. */
export async function importFigma(url: string, signal: AbortSignal): Promise<{ name: string; boards: Omit<FigmaBoard, 'id'>[]; notes: string[] }> {
  let res: Response
  try {
    res = await fetch(FIGMA_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }), signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new Error('Could not reach the Figma service. Check your connection and try again.')
  }
  if (!(res.headers.get('content-type') ?? '').includes('application/json')) {
    throw new Error('Figma import is not available on this copy of Build: it has no backend connected yet.')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.')
  return data
}
