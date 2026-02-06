import { z } from 'zod'

import { createTextFieldAdapter } from './shared'

export const JiraDateAdapter = createTextFieldAdapter('date', z.string(), {
  keyOf: (val) => val,
  toDTO: (val) => val,

  // TODO: add special date input component

  fromDTO: (dto) => z.iso.date().safeParse(dto).data ?? null
})
