import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TemplateServiceImpl } from './index'

describe('TemplateServiceImpl', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    // Clear persisted storage between tests (WXT fake storage is shared)
    const svc = new TemplateServiceImpl()
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
    const svc = new TemplateServiceImpl()

    const created = await svc.createTemplate({
      name: 'Frontend Bug',
      icon: '🐞',
      scope: {
        baseUrlHost: 'a.atlassian.net',
        projectKey: 'PROJ',
        issueTypeId: '10000',
        issueTypeName: 'Bug'
      },
      fields: { priority: { behavior: 'preset', presetValue: { id: '1' } } }
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
    const svc = new TemplateServiceImpl()

    const t = await svc.createTemplate({
      name: 'T',
      scope: {
        baseUrlHost: 'a.atlassian.net',
        projectKey: 'PROJ',
        issueTypeId: '10000',
        issueTypeName: 'Bug'
      },
      fields: {}
    })

    await svc.markTemplateUsed(t.id)
    const again = await svc.getTemplate(t.id)
    expect(again?.lastUsedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('getTemplates skips invalid entries in storage', async () => {
    const svc = new TemplateServiceImpl()

    await svc.createTemplate({
      name: 'Valid',
      scope: {
        baseUrlHost: 'a.atlassian.net',
        projectKey: 'PROJ',
        issueTypeId: '10000',
        issueTypeName: 'Bug'
      },
      fields: {}
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
          projectKey: 'PROJ',
          issueTypeId: '10000',
          issueTypeName: ''
        },
        fields: {},
        createdAt: 'not-a-date',
        updatedAt: 'not-a-date'
      }
    ])

    const valid = await svc.getTemplates()
    expect(valid.map((t) => t.name)).toEqual(['Valid'])
  })

  it('createTemplate validates input (rejects empty issueTypeName)', async () => {
    const svc = new TemplateServiceImpl()

    await expect(
      svc.createTemplate({
        name: 'Bad',
        scope: {
          baseUrlHost: 'a.atlassian.net',
          projectKey: 'PROJ',
          issueTypeId: '10000',
          issueTypeName: ''
        },
        fields: {}
      })
    ).rejects.toThrow(/Invalid template/i)
  })
})
