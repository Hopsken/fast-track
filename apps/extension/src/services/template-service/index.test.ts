import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  CachedFieldMetadata,
  FieldConflict,
  IssueTemplate
} from '~/types/template'

import { TemplateServiceImpl } from './index'

function makeTemplate(partial?: Partial<IssueTemplate>): IssueTemplate {
  const now = new Date().toISOString()
  return {
    id: partial?.id ?? crypto.randomUUID(),
    name: partial?.name ?? 'T',
    trigger: partial?.trigger ?? 't',
    scope: {
      siteUrl: partial?.scope?.siteUrl ?? 'https://a.atlassian.net',
      projectKey: partial?.scope?.projectKey ?? 'PROJ',
      issueTypeId: partial?.scope?.issueTypeId ?? '10000',
      issueTypeName: partial?.scope?.issueTypeName ?? 'Bug'
    },
    fields: partial?.fields ?? {},
    createdAt: partial?.createdAt ?? now,
    updatedAt: partial?.updatedAt ?? now,
    lastUsedAt: partial?.lastUsedAt
  }
}

describe('TemplateServiceImpl', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    // Ensure active site is known
    vi.spyOn(
      TemplateServiceImpl.prototype as any,
      'getActiveSiteUrl'
    ).mockResolvedValue('https://a.atlassian.net')

    // Prevent real network calls
    vi.spyOn(
      TemplateServiceImpl.prototype as any,
      'fetchCreateIssueFields'
    ).mockResolvedValue([
      {
        fieldId: 'summary',
        key: 'summary',
        name: 'Summary',
        required: true,
        schema: { type: 'string' }
      }
    ])
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

  it('refreshForActiveSite selects recent 5 by lastUsedAt and respects TTL', async () => {
    const svc = new TemplateServiceImpl()

    const templates: IssueTemplate[] = []
    for (let i = 0; i < 6; i++) {
      templates.push(
        makeTemplate({
          id: `t${i}`,
          scope: {
            siteUrl: 'https://a.atlassian.net',
            projectKey: 'PROJ',
            issueTypeId: '10000',
            issueTypeName: 'Bug'
          },
          lastUsedAt: `2026-01-0${i + 1}T00:00:00.000Z`
        })
      )
    }

    await (svc as any).templatesItem.setValue(templates)

    // Same cacheKey is shared across templates with same scope.
    const fetchSpy = vi.spyOn(svc as any, 'fetchCreateIssueFields')

    await svc.refreshForActiveSite({ limit: 5, ttlMs: 24 * 60 * 60 * 1000 })
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    // Second run should skip due TTL
    fetchSpy.mockClear()
    await svc.refreshForActiveSite({ limit: 5, ttlMs: 24 * 60 * 60 * 1000 })
    expect(fetchSpy).toHaveBeenCalledTimes(0)

    // Make cache stale by moving time forward 2 days
    vi.setSystemTime(new Date('2026-01-03T00:00:00.000Z'))
    await svc.refreshForActiveSite({ limit: 5, ttlMs: 24 * 60 * 60 * 1000 })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })
})
