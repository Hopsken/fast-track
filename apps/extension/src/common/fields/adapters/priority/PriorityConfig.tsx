import { useState } from 'react'

import { GeneralIcon } from '@/components'
import { AutoComplete } from '@/components/ui/AutoComplete'
import { JiraPriority, JiraPrioritySchema } from '@/repository/schema'

import { useFieldOptions } from '../../hooks/useFieldOptions'
import { FieldConfigComponentProps } from '../../types'

/**
 * Single select field input with search/filter functionality.
 * Converts field metadata allowed values into searchable options.
 * Supports filtering to quickly find options in large lists.
 */
export const PriorityConfig = ({
  adapter,
  context,
  config,
  onChangeConfig
}: FieldConfigComponentProps<typeof JiraPrioritySchema>) => {
  const [query, setQuery] = useState('')
  const { options, isLoading } = useFieldOptions({
    adapter,
    context,
    config,
    query
  })

  return (
    <AutoComplete<JiraPriority, false>
      multiple={false}
      isLoading={isLoading}
      value={config.presetValue ?? null}
      onValueChange={(val) =>
        onChangeConfig({ ...config, presetValue: val ?? undefined })
      }
      query={query}
      onQueryChange={setQuery}
      options={options}
      getOptionValue={adapter.keyOf}
      getOptionLabel={adapter.labelOf ?? adapter.keyOf}
      renderOptionIcon={(opt) =>
        opt.iconUrl ? (
          <GeneralIcon alt={opt.name ?? ''} iconUrl={opt.iconUrl} />
        ) : null
      }
    />
  )
}
