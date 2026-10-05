// Icons a design can show right away, without loading the full Material Symbols catalogue. Anything else resolves through
// the lazily loaded catalogue (see useIconCatalog).
import {
  msAccountBalanceWallet, msAdd, msArrowForward, msBookmark, msChevronRight, msFilterList, msHelp, msInfo, msLock, msMoreVert,
  msNotifications, msPerson, msSchedule, msSearch, msSettings, msShare, msStar, msTrendingUp, msVerified,
} from '../icons/material'
import type { IconCatalog } from './useIconCatalog'
import type { IconSpec } from './design'

const bundled: Record<string, string> = {
  account_balance_wallet: msAccountBalanceWallet, add: msAdd, arrow_forward: msArrowForward, bookmark: msBookmark,
  chevron_right: msChevronRight, filter_list: msFilterList, help: msHelp, info: msInfo, lock: msLock, more_vert: msMoreVert,
  notifications: msNotifications, person: msPerson, schedule: msSchedule, search: msSearch, settings: msSettings, share: msShare,
  star: msStar, trending_up: msTrendingUp, verified: msVerified,
}

/** URL of an icon by Material Symbols name, or undefined while the catalogue is still loading. */
export function iconSrc(name: string | undefined, fill: boolean | undefined, catalog: IconCatalog | null): string | undefined {
  if (!name) return undefined
  if (!fill && bundled[name]) return bundled[name]
  return catalog?.iconUrl(name, !!fill) ?? bundled[name]
}

export const specSrc = (spec: IconSpec | undefined, fallback: string, catalog: IconCatalog | null) => iconSrc(spec?.name ?? fallback, spec?.fill, catalog)
