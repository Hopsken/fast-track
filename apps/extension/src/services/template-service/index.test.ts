import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getStorageItem } from '~/lib/storage/schema'

import { TemplateService } from './index'

const mkTemplateInput = (host: string, name: string) => ({
  name,
  scope: {
    baseUrlHost: host,
    project: {
      id: '1',
      key: 'PROJ',
      name: 'Project'
    },
    issueType: {
      id: '10000',
      name: 'Bug',
      iconUrl: '',
      description: '',
      subtask: false
    }
  },
  fields: []
})

describe('TemplateService', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    // Set up auth so getTemplates doesn't filter everything out
    const authItem = getStorageItem('AuthCredentials')
    await authItem.setValue({
      type: 'apiKey',
      host: 'https://a.atlassian.net',
      userInfo: {
        accountId: 'abc',
        email: 'a@a.com',
        name: 'A'
      },
      oauth: null,
      apiKey: { email: 'a@a.com', apiKey: 'abc' }
    })

    // Default: treat as Free unless a test sets Pro explicitly
    await getStorageItem('SubscriptionSnapshot').setValue(null)

    // Clear persisted storage between tests (WXT fake storage is shared)
    const svc = new TemplateService()
    const templatesItem = (
      svc as unknown as {
        templatesItem: { setValue: (v: unknown[]) => Promise<void> }
      }
    ).templatesItem
    await templatesItem.setValue([])
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('CRUD: create/get/update/delete', async () => {
    const svc = new TemplateService()

    const created = await svc.createTemplate({
      name: 'Frontend Bug',
      icon: '🐞',
      scope: {
        baseUrlHost: 'a.atlassian.net',
        project: {
          id: '1',
          key: 'PROJ',
          name: 'Project'
        },
        issueType: {
          id: '10000',
          name: 'Bug',
          iconUrl: '',
          description: '',
          subtask: false
        }
      },
      fields: [
        {
          fieldId: 'priority',
          behavior: 'preset',
          presetValue: { id: '1' }
        }
      ]
    })

    const fetched = await svc.getTemplate(created.id)
    expect(fetched?.name).toBe('Frontend Bug')
    // nanoid default length is 21
    expect(created.id.length).toBe(21)

    const updated = await svc.updateTemplate(created.id, { name: 'FB' })
    expect(updated.name).toBe('FB')

    await svc.deleteTemplate(created.id)
    expect(await svc.getTemplate(created.id)).toBeNull()
  })

  it('markTemplateUsed updates lastUsedAt', async () => {
    const svc = new TemplateService()

    const t = await svc.createTemplate({
      name: 'T',
      scope: {
        baseUrlHost: 'a.atlassian.net',
        project: {
          id: '1',
          key: 'PROJ',
          name: 'Project'
        },
        issueType: {
          id: '10000',
          name: 'Bug',
          iconUrl: '',
          description: '',
          subtask: false
        }
      },
      fields: []
    })

    await svc.markTemplateUsed(t.id)
    const again = await svc.getTemplate(t.id)
    expect(again?.lastUsedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('getTemplates skips invalid entries in storage', async () => {
    const svc = new TemplateService()

    await svc.createTemplate({
      name: 'Valid',
      scope: {
        baseUrlHost: 'a.atlassian.net',
        project: {
          id: '1',
          key: 'PROJ',
          name: 'Project'
        },
        issueType: {
          id: '10000',
          name: 'Bug',
          iconUrl: '',
          description: '',
          subtask: false
        }
      },
      fields: []
    })

    const templatesItem = (
      svc as unknown as {
        templatesItem: {
          getValue: () => Promise<unknown[]>
          setValue: (v: unknown[]) => Promise<void>
        }
      }
    ).templatesItem
    const raw = await templatesItem.getValue()

    await templatesItem.setValue([
      ...raw,
      {
        id: 'broken',
        name: 'Broken',
        trigger: 'b',
        scope: {
          baseUrlHost: 'https://not-host-only.example.com/path',
          project: {
            id: '1',
            key: 'PROJ',
            name: 'Project'
          },
          issueType: {
            id: '10000',
            name: 'Bug',
            iconUrl: '',
            description: '',
            subtask: false
          }
        },
        fields: [],
        createdAt: 'not-a-date',
        updatedAt: 'not-a-date'
      }
    ])

    const valid = await svc.getTemplates()
    expect(valid.map((t) => t.name)).toEqual(['Valid'])
  })

  it('enforces Free plan limit (max 3 templates) per current Jira host', async () => {
    const svc = new TemplateService()

    const input = {
      scope: {
        baseUrlHost: 'a.atlassian.net',
        project: {
          id: '1',
          key: 'PROJ',
          name: 'Project'
        },
        issueType: {
          id: '10000',
          name: 'Bug',
          iconUrl: '',
          description: '',
          subtask: false
        }
      },
      fields: []
    }

    await svc.createTemplate({ name: 'T1', ...input })
    await svc.createTemplate({ name: 'T2', ...input })
    await svc.createTemplate({ name: 'T3', ...input })

    await expect(svc.createTemplate({ name: 'T4', ...input })).rejects.toThrow(
      /Free plan limit reached/i
    )
  })

  it('allows creating templates on another host after reaching Free limit on current host', async () => {
    const authItem = getStorageItem('AuthCredentials')
    const svc = new TemplateService()

    await svc.createTemplate(mkTemplateInput('a.atlassian.net', 'A1'))
    await svc.createTemplate(mkTemplateInput('a.atlassian.net', 'A2'))
    await svc.createTemplate(mkTemplateInput('a.atlassian.net', 'A3'))

    await expect(
      svc.createTemplate(mkTemplateInput('a.atlassian.net', 'A4'))
    ).rejects.toThrow(/Free plan limit reached/i)

    await authItem.setValue({
      type: 'apiKey',
      host: 'https://b.atlassian.net',
      userInfo: {
        accountId: 'abc',
        email: 'a@a.com',
        name: 'A'
      },
      oauth: null,
      apiKey: { email: 'a@a.com', apiKey: 'abc' }
    })

    await expect(
      svc.createTemplate(mkTemplateInput('b.atlassian.net', 'B1'))
    ).resolves.toBeDefined()
  })

  it('allows Pro to create more than 3 templates', async () => {
    await getStorageItem('SubscriptionSnapshot').setValue({
      status: 'active',
      renewsAt: null,
      endsAt: null,
      updatedAt: '2026-01-01T00:00:00.000Z',
      isPro: true,
      lastCheckedAt: '2026-01-01T00:00:00.000Z'
    })

    const svc = new TemplateService()

    const input = {
      scope: {
        baseUrlHost: 'a.atlassian.net',
        project: {
          id: '1',
          key: 'PROJ',
          name: 'Project'
        },
        issueType: {
          id: '10000',
          name: 'Bug',
          iconUrl: '',
          description: '',
          subtask: false
        }
      },
      fields: []
    }

    await svc.createTemplate({ name: 'T1', ...input })
    await svc.createTemplate({ name: 'T2', ...input })
    await svc.createTemplate({ name: 'T3', ...input })
    await expect(
      svc.createTemplate({ name: 'T4', ...input })
    ).resolves.toBeDefined()
  })

  it('does not overwrite templates from other Jira sites when creating/updating', async () => {
    const authItem = getStorageItem('AuthCredentials')

    const svc = new TemplateService()

    // Simulate user being connected to site B, then switching to site A
    await authItem.setValue({
      type: 'apiKey',
      host: 'https://b.atlassian.net',
      userInfo: {
        accountId: 'abc',
        email: 'a@a.com',
        name: 'A'
      },
      oauth: null,
      apiKey: { email: 'a@a.com', apiKey: 'abc' }
    })
    await svc.createTemplate(mkTemplateInput('b.atlassian.net', 'B1'))

    await authItem.setValue({
      type: 'apiKey',
      host: 'https://a.atlassian.net',
      userInfo: {
        accountId: 'abc',
        email: 'a@a.com',
        name: 'A'
      },
      oauth: null,
      apiKey: { email: 'a@a.com', apiKey: 'abc' }
    })
    const a1 = await svc.createTemplate(
      mkTemplateInput('a.atlassian.net', 'A1')
    )

    // Updating A should not drop B
    await svc.updateTemplate(a1.id, { name: 'A1-updated' })

    const all = await svc.getTemplates({ includeOtherHosts: true })
    expect(all.map((t) => t.name).sort()).toEqual(['A1-updated', 'B1'])
  })

  it('createTemplate validates input (rejects empty issueTypeName)', async () => {
    const svc = new TemplateService()

    await expect(
      svc.createTemplate({
        name: 'Bad',
        //@ts-expect-error - testing invalid input
        scope: {
          baseUrlHost: 'a.atlassian.net',
          project: {
            id: '1',
            key: 'PROJ',
            name: 'Project'
          }
        },
        fields: []
      })
    ).rejects.toThrow(/Invalid template/i)
  })
})
