import { useState } from 'react'
import { z } from 'zod'

import { useFieldOptions } from '@/common/fields/hooks/useFieldOptions'
import { FieldValueSchema, SelectComponentProps } from '@/common/fields/types'
import { GeneralIcon } from '@/components'
import { AutoComplete } from '@/components/ui/AutoComplete'

import { useFieldContext } from '../context'

import { getIconUrl } from './utils'

export const GeneralSelect = <S extends FieldValueSchema>({
  isMultiple,
  value,
  onChange,
  onConfirm
}: SelectComponentProps<z.infer<S>>) => {
  type Item = z.infer<S>

  const [query, setQuery] = useState('')

  const { adapter, context, config } = useFieldContext<S>()
  const { options, isLoading } = useFieldOptions<S>({
    adapter,
    context,
    config,
    query
  })

  const { keyOf, labelOf } = adapter

  const getOptionLabel = (item: Item) => {
    const label = labelOf?.(item)
    return typeof label === 'string' ? label : keyOf(item)
  }

  // 将 AutoComplete 的泛型显式指定为 Item (单个选项类型)
  return (
    <AutoComplete<Item, boolean>
      multiple={isMultiple}
      isLoading={isLoading}
      // 这里的类型转换是必要的，因为 TypeScript 无法在运行时确定 Value 到底是 Item 还是 Item[]
      // 但我们在逻辑上保证了 matches multiple 属性
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={value as any}
      onValueChange={(next) => {
        // treat option selection as a commit when onConfirm is provided (restricted builder)
        onChange(next)
        onConfirm?.(next)
      }}
      query={query}
      onQueryChange={setQuery}
      // Adapter 的 keyOf/labelOf 是针对 Item 设计的
      getOptionValue={(item) => keyOf(item)}
      getOptionLabel={getOptionLabel}
      renderOptionIcon={(opt) => {
        // opt 在这里被正确推导为 Item
        const iconUrl = getIconUrl(opt)
        const name = getOptionLabel(opt)
        return iconUrl ? <GeneralIcon alt={name} iconUrl={iconUrl} /> : null
      }}
      options={options}
    />
  )
}
