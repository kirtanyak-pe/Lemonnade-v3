# Icons

> The full Material Symbols set — Rounded, weight 400, grade 0, optical size 24dp, fill off (with the filled variant) — straight from Google, stored in the repo and imported one icon at a time.

- Group: Foundations
- Lifecycle: done
- Version: 1.0.0

## Overview

### Using an icon

```
`import { Icon } from './components/Icon'
import { msWallet, msWalletFill } from './icons/material'

<Icon icon={msWallet} size={24} />            // decorative
<Icon icon={msWalletFill} label="Wallet" />    // meaningful → announced
<Button iconLeft={<Icon icon={msAdd} />}>Add funds</Button>`
```

Only the icons you import end up in the app. Color comes from the surrounding text color; sizes use the icon-size tokens (12–24). Run `npm run icons` to pull new icons from Google.

## Recent changes

- **1.0.0** (2026-09-26) Full Material Symbols Rounded library: 3,900+ icons (outlined + filled), weight 400, grade 0, 24dp optical size, downloaded from Google. <Icon> component with size tokens and an optional label for meaningful icons. npm run icons to pull new icons; only imported icons end up in the app.
