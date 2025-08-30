/**
 * Background service for ticket fetching operations
 */

import { JiraApiService } from '~/lib/jira'
import { StorageKey } from '~/storage/keys'
import { persistLayer } from '~/storage/storage-layer'
import type { JiraTicket } from '~/storage/types'

export class TicketFetcherService {
  /**
   * Fetches ticket details using the background API service
   */
  static async fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]> {
    console.log('🔄 Background: Fetching details for tickets:', ticketKeys)

    try {
      // Get API configuration from storage
      const [jiraHost, apiToken, userEmail] = await Promise.all([
        persistLayer.get(StorageKey.JiraHost),
        persistLayer.get(StorageKey.JiraApiToken),
        persistLayer.get(StorageKey.JiraUserEmail)
      ])

      if (!jiraHost || !apiToken || !userEmail) {
        throw new Error(
          'Jira API configuration is incomplete. Please configure API settings.'
        )
      }

      // Create API service instance
      const apiService = new JiraApiService({
        baseUrl: jiraHost,
        email: userEmail,
        apiToken
      })

      // Fetch tickets in batches with rate limiting
      const tickets = await this.processBatchedRequests(apiService, ticketKeys)

      console.log(
        `🎉 Background: Successfully fetched ${tickets.length}/${ticketKeys.length} tickets`
      )
      return tickets
    } catch (error) {
      console.error('❌ Background: Failed to fetch ticket details:', error)
      throw error
    }
  }

  /**
   * Processes ticket requests in batches with rate limiting
   */
  private static async processBatchedRequests(
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
  private static async processSingleBatch(
    apiService: JiraApiService,
    batch: string[]
  ): Promise<JiraTicket[]> {
    const batchPromises = batch.map(async (key) => {
      try {
        const ticket = await apiService.getIssue(key)
        if (ticket) {
          console.log(`✅ Background: Fetched details for ${key}`)
          return ticket
        }
        console.warn(`⚠️ Background: No details found for ${key}`)
        return null
      } catch (error) {
        console.error(`❌ Background: Failed to fetch ${key}:`, error)
        return null
      }
    })

    const batchResults = await Promise.all(batchPromises)
    return batchResults.filter(
      (ticket): ticket is JiraTicket => ticket !== null
    )
  }

  /**
   * Tests the API connection
   */
  static async testConnection(): Promise<{
    success: boolean
    error?: string
    user?: any
  }> {
    try {
      const [jiraHost, apiToken, userEmail] = await Promise.all([
        persistLayer.get(StorageKey.JiraHost),
        persistLayer.get(StorageKey.JiraApiToken),
        persistLayer.get(StorageKey.JiraUserEmail)
      ])

      if (!jiraHost || !apiToken || !userEmail) {
        throw new Error('API configuration incomplete')
      }

      const apiService = new JiraApiService({
        baseUrl: jiraHost,
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
}
