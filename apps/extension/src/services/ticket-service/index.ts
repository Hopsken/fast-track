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
import { IssueSource, JiraTicket } from '@/types'
import { concatPromises } from '@/utils/promise'
import { JiraAPI } from '~/lib/jira'

import {
  TicketSuggestionService,
  TicketSuggestionsAPI
} from './ticket-suggestion-service'

/**
 * Ticket service implementation
 */
class TicketServiceImpl {
  private database: Database
  public jiraFactory: () => Promise<JiraAPI | null>
  readonly suggestions: TicketSuggestionsAPI

  public lastSyncStorage = getStorageItem('LastSyncAt')

  constructor(
    jiraApiFactory: () => Promise<JiraAPI | null>,
    database: Database
  ) {
    this.jiraFactory = jiraApiFactory
    this.database = database
    this.suggestions = new TicketSuggestionService(this, database)
  }

  public async getJira(): Promise<JiraAPI | null> {
    try {
      return await this.jiraFactory()
    } catch (error) {
      console.error('TicketService: failed to initialize Jira client', error)
      return null
    }
  }

  public async getIssueEditMeta(issue: JiraTicket): Promise<any> {
    return this.withJira(
      (jira) => jira.issues.getIssueEditMetadata(issue),
      null,
      'getIssueEditMeta'
    )
  }

  /**
   * Fetches ticket details using the background API service
   */
  async fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]> {
    return this.withJira(
      (jira) => jira.issues.getIssues(ticketKeys),
      [],
      'fetchTicketDetails'
    )
  }

  /**
   * Loads suggestions related to the current user
   */
  async loadSuggestions(force = false): Promise<JiraTicket[]> {
    return this.withJira(
      async (jira) => {
        const shouldSync = await this.shouldSync(force)
        if (!shouldSync) {
          return []
        }

        const results = await concatPromises([
          jira.issues.getMyUnresolvedIssues(10),
          jira.issues.getRecentHistoryIssues(20),
          jira.issues.getMyRecentDoneIssues(10),
          jira.issues.getMyWatchingIssues(10)
          // TODO add sprint tickets
        ])

        const uniqTickets = this.mergeTicketsByKey(results)

        await this.database.collections.issues.bulkUpsert(uniqTickets)

        this.lastSyncStorage.setValue(Date.now().toString())
        return uniqTickets
      },
      [],
      'loadSuggestions'
    )
  }

  async searchTickets(query: string): Promise<JiraTicket[]> {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      return []
    }

    return this.withJira(
      async (jira) => {
        const results = await jira.issues.searchIssuesByText(normalizedQuery)
        // skip cache search tickets for now since it contains a lot of noise tickets
        // await this.database.collections.issues.bulkUpsert(uniqTickets)
        // TODO: add user select tickets to cache
        return uniqBy(results, 'key')
      },
      [],
      'searchTickets'
    )
  }

  public async shouldSync(force = false) {
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
    console.info('TicketService: isConfigured checked')
    return (await this.getJira()) != null
  }

  public mergeTicketsByKey(tickets: JiraTicket[]) {
    const ticketsByKey = new Map<string, JiraTicket>()

    tickets.forEach((ticket) => {
      const existing = ticketsByKey.get(ticket.key)
      if (!existing) {
        ticketsByKey.set(ticket.key, ticket)
        return
      }

      ticketsByKey.set(ticket.key, {
        ...existing,
        ...ticket,
        sources: Array.from(
          new Set([...(existing.sources || []), ...(ticket.sources || [])])
        ) as IssueSource[]
      })
    })

    return Array.from(ticketsByKey.values())
  }

  public async withJira<T>(
    action: (jira: JiraAPI) => Promise<T>,
    fallback: T,
    context: string
  ) {
    const jira = await this.getJira()
    if (!jira) {
      console.info(`TicketService: ${context} skipped, not configured`)
      return fallback
    }

    return action(jira)
  }
}

export type TicketService = InstanceType<typeof TicketServiceImpl>

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
