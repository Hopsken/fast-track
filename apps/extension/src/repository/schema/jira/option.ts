import { z } from 'zod'

export const JiraOptionSchema = z.object({
  id: z.string(),
  value: z.string(),
  disabled: z.boolean().optional()
})

export type JiraOption = z.infer<typeof JiraOptionSchema>
