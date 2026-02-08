import stringify from 'fast-json-stable-stringify'
import { z } from 'zod'

import { FieldAdapter, FieldValueSchema } from '../types'

import { Unsupported } from './shared/Unsupported'

/**
 * Fallback Schema
 * 既然我们不支持它，我们对它的内部数据不做任何假设，
 * 允许它是 any，但在提交时我们会忽略它。
 */
const fallbackSchema = z.any().optional()

export const FallbackAdapter: FieldAdapter<FieldValueSchema> = {
  key: 'fallback',

  schema: fallbackSchema,

  keyOf: (val) => stringify(val),

  // 不需要 fetchOptions，因为我们不展示选项
  fetchOptions: undefined,

  InputComponent: Unsupported,

  ConfigComponent: Unsupported,

  /**
   * 关键逻辑：序列化
   * 返回 `undefined` 是最佳实践。
   * 在 JSON.stringify 过程中，值为 undefined 的 key 会被自动剔除。
   * 这样可以防止我们向 Jira 发送它无法理解的数据格式，避免报错。
   */
  toDTO: () => undefined,

  /**
   * 反序列化
   * 如果 API 返回了值，我们原样保留，虽然 UI 无法编辑，
   * 但保持数据完整性是个好习惯。
   */
  fromDTO: (apiValue) => apiValue
}
