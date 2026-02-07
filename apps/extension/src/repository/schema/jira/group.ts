import { z } from 'zod'

export const JiraGroupSchema = z.object({
  name: z.string(),
  groupId: z.string().optional()
})

export type JiraGroup = z.infer<typeof JiraGroupSchema>
