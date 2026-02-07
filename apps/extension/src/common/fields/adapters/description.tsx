import { z } from 'zod'

import { createTextFieldAdapter } from './shared/text'

export const JiraDescriptionAdapter = createTextFieldAdapter(
  'description',
  z.string(),
  {
    supportModes: ['preset'],
    keyOf: (val) => val,
    toDTO: (val) => val,
    fromDTO: (dto) => (typeof dto === 'string' ? dto : null)
  }
)
