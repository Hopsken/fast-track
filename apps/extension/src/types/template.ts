export interface IssueTemplate {
  id: string
  name: string
  trigger: string
  icon?: string
  scope: TemplateScope
  fields: Record<string, FieldConfig>
  descriptionTemplate?: string
  createdAt: string
  updatedAt: string
  lastUsedAt?: string
}

export interface TemplateScope {
  siteUrl: string
  projectKey: string
  issueTypeId: string
  issueTypeName: string
}

export interface FieldConfig {
  behavior: 'preset' | 'visible' | 'ignore'
  presetValue?: unknown
}

export interface CachedFieldMetadata {
  cacheKey: string // `${siteUrl}:${projectKey}:${issueTypeId}`
  lastUpdated: string
  fields: FieldMetadata[]
}

export interface JsonType {
  type: string
  items?: string
  system?: string
  custom?: string
  customId?: number
}

export interface AllowedValue {
  id: string
  name?: string
  value?: string
  iconUrl?: string
  [key: string]: unknown
}

export interface FieldMetadata {
  fieldId: string
  key: string
  name: string
  required: boolean
  schema: JsonType
  allowedValues?: AllowedValue[]
  autoCompleteUrl?: string
  hasDefaultValue?: boolean
  defaultValue?: unknown
}

export type ConflictType =
  | 'preset_invalid'
  | 'now_required'
  | 'field_removed'
  | 'scope_invalid'

export interface FieldConflict {
  fieldId: string
  fieldName: string
  type: ConflictType
  message: string
  fieldMetadata?: FieldMetadata
}
