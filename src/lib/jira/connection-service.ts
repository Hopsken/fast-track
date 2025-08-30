/**
 * Service for Jira connection testing and validation
 */

import { JiraApiClient } from './api-client'
import type { JiraConnectionTestResult } from './types'

export class JiraConnectionService {
  constructor(private client: JiraApiClient) {}

  /**
   * Tests the connection to Jira API
   */
  async testConnection(): Promise<JiraConnectionTestResult> {
    try {
      console.log('🧪 JiraAPI: Testing connection...')

      const user = (await this.client.makeRequest('myself')) as any

      console.log('✅ JiraAPI: Connection test successful')
      return {
        success: true,
        user: {
          accountId: user.accountId,
          displayName: user.displayName,
          emailAddress: user.emailAddress
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
    // Note: We can't check apiToken here since it's not exposed by getConfig()

    return {
      isValid: missingFields.length === 0,
      missingFields
    }
  }

  /**
   * Gets server information
   */
  async getServerInfo(): Promise<any> {
    try {
      console.log('ℹ️ JiraAPI: Fetching server info...')

      const serverInfo = await this.client.makeRequest('serverInfo')

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

      const projects = (await this.client.makeRequest(
        'project/search?maxResults=1'
      )) as any

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
