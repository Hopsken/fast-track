import { ComponentType } from 'react'
import { z, ZodType } from 'zod'

import {
  FieldConfig,
  JiraFieldMetadata,
  JiraFieldSchemaArrayItemsType,
  JiraFieldSchemaType,
  JiraFieldSystem,
  JiraIssueType,
  JiraProject
} from '@/repository/schema'

export interface JiraFieldContext {
  project?: JiraProject
  issueType?: JiraIssueType
  metadata: JiraFieldMetadata
}

// Field 组件渲染公共属性
interface FieldComponentCommonProps<ValueSchema extends ZodType> {
  adapter: FieldAdapter<ValueSchema>
  config: FieldConfig<z.infer<ValueSchema>>
  context: JiraFieldContext
}

// Field config 组件，用于渲染配置页面
export interface FieldConfigComponentProps<ValueSchema extends ZodType>
  extends FieldComponentCommonProps<ValueSchema> {
  value?: z.infer<ValueSchema>
  onValueChange: (value: z.infer<ValueSchema> | null) => void
  onConfirm: () => void
}

export type FieldConfigComponent<ValueSchema extends ZodType> = ComponentType<
  FieldConfigComponentProps<ValueSchema>
>

// Field input 组件，用于渲染输入页面
export interface FieldInputComponentProps<ValueSchema extends ZodType>
  extends FieldComponentCommonProps<ValueSchema> {
  inputText?: string

  value?: z.infer<ValueSchema>
  onChange: (newValue: z.infer<ValueSchema> | null) => void
  onConfirm: () => void
}

export type FieldInputComponent<ValueSchema extends ZodType> = React.FC<
  FieldInputComponentProps<ValueSchema>
>

// Field key，包含 system fields, schema type, schema items type
export type FieldAdapterKey =
  | JiraFieldSystem
  | JiraFieldSchemaType
  | JiraFieldSchemaArrayItemsType
  | (string & {})

export interface FieldAdapter<
  ValueSchema extends ZodType,
  Value extends z.infer<ValueSchema> = z.infer<ValueSchema>
> {
  // 1. 唯一标识，对应 Jira 的 schema type (e.g., 'com.atlassian.jira.plugin...:select')
  // equals to system type for system field, otherwise, it's schema.type+schema.items type
  key: FieldAdapterKey
  title?: string

  // 2. Zod schema for the field value
  schema: ValueSchema
  keyOf: (val: Value) => string
  labelOf?: (val: Value) => string
  keywords?: (val: Value) => string[]

  // 3. 数据获取：如何获取该字段的选项列表（用于 Limit 模式或 Popup 里的选择）
  // 上下文可能包含 project key 或 issue type
  fetchOptions?: (context: JiraFieldContext, query?: string) => Promise<Value[]>

  // 4. 配置态 UI (Options Page)：用于设置 Preset 或 Limit
  // 比如 Story Point 可能是一个数字输入框，而 Assignee 是一个用户选择器
  ConfigComponent: FieldConfigComponent<ValueSchema>

  // 5. 运行态 UI (Popup/Command Palette)：用于用户实际填写
  // 这是一个“受控组件”，输入逻辑由 Adapter 内部封装
  InputComponent: FieldInputComponent<ValueSchema>

  // 6. 序列化：将内部值转换为 Jira API 需要的 JSON 格式
  toDTO: (value: Value) => unknown

  // 7. 反序列化：将 Jira API 返回的值转为内部 UI 格式
  fromDTO: (dto: unknown) => Value | null
}

export function defineFieldAdapter<const S extends ZodType>(
  adapter: FieldAdapter<S>
): FieldAdapter<S> {
  return adapter
}
