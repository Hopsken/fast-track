import { JiraUserSchema } from '@/repository/schema'
import { getJiraService } from '@/services'

import { createSelectFieldAdapter } from './shared/select'

export const JiraUserAdapter = createSelectFieldAdapter(
  'user',
  JiraUserSchema,
  {
    keyOf: (val) => val.accountId,
    labelOf: (val) => val.displayName ?? val.emailAddress ?? '',

    fetchOptions: async ({ project }, query) => {
      const svc = getJiraService()
      if (!project) return []
      return svc.searchUserOfProject(project.key, query ?? '')
    },

    toDTO: (val) => ({ id: val.accountId }),
    fromDTO: (dto) => JiraUserSchema.safeParse(dto).data ?? null
  }
)
