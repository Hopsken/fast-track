import { JiraIssueComponentSchema } from '@/repository/schema'

import { fetchAutoCompleteOptions } from '../utils'

import { createSelectFieldAdapter } from './shared/select'

export const JiraComponentAdapter = createSelectFieldAdapter(
  'component',
  JiraIssueComponentSchema,
  {
    keyOf: (val) => val.id,
    labelOf: (val) => val.name,

    fetchOptions: ({ metadata }, query) => {
      return fetchAutoCompleteOptions(metadata, JiraIssueComponentSchema, query)
    },

    toDTO: (val) => ({ id: val.id }),
    fromDTO: (dto) => JiraIssueComponentSchema.safeParse(dto).data ?? null
  }
)
