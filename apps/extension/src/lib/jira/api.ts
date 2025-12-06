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
    const headers = this.buildAuthorizationHeader(this.client.getConfig())

    const updatedUrl = new URL(url)
    Object.entries(params).forEach(([key, value]) => {
      updatedUrl.searchParams.set(key, value)
    })

    const response = await fetch(updatedUrl, {
      method: 'GET',
      headers
    })

    if (response.ok) {
      return response.json() as T
    } else {
      const result = await response.json()
      throw new Error(JSON.stringify(result))
    }
  }

  private buildAuthorizationHeader(config: JiraApiConfig): HeadersInit {
    if (config.type === 'oauth') {
      return {
        Accept: 'application/json',
        Authorization: `Bearer ${config.access_token}`
      }
    }

    if (config.type === 'apiKey') {
      return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        // eslint-disable-next-line sonarjs/no-nested-template-literals
        Authorization: `Basic ${btoa(`${config.email}:${config.apiKey}`)}`
      }
    }

    throw new Error(`Unsupported authentication type: ${config}`)
  }

  getConfig(): JiraApiConfig {
    return this.client.getConfig()
  }
}
