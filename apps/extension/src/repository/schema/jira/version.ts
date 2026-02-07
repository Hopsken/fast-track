import { z } from 'zod'

export const JiraVersionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  released: z.boolean().optional(),
  archived: z.boolean().optional()
})

export type JiraVersion = z.infer<typeof JiraVersionSchema>
