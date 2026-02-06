import { ZodType } from 'zod'

import { CommandSingleSelect } from '@/components/commands'

import { useFieldOptions } from '../../../hooks/useFieldOptions'
import { FieldInputComponentProps } from '../../../types'

export const GenericSelectInput = <S extends ZodType>({
  adapter,
  config,
  value,
  context,
  onChange,
  inputText
}: FieldInputComponentProps<S>) => {
  // 复用之前的 Hook，虽然 Priority 通常不需要搜索，但统一接口没坏处
  // 注意：Priority 通常是全局或项目级的，不太需要 debounce 搜索，
  const { options, isLoading } = useFieldOptions({
    adapter,
    context,
    config,
    query: inputText
  })

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
