// Dev-server endpoints for the Build chat: POST /api/generate (Claude designs a screen) and POST /api/figma (place a
// Figma frame on the canvas). Reads the Claude key and the Figma token (FIGMA_TOKEN) from .env.local, never sent to the
// browser, and the design-system rules from this repo. Only exists under `npm run dev`; the production build is static.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { loadEnv, type Plugin } from 'vite'
import icons from '../src/icons/material/icons.json' with { type: 'json' }
import { UserError } from './errors.ts'
import { findFigmaLinks, importFigmaLink } from './figma.ts'
// generate.ts needs @anthropic-ai/sdk (optional): it's loaded only when the Build chat calls the API, so the docs
// build and dev server work on machines where the package can't be installed.
import type { GenerateRequest, GenerateResult } from './types.ts'

type Generator = {
  generate: (req: GenerateRequest, env: Record<string, string>, rules: string, iconNames: ReadonlySet<string>) => Promise<GenerateResult>
  /** generate.ts's own UserError: it's loaded separately from this file, so its class isn't the one imported above. */
  UserError: new (message?: string) => Error
}
// A computed URL, so neither the bundler nor tsc pulls generate.ts (and the SDK) in up front.
const generatorUrl = new URL('./generate.ts', import.meta.url).href
const loadGenerator = () => (import(/* @vite-ignore */ generatorUrl) as Promise<Generator>).catch(() => null)

const iconNames: ReadonlySet<string> = new Set(icons.map((i) => i.name))
const MAX_BODY = 20 * 1024 * 1024 // a PDF as base64

export function buildApi(): Plugin {
  let env: Record<string, string> = {}
  let root = process.cwd()

  const loadRules = () =>
    ['AGENTS.md', 'DESIGN_SYSTEM.md', 'src/components/Button/USAGE.md', 'docs/figma-code-map.md']
      .map((file) => `## ${file}\n\n${readFileSync(join(root, file), 'utf8')}`)
      .join('\n\n---\n\n')

  return {
    name: 'l3-build-api',
    configResolved(config) {
      root = config.root
      env = loadEnv(config.mode, config.envDir || config.root, '')
    },
    configureServer(server) {
      // Place a pasted Figma link on the canvas as it looks in Figma. Uses only the Figma API, so it costs nothing.
      server.middlewares.use('/api/figma', (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (req.method !== 'POST') return send(405, { error: 'Use POST.' })
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as { url?: unknown }
            const link = findFigmaLinks(typeof body.url === 'string' ? body.url : '')[0]
            if (!link) return send(400, { error: 'That is not a link to a Figma frame. In Figma, right-click the frame and choose Copy link to selection.' })
            if (!env.FIGMA_TOKEN) return send(422, { error: 'To place Figma designs, add a Figma personal access token to .env.local as FIGMA_TOKEN, then restart npm run dev.' })
            send(200, await importFigmaLink(link, env.FIGMA_TOKEN))
          } catch (err) {
            if (err instanceof UserError) return send(422, { error: err.message })
            console.error('[figma-api]', err)
            send(500, { error: 'Something went wrong on the server. Check the terminal running npm run dev.' })
          }
        })
      })

      server.middlewares.use('/api/generate', (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        if (req.method !== 'POST') return send(405, { error: 'Use POST.' })

        const chunks: Buffer[] = []
        let size = 0
        req.on('data', (c: Buffer) => {
          size += c.length
          if (size > MAX_BODY) { send(413, { error: 'That file is too large (20 MB max).' }); req.destroy(); return }
          chunks.push(c)
        })
        req.on('end', async () => {
          const generator = await loadGenerator()
          if (!generator) return send(503, { error: 'The Build chat needs the @anthropic-ai/sdk package, which isn’t installed here. Run npm install where it’s available.' })
          const { generate, UserError } = generator
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as GenerateRequest
            if (typeof body.prompt !== 'string' || !body.prompt.trim()) return send(400, { error: 'Type what you want to build.' })
            const result = await generate(
              { model: typeof body.model === 'string' ? body.model : undefined, prompt: body.prompt, product: String(body.product ?? 'Lemonn'), tree: Array.isArray(body.tree) ? body.tree : [], selectedId: body.selectedId ?? null, history: Array.isArray(body.history) ? body.history : [], prd: body.prd ?? null },
              env,
              loadRules(),
              iconNames,
            )
            send(200, result)
          } catch (err) {
            if (err instanceof UserError) return send(422, { error: err.message })
            console.error('[build-api]', err)
            send(500, { error: 'Something went wrong on the server. Check the terminal running npm run dev.' })
          }
        })
      })
    },
  }
}
