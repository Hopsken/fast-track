import { isValid } from 'date-fns'
import { z } from 'zod'

import { defineFieldAdapter } from '@/common/fields/types'
import { JiraDateTimeSchema } from '@/repository/schema'
import { formatDateInput, formatDateTimeInput } from '@/utils/date-format'

import { DateFieldConfig } from './DateFieldConfig'
import { DateInput } from './DateInput'
import { parseJiraDate, toJiraDate, toJiraDateTime } from './dateParsing'
import { DatetimeFieldConfig } from './DatetimeFieldConfig'
import { DateTimeInput } from './DateTimeInput'

// Date and datetime are internally just plain strings
export const JiraDateAdapter = defineFieldAdapter({
  key: 'date',
  schema: z.string(),
  keyOf: (val) => val,
  labelOf: (val) => {
    if (!val) return ''
    const parsed = parseJiraDate(val)
    if (!parsed) return ''
    return formatDateInput(parsed)
  },

  InputComponent: DateInput,
  ConfigComponent: DateFieldConfig,

  toDTO: (val) => toJiraDate(new Date(val)),
  fromDTO: (dto) =>
    typeof dto === 'string' ? (parseJiraDate(dto)?.toISOString() ?? null) : null
})

export const JiraDatetimeAdapter = defineFieldAdapter({
  key: 'datetime',
  schema: z.string(),
  keyOf: (val) => val,
  labelOf: (val) => {
    if (!val) return ''
    const parsed = parseJiraDate(val)
    if (!parsed) return ''
    return formatDateTimeInput(parsed)
  },

  InputComponent: DateTimeInput,
  ConfigComponent: DatetimeFieldConfig,

  toDTO: (val) => toJiraDateTime(new Date(val)),
  fromDTO: (dto) => JiraDateTimeSchema.safeParse(dto).data ?? null
})
