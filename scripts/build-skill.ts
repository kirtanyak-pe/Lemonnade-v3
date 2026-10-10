// npm run skill — builds the standalone "lemonnade-l3-figma" skill from this repo (the repo stays the source of truth):
//   plugin/skills/lemonnade-l3-figma/   SKILL.md (from docs/agent/GENERATE.md) · scripts/ (kit CLI, compiler, runtime,
//                                       outline) · data/ (library keys, icons) · examples/
//   plugin/.claude-plugin/plugin.json + .claude-plugin/marketplace.json  → /plugin marketplace add kirtanyak-pe/Lemonnade-v3
// No dependencies: anyone with Node 18+ and the Figma connector can use it.
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const name = 'lemonnade-l3-figma'
const plugin = join(root, 'plugin')
const out = join(plugin, 'skills', name)
const repo = 'https://github.com/kirtanyak-pe/Lemonnade-v3/blob/main'
rmSync(out, { recursive: true, force: true })
for (const d of ['scripts', 'data', 'examples']) mkdirSync(join(out, d), { recursive: true })

// scripts: the CLI (TypeScript → plain ESM) + the kit files as they are
const cli = ts.transpileModule(readFileSync(join(root, 'scripts/figma/kit.ts'), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
writeFileSync(join(out, 'scripts/kit.mjs'), cli.replace("'./kit/compile.js'", "'./compile.js'").replace(/npm run kit -- /g, 'node scripts/kit.mjs '))
for (const f of ['compile.js', 'runtime.js', 'outline.js']) cpSync(join(root, 'scripts/figma/kit', f), join(out, 'scripts', f))
cpSync(join(root, 'scripts/figma/kit/examples'), join(out, 'examples'), { recursive: true })

// data: only what the kit reads
const lib = JSON.parse(readFileSync(join(root, 'docs/migration/figma-library.json'), 'utf8'))
writeFileSync(join(out, 'data/figma-library.json'), JSON.stringify({ $about: `Keys of the ✅ Lemonnade V3 Figma library (${lib.fileKey}), from the Lemonnade-v3 repo.`, components: lib.components.map((c: { name: string; key: string; status: string }) => ({ name: c.name, key: c.key, status: c.status })), textStyles: lib.textStyles, collections: lib.collections }, null, 1))
writeFileSync(join(out, 'data/colors.json'), JSON.stringify({ l3ColorPrefix: JSON.parse(readFileSync(join(root, 'docs/migration/d2-to-l3.json'), 'utf8')).l3ColorPrefix }))
cpSync(join(root, 'docs/agent/icons.json'), join(out, 'data/icons.json'))

// SKILL.md: the brief, rewritten for the skill layout
let doc = readFileSync(join(root, 'docs/agent/GENERATE.md'), 'utf8')
doc = doc
  .replace(/^# .*\n\n[\s\S]*?\n---\n/, `# Lemonnade V3 (L3) — design screens in Figma

Design production-ready mobile screens, flows and redesigns for the Lemonn / CS PRO / Kuber trading apps in Figma, from
the ✅ Lemonnade V3 library. You write short **L3 JSX**; \`node <skill>/scripts/kit.mjs build\` checks it against the
design rules and fixes what it can; **one \`use_figma\` call builds the whole flow** from real library instances, checks
it and returns snapshots. \`<skill>\` = this skill's base directory (shown when the skill loads).

**Needs:** Node 18+ (no install) · the Figma connector (\`use_figma\`) · a Figma file that has the **✅ Lemonnade V3**
library enabled (Assets → Libraries) · the target page or section id (from its Figma link: \`node-id=12-34\` → \`12:34\`).
Read only this file; everything the job needs is here or in the kit.

---
`)
  .replace(/`npm run kit -- /g, '`node <skill>/scripts/kit.mjs ')
  .replace(/\| 0 \| \*\*Set up\*\*[^\n]*\n/, '| 0 | **Set up** — nothing to install. Get the target page / section id from the user\'s Figma link. | — | 0 Figma calls |\n')
  .replace(/\(`src\/components`, `docs\/figma-code-map\.md`\)/, `([components](${repo}/src/components), [Figma ↔ code map](${repo}/docs/figma-code-map.md))`)
  .replace(/docs\/agent\/ALGORITHM\.md/g, `[ALGORITHM.md](${repo}/docs/agent/ALGORITHM.md)`)
  .replace(/`scripts\/figma\/kit\/examples\/kill-switch\.jsx`/g, '`<skill>/examples/kill-switch.jsx`')
  .replace(/`?docs\/agent\/icons\.json`?/g, '`<skill>/data/icons.json`')
  .replace('in a work folder **outside the repo** (scratchpad)', 'in a work folder (scratchpad / temp — not inside any repo)')
  .replace(/PLAYBOOK §4/g, `the repo's [PLAYBOOK §4](${repo}/docs/PLAYBOOK.md)`)
  .replace(/After the task: add one line to `docs\/LEARNINGS\.md`[\s\S]*$/, `After the task: if something cost you time or the kit got it wrong, say so in your report (the kit's source and its
learnings log live in the [Lemonnade-v3 repo](https://github.com/kirtanyak-pe/Lemonnade-v3): \`scripts/figma/kit/\`, \`docs/LEARNINGS.md\`).
`)
  .replace(/if it's the kit, log it in docs\/LEARNINGS\.md/g, "if it's the kit, report it")
  .replace(/- \*\*One task per session\.\*\* The repo's `\.claude\/settings\.json` compacts at ~250k tokens; start a fresh session for a new flow\./, '- **One task per session.** Start a fresh session for a new flow; compact long ones early.')
const front = `---
name: ${name}
description: Design production-ready mobile screens, flows and redesigns in Figma with the Lemonnade V3 (L3) design system (Lemonn, CS PRO, Kuber trading apps). Use when asked to design, generate, mock up or redesign app screens in Figma with Lemonnade / L3 components, or to turn a feature brief into Figma screens.
---

`
writeFileSync(join(out, 'SKILL.md'), front + doc)

// plugin + marketplace (Claude Code: /plugin marketplace add kirtanyak-pe/Lemonnade-v3)
const pkgVersion = new Date().toISOString().slice(0, 10).replace(/-/g, '.')
mkdirSync(join(plugin, '.claude-plugin'), { recursive: true })
writeFileSync(join(plugin, '.claude-plugin/plugin.json'), JSON.stringify({ name: 'lemonnade', version: pkgVersion, description: 'Design production-ready Lemonnade V3 screens and flows in Figma — the L3 kit as a skill.', author: { name: 'Lemonnade design system' }, homepage: 'https://github.com/kirtanyak-pe/Lemonnade-v3' }, null, 2) + '\n')
mkdirSync(join(root, '.claude-plugin'), { recursive: true })
writeFileSync(join(root, '.claude-plugin/marketplace.json'), JSON.stringify({ name: 'lemonnade', owner: { name: 'kirtanyak-pe' }, plugins: [{ name: 'lemonnade', source: './plugin', description: 'Design production-ready Lemonnade V3 screens and flows in Figma.' }] }, null, 2) + '\n')

// prove it works on its own: the skill's own selftest (examples compile, every element documented + rendered)
const r = execFileSync(process.execPath, [join(out, 'scripts/kit.mjs'), 'selftest'], { encoding: 'utf8' })
console.log(r.trim().split('\n').pop())
// a zip for claude.ai (Settings → Capabilities → Skills → Upload) or ~/.claude/skills
execFileSync('zip', ['-qr', join(plugin, `${name}.zip`), name], { cwd: join(plugin, 'skills') })
console.log(`skill → plugin/skills/${name}/ · zip → plugin/${name}.zip`)
