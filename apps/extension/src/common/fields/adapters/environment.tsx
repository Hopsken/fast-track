import { z } from 'zod'

import { adfToText, textToAdf } from './shared/adf'
import { createTextFieldAdapter } from './shared/text'

export const JiraEnvironmentAdapter = createTextFieldAdapter(
  'environment',
  z.string(),
  {
    keyOf: (val) => val,
    toDTO: (val) => textToAdf(val),
    fromDTO: (dto) => adfToText(dto) ?? (typeof dto === 'string' ? dto : null)
  }
)
