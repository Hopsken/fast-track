/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */
import { logging } from '@internal/logger'
import { defineProxyService, flattenPromise } from '@webext-core/proxy-service'

import { JiraTicket } from '@/types'
import { JiraAPI } from '~/lib/jira'

/**
 * Ticket service implementation
 */
export class TicketService {
  private jira: JiraAPI

  constructor(jiraAPI: Promise<JiraAPI>) {
    this.jira = flattenPromise(jiraAPI) as unknown as JiraAPI
  }

  /**
   * Fetches ticket details using the background API service
   */
  async fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]> {
    return this.jira.issues.getIssues(ticketKeys)
  }

  /**
   * Gets Jira Issue Picker suggestions (for empty or initial searches)
   */
  async getIssuePickerSuggestions(): Promise<JiraTicket[]> {
    return this.jira.issues.getIssuePickerSuggestions()
  }

  /**
   * Tests the API connection
   */
  @logging()
  async testConnection() {
    return this.jira.connections.testConnection()
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
  (jiraAPI: Promise<JiraAPI>) => new TicketService(jiraAPI)
)

/**
 * Type helper for the ticket service
 */
export type TicketServiceType = InstanceType<typeof TicketService>
