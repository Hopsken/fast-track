import { JiraVersionSchema } from '@/repository/schema'

import { fetchAutoCompleteOptions } from '../utils'

import { createSelectFieldAdapter } from './shared/select'

export const JiraVersionAdapter = createSelectFieldAdapter(
  'version',
  JiraVersionSchema,
  {
    keyOf: (val) => val.id,
    labelOf: (val) => val.name,

    fetchOptions: ({ metadata }, query) => {
      return fetchAutoCompleteOptions(metadata, JiraVersionSchema, query)
    },

    toDTO: (val) => ({ id: val.id }),
    fromDTO: (dto) => JiraVersionSchema.safeParse(dto).data ?? null
  }
)
