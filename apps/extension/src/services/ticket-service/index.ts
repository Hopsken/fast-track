/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */
import { defineProxyService } from '@webext-core/proxy-service'
import { UserDetails } from 'jira.js/version3/models/userDetails'
import { uniqBy } from 'lodash-es'

import { sendMessage } from '@/lib/message'
import { getStorageItem } from '@/lib/storage'
import { Database } from '@/repository'
import { JiraPriority, JiraTicket, JiraTransition } from '@/types'
import {
  mapPriority,
  mapUserToAssignee,
  mergeTicketsByKey
} from '@/utils/jira/issues'
import { concatPromises } from '@/utils/promise'
import { getJiraApi, JiraAPI } from '~/lib/jira'

import {
  SuggestionRefreshOptions,
  SuggestionRefreshReason,
  TicketSuggestionService,
  TicketSuggestionsAPI
} from './ticket-suggestion-service'

/**
 * Ticket service implementation
 */
class TicketServiceImpl {
  private database: Database
  readonly suggestions: TicketSuggestionsAPI

  private lastSyncStorage = getStorageItem('LastSyncAt')

  constructor(database: Database) {
    this.database = database
    this.suggestions = new TicketSuggestionService(this, database)
  }

  private async getJira(): Promise<JiraAPI | null> {
    try {
      return await getJiraApi()
    } catch (error) {
      console.error('TicketService: failed to initialize Jira client', error)
      return null
    }
  }

  async refreshSuggestions(
    reason: SuggestionRefreshReason,
    options?: SuggestionRefreshOptions
  ) {
    console.log('TicketService: refreshSuggestions', reason, options)
    return this.suggestions.refresh(reason, options)
  }

  /**
   * Loads suggestions related to the current user
   */
  async loadSuggestions(force = false): Promise<JiraTicket[]> {
    return this.withJira(async (jira) => {
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

      const uniqTickets = mergeTicketsByKey(results)

      await this.database.collections.issues.bulkUpsert(uniqTickets)

      this.lastSyncStorage.setValue(Date.now().toString())
      return uniqTickets
    })
  }

  async searchTickets(query: string): Promise<JiraTicket[]> {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      return []
    }

    return this.withJira(async (jira) => {
      const results = await jira.issues.searchIssuesByText(normalizedQuery)
      // skip cache search tickets for now since it contains a lot of noise tickets
      // await this.database.collections.issues.bulkUpsert(uniqTickets)
      // TODO: add user select tickets to cache
      return uniqBy(results, 'key')
    })
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

  private notifyTicketsUpdated(reason: string) {
    sendMessage('ticketsUpdated', {
      reason,
      fetchedAt: Date.now()
    })
  }

  private async updateTicketOptimistically(
    ticketKey: string,
    options: {
      reason: string
      buildOptimistic: (base: JiraTicket) => JiraTicket
      perform: (jira: JiraAPI) => Promise<JiraTicket | null>
    }
  ): Promise<JiraTicket | null> {
    const jira = await this.getJira()
    if (!jira) {
      throw new Error(
        'TicketService: updateTicketOptimistically skipped, not configured'
      )
    }

    const { issues } = this.database.collections
    const existing = await issues
      .findOne({
        selector: {
          key: ticketKey
        }
      })
      .exec()

    const baseTicket = existing?.toMutableJSON()

    if (baseTicket) {
      const optimisticTicket = options.buildOptimistic(baseTicket)
      await issues.upsert(optimisticTicket)
    }

    try {
      const refreshed = await options.perform(jira)
      if (refreshed) {
        await issues.upsert(refreshed)
        this.notifyTicketsUpdated(options.reason)
      }
      return refreshed
    } catch (error) {
      if (baseTicket) {
        await issues.upsert(baseTicket)
      }
      throw error
    }
  }

  async assignTicket(ticketKey: string, assignee: UserDetails | null) {
    console.log('assignTicket', ticketKey, assignee)
    return this.updateTicketOptimistically(ticketKey, {
      reason: 'assign',
      buildOptimistic: (base) => ({
        ...base,
        assignee: assignee ? mapUserToAssignee(assignee) : null
      }),
      perform: async (jira) => {
        console.log('assignTicket', ticketKey, assignee?.accountId ?? null)
        await jira.issues.assignIssue(ticketKey, assignee?.accountId ?? null)
        return jira.issues.getIssue(ticketKey)
      }
    })
  }

  async transitionTicket(ticket: JiraTicket, transition: JiraTransition) {
    return this.updateTicketOptimistically(ticket.key, {
      reason: 'transition',
      buildOptimistic: (base) => ({
        ...base,
        status: transition.to
      }),
      perform: async (jira) => {
        const refreshed = await jira.issues.transitionIssue(
          ticket.key,
          transition.id
        )
        return refreshed
      }
    })
  }

  async updateTicketPriority(ticket: JiraTicket, priority: JiraPriority) {
    const normalizedPriority = mapPriority(priority)
    const { id: priorityId } = normalizedPriority
    if (!priorityId) {
      throw new Error('updateTicketPriority: priority id is required')
    }

    return this.updateTicketOptimistically(ticket.key, {
      reason: 'priority',
      buildOptimistic: (base) => ({
        ...base,
        priority: normalizedPriority
      }),
      perform: async (jira) => {
        const refreshed = await jira.issues.updateIssuePriority(
          ticket.key,
          priorityId
        )
        return refreshed
      }
    })
  }

  public async withJira<T>(action: (jira: JiraAPI) => Promise<T>) {
    const jira = await this.getJira()
    if (!jira) {
      throw new Error(`TicketService: withJira skipped, not configured`)
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
  [Database]
>('TicketService', (database: Database) => new TicketServiceImpl(database))
