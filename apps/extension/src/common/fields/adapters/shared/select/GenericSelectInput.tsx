import { useMemo } from 'react'

import { CommandPanel, useCommandSearch } from '@/common/commands'
import { CommandSingleSelect } from '@/components/commands'
import { CommandMultiSelect } from '@/components/commands/CommandMultiSelect'

import { useFieldOptions } from '../../../hooks/useFieldOptions'
import { FieldInputComponentProps, FieldValueSchema } from '../../../types'

const GenericSelectInputInner = <S extends FieldValueSchema>({
  adapter,
  config,
  value,
  context,
  onChange,
  onConfirm
}: FieldInputComponentProps<S>) => {
  const isMultiple = context.metadata.schema.type === 'array'
  const query = useCommandSearch()

  const { options, isLoading } = useFieldOptions({
    adapter,
    context,
    config,
    query
  })

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
      getOptionValue={adapter.keyOf}
      getOptionLabel={adapter.labelOf ?? adapter.keyOf}
    />
  )
}

export function GenericSelectInput<S extends FieldValueSchema>(
  props: FieldInputComponentProps<S>
) {
  const { value, adapter } = props
  const initialValue = useMemo(() => {
    if (!value) return ''

    if (Array.isArray(value)) {
      const firstValue = value[0]
      return adapter.keyOf(firstValue) ?? ''
    }

    return adapter.keyOf(value) ?? ''
  }, [value, adapter])
  return (
    <CommandPanel value={initialValue}>
      <GenericSelectInputInner {...props} />
    </CommandPanel>
  )
}
