import { JiraGroupSchema } from '@/repository/schema'

import { fetchAutoCompleteOptions } from '../utils'

import { createSelectFieldAdapter } from './shared/select'

export const JiraGroupAdapter = createSelectFieldAdapter(
  'group',
  JiraGroupSchema,
  {
    keyOf: (val) => val.groupId ?? val.name,
    labelOf: (val) => val.name,

    fetchOptions: ({ metadata }, query) => {
      return fetchAutoCompleteOptions(metadata, JiraGroupSchema, query)
    },

    toDTO: (val) => ({ name: val.name }),
    fromDTO: (dto) => JiraGroupSchema.safeParse(dto).data ?? null
  }
)
