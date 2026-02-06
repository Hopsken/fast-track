import { JiraUser, JiraUserSchema } from '@/repository/schema'
import { getJiraService } from '@/services'
import { isNonNullable } from '@/utils/assert'

import { createSelectFieldAdapter } from './shared/select'

export const JiraAssigneeAdapter = createSelectFieldAdapter(
  'assignee',
  JiraUserSchema,
  {
    keyOf: (val) => val.accountId,
    labelOf: (val) => val.displayName ?? val.emailAddress ?? '',

    fetchOptions: async ({ project, metadata }, query) => {
      const svc = getJiraService()
      const { autoCompleteUrl } = metadata

      if (autoCompleteUrl) {
        const result = await svc.autoComplete(autoCompleteUrl, { query })
        if (!Array.isArray(result)) return []
        return result
          .map((item) => JiraUserSchema.safeParse(item).data)
          .filter(isNonNullable)
      }

      if (project) {
        return svc.searchUserOfProject(project.key, query ?? '')
      }

      return []
    },

    toDTO: (val) => ({ accountId: val.accountId }),
    fromDTO: (dto) => JiraUserSchema.safeParse(dto).data ?? null
  }
)
