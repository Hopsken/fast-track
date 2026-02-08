import { ZodString } from 'zod'

import { JiraDateTimeSchema } from '@/repository/schema'

import { createTextFieldAdapter } from './shared'
import { DateTimeInput } from './shared/text/DateTimeInput'

export const JiraDateTimeAdapter = createTextFieldAdapter(
  'datetime',
  JiraDateTimeSchema as unknown as ZodString,
  {
    keyOf: (val) => val,

    ConfigComponent: DateTimeInput,

    toDTO: (val) => {
      return val.replace(/\.\d{3}Z$/, '.000+0000')
    },

    fromDTO: (dto) => JiraDateTimeSchema.safeParse(dto).data ?? null
  }
)
