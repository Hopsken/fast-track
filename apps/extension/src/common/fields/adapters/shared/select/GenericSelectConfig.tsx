import { useState } from 'react'
import { useMemoizedFn } from 'ahooks'
import { z, ZodType } from 'zod'

import { GeneralIcon } from '@/components'
import { AutoComplete } from '@/components/ui/AutoComplete'

import { useFieldOptions } from '../../../hooks/useFieldOptions'
import { FieldConfigComponentProps, UnwrapArray } from '../../../types'

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
  type Item = UnwrapArray<Value>

  const isMultiple = context.metadata.schema.type === 'array'
  const [query, setQuery] = useState('')
  const { options, isLoading } = useFieldOptions<S>({
    adapter,
    context,
    config,
    query
  })

  // AutoComplete 在多选时返回 Item[]，单选时返回 Item | null
  // 这正好对应了我们的 Value 类型
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleValueChange = useMemoizedFn((newValue: any) => {
    onValueChange(newValue)

    // 5. 交互优化：只有单选时，选中后才自动 Confirm (关闭)
    // 多选时用户通常需要连续选多个，不应自动关闭
    if (!isMultiple) {
      onConfirm()
    }
  })

  // 将 AutoComplete 的泛型显式指定为 Item (单个选项类型)
  return (
    <AutoComplete<Item, boolean>
      multiple={isMultiple}
      isLoading={isLoading}
      // 这里的类型转换是必要的，因为 TypeScript 无法在运行时确定 Value 到底是 Item 还是 Item[]
      // 但我们在逻辑上保证了 matches multiple 属性
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value={value as any}
      onValueChange={handleValueChange}
      query={query}
      onQueryChange={setQuery}
      // 强制 options 类型为 Item[]
      // 这样 AutoComplete 内部才能正确处理 keyOf(item)
      options={options as unknown as Item[]}
      // Adapter 的 keyOf/labelOf 是针对 Item 设计的
      getOptionValue={(item) => adapter.keyOf(item as Item)}
      getOptionLabel={(item) =>
        adapter.labelOf?.(item as Item) ?? adapter.keyOf(item as Item)
      }
      renderOptionIcon={(opt) => {
        // opt 在这里被正确推导为 Item
        const iconUrl = getIconUrl(opt)
        const name = adapter.labelOf?.(opt) ?? adapter.keyOf(opt)
        return iconUrl ? <GeneralIcon alt={name} iconUrl={iconUrl} /> : null
      }}
    />
  )
}
