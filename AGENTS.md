# Instructions for AI agents

This repo is the **Lemonnade V3 (L3) design system**: React + TypeScript + Vite components in `src/components`,
design tokens in `src/tokens`, and a docs site in `src/docs`. When you build UI here — a screen, a flow, a new
component, or a Figma design — follow this file.

## 1. Read before you build

1. **`DESIGN_SYSTEM.md`** — spacing scale, layout primitives, token rules, card/actionbar rules, states, a11y,
   theming, icons, responsive rules, Do/Don't.
2. **`src/components/<Name>/USAGE.md`** for every component you use — which variant/size to pick, labels, placement,
   states. (Written so far: `Button`. For others, use the component's docs page / playground in `src/docs`.)
3. The component's props (`src/components/<Name>/<Name>.tsx`). TypeScript enforces several rules — if a combination
   doesn't compile, it's not allowed; don't cast around it.

Sections marked `PENDING` are **undecided**. Do not invent rules for them. If your task depends on one, stop and
ask, or list it under "Open questions" in your answer.

## 2. Non-negotiable rules

- **Components first.** Use an existing component whenever one exists; never hand-roll a button, tab, card, sheet,
  toast, field, etc. Don't restyle a component's internals — use its props.
- **Tokens only.** No hex/rgb, raw px spacing, font sizes or shadows in styles. Only `--l3-*` variables (the one
  accepted literal is `1px` for hairlines). Missing value → add it to `src/tokens/source/local.*.json`, run
  `npm run tokens`, and say so.
- **Mobile first.** Build at 360px wide (mockups 360×800), then check 392 and 412. Tap targets ≥ 32px. Hover only
  inside `@media (hover: hover)`.
- **Both themes.** Check light and dark; only semantic tokens (`surface`, `content`, `border`, `component`).
- **Accessible.** Every control has a name; headings in order; status via `Aerobar`.
- **Don't invent patterns or components.** If something you need doesn't exist (e.g. a select, stepper, chart,
  skeleton), say so and ask — don't build a one-off lookalike inside a screen.

Key component rules (details in the USAGE files / DESIGN_SYSTEM.md):
- **Button:** one `primary` per screen; `secondary` only next to a stronger button (primary/buy/sell/brand),
  usually in a dock; standalone actions like "View all" are `tertiary`; buttons in a dock / `ButtonGroup` are always
  `lg`; `buy`/`sell` only for trades; an icon button has no label, exactly one icon and an `aria-label`.
- **Actionbar:** flat tabs at the top go in its `bottom` slot; at most 2 actions.
- **Card:** clickable → `surface-primary` + `border-light` + `elevation-low` + press scale; a card with one action
  is a clickable card; static (rounded + border) → `surface-default`; flat → transparent, no border/shadow.

## 3. Workflow for UI tasks

1. **Plan first.** List the screens, what each contains, the transitions (push, bottom sheet, toast), the
   components you'll use, and anything missing or `PENDING`. For more than one screen, show this plan before building.
2. **Build.** Screens as React components (docs demos live in `src/docs/demos.tsx` and are registered in
   `src/docs/pages.tsx`). Use real-looking content and cover empty / loading / error states.
3. **Verify** before saying you're done:
   - `npx tsc -b --noEmit` and `npm run build` pass.
   - No raw colours in your CSS: `grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(' <your css>` returns nothing (except
     `rgb(from var(--l3-…))`).
   - Look at it at 360 / 392 / 412 in light and dark (`npm run dev`, then the docs page or demo).
4. **Report** what you built, what you verified, and any rule you had to bend or any `PENDING` decision you hit.

## 4. Figma work

- Use the **✅ Lemonnade V3** library (and **👁️ Lemonnade V3 → Icons**) — instances, variables and text/effect
  styles, never raw values.
- Put content into a component's **slots** (e.g. tabs in the Actionbar's `↓ Content bottom`), don't stack siblings.
- Frames are 360 wide; Manrope via L3 text styles.

## 5. Repo conventions

- Every component change gets a release in `src/docs/changelog.ts` (semver per component).
- Don't commit, push or publish unless asked. The public docs site (`npm run deploy:docs`) is only updated on
  explicit request.
