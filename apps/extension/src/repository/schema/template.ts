import { z } from 'zod'

import { JiraIssueTypeSchema, JiraProjectSchema } from './jira'

/**
 * Template scope is bound to a Jira instance via hostname only.
 * (No protocol, no path)
 */
export const IssueTemplateScopeSchema = z.object({
  baseUrlHost: z
    .string()
    .trim()
    .min(1)
    .refine(
      (v) =>
        !v.includes('://') &&
        !v.includes('/') &&
        !v.includes('?') &&
        !v.includes('#') &&
        !/\s/.test(v),
      {
        message: 'baseUrlHost must be a hostname only (no protocol/path)'
      }
    ),
  project: JiraProjectSchema,
  issueType: JiraIssueTypeSchema
})
export type IssueTemplateScope = z.infer<typeof IssueTemplateScopeSchema>

/**
 * Known Jira field schema `type` values.
 *
 * The `(string & {})` tail preserves autocomplete for known literals while
 * still accepting any string the Jira API might return in the future.
 */
export type JiraSchemaType =
  | 'string'
  | 'number'
  | 'array'
  | 'option'
  | 'priority'
  | 'resolution'
  | 'user'
  | 'date'
  | 'datetime'
  | 'issuetype'
  | 'project'
  | 'status'
  | 'securitylevel'
  | 'component'
  | 'version'
  | 'group'
  | 'issuelink'
  | 'timetracking'
  | 'any'
  | (string & {})

/**
 * Known Jira field schema `items` values (element type when `type` is `'array'`).
 */
export type JiraSchemaItemType =
  | 'option'
  | 'component'
  | 'version'
  | 'priority'
  | 'resolution'
  | 'string'
  | 'user'
  | 'group'
  | 'json'
  | 'issuelinks'
  | (string & {})

export const JsonTypeSchema = z.object({
  type: z.string() as z.ZodType<JiraSchemaType>,
  items: (z.string() as z.ZodType<JiraSchemaItemType>).optional(),
  system: z.string().optional(),
  custom: z.string().optional(),
  customId: z.number().optional()
})
export type JsonType = z.infer<typeof JsonTypeSchema>

export const AllowedValueSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    value: z.string().optional(),
    iconUrl: z.string().optional()
  })
  .catchall(z.unknown())
export type AllowedValue = z.infer<typeof AllowedValueSchema>

/**
 * Field configuration within a template — discriminated union on `behavior`.
 *
 * - **visible**:    Field shown at creation with all available options (default/empty state).
 * - **preset**:     Fixed value, auto-applied at creation (field hidden unless conflict).
 * - **restricted**: User picks from a curated subset of options at creation.
 * - **ignore**:     Field omitted entirely.
 *
 * ## Unified Option Model
 * `allowedOptions` uses AllowedValue as a universal shape for ALL field types:
 *
 * **Jira-provided options** (select, multi-select, priority, etc.):
 *   - Source: field.allowedValues from Jira API
 *   - Shape: { id: "10001", name: "High", iconUrl: "..." }
 *   - UI: User checks subset from existing list
 *
 * **User-defined options** (number, text, user):
 *   - Source: User creates them in wizard UI
 *   - Number (story points): { id: "sp-5", value: "5" } → stored as label="5", value=5
 *   - Text: { id: "txt-prod", value: "Production" } → label="Production", value="Production"
 *   - User: { id: "u-abc123", name: "Alice Chen", value: { accountId: "5f4e..." } }
 *   - UI: Chip input or user search picker
 *
 * The model doesn't distinguish source — only the config UI branches on field.allowedValues.
 */
export const FieldConfigSchema = z.discriminatedUnion('behavior', [
  z.object({ behavior: z.literal('visible') }),
  z.object({ behavior: z.literal('preset'), presetValue: z.unknown() }),
  z.object({
    behavior: z.literal('restricted'),
    allowedOptions: z.array(AllowedValueSchema).min(1)
  }),
  z.object({ behavior: z.literal('ignore') })
])
export type FieldConfig = z.infer<typeof FieldConfigSchema>

export const IssueTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),

  scope: IssueTemplateScopeSchema,
  fields: z.record(z.string(), FieldConfigSchema),

  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  lastUsedAt: z.iso.datetime().optional()
})
export type IssueTemplate = z.infer<typeof IssueTemplateSchema>

export const FieldMetadataSchema = z.object({
  fieldId: z.string(),
  key: z.string(),
  name: z.string(),
  required: z.boolean(),
  schema: JsonTypeSchema,
  allowedValues: z.array(AllowedValueSchema).optional(),
  autoCompleteUrl: z.string().optional(),
  hasDefaultValue: z.boolean().optional(),
  defaultValue: z.unknown().optional()
})
export type FieldMetadata = z.infer<typeof FieldMetadataSchema>

export const CachedFieldMetadataSchema = z.object({
  cacheKey: z.string(), // `${baseUrlHost}:${projectKey}:${issueTypeId}`
  lastUpdated: z.iso.datetime(),
  fields: z.array(FieldMetadataSchema)
})
export type CachedFieldMetadata = z.infer<typeof CachedFieldMetadataSchema>

export const ConflictTypeSchema = z.enum([
  'preset_invalid',
  'restricted_option_invalid',
  'now_required',
  'field_removed',
  'scope_invalid'
])
export type ConflictType = z.infer<typeof ConflictTypeSchema>

export const FieldConflictSchema = z.object({
  fieldId: z.string(),
  fieldName: z.string(),
  type: ConflictTypeSchema,
  message: z.string(),
  fieldMetadata: FieldMetadataSchema.optional()
})
export type FieldConflict = z.infer<typeof FieldConflictSchema>
