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

export const FieldConfigSchema = z.object({
  behavior: z.enum(['preset', 'visible', 'ignore']),
  presetValue: z.unknown().optional()
})
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
