/**
 * Base Jira Client
 * Handles authentication, configuration, and provides access to jira.js modules
 */

import { BaseClient } from 'jira.js'
import {
  IssueSearch,
  Issues,
  Myself,
  Projects,
  ServerInfo
} from 'jira.js/version3'

import type { JiraApiConfig, JiraOAuthConfig, JiraApiKeyConfig } from './types'
import { oauthManager } from './oauth-manager'

/**
 * Base Jira client with authentication and jira.js module access
 */
export class JiraClient extends BaseClient {
  // jira.js modules
  issues = new Issues(this)
  issueSearch = new IssueSearch(this)
  myself = new Myself(this)
  projects = new Projects(this)
  serverInfo = new ServerInfo(this)

  constructor(private jiraConfig: JiraApiConfig) {
    if (!jiraConfig.baseUrl) {
      throw new Error('Base URL is required for Jira client')
    }

    // Validate authentication based on type
    const authConfig = JiraClient.validateAndGetAuthConfig(jiraConfig)
    
    super(authConfig)
  }

  /**
   * Validate configuration and return jira.js auth config
   */
  private static validateAndGetAuthConfig(config: JiraApiConfig) {
    const authType = config.authType || (config.email && config.apiToken ? 'api_key' : 'oauth')
    
    if (authType === 'oauth') {
      if (!config.accessToken) {
        throw new Error('Access token is required for OAuth authentication')
      }
      return {
        host: config.baseUrl,
        authentication: {
          oauth2: {
            accessToken: config.accessToken
          }
        }
      }
    } else {
      if (!config.email || !config.apiToken) {
        throw new Error('Email and API token are required for API key authentication')
      }
      return {
        host: config.baseUrl,
        authentication: {
          basic: {
            email: config.email,
            apiToken: config.apiToken
          }
        }
      }
    }
  }

  /**
   * Updates the client configuration
   */
  updateConfig(newConfig: Partial<JiraApiConfig>): void {
    this.jiraConfig = { ...this.jiraConfig, ...newConfig }

    if (!this.jiraConfig.baseUrl) {
      throw new Error('Base URL is required for Jira client')
    }

    // Validate and get new auth configuration
    const authConfig = JiraClient.validateAndGetAuthConfig(this.jiraConfig)

    // Reinitialize the client with new configuration
    Object.assign(this, new JiraClient(this.jiraConfig))
  }

  /**
   * Create client with OAuth authentication
   */
  static async createWithOAuth(config: { baseUrl: string; accessToken?: string }): Promise<JiraClient> {
    const accessToken = config.accessToken || await oauthManager.getValidAccessToken()
    if (!accessToken) {
      throw new Error('No valid OAuth access token available')
    }

    return new JiraClient({
      baseUrl: config.baseUrl,
      authType: 'oauth',
      accessToken
    })
  }

  /**
   * Create client with API key authentication
   */
  static createWithApiKey(config: JiraApiKeyConfig): JiraClient {
    return new JiraClient(config)
  }

  /**
   * Refresh OAuth token and update client if needed
   */
  async refreshOAuthToken(): Promise<boolean> {
    if (this.jiraConfig.authType !== 'oauth') {
      return false
    }

    const newAccessToken = await oauthManager.getValidAccessToken()
    if (!newAccessToken) {
      return false
    }

    if (newAccessToken !== this.jiraConfig.accessToken) {
      this.updateConfig({ accessToken: newAccessToken })
    }

    return true
  }

  /**
   * Check if client is using OAuth authentication
   */
  isOAuthClient(): boolean {
    return this.jiraConfig.authType === 'oauth'
  }

  /**
   * Check if client is using API key authentication
   */
  isApiKeyClient(): boolean {
    return this.jiraConfig.authType === 'api_key' || (!this.jiraConfig.authType && !!(this.jiraConfig.email && this.jiraConfig.apiToken))
  }

  /**
   * Gets the current configuration
   */
  getConfig(): JiraApiConfig {
    return { ...this.jiraConfig }
  }
}
