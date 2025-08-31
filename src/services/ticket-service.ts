/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */

import { defineProxyService } from '@webext-core/proxy-service'

import { JiraApiService } from '~/lib/jira'
import { persistLayer } from '~/storage'
import { StorageKey } from '~/storage/keys'
import type { JiraTicket } from '~/storage/types'

/**
 * Ticket service implementation
 */
class TicketService {
  /**
   * Fetches ticket details using the background API service
   */
  async fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]> {
    console.log('🔄 TicketService: Fetching details for tickets:', ticketKeys)

    try {
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

      // Create API service instance
      const apiService = new JiraApiService({
        baseUrl,
        email: userEmail,
        apiToken
      })

      // Fetch tickets in batches with rate limiting
      const tickets = await this.processBatchedRequests(apiService, ticketKeys)

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
      const [jiraHost, jiraUrl, apiToken, userEmail] = await Promise.all([
        persistLayer.get(StorageKey.JiraHost),
        persistLayer.get(StorageKey.JiraUrl),
        persistLayer.get(StorageKey.JiraApiToken),
        persistLayer.get(StorageKey.JiraUserEmail)
      ])

      // Use JiraHost if available, otherwise fall back to JiraUrl for backward compatibility
      const baseUrl = jiraHost || jiraUrl

      if (!baseUrl || !apiToken || !userEmail) {
        throw new Error('API configuration incomplete')
      }

      const apiService = new JiraApiService({
        baseUrl,
        email: userEmail,
        apiToken
      })

      return await apiService.testConnection()
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Validates ticket keys format
   */
  async validateTicketKeys(ticketKeys: string[]): Promise<{
    validKeys: string[]
    invalidKeys: string[]
    totalCount: number
    validCount: number
    invalidCount: number
  }> {
    const ticketKeyPattern = /^[A-Z]+-\d+$/
    const validation = ticketKeys.map((key) => ({
      key,
      isValid: typeof key === 'string' && ticketKeyPattern.test(key.trim())
    }))

    const validKeys = validation.filter((v) => v.isValid).map((v) => v.key)
    const invalidKeys = validation.filter((v) => !v.isValid).map((v) => v.key)

    return {
      validKeys,
      invalidKeys,
      totalCount: ticketKeys.length,
      validCount: validKeys.length,
      invalidCount: invalidKeys.length
    }
  }

  /**
   * Processes ticket requests in batches with rate limiting
   */
  private async processBatchedRequests(
    apiService: JiraApiService,
    ticketKeys: string[]
  ): Promise<JiraTicket[]> {
    const tickets: JiraTicket[] = []
    const batchSize = 5

    for (let i = 0; i < ticketKeys.length; i += batchSize) {
      const batch = ticketKeys.slice(i, i + batchSize)
      const batchTickets = await this.processSingleBatch(apiService, batch)

      tickets.push(...batchTickets)

      // Rate limiting between batches
      if (i + batchSize < ticketKeys.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return tickets
  }

  /**
   * Processes a single batch of ticket keys
   */
  private async processSingleBatch(
    apiService: JiraApiService,
    batch: string[]
  ): Promise<JiraTicket[]> {
    const batchPromises = batch.map(async (key) => {
      try {
        const ticket = await apiService.getIssue(key)
        if (ticket) {
          console.log(`✅ TicketService: Fetched details for ${key}`)
          return ticket
        }
        console.warn(`⚠️ TicketService: No details found for ${key}`)
        return null
      } catch (error) {
        console.error(`❌ TicketService: Failed to fetch ${key}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    return batchResults.filter(
      (ticket: JiraTicket | null): ticket is JiraTicket => ticket !== null
    )
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
