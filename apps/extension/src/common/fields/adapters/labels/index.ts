import { lowerCase } from 'lodash-es'
import { z } from 'zod'

import { getJiraService } from '@/services'

import { createTextFieldAdapter } from '../shared'

import { LabelsConfig } from './LabelsConfig'

let promise: Promise<string[]> | null = null

export const JiraLabelAdapter = createTextFieldAdapter('labels', z.string(), {
  ConfigComponent: LabelsConfig,
  fetchOptions: async (_, query) => {
    if (!promise) {
      const svc = getJiraService()
      promise = svc.getLabels()
    }
    const labels = await promise
    return labels.filter((l) => lowerCase(l).includes(lowerCase(query ?? '')))
  },
  keyOf: (val) => val,
  toDTO: (val) => val,
  fromDTO: (dto) => (typeof dto === 'string' ? dto : null)
})
