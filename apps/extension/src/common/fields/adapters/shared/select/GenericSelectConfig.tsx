import { useState } from 'react'
import { z, ZodType } from 'zod'

import { GeneralIcon } from '@/components'
import { AutoComplete } from '@/components/ui/AutoComplete'

import { useFieldOptions } from '../../../hooks/useFieldOptions'
import { FieldConfigComponentProps } from '../../../types'

const iconicSchema = z.object({
  iconUrl: z.string().optional(),
  avatarUrl: z.string().optional()
})

const getIconUrl = (val: unknown) => {
  const { data } = iconicSchema.safeParse(val)
  return data?.iconUrl ?? data?.avatarUrl ?? ''
}

/**
 * Single select field input with search/filter functionality.
 * Converts field metadata allowed values into searchable options.
 * Supports filtering to quickly find options in large lists.
 */
export const GenericSelectConfig = <S extends ZodType>({
  adapter,
  context,
  config,
  onChangeConfig
}: FieldConfigComponentProps<S>) => {
  type Value = z.infer<S>
  const [query, setQuery] = useState('')
  const { options, isLoading } = useFieldOptions({
    adapter,
    context,
    config,
    query
  })

  return (
    <AutoComplete<Value, false>
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
      renderOptionIcon={(opt) => {
        const iconUrl = getIconUrl(opt)
        const name = adapter.labelOf?.(opt) ?? adapter.keyOf(opt)
        return iconUrl ? <GeneralIcon alt={name} iconUrl={iconUrl} /> : null
      }}
    />
  )
}
