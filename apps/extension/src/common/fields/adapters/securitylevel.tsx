import { JiraSecurityLevelSchema } from '@/repository/schema'

import { createSelectFieldAdapter } from './shared/select'

export const JiraSecurityLevelAdapter = createSelectFieldAdapter(
  'securitylevel',
  JiraSecurityLevelSchema,
  {
    keyOf: (val) => val.id,
    labelOf: (val) => val.name,

    toDTO: (val) => ({ id: val.id }),
    fromDTO: (dto) => JiraSecurityLevelSchema.safeParse(dto).data ?? null
  }
)
