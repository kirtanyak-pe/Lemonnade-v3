# Using Lemonnade V3 components in your app

This repo is the **Lemonnade V3 (L3) design system**: React components that match the ✅ Lemonnade V3 Figma library,
the design tokens they're built on, and the docs site (https://kirtanyak-pe.github.io/lemonnade-v3-docs/). This guide
is for developers taking the components into a production app.

## Requirements

| | |
|---|---|
| React | 18 or 19 (`react` + `react-dom`). No other runtime dependencies. Built and tested on React 19; nothing React 19-only is used. |
| Bundler | Anything that supports **CSS Modules** (`*.module.css`): Next.js, Vite, Create React App, webpack (css-loader with modules), Rspack, Parcel. No SVG or asset setup needed. |
| TypeScript | Optional. The components type-check in `strict` mode with a plain setup — no Vite types, no special flags. |
| Browsers | Chrome / Android WebView 111+, Safari / iOS 16.2+, Firefox 121+ (the tokens use `color-mix()`, some components use `:has()`). Entry animations use `@starting-style` and simply don't animate in older browsers. |
| Server rendering | Supported (Next.js etc.). Every component renders on the server; a BottomSheet appears once the page is running in the browser. |

## What to copy

```
src/components/   all components (one entry point: src/components/index.ts)
src/tokens/       index.ts, themes.ts and generated/ (the CSS custom properties the components use)
src/theme/        optional: a ThemeProvider for switching product / dark mode / ♿ contrast
```

- **Don't copy `src/icons/material`** (6,512 SVGs, 27 MB). The components carry the few icons they need in
  `src/components/**/glyphs.ts`. For icons in your own screens, see [Icons](#icons).
- `src/components/SystemStatusbar` is a phone status-bar mock for screens in the docs — not for production. It isn't in
  the entry point.
- `BottomNavbar` ships the Lemonn app's tab artwork (Stocks, F&O, Mutual funds…), so it's specific to that app.
- Note the commit you copied (`git rev-parse --short HEAD`), so you can tell later what changed (see [Updating](#updating)).

## Setup

**1. Load the tokens once**, at the root of the app (e.g. Next.js `app/layout.tsx`, Vite `main.tsx`):

```ts
import './tokens' // the path where you copied src/tokens — loads base, theme, typography and effect CSS
```

**2. Load Manrope as a variable font.** The text styles use weights 500, 650 and 750 and name the family `'Manrope'`, so
it must be the variable font under that exact name. Either the Google Fonts link

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
```

or self-host it (recommended for production) with the same family name:

```css
@font-face {
  font-family: 'Manrope';
  src: url('/fonts/Manrope-Variable.woff2') format('woff2');
  font-weight: 200 800;
  font-display: swap;
}
```

`next/font` renames the family, so it won't match `'Manrope'` — use the link or `@font-face` above instead.

**3. Pick the theme** (optional — the default is Lemonn light). Themes are attributes on `<html>`, or on any element
to theme just that part of the page:

| Attribute | Values |
|---|---|
| `data-product` | `lm` (Lemonn), `cspro` (CS PRO, dark only), `kuber` (Kuber) |
| `data-mode` | `light`, `dark` |
| `data-contrast` | `accessible` for the ♿ higher-contrast theme; leave it off otherwise |

```html
<html lang="en" data-product="lm" data-mode="dark">
```

Set them in the server-rendered HTML to avoid a flash of the wrong theme. `src/theme`'s `ThemeProvider` does the same
in the browser, follows the system dark mode and "Increase contrast" settings, and remembers the choice in
`localStorage` (`l3-theme`). Use it, or set the attributes from your own settings.

## Using the components

```tsx
import { Button, Card, Tag, TextField } from './components'

<Card onClick={openHolding}>
  <Tag variant="secondary" color="profit" size="sm">Buy</Tag>
</Card>
```

- **Props and rules:** each component's page on the docs site (Overview + Specs tabs) and the props in its source
  (`src/components/<Name>/<Name>.tsx`, documented inline). Plain-text versions for search or AI assistants:
  `llms.txt` / `llms-full.txt` on the docs site.
- **Design rules** (which variant when, spacing, layering, selection): `DESIGN_SYSTEM.md`, plus `USAGE.md` in Button,
  ButtonGroup, BottomSheet, Card and ListCell.
- **Figma → code:** `docs/figma-code-map.md` maps every Figma component property to a prop.
- **Development warnings:** in development, components warn in the console when they're misused (a clickable card with
  a button inside, an icon-only button without a name, a third stacked bottom sheet…). They switch off in production
  builds (`process.env.NODE_ENV`).

### Refs and forms

`Button`, `Checkbox`, `Radio`, `Switch` and `TextField` pass `ref` to their `<button>` / `<input>` / `<textarea>`, so
form libraries and focus management work:

```tsx
const { register } = useForm()
<TextField label="Quantity" {...register('qty')} />
<Checkbox {...register('agree')} aria-label="I agree" />
```

Other components don't take a ref; wrap them in an element if you need one.

### Icons

`<Icon icon={…} />` (and the icon slots of Button, Tag, ListCell…) takes a **string** — a `data:` URI or a URL — or an
object with `src`. The simplest way to get icons that work in any bundler is to generate a module with only the ones
you use:

```sh
npm run -s glyphs -- --pick search,arrow_back,chevron_right > icons.ts
```

```tsx
import { msSearch } from './icons'
<Icon icon={msSearch} label="Search" />
```

Names are Material Symbols Rounded file names (`content_copy`, `content_copy-fill` for the filled one); browse them on
the docs site's Icons page. Lemonnade's own icons (`lmSwitchArrowVertical`…) are exported from
`src/components/icons/glyphs.ts`. Importing `.svg` files also works (a URL in Vite / Create React App, `{ src }` in
Next.js), but SVGR-style setups that turn SVGs into components don't fit, and URLs on another domain need CORS headers
(icons are CSS masks, which load with CORS).

## Things to know

- **Language and locale:** numbers and dates are formatted for `en-IN` and amounts use ₹ (PriceChange, Chart,
  Stepper, DatePicker). Screen-reader labels default to English; most can be changed with props (`closeLabel`,
  `backLabel`, `infoLabel`, `dotLabel`, `limitMessage`…), but DatePicker's "Previous month" / "Next month" and the
  bottom sheet header's "Back" are fixed for now.
- **Layering:** BottomSheet sits at `z-index: 1000`, the Actionbar and BottomNavbar at `10`. Fit them into your app's
  layering, or override them in your CSS.
- **Page scroll:** an open BottomSheet locks page scroll (`overflow: hidden` on `<body>`) and makes the rest of the
  page inert while it's open, then restores both.
- **Don't edit generated files:** `src/tokens/generated/*`, `src/components/**/glyphs.ts`, `src/icons/lemonnade/index.ts`.
  They're rebuilt from Figma exports and SVGs (`npm run tokens`, `npm run glyphs`) — change the sources and rebuild.

## Updating

Each component's **What's new** tab on the docs site (source: `src/docs/changelog.ts`) lists its releases with a
version, e.g. Card 1.8.0. To take an update, compare against the commit you copied:

```sh
git diff <copied-commit> HEAD -- src/components src/tokens src/theme
```

Before copying, `npm run check:portable` confirms the components still work outside this repo: no Vite-only code,
strict TypeScript with a plain setup, and server rendering of every component.

## Licences

Material Symbols icons: Apache License 2.0 (Google). Manrope: SIL Open Font License 1.1.
