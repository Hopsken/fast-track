import { defineProxyService } from '@webext-core/proxy-service'
import { nanoid } from 'nanoid'

import { getJiraApi } from '@/lib/jira'
import { IssueTemplateSchema } from '@/repository/schema'
import { normalizeBaseUrlHost } from '@/utils/normalize-host'
import { getStorageItem } from '~/lib/storage/schema'
import { type IssueTemplate } from '~/types/template'

const MAX_TEMPLATES = 50

/**
 * Template service implementation (proxy-service style)
 *
 * Matches the pattern used by `ticket-service`: holds WXT storage items and JiraAPI instance
 * as fields, no dependency-injection in the runtime implementation.
 */
export class TemplateServiceImpl {
  private templatesItem = getStorageItem('IssueTemplates')
  private jiraApi = getJiraApi()

  // ===== CRUD =====
  async getTemplates(options?: {
    includeOtherHosts?: boolean
  }): Promise<IssueTemplate[]> {
    const { includeOtherHosts = false } = options ?? {}
    const currentHost = normalizeBaseUrlHost(this.jiraApi.getHost() ?? '')
    const templates = await this.templatesItem.getValue()

    const valid: IssueTemplate[] = []
    for (const t of templates) {
      const res = IssueTemplateSchema.safeParse(t)
      if (res.success) valid.push(res.data)
    }

    return valid.filter(
      (t) => includeOtherHosts || t.scope.baseUrlHost === currentHost
    )
  }

  async getTemplate(id: string): Promise<IssueTemplate | null> {
    const templates = await this.getTemplates()
    return templates.find((t) => t.id === id) ?? null
  }

  async createTemplate(
    input: Omit<IssueTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IssueTemplate> {
    const templates = await this.getTemplates()

    if (templates.length >= MAX_TEMPLATES) {
      throw new Error(
        `Maximum template limit reached (${MAX_TEMPLATES}). Please delete unused templates.`
      )
    }

    const now = new Date().toISOString()
    const candidate: IssueTemplate = {
      ...input,
      id: nanoid(),
      createdAt: now,
      updatedAt: now
    }

    const parsed = IssueTemplateSchema.safeParse(candidate)
    if (!parsed.success) {
      throw new Error(`Invalid template: ${parsed.error.message}`)
    }

    await this.templatesItem.setValue([...templates, parsed.data])
    return parsed.data
  }

  async updateTemplate(
    id: string,
    updates: Partial<IssueTemplate>
  ): Promise<IssueTemplate> {
    const templates = await this.getTemplates()
    const idx = templates.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Template not found')

    const current = templates[idx] as IssueTemplate

    const candidate: IssueTemplate = {
      ...current,
      ...updates,
      id,
      // preserve required fields if caller passes partial updates
      name: updates.name ?? current.name,
      scope: updates.scope ?? current.scope,
      fields: updates.fields ?? current.fields,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString()
    }

    const parsed = IssueTemplateSchema.safeParse(candidate)
    if (!parsed.success) {
      throw new Error(`Invalid template: ${parsed.error.message}`)
    }

    const copy = templates.slice()
    copy[idx] = parsed.data
    await this.templatesItem.setValue(copy)
    return parsed.data
  }

  async deleteTemplate(id: string): Promise<void> {
    const templates = await this.getTemplates()
    await this.templatesItem.setValue(templates.filter((t) => t.id !== id))
  }

  // ===== Usage tracking =====
  async markTemplateUsed(id: string, usedAt?: string): Promise<void> {
    await this.updateTemplate(id, {
      lastUsedAt: usedAt ?? new Date().toISOString()
    })
  }
}

export type TemplateService = InstanceType<typeof TemplateServiceImpl>

export const [registerTemplateService, getTemplateService] = defineProxyService<
  TemplateService,
  []
>('TemplateService', () => new TemplateServiceImpl())
