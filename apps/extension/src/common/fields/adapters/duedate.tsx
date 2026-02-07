import { z } from 'zod'

import { createTextFieldAdapter } from './shared/text'
import { DateInput } from './shared/text/DateInput'

export const JiraDueDateAdapter = createTextFieldAdapter(
  'duedate',
  z.string(),
  {
    keyOf: (val) => val,
    toDTO: (val) => val,

    ConfigComponent: DateInput,

    fromDTO: (dto) => z.iso.date().safeParse(dto).data ?? null
  }
)
