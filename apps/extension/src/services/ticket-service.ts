/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */
import { defineProxyService, flattenPromise } from '@webext-core/proxy-service'
import { uniqBy } from 'lodash-es'

import { Database } from '@/repository'
import { JiraTicket } from '@/types'
import { concatPromises } from '@/utils/promise'
import { JiraAPI } from '~/lib/jira'

/**
 * Ticket service implementation
 */
class TicketServiceImpl {
  private jira: JiraAPI
  private database: Database

  constructor(jiraAPI: Promise<JiraAPI>, database: Database) {
    this.jira = flattenPromise(jiraAPI) as unknown as JiraAPI
    this.database = database
  }

  /**
   * Fetches ticket details using the background API service
   */
  async fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]> {
    return this.jira.issues.getIssues(ticketKeys)
  }

  /**
   * Loads suggestions related to the current user
   */
  async loadSuggestions(): Promise<JiraTicket[]> {
    const results = await concatPromises([
      this.jira.issues.getIssuePickerSuggestions(),
      this.jira.issues.getMyInProgressIssues(),
      this.jira.issues.getMyRecentDoneIssues(),
      this.jira.issues.getMyWatchingIssues()
    ])

    const uniqTickets = uniqBy(results, 'key')

    console.info('Loaded suggestions', uniqTickets)

    const result = await this.database.issues.bulkUpsert(uniqTickets)
    console.info('Upsert result', result)

    return uniqTickets
  }

  async isConfigured() {
    return this.jira.getConfig() != null
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
  (jiraAPI: Promise<JiraAPI>, database: Database) =>
    new TicketServiceImpl(jiraAPI, database)
)

/**
 * Type helper for the ticket service
 */
export type TicketService = InstanceType<typeof TicketServiceImpl>
