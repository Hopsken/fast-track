import { z } from 'zod'

export const JiraIssueTypeSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    iconUrl: z.string(),
    description: z.string(),
    subtask: z.boolean().optional()
  })
  .strip()

export type JiraIssueType = z.infer<typeof JiraIssueTypeSchema>
