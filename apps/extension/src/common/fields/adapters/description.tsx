import { z } from 'zod'

import { DescriptionInput } from './description/DescriptionInput'
import { textToAdf } from './shared/adf'
import { createTextFieldAdapter } from './shared/text'

export const JiraDescriptionAdapter = createTextFieldAdapter(
  'description',
  z.string(),
  {
    supportModes: ['preset'],
    keyOf: (val) => val,
    InputComponent: DescriptionInput,
    toDTO: (text) => textToAdf(text),
    fromDTO: (dto) => (typeof dto === 'string' ? dto : null)
  }
)
