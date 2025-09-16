/**
 * Jira API Service Facade
 * Provides a unified interface by orchestrating specialized services
 */

import { JiraAuthService } from './auth'
import { JiraClient } from './client'
import { JiraIssueService } from './issues'
import { JiraApiConfig } from './types'

/**
 * Main Jira service that orchestrates specialized services using facade pattern
 */
export class JiraAPI {
  private client: JiraClient
  private _issueService: JiraIssueService
  private _authService: JiraAuthService

  constructor(config: JiraApiConfig) {
    this.client = new JiraClient(config)
    this._issueService = new JiraIssueService(this.client)
    this._authService = new JiraAuthService(this.client)
  }

  public get issues() {
    return this._issueService
  }

  public get connections() {
    return this._authService
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
    this._issueService = new JiraIssueService(this.client)
    this._authService = new JiraAuthService(this.client)
  }

  getConfig(): JiraApiConfig {
    return this.client.getConfig()
  }

  hasValidConfig(): boolean {
    const { baseUrl, email, apiToken } = this.getConfig()
    return !!baseUrl && !!email && !!apiToken
  }
}
