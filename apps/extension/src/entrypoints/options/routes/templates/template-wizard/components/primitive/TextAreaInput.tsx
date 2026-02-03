import { Textarea } from '@internal/ui/components/textarea'

import type { TextAreaInputProps } from '../../types'

/**
 * Multi-line text area input component for longer text content.
 * Supports configurable row height for better content display.
 *
 * @component
 * @example
 * ```tsx
 * <TextAreaInput
 *   value={description}
 *   onChange={setDescription}
 *   rows={6}
 *   placeholder="Enter description"
 *   field={fieldMetadata}
 * />
 * ```
 *
 * @param {TextAreaInputProps} props - Component props
 * @param {string | undefined} props.value - Current text value
 * @param {(v: string | undefined) => void} props.onChange - Callback when value changes
 * @param {string} [props.placeholder] - Placeholder text (auto-generated from field if not provided)
 * @param {number} [props.rows=4] - Number of visible text rows
 * @param {FieldMetadata} [props.field] - Field metadata for auto-generating placeholder
 * @returns {JSX.Element} Text area input component
 */
export function TextAreaInput({
  value,
  onChange,
  placeholder,
  rows = 4,
  field
}: TextAreaInputProps) {
  return (
    <Textarea
      placeholder={
        placeholder ?? (field ? `Enter ${field.name}` : 'Enter text')
      }
      value={value ?? ''}
      rows={rows}
      onChange={(e) => {
        const newValue = e.target.value
        onChange(newValue.length > 0 ? newValue : undefined)
      }}
    />
  )
}
