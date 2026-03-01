import { z } from 'zod'

import { defineFieldAdapter } from '@/common/fields/types'
import { JiraDateTimeSchema } from '@/repository/schema'

import { DateFieldConfig } from './DateFieldConfig'
import { DateInput } from './DateInput'
import { parseJiraDate, toJiraDate, toJiraDateTime } from './dateParsing'
import { DatetimeFieldConfig } from './DatetimeFieldConfig'
import { DateTimeInput } from './DateTimeInput'
import { getSemanticTemporalLabel, getTemporalLabel } from './resolvePreset'

// Date and datetime are internally just plain strings
export const JiraDateAdapter = defineFieldAdapter({
  key: 'date',
  schema: z.string(),
  keyOf: (val) => val,
  labelOf: (val) => {
    if (!val) return ''
    return getTemporalLabel(val, 'date')
  },
  semanticLabelOf: (val) => {
    if (!val) return ''
    return getSemanticTemporalLabel(val, 'date')
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
    return getTemporalLabel(val, 'datetime')
  },
  semanticLabelOf: (val) => {
    if (!val) return ''
    return getSemanticTemporalLabel(val, 'datetime')
  },

  InputComponent: DateTimeInput,
  ConfigComponent: DatetimeFieldConfig,

  toDTO: (val) => toJiraDateTime(new Date(val)),
  fromDTO: (dto) => JiraDateTimeSchema.safeParse(dto).data ?? null
})
