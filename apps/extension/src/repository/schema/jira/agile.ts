import { z } from 'zod'

import { JiraDateTimeSchema } from './date'

export const JiraSprintStateSchema = z
  .enum(['future', 'active', 'closed'])
  .describe('Sprint state')

export const JiraSprintSchema = z
  .object({
    id: z.number().int().nonnegative(),
    state: JiraSprintStateSchema,
    name: z.string().min(1),

    startDate: JiraDateTimeSchema.optional(),
    endDate: JiraDateTimeSchema.optional(),
    createdDate: JiraDateTimeSchema.optional(),
    completeDate: JiraDateTimeSchema.optional(),
    activatedDate: JiraDateTimeSchema.optional(),

    originBoardId: z.number().int().nonnegative().optional(),

    goal: z.string().optional()
  })
  .catchall(z.unknown()) // allow Jira to add fields without breaking parsing

export type JiraSprint = z.infer<typeof JiraSprintSchema>
