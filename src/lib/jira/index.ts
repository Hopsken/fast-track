/**
 * Jira API service - Main entry point
 * This provides a unified service that combines all Jira API functionality
 */

import { JiraApiClient } from './api-client'
import { JiraConnectionService } from './connection-service'
import { JiraIssueService } from './issue-service'
import type { JiraApiConfig } from './types'

export class JiraApiService {
  private client: JiraApiClient
  private issueService: JiraIssueService
  private connectionService: JiraConnectionService

  constructor(config: JiraApiConfig) {
    this.client = new JiraApiClient(config)
    this.issueService = new JiraIssueService(this.client)
    this.connectionService = new JiraConnectionService(this.client)
  }

  // Issue operations
  getIssue = (issueKey: string) => this.issueService.getIssue(issueKey)
  getIssues = (issueKeys: string[]) => this.issueService.getIssues(issueKeys)

  // Connection operations
  testConnection = () => this.connectionService.testConnection()
  validateConfig = () => this.connectionService.validateConfig()
  getServerInfo = () => this.connectionService.getServerInfo()
  testPermissions = () => this.connectionService.testPermissions()

  // Configuration
  updateConfig(newConfig: Partial<JiraApiConfig>): void {
    this.client.updateConfig(newConfig)
  }

  getConfig() {
    return this.client.getConfig()
  }

  // Rate limiting
  setRateLimitDelay(delay: number): void {
    this.issueService.setRateLimitDelay(delay)
  }

  getRateLimitDelay(): number {
    return this.issueService.getRateLimitDelay()
  }
}

// Export types and utilities
export type {
  JiraApiConfig,
  JiraApiIssue,
  JiraApiError,
  JiraConnectionTestResult
} from './types'
export {
  extractJiraUrlFromCurrentPage,
  extractJiraInstanceName,
  isValidJiraUrl,
  normalizeJiraUrl,
  buildIssueUrl,
  extractIssueKeyFromUrl,
  isJiraIssueUrl,
  JiraUrlBuilder
} from './url-helpers'
