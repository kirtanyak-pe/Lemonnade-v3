# Icons

> The full Material Symbols set — Rounded, weight 400, grade 0, optical size 24dp, fill off (with the filled variant). Search, copy as SVG or download any icon.

- Group: Foundations
- Lifecycle: done
- Version: 1.1.0

## Overview

### Using an icon

In Figma, place icons from the **👁️ Lemonnade V3 → Icons** library and swap them through a component's ↪ icon properties. Every icon is Material Symbols Rounded (weight 400, grade 0, 24dp) — never mix in another icon set or the 48px version.

- **Size:** 24 by default; 16 inside small buttons, tabs and tags; 12–24 from the icon-size variables.
- **Color:** icons take the color of the text next to them — use content color variables, never a custom color.
- **Fill off** is the default; the filled version marks a selected or active state.
- Missing an icon in Figma? Find it below, **Copy SVG** and paste it into Figma, or download it.

### Using an icon in code

```
`import { Icon } from './components/Icon'
import { msWallet, msWalletFill } from './icons/material'

<Icon icon={msWallet} size={24} />            // decorative
<Icon icon={msWalletFill} label="Wallet" />    // meaningful → announced
<Button iconLeft={<Icon icon={msAdd} />}>Add funds</Button>`
```

Only the icons you import end up in the app. Color comes from the surrounding text color; sizes use the icon-size tokens (12–24). Run `npm run icons` to pull new icons from Google. Import name: `ms` + the icon name in PascalCase (`content_copy` → `msContentCopy`, filled: `msContentCopyFill`).

## Recent changes

- **1.1.0** (2026-10-07) Copy and download SVG: Pick an icon to Copy SVG (pastes into Figma as an editable vector), Download SVG or Copy name. Usage guidance for designers: Figma icon library, sizes, color and fill. The import snippet and Copy import button moved to the agent docs.
- **1.0.0** (2026-09-26) Full Material Symbols Rounded library: 3,900+ icons (outlined + filled), weight 400, grade 0, 24dp optical size, downloaded from Google. <Icon> component with size tokens and an optional label for meaningful icons. npm run icons to pull new icons; only imported icons end up in the app.
