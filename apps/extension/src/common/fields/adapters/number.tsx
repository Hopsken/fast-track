import { z } from 'zod'

import { createNumberFieldAdapter } from './shared/number'

export const JiraNumberAdapter = createNumberFieldAdapter(
  'number',
  z.number(),
  {
    keyOf: (val) => String(val),
    toDTO: (val) => val,
    fromDTO: (dto) => (typeof dto === 'number' ? dto : null)
  }
)
