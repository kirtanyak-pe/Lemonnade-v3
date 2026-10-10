# The L3 generation algorithm — why it's built this way

The operating manual is `docs/agent/GENERATE.md`. This file is the reasoning and the evidence, for whoever maintains the
kit (people or agents). Built 2026-10-10/11 from an audit of every Claude Code session in this project.

## 1. What we measured

16 sessions (Sep 25 – Oct 10, 2026), 8,348 model calls, read with `scripts/token-audit.py`.

| Where the cost went | Tokens | Share of cost* |
|---|---|---|
| Re-reading the conversation on every call (cache reads) | 3,825 M | **73 %** |
| Writing new context into the cache | 50 M | 19 % |
| Model output (thinking, text, tool calls) | 8.2 M | 8 % |

\* weighted by price: cache read 0.1×, cache write 1.25–2×, output 5× an input token.

**Cost ≈ context size × number of calls.** Sessions ran with a 1M-token window and compacted only near the limit, so the
average call re-read 250k–510k tokens. Everything below follows from that one fact.

What the two sessions that generated screens from this repo did (Kill Switch, 25 frames · Account setup, 28 screens):

| Phase | What happened | Cost |
|---|---|---|
| Bootstrap | "Read all the rules": AGENTS, DESIGN_SYSTEM, PLAYBOOK, LEARNINGS, USAGE files, code map, recipes… | context 70k → 170k in the first minute, carried by every later call |
| Exploration | registry, component internals, `search_design_system` for icons (12k-token results), screenshots of old screens (40 images) | 20–40 calls before the first build |
| Reinventing | each session hand-wrote its own 10–43 kB helper library (`I()`, `P()`, `cell()`, `sheetOver()`…) and re-sent it in every build call | ~15k characters per call |
| Fix loops | component quirks found one at a time: a FILL text centring itself (7 calls), Tabs min-width 328 (4 calls), buttons stretching, default icons showing | 10–25 small calls, each re-reading 300k+ |
| Result | 68 calls, peak 385k · 106 calls, peak 477k | |

## 2. Principles

1. **Few calls, small context** — the bill is context × calls; a call that builds 12 screens beats 12 calls.
2. **Knowledge as code, not as reading** — every rule a machine can apply lives in the compiler or the runtime, not in
   prose an agent must load (L1/L2 titles, dock order, hug vs fill, density, insets, chevron rows, icon visibility…).
3. **Precompute, never explore** — component keys, variants, slots, styles, tokens and 190 icon keys ship with the kit.
4. **Spec, not imperative code** — the agent writes ~120 tokens of L3 JSX per screen; the runtime does the Plugin API work.
5. **Validate before you spend** — the local compiler (zero tokens) rejects what would be wrong; the build call checks
   what it built and returns only problems + small snapshots.
6. **Exceptions only** — results list issues, not inventories; outlines replace screenshots for reading old screens.
7. **Fix the system, not the instance** — a wrong result becomes a compiler rule, a runtime fix or a selftest case.
8. **Judgment stays with the agent** — choosing components and writing copy is the only thinking left, so it still
   works at medium effort.

## 3. The pipeline

```
 brief / old screens ──► intake ──► flow.jsx ──► npm run kit -- build ──► flow.figma.js ──► use_figma (1 call)
   (GENERATE.md)        outline     ~120 tok      parse · lint · fix          runtime +          build · place ·
                       (1 call)     per screen    tree-shake · check          plan, < 49 kB      check · snapshot
                                                                                                    │
            ◄──────────────────────── edit flow.jsx, rebuild --only the changed screens ◄──── issues
```

| Piece | File | Runs | Does |
|---|---|---|---|
| Brief | `docs/agent/GENERATE.md` | read once | The only doc an agent reads for the job: steps, budgets, language, choices |
| Compiler | `scripts/figma/kit/compile.js` | Node, 0 tokens | Static JSX parser, design-rule lint (errors · warnings · auto-fixes), row grouping + density, plan |
| CLI | `scripts/figma/kit.ts` (`npm run kit`) | Node | `build` (bundles only the runtime regions a flow uses + the keys it needs, splits at 49 kB, syntax-checks), `lint`, `outline`, `icons`, `jsx`, `selftest` |
| Runtime | `scripts/figma/kit/runtime.js` | inside `use_figma` | Preload (parallel imports, fonts, tokens) → screens from L3 instances → placement rules → check → snapshots. No eval |
| Outline | `scripts/figma/kit/outline.js` | inside `use_figma` | Old screen → compact text (≈ 1k tokens/screen) instead of screenshots / metadata |
| Icons | `docs/agent/icons.json` | data | 190 icon keys from "👁️ Lemonnade V3 → Icons", mined from past search results |
| Regression | `scripts/figma/kit/examples/*.jsx` + `selftest` | Node | Every element documented + rendered; every doc example compiles clean |

## 4. Results

| | Before (Kill Switch session, 25 frames) | After (kit benchmark, 6 screens) |
|---|---|---|
| Docs loaded to start | ~100k tokens | GENERATE.md ≈ 7k tokens |
| Exploration before building | ~25 calls | 0 |
| What the agent writes per screen | ~1–2k tokens of Plugin API code | ~120 tokens of JSX (6 screens = 2.4 kB) |
| Build calls | 6 (2–5 frames each) + 10–25 fix calls | 1 per ≤ ~15 screens; fixes = JSX edits + `--only` rebuild |
| Rules applied | by the agent, from prose (missed: one-line labels, chevron rows, hug…) | by the compiler/runtime, every time |
| Build time | ~2 min per call | **6 screens in 8.2 s** (5.2 s preload + 0.1–0.7 s per screen); was 55 s before the text-style fix |

## 5. Constraints found on the way (and what we did)

- **No resident code.** Storing the runtime inside the Figma file and `eval`-ing it (it works technically: shared plugin
  data, 100 kB per entry) was blocked by Claude Code's auto-mode classifier as a remote-code-execution surface — fair:
  code persisted in a shared file could be swapped. So every build call carries its runtime; the CLI tree-shakes it to
  what the flow uses (~25–35 kB) and the budget is spent on more screens per call instead.
- **Subagents can't reach the claude.ai Figma connector** in the desktop app (they see the plugin server, which needs
  its own auth). A cheap "runner" subagent that pastes the build file would keep it out of the main context; it works
  only where subagents have Figma access.
- **`use_figma` code is capped at 50,000 characters** → the CLI splits flows into several files.
- **The first `setTextStyleIdAsync` of every call stalls ~29 s**; the synchronous `textStyleId` setter takes ~2 ms.
  Fixed in the kit and in `lib/core.js` (`applyTextStyle`) — this was the unexplained "~60 s per build" in LEARNINGS.
- **A FILL child silently turns a hugging auto-layout parent into a fixed one** (the body must only grow after the
  screen is measured), and **`findAllWithCriteria({types:['TEXT']})` can return instances** inside slots (filter by type).

## 6. Distribution

`npm run skill` packages the whole method as a standalone skill — `plugin/skills/lemonnade-l3-figma/` (SKILL.md from
this brief, the kit CLI as plain ESM, compiler, runtime, outline, library keys, icons, examples; ~140 kB, zero
dependencies) plus `plugin/lemonnade-l3-figma.zip` and a plugin marketplace (`.claude-plugin/marketplace.json`). The
build runs the skill's own selftest from its folder, so a broken package never ships.

## 7. Session hygiene

- `.claude/settings.json` sets `autoCompactWindow: 250000`: compaction near 250k instead of ~1M — the average call
  re-reads roughly a third of what it did. Sessions started outside the repo can set the same in `~/.claude/settings.json`
  (or `CLAUDE_CODE_AUTO_COMPACT_WINDOW=250000`).
- One task per session; a new flow starts fresh with GENERATE.md.
- Big tool outputs (> ~30 kB) are persisted to files and must be re-read: print summaries, not dumps.

## 8. Keep it improving

1. After each run: one line in `docs/LEARNINGS.md` (what cost time, the number, the fix).
2. Turn it into a rule: compiler lint/fix (`compile.js`), runtime behaviour (`runtime.js`), or a brief line (GENERATE.md).
3. `npm run kit -- selftest` must pass; add an example under `scripts/figma/kit/examples/` for anything new.
4. Re-measure with `python3 scripts/token-audit.py ~/.claude/projects/<project>` — calls per screen, peak context.

Next candidates: render the same JSX to React for code prototypes (layout helpers as tiny token-only wrappers);
per-call versions of `swap` / `migrate-tokens` through the same tree-shaking bundler; a Figma-side "L3 Title" element.
