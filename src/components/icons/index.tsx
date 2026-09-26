// Icons used inside the components — Material Symbols Rounded (wght 400 · GRAD 0 · opsz 24) from
// src/icons/material, rendered as masks so they take the surrounding text colour and fill their slot.
// For anything else, import from '../icons/material' and use <Icon>.
import { MaskIcon } from '../MaskIcon'
import {
  msArrowBack,
  msArrowForward,
  msBlurOn,
  msCheckCircle,
  msClose,
  msInfo,
  msKeyboardArrowDown,
  msSearch,
  msWarning,
} from '../../icons/material'
import textGrip from './assets/text-grip.svg'

export const BackIcon = () => <MaskIcon src={msArrowBack} />
export const CloseIcon = () => <MaskIcon src={msClose} />
export const SearchIcon = () => <MaskIcon src={msSearch} />
export const InfoIcon = () => <MaskIcon src={msInfo} />
export const WarningIcon = () => <MaskIcon src={msWarning} />
export const CheckCircleIcon = () => <MaskIcon src={msCheckCircle} />
export const ChevronDownIcon = () => <MaskIcon src={msKeyboardArrowDown} />
export const ArrowRightIcon = () => <MaskIcon src={msArrowForward} />
/** Figma's default placeholder in icon slots (blur_on). */
export const PlaceholderIcon = () => <MaskIcon src={msBlurOn} />

/** @deprecated Same as InfoIcon — kept so existing imports keep working. */
export const InfoOutlineIcon = InfoIcon
/** @deprecated Same as InfoIcon — kept so existing imports keep working. */
export const InfoSmallIcon = InfoIcon

/** Figma text box "Handler" resize grip — a component graphic, not a library icon. SVG carries 60% opacity. */
export const TextGripIcon = () => <MaskIcon src={textGrip} />
