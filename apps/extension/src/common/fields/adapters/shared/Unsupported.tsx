import { JiraFieldContext } from '../../types'

/**
 * Fallback UI Component
 * 展示一个友好的警告框，告诉开发者或用户这个字段暂时不可用。
 */
export const Unsupported = ({ context }: { context: JiraFieldContext }) => {
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
