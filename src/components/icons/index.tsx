// Icons exported from the Figma icon library (linked to the Lemonnade V3 file), rendered as
// masks so they take the surrounding text colour. They fill their parent — the parent sets the size.
import { MaskIcon } from '../MaskIcon'
import arrowBack from './assets/arrow-back.svg'
import close from './assets/close.svg'
import infoOutline from './assets/info-outline.svg'
import infoOutline24 from './assets/info-outline-24.svg'
import search from './assets/search.svg'
import warningAmber14 from './assets/warning-amber-14.svg'
import checkCircle14 from './assets/check-circle-14.svg'
import info14 from './assets/info-14.svg'
import textGrip from './assets/text-grip.svg'
import keyboardArrowDown from './assets/keyboard-arrow-down.svg'

/** Figma "D2 → arrow_back" (24). */
export const BackIcon = () => <MaskIcon src={arrowBack} />
/** Figma "D2 → close" (24). */
export const CloseIcon = () => <MaskIcon src={close} />
/** Figma "info icon" (16) — its SVG carries 60% opacity, so use content/primary to get content/secondary. */
export const InfoIcon = () => <MaskIcon src={infoOutline} />
/** Figma "D2 → info_outline" (24), full opacity. */
export const InfoOutlineIcon = () => <MaskIcon src={infoOutline24} />
/** Figma "D2 → search" (16). */
export const SearchIcon = () => <MaskIcon src={search} />
/** Figma "D2 → warning_amber" (14). */
export const WarningIcon = () => <MaskIcon src={warningAmber14} />
/** Figma "D2 → check_circle_outline" (14). */
export const CheckCircleIcon = () => <MaskIcon src={checkCircle14} />
/** Figma "Info-icon" (14) — SVG carries 60% opacity (use content/primary for a content/secondary look). */
export const InfoSmallIcon = () => <MaskIcon src={info14} />
/** Figma text box "Handler" resize grip (36) — SVG carries 60% opacity. */
export const TextGripIcon = () => <MaskIcon src={textGrip} />
/** Figma "D2 → keyboard_arrow_down" (24) — the list cell's default right icon. */
export const ChevronDownIcon = () => <MaskIcon src={keyboardArrowDown} />
