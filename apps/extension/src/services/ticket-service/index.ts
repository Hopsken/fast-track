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

import { TicketService } from './interface'
import {
  TicketSuggestionService,
  TicketSuggestionsAPI
} from './ticket-suggestion-service'

export type { TicketService } from './interface'

/**
 * Ticket service implementation
 */
class TicketServiceImpl implements TicketService {
  private database: Database
  private jiraFactory: () => Promise<JiraAPI | null>
  private suggestionService: TicketSuggestionService
  readonly suggestions: TicketSuggestionsAPI

  private lastSyncStorage = getStorageItem('LastSyncAt')

  constructor(
    jiraApiFactory: () => Promise<JiraAPI | null>,
    database: Database
  ) {
    this.jiraFactory = jiraApiFactory
    this.database = database
    this.suggestionService = new TicketSuggestionService(this, database)
    this.suggestions = {
      refresh: (reason, options) =>
        this.suggestionService.refreshSuggestions(reason, options),
      onAuthSuccess: () => this.suggestionService.handleAuthSuccess(),
      getCached: (limit) => this.suggestionService.getCachedSuggestions(limit),
      getLastRefreshMeta: () => this.suggestionService.getLastRefreshMeta()
    }
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
      jira.issues.getMyUnresolvedIssues(),
      jira.issues
        .getRecentHistoryIssues()
        .then((tickets) => this.addSource(tickets, 'history')),
      jira.issues
        .getIssuePickerSuggestions()
        .then((tickets) => this.addSource(tickets, 'picker')),
      jira.issues.getMyInProgressIssues(),
      jira.issues.getMyRecentDoneIssues(),
      jira.issues
        .getMyWatchingIssues()
        .then((tickets) => this.addSource(tickets, 'watching'))
    ])

    const uniqTickets = this.mergeTicketsByKey(results)

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
    console.info('TicketService: isConfigured checked')
    return (await this.getJira()) != null
  }

  private addSource(tickets: JiraTicket[], source: IssueSource) {
    return tickets.map((ticket) => ({
      ...ticket,
      sources: Array.from(
        new Set([...(ticket.sources || []), source])
      ) as IssueSource[]
    }))
  }

  private mergeTicketsByKey(tickets: JiraTicket[]) {
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
