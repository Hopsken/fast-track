import { JiraUserSchema } from '@/repository/schema'

import { fetchAutoCompleteOptions } from '../utils'

import { createSelectFieldAdapter } from './shared/select'

export const JiraReporterAdapter = createSelectFieldAdapter(
  'reporter',
  JiraUserSchema,
  {
    keyOf: (val) => val.accountId,
    labelOf: (val) => val.displayName ?? val.emailAddress ?? '',

    fetchOptions: ({ metadata }, query) => {
      return fetchAutoCompleteOptions(metadata, JiraUserSchema, query)
    },

    toDTO: (val) => ({ accountId: val.accountId }),
    fromDTO: (dto) => JiraUserSchema.safeParse(dto).data ?? null
  }
)
