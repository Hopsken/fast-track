import { JiraIssueRefSchema } from '@/repository/schema'
import { getJiraService } from '@/services'

import { createSelectFieldAdapter } from './shared/select'

export const JiraParentAdapter = createSelectFieldAdapter(
  'parent',
  JiraIssueRefSchema,
  {
    keyOf: (val) => val.key,
    labelOf: (val) => val.summaryText ?? val.summary ?? '',

    fetchOptions: async ({ project, issueType }, query) => {
      if (!project || !issueType) return []
      const svc = getJiraService()
      const epicsOnly = !issueType.subtask
      return svc.issues.getIssuePickerSuggestions({
        query,
        currentProjectId: project.id,
        showSubTasks: false,
        currentJQL: epicsOnly ? 'issuetype = Epic' : 'issuetype != Epic'
      })
    },

    toDTO: (val) => ({ key: val.key }),
    fromDTO: (dto) => JiraIssueRefSchema.safeParse(dto).data ?? null
  }
)
