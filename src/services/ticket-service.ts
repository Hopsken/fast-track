/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */

import { defineProxyService } from '@webext-core/proxy-service'
import { isEqual } from 'lodash-es'

import { JiraApiService, type JiraApiConfig } from '~/lib/jira'
import { persistLayer } from '~/storage'
import { StorageKey } from '~/storage/keys'
import type { JiraTicket } from '~/storage/types'

/**
 * Ticket service implementation
 */
class TicketService {
  private cachedApiService: JiraApiService | null = null
  private cachedConfig: JiraApiConfig | null = null
  /**
   * Creates and returns a configured JiraApiService instance with caching
   */
  private async getApiService(): Promise<JiraApiService> {
    // Get API configuration from storage (with backward compatibility)
    const [jiraHost, jiraUrl, apiToken, userEmail] = await Promise.all([
      persistLayer.get(StorageKey.JiraHost),
      persistLayer.get(StorageKey.JiraUrl),
      persistLayer.get(StorageKey.JiraApiToken),
      persistLayer.get(StorageKey.JiraUserEmail)
    ])

    // Use JiraHost if available, otherwise fall back to JiraUrl for backward compatibility
    const baseUrl = jiraHost || jiraUrl

    if (!baseUrl || !apiToken || !userEmail) {
      throw new Error(
        'Jira API configuration is incomplete. Please configure API settings.'
      )
    }

    const currentConfig: JiraApiConfig = {
      baseUrl,
      email: userEmail,
      apiToken
    }

    // Return cached service if configuration hasn't changed
    if (this.cachedApiService && isEqual(this.cachedConfig, currentConfig)) {
      return this.cachedApiService
    }

    // Create new service instance and cache it
    this.cachedApiService = new JiraApiService(currentConfig)
    this.cachedConfig = currentConfig

    return this.cachedApiService
  }
  /**
   * Fetches ticket details using the background API service
   */
  async fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]> {
    console.log('🔄 TicketService: Fetching details for tickets:', ticketKeys)

    try {
      const apiService = await this.getApiService()

      // Use bulk getIssues method instead of manual batching
      const tickets = await apiService.getIssues(ticketKeys)

      console.log(
        `🎉 TicketService: Successfully fetched ${tickets.length}/${ticketKeys.length} tickets`
      )
      return tickets
    } catch (error) {
      console.error('❌ TicketService: Failed to fetch ticket details:', error)
      throw error
    }
  }

  /**
   * Tests the API connection
   */
  async testConnection(): Promise<{
    success: boolean
    error?: string
    user?: unknown
  }> {
    try {
      const apiService = await this.getApiService()
      return await apiService.testConnection()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * Define the proxy service
 *
 * Returns:
 * - registerTicketService: Function to register the service in background script
 * - getTicketService: Function to get service instance from any context
 */
export const [registerTicketService, getTicketService] = defineProxyService(
  'TicketService',
  () => new TicketService()
)

/**
 * Type helper for the ticket service
 */
export type TicketServiceType = InstanceType<typeof TicketService>
