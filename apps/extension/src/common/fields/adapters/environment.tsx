import { z } from 'zod'

import { createTextFieldAdapter } from './shared/text'

export const JiraEnvironmentAdapter = createTextFieldAdapter(
  'environment',
  z.string(),
  {
    keyOf: (val) => val,
    toDTO: (val) => val,
    fromDTO: (dto) => (typeof dto === 'string' ? dto : null)
  }
)
