import { FC } from 'react'
import { Input } from '@internal/ui/components/input'

import type { TextInputProps } from '../../types'

/**
 * Text input component for single-line text fields.
 *
 * @component
 * @example
 * ```tsx
 * <TextInput
 *   value={value}
 *   onChange={setValue}
 *   placeholder="Enter summary"
 *   field={fieldMetadata}
 * />
 * ```
 *
 * @param {TextInputProps} props - Component props
 * @param {string | undefined} props.value - Current text value
 * @param {(v: string | undefined) => void} props.onChange - Callback when value changes
 * @param {string} [props.placeholder] - Placeholder text (auto-generated from field if not provided)
 * @param {FieldMetadata} [props.field] - Field metadata for auto-generating placeholder
 * @returns {JSX.Element} Text input component
 */
export const TextInput: FC<TextInputProps> = ({
  value,
  onChange,
  placeholder,
  field
}) => {
  return (
    <Input
      type="text"
      placeholder={
        placeholder ?? (field ? `Enter ${field.name}` : 'Enter text')
      }
      value={value ?? ''}
      onChange={(e) => {
        const newValue = e.target.value
        onChange(newValue.length > 0 ? newValue : undefined)
      }}
    />
  )
}
