/**
 * Jira API Service Facade
 * Provides a unified interface by orchestrating specialized services
 */

import { RequestConfig } from 'jira.js'

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

  public async request<T>(config: RequestConfig): Promise<T> {
    // @ts-expect-error - mistyped arg
    return this.client.sendRequest<T>(config)
  }

  getConfig(): JiraApiConfig {
    return this.client.getConfig()
  }
}
