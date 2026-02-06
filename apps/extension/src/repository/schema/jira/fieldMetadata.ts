import { z } from 'zod'

export type JiraFieldSystem =
  | 'summary'
  | 'description'
  | 'assignee'
  | 'reporter'
  | 'priority'
  | 'status'
  | 'resolution'
  | 'duedate'
  | 'fixVersions'
  | 'versions'
  | 'components'
  | 'labels'
  | 'security'
  | 'environment'
  | 'timetracking'
  | 'comment'
  | 'attachment'
  | 'issuelinks'
  | 'subtasks'
  | 'worklog'
  | 'customfield'
  | (string & {})

/**
 * Known Jira field schema `type` values.
 *
 * The `(string & {})` tail preserves autocomplete for known literals while
 * still accepting any string the Jira API might return in the future.
 */
export type JiraFieldSchemaType =
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
export type JiraFieldSchemaArrayItemsType =
  | 'option'
  | 'component'
  | 'attachment'
  | 'version'
  | 'priority'
  | 'resolution'
  | 'string'
  | 'user'
  | 'group'
  | 'json'
  | 'issuelinks'
  | (string & {})

export const JiraFieldSchemaSchema = z.object({
  type: z.string() as z.ZodType<JiraFieldSchemaType>,
  items: (z.string() as z.ZodType<JiraFieldSchemaArrayItemsType>).optional(),
  system: (z.string() as z.ZodType<JiraFieldSystem>).optional(),
  custom: z.string().optional(),
  customId: z.number().optional()
})
export type JiraFieldSchema = z.infer<typeof JiraFieldSchemaSchema>

export const JiraFieldAllowedValueSchema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    value: z.unknown().optional(),
    iconUrl: z.string().optional()
  })
  .catchall(z.unknown())

export type JiraFieldAllowedValue = z.infer<typeof JiraFieldAllowedValueSchema>

export const JiraFieldMetadataSchema = z.object({
  fieldId: z.string(),
  key: z.string(),
  name: z.string(),
  required: z.boolean(),
  schema: JiraFieldSchemaSchema,
  allowedValues: z.array(JiraFieldAllowedValueSchema).optional(),
  autoCompleteUrl: z.string().optional(),
  hasDefaultValue: z.boolean().optional(),
  defaultValue: z.unknown().optional()
})
export type JiraFieldMetadata = z.infer<typeof JiraFieldMetadataSchema>
