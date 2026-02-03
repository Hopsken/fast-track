import { useMemo } from 'react'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'
import type { FieldMetadata } from '~/types/template'

interface SingleSelectFieldProps {
  fieldName: string
  allowedValues: NonNullable<FieldMetadata['allowedValues']>
  value: unknown
  onChange: (v: unknown) => void
}

/**
 * Single select field input with search/filter functionality.
 * Converts field metadata allowed values into searchable options.
 * Supports filtering to quickly find options in large lists.
 *
 * @component
 * @example
 * ```tsx
 * <SingleSelectField
 *   fieldName="status"
 *   allowedValues={[
 *     { id: '1', name: 'Open' },
 *     { id: '2', name: 'In Progress' }
 *   ]}
 *   value={{ id: '1', name: 'Open' }}
 *   onChange={setStatus}
 * />
 * ```
 *
 * @param {SingleSelectFieldProps} props - Component props
 * @param {string} props.fieldName - Name of the field for placeholder text
 * @param {NonNullable<FieldMetadata['allowedValues']>} props.allowedValues - Array of allowed values from field metadata
 * @param {unknown} props.value - Currently selected value
 * @param {(v: unknown) => void} props.onChange - Callback when selection changes
 * @returns {JSX.Element} Searchable single-select dropdown
 */
export function SingleSelectField({
  fieldName,
  allowedValues,
  value,
  onChange
}: SingleSelectFieldProps) {
  const options = useMemo<SearchOption<Record<string, unknown>>[]>(
    () =>
      allowedValues.map((av) => ({
        value: String(av.id ?? av.value ?? av.name),
        label: av.name ?? av.value ?? av.id ?? 'Unknown',
        data: av as Record<string, unknown>
      })),
    [allowedValues]
  )

  return (
    <InputSearch
      placeholder={`Select ${fieldName}…`}
      options={options}
      value={value as Record<string, unknown> | null}
      onSelect={(val) => onChange(val)}
      filter
    />
  )
}
