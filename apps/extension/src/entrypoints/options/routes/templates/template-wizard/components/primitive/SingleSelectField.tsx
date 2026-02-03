import { useState } from 'react'

import { GeneralIcon } from '@/components'
import { AutoComplete } from '@/components/ui/AutoComplete'

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
  const [query, setQuery] = useState('')
  const options = useFieldOptions<T>(field, query)

  return (
    <AutoComplete<T, false>
      multiple={false}
      value={value}
      onValueChange={(val) => onChange(val ?? undefined)}
      query={query}
      onQueryChange={setQuery}
      options={options}
      getOptionValue={(opt) => opt.id}
      getOptionLabel={(opt) => opt.name ?? opt.value ?? opt.id}
      renderOptionIcon={(opt) =>
        opt.iconUrl ? (
          <GeneralIcon alt={opt.name ?? ''} iconUrl={opt.iconUrl} />
        ) : null
      }
    />
  )
}
