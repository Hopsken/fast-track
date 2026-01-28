import { beforeEach, describe, expect, it, vi } from 'vitest'

import { TemplateServiceImpl } from './index'

describe('TemplateServiceImpl', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
  })

  it('CRUD: create/get/update/delete', async () => {
    const svc = new TemplateServiceImpl()

    const created = await svc.createTemplate({
      name: 'Frontend Bug',
      trigger: 'febug',
      icon: '🐞',
      scope: {
        siteUrl: 'https://a.atlassian.net',
        projectKey: 'PROJ',
        issueTypeId: '10000',
        issueTypeName: 'Bug'
      },
      fields: { priority: { behavior: 'preset', presetValue: { id: '1' } } }
    } as any)

    const fetched = await svc.getTemplate(created.id)
    expect(fetched?.name).toBe('Frontend Bug')

    const updated = await svc.updateTemplate(created.id, { name: 'FB' })
    expect(updated.name).toBe('FB')

    await svc.deleteTemplate(created.id)
    expect(await svc.getTemplate(created.id)).toBeNull()
  })

  it('markTemplateUsed updates lastUsedAt', async () => {
    const svc = new TemplateServiceImpl()

    const t = await svc.createTemplate({
      name: 'T',
      trigger: 't',
      scope: {
        siteUrl: 'https://a.atlassian.net',
        projectKey: 'PROJ',
        issueTypeId: '10000',
        issueTypeName: 'Bug'
      },
      fields: {}
    } as any)

    await svc.markTemplateUsed(t.id)
    const again = await svc.getTemplate(t.id)
    expect(again?.lastUsedAt).toBe('2026-01-01T00:00:00.000Z')
  })
})
