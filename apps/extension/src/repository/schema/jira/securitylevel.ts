import { z } from 'zod'

export const JiraSecurityLevelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional()
})

export type JiraSecurityLevel = z.infer<typeof JiraSecurityLevelSchema>
