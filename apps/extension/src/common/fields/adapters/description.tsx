import { z } from 'zod'

import { DescriptionInput } from './description/DescriptionInput'
import { createTextFieldAdapter } from './shared/text'

export const JiraDescriptionAdapter = createTextFieldAdapter(
  'description',
  z.string(),
  {
    supportModes: ['preset'],
    keyOf: (val) => val,
    InputComponent: DescriptionInput,
    toDTO: (text) => ({
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text }]
        }
      ]
    }),
    fromDTO: (dto) => (typeof dto === 'string' ? dto : null)
  }
)
