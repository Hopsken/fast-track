import { useMemo } from 'react'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'

import { FieldInputBaseProps, IconOption } from '../../types'

import { useFieldOptions } from './useFieldOptions'

/**
 * Single select field input with search/filter functionality.
 * Converts field metadata allowed values into searchable options.
 * Supports filtering to quickly find options in large lists.
 */
export function SingleSelectField<T extends IconOption>({
  field,
  value,
  onChange
}: FieldInputBaseProps<T>) {
  const options = useFieldOptions<T>(field, '')
  const searchOptions = useMemo<SearchOption<T>[]>(
    () =>
      options.map((opt) => ({
        value: opt.id,
        label: opt.name ?? opt.value ?? opt.id,
        data: opt
      })),
    [options]
  )

  return (
    <InputSearch<T>
      placeholder={`Select ${field?.name}…`}
      options={searchOptions}
      value={value}
      onSelect={(val) => onChange(val as T)}
      filter
    />
  )
}
