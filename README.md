# Lemonnade V3 (L3) design system

React components, design tokens and docs for the ✅ Lemonnade V3 Figma library.

- **Docs:** https://kirtanyak-pe.github.io/lemonnade-v3-docs/ — every component with its variants, rules and a
  playground.
- **Taking components into an app?** Start with [DEVELOPERS.md](DEVELOPERS.md): what to copy, setup (tokens, font,
  theme), icons, refs and forms, server rendering, updating.
- **Design rules:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (spacing, layering, cards, selection…) and the `USAGE.md`
  files next to the components.
- **AI agents designing screens, flows or redesigns in Figma:** read only
  [docs/agent/GENERATE.md](docs/agent/GENERATE.md) and follow it (L3 JSX → `npm run kit -- build` → one `use_figma`
  call per flow). For everything else: [AGENTS.md](AGENTS.md).

## Design in Figma with the L3 skill (for anyone)

A ready-made skill that lets Claude design production-ready Lemonnade V3 screens and flows in Figma — no repo setup, no
install, just Node 18+, the Figma connector and a Figma file with the ✅ Lemonnade V3 library enabled.

- **Claude Code:** `/plugin marketplace add kirtanyak-pe/Lemonnade-v3`, then `/plugin install lemonnade@lemonnade`.
  (Or copy `plugin/skills/lemonnade-l3-figma/` into `~/.claude/skills/`.)
- **Claude.ai / desktop app:** Settings → Capabilities → Skills → upload
  [`plugin/lemonnade-l3-figma.zip`](plugin/lemonnade-l3-figma.zip).
- Then just ask: *"Design the price-alerts flow in Figma on <page link>"* — it follows the brief, compiles and builds.

The skill is generated from this repo (`npm run skill`); re-run it after changing `scripts/figma/kit/` or
`docs/agent/GENERATE.md`.

## Layout

```
src/components/   the components (entry point: src/components/index.ts)
src/tokens/       design tokens — source JSON from Figma, generated CSS custom properties
src/theme/        ThemeProvider (product, dark mode, ♿ contrast)
src/icons/        Material Symbols (docs icon browser) and Lemonnade's own icons
src/docs/         the docs site
scripts/          token, icon and docs builds; Figma migration tools; audits
```

## Scripts

| | |
|---|---|
| `npm run dev` | Docs site on http://localhost:5173 |
| `npm run build` | Type-check and build the docs site |
| `npm run tokens` | Rebuild the token CSS from `src/tokens/source` |
| `npm run glyphs` | Rebuild the icon strings the components use from their SVGs |
| `npm run check:portable` | Check the components work outside this repo: no Vite-only code, strict TypeScript, server rendering |
| `npm run audit:ui -- <src>` | Check UI code against the L3 rules (tokens only, components first…) |
| `npm run find -- "<need>"` | Find the component for a job |
| `npm run kit -- build <flow.jsx> --parent <id>` | Compile L3 JSX screens into a `use_figma` script (rules checked, auto-fixes) — see docs/agent/GENERATE.md |
