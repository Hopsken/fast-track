import { useState } from 'react'
import { useMemoizedFn } from 'ahooks'
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
  value,
  onValueChange,
  onConfirm
}: FieldConfigComponentProps<S>) => {
  type Value = z.infer<S>

  const isMultiple = context.metadata.schema.type === 'array'
  const [query, setQuery] = useState('')
  const { options, isLoading } = useFieldOptions({
    adapter,
    context,
    config,
    query
  })

  const onSelect = useMemoizedFn((opt: Value | null) => {
    onValueChange(opt)
    onConfirm()
  })

  if (isMultiple) {
    // eslint-disable-next-line sonarjs/no-nested-conditional
    const values = value ? (Array.isArray(value) ? value : [value]) : []
    return (
      <AutoComplete<Value, true>
        multiple={true}
        isLoading={isLoading}
        value={values}
        // @ts-expect-error newValue is array, should be handler externally
        onValueChange={onSelect}
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

  return (
    <AutoComplete<Value, false>
      multiple={isMultiple}
      isLoading={isLoading}
      value={value ?? null}
      onValueChange={onSelect}
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
