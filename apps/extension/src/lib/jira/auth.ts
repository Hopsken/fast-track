/**
 * Jira Connection Service
 * Handles connection testing, validation, and health checks for both OAuth and API key authentication
 */

import type { ServerInformation } from 'jira.js/version3/models/serverInformation'

import type { AuthType } from '@/lib/storage/schema'

import type { JiraClient } from './client'
import { oauthManager } from './oauth-manager'

export interface JiraConnectionTestResult {
  success: boolean
  user?: {
    accountId: string
    displayName: string
    emailAddress: string
  }
  error?: string
}

/**
 * Service for connection-related operations and validation
 */
export class JiraAuthService {
  constructor(private client: JiraClient) {}

  /**
   * Tests the connection to Jira API
   */
  async testConnection(): Promise<JiraConnectionTestResult> {
    try {
      console.log('🧪 JiraAPI: Testing connection...')

      const user = await this.client.myself.getCurrentUser()

      console.log('✅ JiraAPI: Connection test successful')
      return {
        success: true,
        user: {
          accountId: user.accountId,
          displayName: user.displayName || '',
          emailAddress: user.emailAddress || ''
        }
      }
    } catch (error) {
      console.error('❌ JiraAPI: Connection test failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Validates configuration for both OAuth and API key authentication
   */
  validateConfig(): {
    isValid: boolean
    missingFields: string[]
    authType: AuthType
  } {
    const config = this.client.getConfig()
    const missingFields: string[] = []
    const authType = config.authType || 'api_key'

    if (!config.baseUrl) {
      missingFields.push('baseUrl')
    }

    if (authType === 'oauth') {
      if (!config.accessToken) {
        missingFields.push('accessToken')
      }
    } else {
      // API key validation
      if (!config.email) {
        missingFields.push('email')
      }
      if (!config.apiToken) {
        missingFields.push('apiToken')
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      authType
    }
  }

  /**
   * Validates OAuth token and refreshes if needed
   */
  async validateOAuthToken(): Promise<{
    isValid: boolean
    refreshed: boolean
    error?: string
  }> {
    try {
      const isExpired = await oauthManager.isTokenExpired()
      if (!isExpired) {
        return { isValid: true, refreshed: false }
      }

      // Try to refresh the token
      const refreshed = await oauthManager.refreshTokens()
      if (refreshed) {
        return { isValid: true, refreshed: true }
      }

      return { isValid: false, refreshed: false, error: 'Token refresh failed' }
    } catch (error) {
      return {
        isValid: false,
        refreshed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Gets the current authentication type
   */
  async getAuthType(): Promise<AuthType> {
    return await oauthManager.getAuthType()
  }

  /**
   * Switches authentication method
   */
  async switchAuthType(authType: AuthType): Promise<void> {
    await oauthManager.setAuthType(authType)
  }

  /**
   * Tests OAuth connection specifically
   */
  async testOAuthConnection(): Promise<JiraConnectionTestResult> {
    try {
      // First validate the OAuth token
      const tokenValidation = await this.validateOAuthToken()
      if (!tokenValidation.isValid) {
        return {
          success: false,
          error: tokenValidation.error || 'Invalid OAuth token'
        }
      }

      // If token was refreshed, we need to update the client
      if (tokenValidation.refreshed) {
        const refreshed = await this.client.refreshOAuthToken()
        if (!refreshed) {
          return {
            success: false,
            error: 'Failed to update client with refreshed token'
          }
        }
      }

      // Test the connection
      return await this.testConnection()
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'OAuth connection test failed'
      }
    }
  }

  /**
   * Gets server information
   */
  async getServerInfo(): Promise<ServerInformation> {
    try {
      console.log('ℹ️ JiraAPI: Fetching server info...')

      const serverInfo = await this.client.serverInfo.getServerInfo()

      console.log('✅ JiraAPI: Server info retrieved')
      return serverInfo
    } catch (error) {
      console.error('❌ JiraAPI: Failed to fetch server info:', error)
      throw error
    }
  }

  /**
   * Tests permissions by trying to access user's projects
   */
  async testPermissions(): Promise<{
    hasAccess: boolean
    projectCount: number
  }> {
    try {
      console.log('🔐 JiraAPI: Testing permissions...')

      const projects = await this.client.projects.searchProjects({
        maxResults: 1
      })

      const hasAccess = Array.isArray(projects.values)
      const projectCount = projects.total || 0

      console.log(
        `✅ JiraAPI: Permission test completed. Access: ${hasAccess}, Projects: ${projectCount}`
      )

      return {
        hasAccess,
        projectCount
      }
    } catch (error) {
      console.error('❌ JiraAPI: Permission test failed:', error)
      return {
        hasAccess: false,
        projectCount: 0
      }
    }
  }
}
