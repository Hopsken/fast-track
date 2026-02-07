import { JiraOptionSchema } from '@/repository/schema'

import { createSelectFieldAdapter } from './shared/select'

export const JiraOptionAdapter = createSelectFieldAdapter(
  'option',
  JiraOptionSchema,
  {
    keyOf: (val) => val.id,
    labelOf: (val) => val.value,

    toDTO: (val) => ({ id: val.id }),
    fromDTO: (dto) => JiraOptionSchema.safeParse(dto).data ?? null
  }
)
