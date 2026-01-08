/**
 * Jira API Service Facade
 * Provides a unified interface by orchestrating specialized services
 */

import { JiraUserInfo } from '@/types'

import { JiraClient } from './client'
import { JiraIssueService } from './issues'
import { JiraApiConfig } from './types'

/**
 * Main Jira service that orchestrates specialized services using facade pattern
 */
export class JiraAPI {
  private client: JiraClient
  private _issueService: JiraIssueService

  constructor(config: JiraApiConfig) {
    this.client = new JiraClient(config)
    this._issueService = new JiraIssueService(this.client)
  }

  public get issues() {
    return this._issueService
  }

  public async getMyself(): Promise<JiraUserInfo> {
    const currentUser = await this.client.myself.getCurrentUser()
    return {
      accountId: currentUser.accountId,
      email: currentUser.emailAddress ?? '',
      name: currentUser.displayName ?? '',
      avatarUrl: currentUser.avatarUrls?.['16x16']
    }
  }

  public async autoComplete<T>(
    url: string,
    params: Record<string, string>
  ): Promise<T> {
    const updatedUrl = new URL(url)
    Object.entries(params).forEach(([key, value]) => {
      updatedUrl.searchParams.set(key, value)
    })

    const response = await (this.client as any).sendRequest({
      url: updatedUrl.toString(),
      method: 'GET'
    })

    return (response?.data ?? response) as T
  }

  public async request<T>(
    url: string,
    options?: { method?: string; responseType?: 'blob' | 'json' }
  ): Promise<T> {
    const response = await (this.client as any).sendRequest({
      url,
      method: options?.method ?? 'GET'
    })

    if (response instanceof Response) {
      if (options?.responseType === 'blob') {
        return (await response.blob()) as T
      }
      return (await response.json()) as T
    }

    return (response?.data ?? response) as T
  }

  getConfig(): JiraApiConfig {
    return this.client.getConfig()
  }
}
