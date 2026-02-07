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
  inputText
}: FieldInputComponentProps<S>) => {
  const isMultiple = context.metadata.schema.type === 'array'

  const { options, isLoading } = useFieldOptions({
    adapter,
    context,
    config,
    query: inputText
  })

  if (isMultiple) {
    // eslint-disable-next-line sonarjs/no-nested-conditional
    const values = value ? (Array.isArray(value) ? value : [value]) : []
    return (
      <CommandMultiSelect
        title={adapter.title}
        isLoading={isLoading}
        value={values}
        options={options}
        // @ts-expect-error newValue is array, should be handler externally
        onChange={(newValue) => onChange(newValue)}
        getOptionValue={adapter.keyOf}
        getOptionLabel={adapter.labelOf ?? adapter.keyOf}
      />
    )
  }

  return (
    <CommandSingleSelect
      title={adapter.title}
      isLoading={isLoading}
      value={value}
      options={options}
      onChange={onChange}
      getOptionValue={adapter.keyOf}
      getOptionLabel={adapter.labelOf ?? adapter.keyOf}
    />
  )
}
