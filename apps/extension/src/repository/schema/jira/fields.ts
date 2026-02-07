import { z } from 'zod'

import { JiraAvatarUrlSchema } from './user'

export const JiraStatusCategorySchema = z
  .object({
    key: z.string(),
    colorName: z.string(),
    name: z.string()
  })
  .strip()

export type JiraStatusCategory = z.infer<typeof JiraStatusCategorySchema>

export const JiraStatusSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    statusCategory: JiraStatusCategorySchema
  })
  .strip()

export type JiraStatus = z.infer<typeof JiraStatusSchema>

export const JiraTransitionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    to: JiraStatusSchema
  })
  .strip()

export type JiraTransition = z.infer<typeof JiraTransitionSchema>

export const JiraAssigneeSchema = z.preprocess(
  (value) => {
    if (!value || typeof value !== 'object') return value

    const record = value as Record<string, unknown>

    return {
      accountId: typeof record.accountId === 'string' ? record.accountId : '',
      displayName:
        typeof record.displayName === 'string' ? record.displayName : '',
      emailAddress:
        typeof record.emailAddress === 'string' ? record.emailAddress : '',
      avatarUrls: record.avatarUrls ?? record.avatarUrl
    }
  },
  z
    .object({
      accountId: z.string(),
      displayName: z.string(),
      emailAddress: z.string(),
      avatarUrls: JiraAvatarUrlSchema
    })
    .strip()
)

export type JiraAssignee = z.infer<typeof JiraAssigneeSchema>

export const JiraPrioritySchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    iconUrl: z.string()
  })
  .strip()

export type JiraPriority = z.infer<typeof JiraPrioritySchema>

export const JiraMergeRequestSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    url: z.string(),
    provider: z.enum(['github', 'gitlab'])
  })
  .strip()

export type JiraMergeRequest = z.infer<typeof JiraMergeRequestSchema>

export const JiraIssueComponentSchema = z
  .object({
    id: z.string(),
    name: z.string()
  })
  .strip()

export type JiraIssueComponent = z.infer<typeof JiraIssueComponentSchema>

export const JiraIssueResolutionSchema = z
  .object({
    id: z.string(),
    name: z.string()
  })
  .strip()

export type JiraIssueResolution = z.infer<typeof JiraIssueResolutionSchema>

export const JiraSubtaskFieldsSchema = z
  .object({
    status: z
      .object({
        name: z.string()
      })
      .strip(),
    priority: z
      .object({
        name: z.string(),
        iconUrl: z.string().optional()
      })
      .strip(),
    issuetype: z
      .object({
        iconUrl: z.string().optional()
      })
      .strip()
  })
  .strip()

export type JiraSubtaskFields = z.infer<typeof JiraSubtaskFieldsSchema>

export const JiraSubtaskSchema = z
  .object({
    id: z.string(),
    key: z.string(),
    summary: z.string(),
    fields: JiraSubtaskFieldsSchema
  })
  .strip()

export type JiraSubtask = z.infer<typeof JiraSubtaskSchema>

export const CreateIssueFieldsSchema = z
  .object({
    summary: z.string()
  })
  .catchall(z.unknown())

export type CreateIssueFields = z.infer<typeof CreateIssueFieldsSchema>

export const CreateIssuePayloadSchema = z
  .object({
    projectKey: z.string(),
    issueTypeId: z.string(),
    fields: CreateIssueFieldsSchema
  })
  .strip()

export type CreateIssuePayload = z.infer<typeof CreateIssuePayloadSchema>
