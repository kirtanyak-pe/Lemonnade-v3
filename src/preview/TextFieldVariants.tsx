import { PlaceholderIcon } from '../components/Button'
import { TextField } from '../components/TextField'

const icon = <PlaceholderIcon />
const text = 'Input text goes here'

// Rows mirror the Figma frame. "Typing" is really :focus — forced here with a preview-only class.
const rows = [
  { state: 'Default', field: { placeholder: 'Placeholder label' }, box: { placeholder: 'Placeholder label', maxLength: 250 } },
  { state: 'Typing', typing: true, field: { defaultValue: text }, box: { defaultValue: text, maxLength: 350 } },
  { state: 'Error', field: { defaultValue: text, status: 'error' as const }, box: { defaultValue: text.padEnd(352, '.'), maxLength: 350 } },
  { state: 'Success', field: { defaultValue: text, status: 'success' as const }, box: { defaultValue: text, maxLength: 350, status: 'success' as const, helperText: 'Helper text' } },
  { state: 'Typed', field: { defaultValue: text }, box: { defaultValue: text, maxLength: 250 } },
  { state: 'Disabled', field: { defaultValue: text, disabled: true }, box: { defaultValue: text, maxLength: 250, disabled: true } },
]

export function TextFieldVariants() {
  return (
    <div className="btn-grid-scroll">
      <table className="ab-grid">
        <thead>
          <tr><th /><th scope="col">isInputBox=False (field)</th><th scope="col">isInputBox=True (text box)</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.state} className={r.typing ? 'force-typing' : undefined}>
              <th scope="row">{r.state}</th>
              <td>
                <TextField label="Label" helperText="Helper text" iconLeft={icon} iconRight={icon} {...r.field} />
              </td>
              <td>
                <TextField multiline label="Label" helperText="Description character limit" {...r.box} />
              </td>
            </tr>
          ))}
          <tr>
            <th scope="row">Required</th>
            <td><TextField label="Label" required placeholder="Placeholder label" helperText="Helper text" /></td>
            <td><TextField multiline label="Label" required placeholder="Placeholder label" helperText="Description character limit" maxLength={250} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
