import { useId, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { CheckCircleIcon, InfoIcon, TextGripIcon, WarningIcon } from '../icons'
import styles from './TextField.module.css'

/** Figma "L3: input field & text Box" (node 4543:66091). */
type Common = {
  /** Figma 👁️ Label. */
  label?: string
  /** Figma "required" — the red * after the label (also sets the input's required attribute). */
  required?: boolean
  /** Figma "Helper text" row under the field. */
  helperText?: ReactNode
  /** Field only: the ⓘ before the helper text (Figma descriptionIcon). Error/success always show their icon. */
  helperIcon?: boolean
  /** Figma State=Error / Success. Typing (focus), Typed (has value) and Disabled come from the input itself. */
  status?: 'error' | 'success'
  className?: string
}

type FieldProps = Common &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'> & {
    multiline?: false
    /** Figma "Icon - L" slot (16px). */
    iconLeft?: ReactNode
    /** Figma "Icon-R" slot (16px). */
    iconRight?: ReactNode
  }

type BoxProps = Common &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
    /** Figma isInputBox=True: multi-line text box with a character counter. */
    multiline: true
    /** Shows the "n/max" counter. Going over switches to the error state with `limitMessage`. */
    maxLength?: number
    /** Figma "Character limit reached". */
    limitMessage?: string
  }

export type TextFieldProps = FieldProps | BoxProps

export function TextField(props: TextFieldProps) {
  const { label, required, helperText, helperIcon = true, status, className, ...rest } = props
  const autoId = useId()
  const id = rest.id ?? autoId
  const helperId = `${id}-helper`

  // Character count for the text box (controlled value, or tracked while uncontrolled).
  const [typedLength, setTypedLength] = useState(String(rest.value ?? rest.defaultValue ?? '').length)
  const length = rest.value !== undefined ? String(rest.value).length : typedLength

  const maxLength = rest.multiline ? rest.maxLength : undefined
  const overLimit = maxLength !== undefined && length > maxLength
  const effectiveStatus = overLimit ? 'error' : status
  const message = overLimit && rest.multiline ? (rest.limitMessage ?? 'Character limit reached') : helperText

  const statusIcon = effectiveStatus === 'error' ? <WarningIcon /> : effectiveStatus === 'success' ? <CheckCircleIcon /> : null
  const leadIcon = statusIcon ?? (!rest.multiline && helperIcon ? <InfoIcon /> : null)
  const hasHelperRow = Boolean(message) || maxLength !== undefined

  const shared = {
    id,
    required,
    'aria-invalid': effectiveStatus === 'error' || undefined,
    'aria-describedby': hasHelperRow ? helperId : undefined,
    className: styles.input,
  }

  let control: ReactNode
  if (rest.multiline) {
    const { multiline: _multiline, maxLength: _max, limitMessage: _limit, onChange, ...textarea } = rest
    control = (
      <div className={styles.control}>
        <textarea
          rows={3}
          {...textarea}
          {...shared}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            setTypedLength(e.target.value.length)
            onChange?.(e)
          }}
        />
        <span className={styles.grip} aria-hidden="true"><TextGripIcon /></span>
      </div>
    )
  } else {
    const { multiline: _multiline, iconLeft, iconRight, onChange, ...input } = rest
    control = (
      <div className={styles.control}>
        {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
        <input
          {...input}
          {...shared}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setTypedLength(e.target.value.length)
            onChange?.(e)
          }}
        />
        {iconRight && <span className={styles.icon}>{iconRight}</span>}
      </div>
    )
  }

  return (
    <div
      className={[styles.field, className].filter(Boolean).join(' ')}
      data-multiline={rest.multiline || undefined}
      data-status={effectiveStatus}
      data-disabled={rest.disabled || undefined}
    >
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      {control}
      {hasHelperRow && (
        <div id={helperId} className={styles.helper}>
          {/* Live so a new error/success message is announced while typing, not only on focus. */}
          <span className={styles.helperMessage} aria-live="polite">
            {leadIcon && message && <span className={styles.helperIcon}>{leadIcon}</span>}
            {message}
          </span>
          {maxLength !== undefined && (
            <span className={styles.counter}>
              {length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
