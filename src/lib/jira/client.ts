/**
 * Base Jira Client
 * Handles authentication, configuration, and provides access to jira.js modules
 */

import { BaseClient } from 'jira.js'
import { Issues, Myself, Projects, ServerInfo } from 'jira.js/version3'

import type { JiraApiConfig } from './types'

/**
 * Base Jira client with authentication and jira.js module access
 */
export class JiraClient extends BaseClient {
  // jira.js modules
  issues = new Issues(this)
  myself = new Myself(this)
  projects = new Projects(this)
  serverInfo = new ServerInfo(this)

  constructor(private jiraConfig: JiraApiConfig) {
    // Validate required authentication fields
    if (!jiraConfig.email || !jiraConfig.apiToken) {
      throw new Error(
        'Email and API token are required for Jira authentication'
      )
    }

    if (!jiraConfig.baseUrl) {
      throw new Error('Base URL is required for Jira client')
    }

    super({
      host: jiraConfig.baseUrl,
      authentication: {
        basic: {
          email: jiraConfig.email,
          apiToken: jiraConfig.apiToken
        }
      }
    })
  }

  /**
   * Updates the client configuration
   */
  updateConfig(newConfig: Partial<JiraApiConfig>): void {
    this.jiraConfig = { ...this.jiraConfig, ...newConfig }

    // Validate updated configuration
    if (!this.jiraConfig.email || !this.jiraConfig.apiToken) {
      throw new Error(
        'Email and API token are required for Jira authentication'
      )
    }

    if (!this.jiraConfig.baseUrl) {
      throw new Error('Base URL is required for Jira client')
    }

    // Reinitialize the client with new configuration
    const updatedConfig = {
      host: this.jiraConfig.baseUrl,
      authentication: {
        basic: {
          email: this.jiraConfig.email,
          apiToken: this.jiraConfig.apiToken
        }
      }
    }

    Object.assign(
      this,
      new JiraClient({
        baseUrl: updatedConfig.host,
        email: updatedConfig.authentication.basic.email,
        apiToken: updatedConfig.authentication.basic.apiToken
      })
    )
  }

  /**
   * Gets the current configuration
   */
  getConfig(): JiraApiConfig {
    return { ...this.jiraConfig }
  }
}
