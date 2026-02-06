import { JiraFieldSchema } from '@/repository/schema'
import { getLogger } from '@/utils'

import { FallbackAdapter } from './adapters/FallbackAdapter'
import { FieldAdapter } from './types'

const log = getLogger()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapterRegistry: Record<string, FieldAdapter<any>> = {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerAdapter = (adapter: FieldAdapter<any>) => {
  adapterRegistry[adapter.key] = adapter
}

export function getFieldAdapter(schema: JiraFieldSchema) {
  // 策略 1: 尝试通过 Field Key 精确匹配 (e.g., "summary", "assignee", "com.pyxis.greenhopper.jira:gh-sprint")
  const systemKey = schema.system
  if (systemKey && adapterRegistry[systemKey]) {
    return adapterRegistry[systemKey]
  }

  // 策略 2: 尝试通过 Schema Custom Type 匹配 (插件类型)
  // 比如某些第三方插件的字段 "com.pyxis.greenhopper.jira:gh-sprint"
  if (schema.custom && adapterRegistry[schema.custom]) {
    return adapterRegistry[schema.custom]
  }

  // 策略 3: 尝试通过 Schema Base Type 匹配 (基础类型)
  // e.g. customfield_123 (type: 'user') -> 使用 JiraUserAdapter
  if (schema.type) {
    const type = schema.type

    // 特殊处理 array 类型：查看 array 里面装的是什么
    if (type === 'array' && schema.items) {
      // 比如 type: 'array', items: 'user' -> 也可以用 UserAdapter (需要 Adapter 支持多选)
      // 这里为了简单，如果 registry 里注册了 'user'，就返回 'user' 的 adapter
      // 你的 UserAdapter 应该读取 schema 来判断是否开启 isMulti
      if (adapterRegistry[schema.items]) {
        return adapterRegistry[schema.items]
      }
    }

    if (adapterRegistry[type]) {
      return adapterRegistry[type]
    }
  }

  // 策略 4: 彻底放弃，使用兜底
  log.warn(
    `[Registry] No adapter found for field: ${schema.system} (${schema.type}), using Fallback.`
  )
  return FallbackAdapter
}
