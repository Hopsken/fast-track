import { z } from 'zod'

import { JiraIssueTypeSchema } from './issueType'

export const JiraProjectSchema = z
  .object({
    id: z.string(),
    key: z.string(),
    name: z.string(),
    avatarUrl: z.url().optional(),
    issueTypes: z.array(JiraIssueTypeSchema).optional()
  })
  .strip()

export type JiraProject = z.infer<typeof JiraProjectSchema>

export const JiraProjectRefSchema = JiraProjectSchema.pick({
  id: true,
  key: true,
  name: true,
  avatarUrl: true
}).strip()

export type JiraProjectRef = z.infer<typeof JiraProjectRefSchema>
