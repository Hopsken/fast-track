import { describe, expect, it } from 'vitest'

import { IssueTemplateScopeSchema } from './template'

describe('IssueTemplateScopeSchema (v1)', () => {
  it('requires all required issueType fields', () => {
    const res = IssueTemplateScopeSchema.safeParse({
      baseUrlHost: 'example.atlassian.net',
      project: {
        id: '10000',
        key: 'PROJ',
        name: 'Project'
      },
      issueType: {
        id: '10000',
        // missing name
        iconUrl: 'https://example.com/icon.png',
        description: 'Bug type'
      }
    })

    expect(res.success).toBe(false)
  })

  it('requires baseUrlHost to be host-only (no protocol / path)', () => {
    const res = IssueTemplateScopeSchema.safeParse({
      baseUrlHost: 'https://example.atlassian.net/browse/PROJ',
      project: {
        id: '10000',
        key: 'PROJ',
        name: 'Project'
      },
      issueType: {
        id: '10000',
        name: 'Bug',
        iconUrl: 'https://example.com/icon.png',
        description: 'Bug type'
      }
    })

    expect(res.success).toBe(false)
  })

  it('accepts a hostname baseUrlHost', () => {
    const res = IssueTemplateScopeSchema.safeParse({
      baseUrlHost: 'example.atlassian.net',
      project: {
        id: '10000',
        key: 'PROJ',
        name: 'Project'
      },
      issueType: {
        id: '10000',
        name: 'Bug',
        iconUrl: 'https://example.com/icon.png',
        description: 'Bug type'
      }
    })

    expect(res.success).toBe(true)
  })
})
