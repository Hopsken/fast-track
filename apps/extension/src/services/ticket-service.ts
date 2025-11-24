/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */
import { defineProxyService } from '@webext-core/proxy-service'
import { uniqBy } from 'lodash-es'

import { getStorageItem } from '@/lib/storage'
import { Database } from '@/repository'
import { JiraTicket } from '@/types'
import { concatPromises } from '@/utils/promise'
import { JiraAPI } from '~/lib/jira'

export interface TicketService {
  fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]>
  loadSuggestions(force?: boolean): Promise<JiraTicket[]>
  searchTickets(query: string): Promise<JiraTicket[]>
  isConfigured(): Promise<boolean>
}

/**
 * Ticket service implementation
 */
class TicketServiceImpl implements TicketService {
  private database: Database
  private jiraFactory: () => Promise<JiraAPI | null>

  private lastSyncStorage = getStorageItem('LastSyncAt')

  constructor(
    jiraApiFactory: () => Promise<JiraAPI | null>,
    database: Database
  ) {
    this.jiraFactory = jiraApiFactory
    this.database = database
  }

  private async getJira(): Promise<JiraAPI | null> {
    try {
      return await this.jiraFactory()
    } catch (error) {
      console.error('TicketService: failed to initialize Jira client', error)
      return null
    }
  }

  /**
   * Fetches ticket details using the background API service
   */
  async fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]> {
    const jira = await this.getJira()
    if (!jira) {
      console.info('TicketService: fetchTicketDetails skipped, not configured')
      return []
    }

    return jira.issues.getIssues(ticketKeys)
  }

  /**
   * Loads suggestions related to the current user
   */
  async loadSuggestions(force = false): Promise<JiraTicket[]> {
    const jira = await this.getJira()
    if (!jira) {
      console.info('TicketService: loadSuggestions skipped, not configured')
      return []
    }

    const shouldSync = await this.shouldSync(force)
    if (!shouldSync) {
      return []
    }

    const results = await concatPromises([
      jira.issues.getIssuePickerSuggestions(),
      jira.issues.getMyInProgressIssues(),
      jira.issues.getMyRecentDoneIssues(),
      jira.issues.getMyWatchingIssues()
    ])

    const uniqTickets = uniqBy(results, 'key')

    await this.database.collections.issues.bulkUpsert(uniqTickets)

    this.lastSyncStorage.setValue(Date.now().toString())
    return uniqTickets
  }

  async searchTickets(query: string): Promise<JiraTicket[]> {
    const jira = await this.getJira()
    if (!jira) {
      console.info('TicketService: search skipped, not configured')
      return []
    }

    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      return []
    }

    const results = await jira.issues.searchIssuesByText(normalizedQuery)
    const uniqTickets = uniqBy(results, 'key')

    await this.database.collections.issues.bulkUpsert(uniqTickets)
    return uniqTickets
  }

  private async shouldSync(force = false) {
    if (force) return true

    const lastSyncAt = await this.lastSyncStorage.getValue()
    if (!lastSyncAt || force) {
      return true
    }

    const lastSyncDate = new Date(lastSyncAt)
    const now = new Date()
    const diff = now.getTime() - lastSyncDate.getTime()
    return diff > 1000 * 60 // 1 min
  }

  async isConfigured() {
    return (await this.getJira()) != null
  }
}

/**
 * Define the proxy service
 *
 * Returns:
 * - registerTicketService: Function to register the service in background script
 * - getTicketService: Function to get service instance from any context
 */
export const [registerTicketService, getTicketService] = defineProxyService<
  TicketService,
  [() => Promise<JiraAPI | null>, Database]
>(
  'TicketService',
  (jiraApiFactory: () => Promise<JiraAPI | null>, database: Database) =>
    new TicketServiceImpl(jiraApiFactory, database)
)
