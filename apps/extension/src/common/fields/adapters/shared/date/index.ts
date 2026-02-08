import { z } from 'zod'

import { defineFieldAdapter } from '@/common/fields/types'
import { JiraDateTimeSchema } from '@/repository/schema'

import { GenericTextInput } from '../text/GenericTextInput'

import { DateFieldConfig } from './DateFieldConfig'
import { parseJiraDate, toJiraDate, toJiraDateTime } from './dateParsing'
import { DatetimeFieldConfig } from './DatetimeFieldConfig'

// Date and datetime are internally just plain strings
export const JiraDateAdapter = defineFieldAdapter({
  key: 'date',
  schema: z.string(),
  keyOf: (val) => val,

  InputComponent: GenericTextInput,
  ConfigComponent: DateFieldConfig,

  toDTO: (val) => toJiraDate(new Date(val)),
  fromDTO: (dto) =>
    typeof dto === 'string' ? (parseJiraDate(dto)?.toISOString() ?? null) : null
})

export const JiraDatetimeAdapter = defineFieldAdapter({
  key: 'datetime',
  schema: z.string(),
  keyOf: (val) => val,

  InputComponent: GenericTextInput,
  ConfigComponent: DatetimeFieldConfig,

  toDTO: (val) => toJiraDateTime(new Date(val)),
  fromDTO: (dto) => JiraDateTimeSchema.safeParse(dto).data ?? null
})
