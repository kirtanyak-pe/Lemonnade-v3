// Turns a request from the Build chat into a design, by calling Claude. Runs on the server only: the API key never
// reaches the browser. Written against plain inputs so the same code can move into a Supabase Edge Function later.
// The Claude SDK is an optional dependency, loaded only when a request needs it: the site still builds and runs where
// the package can't be installed (for example when a company registry blocks it), and the chat says AI is unavailable.
import type { DesignNode } from '../src/build/design.ts'
import { fromFlat, mockDesign, outputSchema, toFlat, type FlatNode } from '../src/build/generation.ts'
import { defaultModel, models, textSizes } from '../src/build/schema.ts'

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

type Env = { ANTHROPIC_API_KEY?: string; BUILD_MODEL?: string; BUILD_EFFORT?: string }

const INTRO = `You are the design engine inside Build, a tool at Lemonn where product managers turn a PRD or a short brief into mobile screens made only of Lemonnade V3 (L3) design-system components. Lemonn is an Indian investing app: stocks, mutual funds, F&O, portfolio. Write realistic copy for that world (rupee amounts, tickers, order and KYC flows), never lorem ipsum.

You describe a screen as a flat list of nodes. Each node has an id, a parent ("root" or the id of a container), and a kind. Array order is visual order, top to bottom, within each parent.

Containers (always at the root, never nested in each other):
- section: stacks its items vertically. Options: name, gap, padding, align, background, radius, border.
- card: a surface that groups related content (Card). Options: name, surface, flat, gap, align.
- dock: the screen's button dock (ButtonGroup). Holds one or two buttons only. Options: name, direction.

Components (leaves; put them at the root or inside a section or card, except where noted):
- actionbar: the top bar. Options: text (title), description (subtitle), back, actions (up to two icons), items (tab labels: flat tabs at the top of a screen go here, inside the bar), active. Root only.
- tabs: a tab bar on its own. Options: items, active, appearance (underline for sections, pill for filters and chips).
- heading and text: title and supporting copy. Options: text, weight, size, color, textAlign.
- button: an action. Options: text (the label), variant, buttonSize, fill, iconLeft, iconRight.
- tag: a static status or label. Options: text, tagColor, tagVariant, tagSize. Use profit and loss for price moves and P&L, success and error for outcomes, processing for in progress. Tags are never tappable.
- listcell: a row. Options: text (label), description, value (shown on the right), iconLeft, chevron, control (switch or checkbox on the right), checked, cellVariant (plain or card).
- textfield: a labelled input. Options: text (label), placeholder, helper, status.
- switch, checkbox, radio: labelled choices. Options: text, checked. Use radios when exactly one option can be chosen.
- aerobar: a status message. Options: text (heading), description, tone, floating. A message about the page is a full-width bar; the result of an action is a floating toast.
- emptystate: nothing to show. Options: text (title), description, value (label of its button). Always say what happened and how to recover.
- bottomnav: the app-level navigation, three to five labelled sections. Options: navItems (label and icon), active. Root only.
- brandlogo: the Lemonn or Zing logo. Options: brand, logoVariant.
- icon: a single Material Symbols Rounded icon. Options: iconLeft.

Layout is handled for you. Full-width components (actionbar, tabs, dock, bottomnav, emptystate, plain listcells, full-width aerobars) touch the screen edges; everything else gets the 16px side gutter automatically, so do not add padding for that. The dock and bottom navigation pin to the bottom of the screen: put them last, with the dock before the bottom navigation when both are present. Put the action bar first. Screen titles belong in the action bar's text, not in a heading, unless the screen has no action bar (for example onboarding).

The canvas is a 360 by 800 phone screen; a longer screen scrolls inside it. Spacing values are pixels on the 4px scale (0, 4, 8, 12, 16, 24, 32, 40, 48, 64). Body text is usually regular 14, section titles semibold 16 to 20, large numbers bold 28 to 36. Available text sizes: ${JSON.stringify(textSizes)}.

Follow the design-system rules below. Sections marked PENDING are undecided: do not invent rules for them, and mention the question in your reply when it affects the screen. The rules that matter most: one primary button per screen; secondary only beside a stronger button; tertiary for standalone low-emphasis actions; buy and sell only for trades; button labels start with a verb and are one to three words; buttons in a dock are always large, at most two, with the strong button on the right; a card with a single button in it should be a clickable card instead; tabs at the top go inside the action bar; use a component whenever one exists and never fake one with text.

If the PRD needs something that has no component (a chart, an image, a select, a stepper, a bottom sheet), do not fake it. Leave it out or represent the content as plainly as you can, and say exactly what is missing in the reply.

When a current design is provided, return the WHOLE updated design, not just the change. Keep the ids and content of everything you were not asked to change. When an item is selected, the request is about that item unless it clearly says otherwise.

Reply in one to three short sentences: what you built or changed, then at most three assumptions or open questions. Plain text only, no markdown.`

// Just the parts of the SDK used here, so type-checking does not need the package installed.
type TextBlock = { type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }
type ContentBlock = TextBlock | { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } }
type MessageParam = { role: 'user' | 'assistant'; content: string | ContentBlock[] }
type ErrorClass = new (...args: never[]) => Error & { status?: number }
type Sdk = {
  default: new (opts: { apiKey?: string }) => {
    beta: { messages: { stream(params: Record<string, unknown>): { finalMessage(): Promise<{ stop_reason: string | null; content: { type: string; text?: string }[] }> } } }
  }
  APIError: ErrorClass
  AuthenticationError: ErrorClass
  RateLimitError: ErrorClass
  BadRequestError: ErrorClass
}

// A variable specifier keeps TypeScript and the bundler from resolving the package at build time.
const SDK_PACKAGE = '@anthropic-ai/sdk'
let sdkPromise: Promise<Sdk | null> | undefined
function loadSdk(): Promise<Sdk | null> {
  sdkPromise ??= (import(SDK_PACKAGE) as Promise<Sdk>).catch(() => null)
  return sdkPromise
}

/** Build the messages: earlier chat turns as real turns, then this request with the current design and any PRD. */
function buildMessages(req: GenerateRequest): MessageParam[] {
  const messages: MessageParam[] = []
  for (const h of req.history.slice(-8)) {
    if (!h.text.trim()) continue
    const last = messages[messages.length - 1]
    if (last && last.role === h.role) continue // keep roles alternating
    messages.push({ role: h.role, content: h.text })
  }
  // The conversation must start with a user turn.
  while (messages.length && messages[0].role !== 'user') messages.shift()
  if (messages.length && messages[messages.length - 1].role === 'user') messages.pop()

  const parts: string[] = [`Product theme: ${req.product}.`]
  if (req.tree.length) {
    parts.push(`Current design:\n${JSON.stringify(toFlat(req.tree))}`)
    if (req.selectedId) parts.push(`The user has selected the item with id "${req.selectedId.split(':')[0]}"${req.selectedId.includes(':') ? ` (its ${req.selectedId.split(':')[1]} part)` : ''}.`)
  } else {
    parts.push('There is no design yet.')
  }
  if (req.prd?.kind === 'text') parts.push(`Attached PRD (${req.prd.name}):\n${req.prd.data.slice(0, 120_000)}`)
  parts.push(`Request: ${req.prompt}`)

  const content: ContentBlock[] = []
  if (req.prd?.kind === 'pdf') {
    content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: req.prd.data } })
  }
  content.push({ type: 'text', text: parts.join('\n\n') })
  messages.push({ role: 'user', content })
  return messages
}

export async function generate(req: GenerateRequest, env: Env, rules: string, iconNames: ReadonlySet<string>): Promise<GenerateResult> {
  // No key: a canned screen, so the whole flow can be tried without one.
  if (!env.ANTHROPIC_API_KEY) {
    const mock = mockDesign(req.prompt, req.tree.length > 0)
    if (!mock.nodes.length) {
      const note: DesignNode = { id: `note-${Date.now() % 10000}`, kind: 'text', name: 'Text', text: `Note: ${req.prompt}`, weight: 'regular', size: 12, color: 'tertiary' }
      const tree = req.tree.map((n) => n)
      tree.push(note)
      return { reply: mock.reply, tree, warnings: [], live: false }
    }
    const { tree, warnings } = fromFlat(mock.nodes, { iconNames, prev: req.tree })
    return { reply: mock.reply, tree, warnings, live: false }
  }

  const sdk = await loadSdk()
  if (!sdk) throw new UserError('AI generation isn’t available: the @anthropic-ai/sdk package is not installed on this machine.')

  // Only models on the allowlist can be chosen; anything else falls back to the default.
  const chosen = models.find((m) => m.id === req.model) ?? models.find((m) => m.id === env.BUILD_MODEL) ?? models.find((m) => m.id === defaultModel)!
  const effort = (['low', 'medium', 'high', 'xhigh', 'max'] as const).find((e) => e === env.BUILD_EFFORT) ?? 'medium'

  // The rules are identical on every request, so they are cached: repeat requests read them at a fraction of the price.
  const system: TextBlock[] = [
    { type: 'text', text: INTRO },
    { type: 'text', text: `# Design-system rules\n\n${rules}`, cache_control: { type: 'ephemeral' } },
  ]

  try {
    const stream = new sdk.default({ apiKey: env.ANTHROPIC_API_KEY }).beta.messages.stream({
      model: chosen.id,
      max_tokens: 24_000,
      // If a safety classifier declines, the API retries on its default fallback model inside the same call.
      ...(chosen.fallbacks ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
      system,
      messages: buildMessages(req),
      // Haiku 4.5 does not accept `effort`.
      output_config: { ...(chosen.effort ? { effort } : {}), format: { type: 'json_schema', schema: outputSchema as unknown as Record<string, unknown> } },
    })
    const message = await stream.finalMessage()

    if (message.stop_reason === 'refusal') throw new UserError('Claude declined this request. Try describing the screen differently.')
    if (message.stop_reason === 'max_tokens') throw new UserError('The design was too big to finish. Try asking for one screen at a time.')

    const text = message.content.flatMap((b) => (b.type === 'text' && b.text ? [b.text] : [])).join('').trim()

    let parsed: { reply?: unknown; nodes?: unknown }
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new UserError('Claude’s answer could not be read as a design. Please try again.')
    }
    const { tree, warnings } = fromFlat(parsed.nodes as FlatNode[], { iconNames, prev: req.tree })
    return { reply: typeof parsed.reply === 'string' && parsed.reply.trim() ? parsed.reply.trim() : 'Done.', tree, warnings, live: true }
  } catch (err) {
    if (err instanceof UserError) throw err
    if (err instanceof sdk.AuthenticationError) throw new UserError('The Claude API key was rejected. Check ANTHROPIC_API_KEY in .env.local.')
    if (err instanceof sdk.RateLimitError) throw new UserError('Claude is busy or the rate limit was hit. Wait a moment and try again.')
    if (err instanceof sdk.BadRequestError) throw new UserError(`Claude rejected the request: ${err.message}`)
    if (err instanceof sdk.APIError) throw new UserError(`Claude returned an error (${err.status ?? 'network'}). Please try again.`)
    throw err
  }
}

/** An error whose message is safe and useful to show the user. */
export class UserError extends Error {}
