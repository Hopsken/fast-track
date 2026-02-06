import { z } from 'zod'

import { createTextFieldAdapter } from './shared'
import { DateTimeInput } from './shared/text/DateTimeInput'

export const JiraDateTimeAdapter = createTextFieldAdapter(
  'datetime',
  z.string(),
  {
    keyOf: (val) => val,
    toDTO: (val) => val,

    ConfigComponent: DateTimeInput,

    fromDTO: (dto) => z.iso.datetime().safeParse(dto).data ?? null
  }
)
