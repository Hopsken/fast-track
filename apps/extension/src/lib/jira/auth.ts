/**
 * Jira Connection Service
 * Handles connection testing, validation, and health checks
 */

import type { ServerInformation } from 'jira.js/version3/models/serverInformation'

import type { JiraClient } from './client'

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
   * Validates API configuration without making a request
   */
  validateConfig(): { isValid: boolean; missingFields: string[] } {
    const config = this.client.getConfig()
    const missingFields: string[] = []

    if (!config.baseUrl) {
      missingFields.push('baseUrl')
    }
    if (!config.email) {
      missingFields.push('email')
    }
    if (!config.apiToken) {
      missingFields.push('apiToken')
    }

    return {
      isValid: missingFields.length === 0,
      missingFields
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
