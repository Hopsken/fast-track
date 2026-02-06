import { useState } from 'react'

import { GeneralIcon } from '@/components'
import { AutoComplete } from '@/components/ui/AutoComplete'

import { FieldInputBaseProps, IconOption } from '../../types'

import { useFieldOptions } from './useFieldOptions'

/**
 * Multi-select input displayed as toggleable chips.
 * Allows selecting multiple values from a predefined list with visual feedback.
 * Selected chips are highlighted and can be toggled on/off. Includes a clear all button.
 *
 * @component
 * @example
 * ```tsx
 * <MultiSelectChips
 *   field={field}
 *   value={[
 *     { id: '1', name: 'Frontend' },
 *     { id: '2', name: 'Backend' }
 *   ]}
 *   onChange={setComponents}
 * />
 * ```

 */
export function MultiSelectInput<T extends IconOption>({
  field,
  value,
  onChange
}: FieldInputBaseProps<T[]>) {
  const [query, setQuery] = useState('')
  const options = useFieldOptions<T>(field, query)

  return (
    <AutoComplete<T, true>
      multiple
      value={value ?? []}
      onValueChange={onChange}
      query={query}
      onQueryChange={setQuery}
      options={options}
      getOptionValue={(option) => option.id ?? ''}
      getOptionLabel={(option) => option.name ?? ''}
      renderOptionIcon={(opt) =>
        opt.iconUrl ? (
          <GeneralIcon alt={opt.name ?? ''} iconUrl={opt.iconUrl} />
        ) : null
      }
    />
  )
}
