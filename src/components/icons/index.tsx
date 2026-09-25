// Icons exported from the Figma icon library (linked to the Lemonnade V3 file), rendered as
// masks so they take the surrounding text colour. They fill their parent — the parent sets the size.
import { MaskIcon } from '../MaskIcon'
import arrowBack from './assets/arrow-back.svg'
import close from './assets/close.svg'
import infoOutline from './assets/info-outline.svg'
import search from './assets/search.svg'

/** Figma "D2 → arrow_back" (24). */
export const BackIcon = () => <MaskIcon src={arrowBack} />
/** Figma "D2 → close" (24). */
export const CloseIcon = () => <MaskIcon src={close} />
/** Figma "info icon" (16). */
export const InfoIcon = () => <MaskIcon src={infoOutline} />
/** Figma "D2 → search" (16). */
export const SearchIcon = () => <MaskIcon src={search} />
