import { describe, expect, it } from 'vitest'

import { IssueTemplateScopeSchema } from '~/types/template'

describe('IssueTemplateScopeSchema (v1)', () => {
  it('requires non-empty issueTypeName', () => {
    const res = IssueTemplateScopeSchema.safeParse({
      baseUrlHost: 'example.atlassian.net',
      projectKey: 'PROJ',
      issueTypeId: '10000',
      issueTypeName: ''
    })

    expect(res.success).toBe(false)
  })

  it('requires baseUrlHost to be host-only (no protocol / path)', () => {
    const res = IssueTemplateScopeSchema.safeParse({
      baseUrlHost: 'https://example.atlassian.net/browse/PROJ',
      projectKey: 'PROJ',
      issueTypeId: '10000',
      issueTypeName: 'Bug'
    })

    expect(res.success).toBe(false)
  })

  it('accepts a hostname baseUrlHost', () => {
    const res = IssueTemplateScopeSchema.safeParse({
      baseUrlHost: 'example.atlassian.net',
      projectKey: 'PROJ',
      issueTypeId: '10000',
      issueTypeName: 'Bug'
    })

    expect(res.success).toBe(true)
  })
})
