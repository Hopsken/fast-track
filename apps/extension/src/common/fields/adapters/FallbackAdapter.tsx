import stringify from 'fast-json-stable-stringify'
import { z } from 'zod'

import { FieldAdapter, FieldValueSchema, JiraFieldContext } from '../types'

/**
 * Fallback Schema
 * 既然我们不支持它，我们对它的内部数据不做任何假设，
 * 允许它是 any，但在提交时我们会忽略它。
 */
const fallbackSchema = z.any().optional()

/**
 * Fallback UI Component
 * 展示一个友好的警告框，告诉开发者或用户这个字段暂时不可用。
 */
const FallbackInput = ({ context }: { context: JiraFieldContext }) => {
  // 从 config 中尝试获取字段的原始类型，方便调试
  // 假设 registry 传递过来时把原始类型塞进了 config.jiraFieldType
  const fieldType = context.metadata?.schema.type || 'unknown'
  const fieldId = context.metadata?.fieldId || 'unknown-id'

  return (
    <div
      style={{
        padding: '8px 12px',
        backgroundColor: '#f4f5f7', // Jira 风格的浅灰色背景
        border: '1px dashed #dfe1e6',
        borderRadius: '3px',
        color: '#6b778c',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
      <span role="img" aria-label="warning">
        ⚠️
      </span>
      <span>
        Field <strong>{fieldId}</strong> (Type: <code>{fieldType}</code>) is not
        supported yet.
      </span>
    </div>
  )
}

export const FallbackAdapter: FieldAdapter<FieldValueSchema> = {
  key: 'fallback',

  // @ts-expect-error ah...
  schema: z.unknown(),

  keyOf: (val) => stringify(val),

  // 不需要 fetchOptions，因为我们不展示选项
  fetchOptions: undefined,

  InputComponent: FallbackInput,

  ConfigComponent: FallbackInput,

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
  // @ts-expect-error ignore this
  fromDTO: (apiValue) => apiValue
}
