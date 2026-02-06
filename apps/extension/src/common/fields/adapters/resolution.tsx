import { JiraIssueResolutionSchema } from '@/repository/schema'

import { fetchAutoCompleteOptions } from '../utils'

import { createSelectFieldAdapter } from './shared/select'

export const JiraResolutionAdapter = createSelectFieldAdapter(
  'resolution',
  JiraIssueResolutionSchema,
  {
    keyOf: (val) => val.id,
    labelOf: (val) => val.name,

    fetchOptions: ({ metadata }, query) => {
      return fetchAutoCompleteOptions(
        metadata,
        JiraIssueResolutionSchema,
        query
      )
    },

    toDTO: (val) => ({ id: val.id }),
    fromDTO: (dto) => JiraIssueResolutionSchema.safeParse(dto).data ?? null
  }
)
