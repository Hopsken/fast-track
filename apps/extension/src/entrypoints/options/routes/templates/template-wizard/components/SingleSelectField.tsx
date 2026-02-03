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
