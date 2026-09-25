import { MaskIcon } from '../MaskIcon'
import placeholder from './assets/icon-placeholder.svg'
import arrowRight from './assets/icon-arrow-right.svg'

/** Figma's default icon-l (placeholder grid). */
export const PlaceholderIcon = () => <MaskIcon src={placeholder} />

/** Figma's default icon-r (arrow). */
export const ArrowRightIcon = () => <MaskIcon src={arrowRight} />
