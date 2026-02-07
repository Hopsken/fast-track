import { JiraPrioritySchema } from '@/repository/schema'
import { getJiraService } from '@/services'

import { createSelectFieldAdapter } from './shared/select'

export const JiraPriorityAdapter = createSelectFieldAdapter(
  'priority',
  JiraPrioritySchema,
  {
    keyOf: (val) => String(val.id),
    labelOf: (val) => val.name,

    fetchOptions: async () => {
      const svc = getJiraService()
      return svc.issues.getPriorities()
    },

    toDTO: (val) => ({ id: val.id }),
    fromDTO: (dto) => JiraPrioritySchema.safeParse(dto).data ?? null
  }
)
