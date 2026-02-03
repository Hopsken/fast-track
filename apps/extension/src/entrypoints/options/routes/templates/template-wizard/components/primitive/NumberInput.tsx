import { Input } from '@internal/ui/components/input'

import type { NumberInputProps } from '../../types'

/**
 * Number input component for numeric fields.
 * Validates input to ensure only valid numbers are accepted.
 *
 * @component
 * @example
 * ```tsx
 * <NumberInput
 *   value={42}
 *   onChange={setValue}
 *   placeholder="Enter story points"
 *   field={fieldMetadata}
 * />
 * ```
 *
 * @param {NumberInputProps} props - Component props
 * @param {number | undefined} props.value - Current numeric value
 * @param {(v: number | undefined) => void} props.onChange - Callback when value changes
 * @param {string} [props.placeholder] - Placeholder text (auto-generated from field if not provided)
 * @param {FieldMetadata} [props.field] - Field metadata for auto-generating placeholder
 * @returns {JSX.Element} Number input component
 */
export function NumberInput({
  value,
  onChange,
  placeholder,
  field
}: NumberInputProps) {
  return (
    <Input
      type="number"
      placeholder={
        placeholder ?? (field ? `Enter ${field.name}` : 'Enter number')
      }
      value={typeof value === 'number' ? String(value) : ''}
      onChange={(e) => {
        const num = Number(e.target.value)
        onChange(!e.target.value || isNaN(num) ? undefined : num)
      }}
    />
  )
}
