# Lemonnade V3 (L3) design system

React components, design tokens and docs for the ✅ Lemonnade V3 Figma library.

- **Docs:** https://kirtanyak-pe.github.io/lemonnade-v3-docs/ — every component with its variants, rules and a
  playground.
- **Taking components into an app?** Start with [DEVELOPERS.md](DEVELOPERS.md): what to copy, setup (tokens, font,
  theme), icons, refs and forms, server rendering, updating.
- **Design rules:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (spacing, layering, cards, selection…) and the `USAGE.md`
  files next to the components.
- **AI agents** building UI with these components: [AGENTS.md](AGENTS.md).

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
