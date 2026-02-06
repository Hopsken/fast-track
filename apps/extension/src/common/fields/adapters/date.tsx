import { z } from 'zod'

import { createTextFieldAdapter } from './shared'
import { DateInput } from './shared/text/DateInput'

export const JiraDateAdapter = createTextFieldAdapter('date', z.string(), {
  keyOf: (val) => val,
  toDTO: (val) => val,

  ConfigComponent: DateInput,

  fromDTO: (dto) => z.iso.date().safeParse(dto).data ?? null
})
