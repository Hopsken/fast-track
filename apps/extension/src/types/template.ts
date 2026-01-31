import { z } from 'zod'

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
  projectKey: z.string().trim().min(1),
  issueTypeId: z.string().trim().min(1),
  issueTypeName: z.string().trim().min(1)
})
export type IssueTemplateScope = z.infer<typeof IssueTemplateScopeSchema>

export const JsonTypeSchema = z.object({
  type: z.string(),
  items: z.string().optional(),
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
 * - preset:     Fixed value, auto-applied at creation (field hidden).
 * - restricted: User picks from a curated subset of allowed values at creation.
 *               The field is always visible.
 * - visible:    Field shown at creation with all available options.
 * - ignore:     Field omitted entirely.
 *
 * `allowedOptions` uses AllowedValue as a universal shape:
 *   - Select / multi-select: native Jira shape { id, name, ... }
 *   - User fields: { id: accountId, name: displayName } — name stored for
 *     display, accountId is the stable reference.
 *
 * Phase 2 deferred items (schema is ready, UI not yet implemented):
 * TODO(phase2): Restricted mode for number fields — store as { id: '5', value: '5' }
 * TODO(phase2): Restricted mode for user fields — needs user search + accountId picker in wizard
 * TODO(phase2): Restricted mode for free-text fields — not planned
 */
export const FieldConfigSchema = z.discriminatedUnion('behavior', [
  z.object({ behavior: z.literal('preset'), presetValue: z.unknown() }),
  z.object({
    behavior: z.literal('restricted'),
    allowedOptions: z.array(AllowedValueSchema).min(1)
  }),
  z.object({ behavior: z.literal('visible') }),
  z.object({ behavior: z.literal('ignore') })
])
export type FieldConfig = z.infer<typeof FieldConfigSchema>

export const IssueTemplateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  icon: z.string().optional(),
  scope: IssueTemplateScopeSchema,
  fields: z.record(z.string(), FieldConfigSchema),
  descriptionTemplate: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().optional()
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
  lastUpdated: z.string().datetime(),
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
