import { JiraPrioritySchema } from '@/repository/schema/jira/fields'
import { getJiraService } from '@/services'

import { defineFieldAdapter } from '../../types'

import { PriorityConfig } from './PriorityConfig'
import { PriorityInput } from './PriorityInput'

export const JiraPriorityAdapter = defineFieldAdapter<
  typeof JiraPrioritySchema
>({
  key: 'priority',

  schema: JiraPrioritySchema,
  keyOf: (val) => val.id ?? val.name,
  labelOf: (val) => val.name,

  // 数据获取逻辑
  fetchOptions: async () => {
    // 这是一个通用的获取项目优先级的 API
    const svc = getJiraService()
    const priorities = await svc.issues.getPriorities()
    return priorities
  },

  InputComponent: PriorityInput,

  ConfigComponent: PriorityConfig,

  // 序列化：Jira 创建 Issue 时只需要 ID
  toDTO: (value) => {
    return value ? { id: value.id } : undefined // 或 null
  },

  // 反序列化：从 API 读回来时，直接用
  fromDTO: (apiValue) => {
    return JiraPrioritySchema.safeParse(apiValue).data ?? null
  }
})
