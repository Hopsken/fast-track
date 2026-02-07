import { JiraSprintSchema } from '@/repository/schema'
import { getJiraService } from '@/services'

import { createSelectFieldAdapter } from './shared/select'

export const JiraSprintAdapter = createSelectFieldAdapter(
  'com.pyxis.greenhopper.jira:gh-sprint',
  JiraSprintSchema,
  {
    keyOf: (val) => String(val.id),
    labelOf: (val) => val.name,

    fetchOptions: async ({ project }) => {
      if (!project) return []
      return getJiraService().agile.getSprints(project.id)
    },

    toDTO: (val) => ({ id: val.id }),
    fromDTO: (dto) => JiraSprintSchema.safeParse(dto).data ?? null
  }
)
