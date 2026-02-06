import { z } from 'zod'

import { createTextFieldAdapter } from '../shared'

import { LabelsConfig } from './LabelsConfig'

export const JiraLabelAdapter = createTextFieldAdapter('labels', z.string(), {
  ConfigComponent: LabelsConfig,
  keyOf: (val) => val,
  toDTO: (val) => val,
  fromDTO: (dto) => (typeof dto === 'string' ? dto : null)
})
