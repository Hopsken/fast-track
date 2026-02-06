import { z } from 'zod'

import {
  JiraStatusSchema,
  JiraAssigneeSchema,
  JiraPrioritySchema,
  JiraIssueComponentSchema,
  JiraSubtaskSchema
} from './fields'
import { JiraIssueTypeSchema } from './issueType'
import { JiraProjectRefSchema } from './project'

export const IssueSourceSchema = z.enum([
  'history',
  'sprint',
  'sniff',
  'picker',
  'watching'
])

export type IssueSource = z.infer<typeof IssueSourceSchema>

export const JiraIssueSchema = z
  .object({
    __typename: z.literal('JiraTicket'),
    id: z.string(),
    key: z.string(),
    summary: z.string(),
    issueType: JiraIssueTypeSchema,
    status: JiraStatusSchema,
    assignee: JiraAssigneeSchema.nullable(),
    priority: JiraPrioritySchema.nullable(),
    projectKey: z.string(),
    boardName: z.string(),
    url: z.string(),
    isInProgress: z.boolean(),
    sources: z.array(IssueSourceSchema),
    lastViewed: z.string().nullable(),
    created: z.string(),
    updated: z.string()
  })
  .strip()

export type JiraIssue = z.infer<typeof JiraIssueSchema>

export const JiraIssueRefSchema = z
  .object({
    key: z.string(),
    summary: z.string(),
    summaryText: z.string().optional()
  })
  .strip()

export type JiraIssueRef = z.infer<typeof JiraIssueRefSchema>

export const JiraIssueDetailSchema = JiraIssueSchema.extend({
  description: z.string().optional(),
  reporter: JiraAssigneeSchema.optional(),
  labels: z.array(z.string()).optional(),
  components: z.array(JiraIssueComponentSchema).optional(),
  parent: JiraIssueRefSchema.optional(),
  subtasks: z.array(JiraSubtaskSchema).optional(),
  dueDate: z.iso.date().optional(),
  project: JiraProjectRefSchema.optional()
}).strip()

export type JiraIssueDetail = z.infer<typeof JiraIssueDetailSchema>
