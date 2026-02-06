import { z } from 'zod'

import {
  JiraFieldAllowedValueSchema,
  JiraFieldMetadataSchema,
  JiraIssueTypeSchema,
  JiraProjectSchema
} from './jira'

/**
 * Template scope is bound to a Jira instance via hostname only.
 * (No protocol, no path)
 */
export const IssueTemplateScopeSchema = z.object({
  baseUrlHost: z.string().trim().regex(z.regexes.hostname, {
    message: 'baseUrlHost must be a valid hostname'
  }),
  project: JiraProjectSchema,
  issueType: JiraIssueTypeSchema
})
export type IssueTemplateScope = z.infer<typeof IssueTemplateScopeSchema>

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
  z.object({
    behavior: z.literal('preset'),
    presetValue: z.unknown().optional()
  }),
  z.object({
    behavior: z.literal('restricted'),
    allowedOptions: z.array(JiraFieldAllowedValueSchema).min(1)
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

export const CachedFieldMetadataSchema = z.object({
  cacheKey: z.string(), // `${baseUrlHost}:${projectKey}:${issueTypeId}`
  lastUpdated: z.iso.datetime(),
  fields: z.array(JiraFieldMetadataSchema)
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
  fieldMetadata: JiraFieldMetadataSchema.optional()
})
export type FieldConflict = z.infer<typeof FieldConflictSchema>
