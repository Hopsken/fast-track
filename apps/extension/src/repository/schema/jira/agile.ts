import { z } from 'zod'

export const JiraSprintStateSchema = z
  .enum(['future', 'active', 'closed'])
  .describe('Sprint state')

/**
 * Jira uses ISO-8601 date-time strings (e.g., 2020-01-01T12:34:56.000+0000).
 * Keep as string unless you explicitly want to parse to Date.
 */
export const JiraDateTimeStringSchema = z
  .string()
  .min(1)
  .describe('ISO-8601 date-time string')

export const JiraSprintSchema = z
  .object({
    id: z.number().int().nonnegative(),
    state: JiraSprintStateSchema,
    name: z.string().min(1),

    startDate: JiraDateTimeStringSchema.optional(),
    endDate: JiraDateTimeStringSchema.optional(),
    completeDate: JiraDateTimeStringSchema.optional(),
    activatedDate: JiraDateTimeStringSchema.optional(),

    originBoardId: z.number().int().nonnegative().optional(),

    goal: z.string().optional()
  })
  .strict() // allow Jira to add fields without breaking parsing

export type JiraSprint = z.infer<typeof JiraSprintSchema>
