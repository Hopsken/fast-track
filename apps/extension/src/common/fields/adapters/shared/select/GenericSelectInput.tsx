import { useMemo, useState } from 'react'

import { CommandSingleSelect } from '@/components/commands'
import { CommandMultiSelect } from '@/components/commands/CommandMultiSelect'

import { useFieldOptions } from '../../../hooks/useFieldOptions'
import { FieldInputComponentProps, FieldValueSchema } from '../../../types'

export const GenericSelectInput = <S extends FieldValueSchema>({
  adapter,
  config,
  value,
  context,
  onChange,
  onConfirm
}: FieldInputComponentProps<S>) => {
  const [search, setSearch] = useState('')
  const isMultiple = context.metadata.schema.type === 'array'

  const { options, isLoading } = useFieldOptions({
    adapter,
    context,
    config,
    query: search
  })

  const shouldFilter = useMemo(() => {
    return !adapter.fetchOptions
  }, [adapter.fetchOptions])

  if (isMultiple) {
    // eslint-disable-next-line sonarjs/no-nested-conditional
    const values = value ? (Array.isArray(value) ? value : [value]) : []
    return (
      <CommandMultiSelect
        title={adapter.title ?? context.metadata.name}
        isLoading={isLoading}
        value={values}
        options={options}
        // @ts-expect-error newValue is array, should be handler externally
        onChange={(newValue) => onChange(newValue)}
        onConfirm={onConfirm}
        search={search}
        onSearchChange={setSearch}
        shouldFilter={shouldFilter}
        getOptionValue={adapter.keyOf}
        getOptionLabel={adapter.labelOf ?? adapter.keyOf}
      />
    )
  }

  return (
    <CommandSingleSelect
      title={adapter.title ?? context.metadata.name}
      isLoading={isLoading}
      value={value}
      options={options}
      onChange={onChange}
      onConfirm={onConfirm}
      search={search}
      onSearchChange={setSearch}
      shouldFilter={shouldFilter}
      getOptionValue={adapter.keyOf}
      getOptionLabel={adapter.labelOf ?? adapter.keyOf}
    />
  )
}
