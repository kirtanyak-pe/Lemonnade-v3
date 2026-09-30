// The full Material Symbols set (~6.5k icons). Loaded lazily (see useIconCatalog) so the Build page stays light.
import icons from '../icons/material/icons.json'

// URLs only (not inlined), so the browser fetches just the icons that are on screen.
const urls = import.meta.glob<string>('../icons/material/rounded/*.svg', { query: '?url&no-inline', import: 'default', eager: true })

export type IconEntry = (typeof icons)[number]
export const catalog: IconEntry[] = icons
export const iconUrl = (name: string, fill = false): string | undefined => urls[`../icons/material/rounded/${name}${fill ? '-fill' : ''}.svg`]
