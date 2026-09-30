import { Icon } from '../components/Icon'
import styles from './Build.module.css'

/** Icon-only button: a name is required. `pressed` makes it a two-state toggle (default / selected). */
export function IconButton({ icon, label, onClick, disabled, pressed }: { icon: string; label: string; onClick?: () => void; disabled?: boolean; pressed?: boolean }) {
  return (
    <button type="button" className={styles.iconButton} aria-label={label} title={label} aria-pressed={pressed} onClick={onClick} disabled={disabled}>
      <Icon icon={icon} size={20} />
    </button>
  )
}
