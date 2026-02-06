import { useMemo } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query' // v5 写法，v4 为 keepPreviousData: true
import { useDebounce } from 'ahooks'
import { z, ZodType } from 'zod'

import { FieldConfig } from '@/repository/schema'

import { FieldAdapter, JiraFieldContext } from '../types'

export const useFieldOptions = <Schema extends ZodType>(params: {
  adapter: FieldAdapter<Schema>
  context: JiraFieldContext
  config: FieldConfig<z.infer<Schema>>
  query?: string
}) => {
  const { adapter, context, config, query = '' } = params

  // 2. 防抖处理：只有 debouncedValue 变化时，才会触发 React Query
  const [debouncedQuery] = useDebounce(query, { wait: 300 })

  // 3. 判断是否需要服务端搜索
  // 如果是 'limit' 模式，我们不需要发请求，直接用本地数据
  const isServerSearch = config.behavior !== 'restricted'

  const queryResult = useQuery({
    // 关键点：将 debouncedQuery 加入缓存 Key

    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      'field-options',
      adapter.key,
      context.project?.key,
      context.issueType?.id,
      debouncedQuery
    ],

    queryFn: () => adapter.fetchOptions!(context, debouncedQuery),

    enabled: isServerSearch && !!adapter.fetchOptions,

    // 关键体验优化：在搜索新词的过程中，保留上一份数据，避免下拉框突然闪烁变白
    placeholderData: keepPreviousData
  })

  // 4. 计算最终 Options
  const options = useMemo(() => {
    if (isServerSearch) {
      return queryResult.data || []
    }

    // Limit 模式：使用配置的 allowedValues，并在前端做简单的本地过滤
    const allowedValues = config.allowedOptions || []
    const search = debouncedQuery?.trim().toLowerCase() ?? ''

    if (search) {
      allowedValues.filter((opt) => {
        const keywords = adapter.keywords?.(opt) || []
        const display = adapter.labelOf?.(opt) || adapter.keyOf(opt)
        return [display, ...keywords].some((keyword) =>
          keyword.toLowerCase().includes(search)
        )
      })
    }

    return allowedValues
  }, [
    adapter,
    config.allowedOptions,
    debouncedQuery,
    isServerSearch,
    queryResult.data
  ])

  return {
    options,
    isLoading: queryResult.isLoading && isServerSearch
  }
}
