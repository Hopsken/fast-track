import { describe, expect, it } from 'vitest'

import { CreateIssuePayloadSchema } from '../fields'

describe('jira field schemas', () => {
  it('allows extra fields on CreateIssuePayload fields', () => {
    const payload = {
      projectKey: 'PROJ',
      issueTypeId: '10001',
      fields: {
        summary: 'Example issue',
        customField: { value: 123 }
      }
    }

    const result = CreateIssuePayloadSchema.parse(payload)
    expect(result.fields.customField).toEqual({ value: 123 })
  })
})
