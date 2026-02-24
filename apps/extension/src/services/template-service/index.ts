import { defineProxyService } from '@webext-core/proxy-service'
import { nanoid } from 'nanoid'

import { JiraAPI } from '@/lib/jira'
import { IssueTemplateSchema } from '@/repository/schema'
import { normalizeBaseUrlHost } from '@/utils/normalize-host'
import { getStorageItem } from '~/lib/storage/schema'
import { type IssueTemplate } from '~/types/template'

const MAX_TEMPLATES = 50
const FREE_TEMPLATES_LIMIT = 3

/**
 * Template service implementation (proxy-service style)
 *
 * Matches the pattern used by `ticket-service`: holds WXT storage items and JiraAPI instance
 * as fields, no dependency-injection in the runtime implementation.
 */
export class TemplateService {
  private templatesItem = getStorageItem('IssueTemplates')
  private snapshotItem = getStorageItem('SubscriptionSnapshot')
  private jiraApi = JiraAPI.getInstance()

  private async getAllValidTemplates(): Promise<IssueTemplate[]> {
    const templates = await this.templatesItem.getValue()

    const valid: IssueTemplate[] = []
    for (const t of templates) {
      const res = IssueTemplateSchema.safeParse(t)
      if (res.success) valid.push(res.data)
    }

    return valid
  }

  // ===== CRUD =====
  async getTemplates(options?: {
    includeOtherHosts?: boolean
  }): Promise<IssueTemplate[]> {
    const host = await this.jiraApi.getHost()
    const { includeOtherHosts = false } = options ?? {}
    const currentHost = normalizeBaseUrlHost(host ?? '')
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

  async getTemplate(
    id: string,
    options?: {
      includeOtherHosts?: boolean
    }
  ): Promise<IssueTemplate | null> {
    const { includeOtherHosts = false } = options ?? {}
    const templates = await this.getTemplates({ includeOtherHosts })
    return templates.find((t) => t.id === id) ?? null
  }

  async createTemplate(
    input: Omit<IssueTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<IssueTemplate> {
    const templates = await this.getAllValidTemplates()

    if (templates.length >= MAX_TEMPLATES) {
      throw new Error(
        `Maximum template limit reached (${MAX_TEMPLATES}). Please delete unused templates.`
      )
    }

    const snapshot = await this.snapshotItem.getValue()
    const isPro = snapshot?.isPro ?? false
    if (!isPro && templates.length >= FREE_TEMPLATES_LIMIT) {
      throw new Error(
        `Free plan limit reached (${FREE_TEMPLATES_LIMIT} issue templates). Upgrade to Pro to create more.`
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
    const templates = await this.getAllValidTemplates()
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
    const templates = await this.getAllValidTemplates()
    await this.templatesItem.setValue(templates.filter((t) => t.id !== id))
  }

  // ===== Usage tracking =====
  async markTemplateUsed(id: string, usedAt?: string): Promise<void> {
    await this.updateTemplate(id, {
      lastUsedAt: usedAt ?? new Date().toISOString()
    })
  }
}

export const [registerTemplateService, getTemplateService] = defineProxyService<
  TemplateService,
  []
>('TemplateService', () => new TemplateService())
