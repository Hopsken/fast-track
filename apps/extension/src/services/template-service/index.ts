import { defineProxyService } from '@webext-core/proxy-service'

import { getJiraApi } from '~/lib/jira'
import { getStorageItem } from '~/lib/storage/schema'
import type {
  CachedFieldMetadata,
  FieldConflict,
  IssueTemplate
} from '~/types/template'

import { refreshAndDetectConflicts } from './conflict-detection'
import { isValidCreateMetaFields, parseCreateMetaFields } from './create-meta'

type CreateMetaPage = {
  fields?: unknown[]
}

export interface RefreshForActiveSiteOptions {
  ttlMs: number
  limit: number
}

const MAX_TEMPLATES = 50

function byRecency(a: IssueTemplate, b: IssueTemplate) {
  const aTime = a.lastUsedAt ?? a.updatedAt ?? a.createdAt
  const bTime = b.lastUsedAt ?? b.updatedAt ?? b.createdAt
  return bTime.localeCompare(aTime)
}

function isCacheFresh(cache: CachedFieldMetadata | undefined, ttlMs: number) {
  if (!cache) return false
  const last = Date.parse(cache.lastUpdated)
  if (Number.isNaN(last)) return false
  return Date.now() - last <= ttlMs
}

/**
 * Template service implementation (proxy-service style)
 *
 * Matches the pattern used by `ticket-service`: holds WXT storage items and JiraAPI instance
 * as fields, no dependency-injection in the runtime implementation.
 */
export class TemplateServiceImpl {
  private templatesItem = getStorageItem('IssueTemplates')
  private cacheItem = getStorageItem('FieldMetadataCache')
  private conflictsItem = getStorageItem('TemplateConflicts')

  private jira = getJiraApi()

  private async getActiveSiteUrl(): Promise<string | null> {
    const auth = await getStorageItem('AuthCredentials').getValue()
    return auth?.host ? `https://${auth.host}`.replace(/\/$/, '') : null
  }

  private async fetchCreateIssueFields(input: {
    projectIdOrKey: string
    issueTypeId: string
  }) {
    // Use jira.js client via the shared JiraIssueService wrapper.
    // This keeps Jira HTTP concerns in lib/jira (same direction as ticket-service).
    const page = await this.jira.issues.getCreateIssueMetaFields({
      projectIdOrKey: input.projectIdOrKey,
      issueTypeId: input.issueTypeId
    })

    const fields = parseCreateMetaFields(page)
    if (!isValidCreateMetaFields(fields)) return []
    return fields
  }

  // ===== CRUD =====
  async getTemplates(): Promise<IssueTemplate[]> {
    return this.templatesItem.getValue()
  }

  async getTemplate(id: string): Promise<IssueTemplate | null> {
    const templates = await this.templatesItem.getValue()
    return templates.find((t) => t.id === id) ?? null
  }

  async createTemplate(
    input: Omit<IssueTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IssueTemplate> {
    const templates = await this.templatesItem.getValue()

    if (templates.length >= MAX_TEMPLATES) {
      throw new Error(
        `Maximum template limit reached (${MAX_TEMPLATES}). Please delete unused templates.`
      )
    }

    const now = new Date().toISOString()
    const template: IssueTemplate = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    }

    await this.templatesItem.setValue([...templates, template])
    return template
  }

  async updateTemplate(
    id: string,
    updates: Partial<IssueTemplate>
  ): Promise<IssueTemplate> {
    const templates = await this.templatesItem.getValue()
    const idx = templates.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Template not found')

    const current = templates[idx] as IssueTemplate

    const next: IssueTemplate = {
      ...current,
      ...updates,
      id,
      // preserve required fields if caller passes partial updates
      name: updates.name ?? current.name,
      trigger: updates.trigger ?? current.trigger,
      scope: updates.scope ?? current.scope,
      fields: updates.fields ?? current.fields,
      createdAt: updates.createdAt ?? current.createdAt,
      updatedAt: new Date().toISOString()
    }

    const copy = templates.slice()
    copy[idx] = next
    await this.templatesItem.setValue(copy)
    return next
  }

  async deleteTemplate(id: string): Promise<void> {
    const templates = await this.templatesItem.getValue()
    await this.templatesItem.setValue(templates.filter((t) => t.id !== id))

    const conflicts = await this.conflictsItem.getValue()
    if (conflicts[id]) {
      const { [id]: _removed, ...rest } = conflicts
      await this.conflictsItem.setValue(rest)
    }
  }

  // ===== Usage tracking =====
  async markTemplateUsed(id: string, usedAt?: string): Promise<void> {
    await this.updateTemplate(id, {
      lastUsedAt: usedAt ?? new Date().toISOString()
    })
  }

  // ===== Cache/conflicts =====
  async getFieldMetadataCache(
    cacheKey: string
  ): Promise<CachedFieldMetadata | null> {
    const cache = await this.cacheItem.getValue()
    return cache[cacheKey] ?? null
  }

  async updateFieldMetadataCache(
    cacheKey: string,
    cacheValue: CachedFieldMetadata
  ): Promise<void> {
    const cache = await this.cacheItem.getValue()
    await this.cacheItem.setValue({
      ...cache,
      [cacheKey]: cacheValue
    })
  }

  async getTemplateConflicts(templateId: string): Promise<FieldConflict[]> {
    const all = await this.conflictsItem.getValue()
    return all[templateId] ?? []
  }

  async updateTemplateConflicts(
    templateId: string,
    conflicts: FieldConflict[]
  ): Promise<void> {
    const all = await this.conflictsItem.getValue()
    await this.conflictsItem.setValue({ ...all, [templateId]: conflicts })
  }

  // ===== Refresh =====
  async refreshForActiveSite(
    options: RefreshForActiveSiteOptions
  ): Promise<void> {
    const siteUrl = await this.getActiveSiteUrl()
    if (!siteUrl) return

    const templates = (await this.templatesItem.getValue())
      .filter((t) => t.scope.siteUrl === siteUrl)
      .sort(byRecency)
      .slice(0, options.limit)

    if (templates.length === 0) return

    const allCache = await this.cacheItem.getValue()
    const allConflicts = await this.conflictsItem.getValue()

    const inFlightByCacheKey = new Map<string, Promise<void>>()

    for (const template of templates) {
      const cacheKey = `${template.scope.siteUrl}:${template.scope.projectKey}:${template.scope.issueTypeId}`

      if (isCacheFresh(allCache[cacheKey], options.ttlMs)) {
        continue
      }

      const existing = inFlightByCacheKey.get(cacheKey)
      if (existing) {
        await existing
      }

      const task = (async () => {
        const result = await refreshAndDetectConflicts(template, {
          getCreateIssueFields: async ({ projectIdOrKey, issueTypeId }) =>
            this.fetchCreateIssueFields({ projectIdOrKey, issueTypeId })
        })

        allConflicts[template.id] = result.conflicts
        if (result.updatedCache && result.updatedCache.fields.length > 0) {
          allCache[cacheKey] = result.updatedCache
        }
      })()

      inFlightByCacheKey.set(cacheKey, task)
      await task
    }

    await Promise.all([
      this.cacheItem.setValue(allCache),
      this.conflictsItem.setValue(allConflicts)
    ])
  }
}

export type TemplateService = InstanceType<typeof TemplateServiceImpl>

export const [registerTemplateService, getTemplateService] = defineProxyService<
  TemplateService,
  []
>('TemplateService', () => new TemplateServiceImpl())
