/**
 * Jira API Service Facade
 * Provides a unified interface by orchestrating specialized services
 */

import type { JiraTicket } from '~/storage'

import { JiraClient } from './client'
import { JiraConnectionService } from './connection-service'
import { JiraIssueService } from './issue-service'
import type { JiraApiConfig, JiraConnectionTestResult } from './types'

/**
 * Main Jira service that orchestrates specialized services using facade pattern
 */
export class JiraApiService {
  private client: JiraClient
  private issueService: JiraIssueService
  private connectionService: JiraConnectionService

  constructor(config: JiraApiConfig) {
    this.client = new JiraClient(config)
    this.issueService = new JiraIssueService(this.client)
    this.connectionService = new JiraConnectionService(this.client)
  }

  // ============================================================================
  // Issue Operations (Delegated to JiraIssueService)
  // ============================================================================

  async getIssue(issueKey: string): Promise<JiraTicket | null> {
    return this.issueService.getIssue(issueKey)
  }

  async getIssues(issueKeys: string[]): Promise<JiraTicket[]> {
    return this.issueService.getIssues(issueKeys)
  }

  // ============================================================================
  // Connection Operations (Delegated to JiraConnectionService)
  // ============================================================================

  async testConnection(): Promise<JiraConnectionTestResult> {
    return this.connectionService.testConnection()
  }

  validateConfig(): { isValid: boolean; missingFields: string[] } {
    return this.connectionService.validateConfig()
  }

  async getServerInfo(): Promise<unknown> {
    return this.connectionService.getServerInfo()
  }

  async testPermissions(): Promise<{
    hasAccess: boolean
    projectCount: number
  }> {
    return this.connectionService.testPermissions()
  }

  // ============================================================================
  // Configuration (Delegated to JiraClient)
  // ============================================================================

  /**
   * Updates the service configuration
   */
  updateConfig(newConfig: Partial<JiraApiConfig>): void {
    this.client.updateConfig(newConfig)

    // Reinitialize services with updated client
    this.issueService = new JiraIssueService(this.client)
    this.connectionService = new JiraConnectionService(this.client)
  }

  getConfig(): JiraApiConfig {
    return this.client.getConfig()
  }

  // ============================================================================
  // Rate Limiting (Delegated to JiraIssueService)
  // ============================================================================

  /**
   * Updates the rate limit delay
   */
  setRateLimitDelay(delay: number): void {
    this.issueService.setRateLimitDelay(delay)
  }

  /**
   * Gets the current rate limit delay
   */
  getRateLimitDelay(): number {
    return this.issueService.getRateLimitDelay()
  }
}
