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
import { Database } from '@/repository'
import { JiraPriority, JiraTicket, JiraTransition } from '@/types'
import { getCurrentUser } from '@/utils/currentUser'
import { mapPriority, mapUserToAssignee } from '@/utils/jira/issues'
import { nextTick } from '@/utils/nextTick'
import { getJiraApi, JiraAPI } from '~/lib/jira'

import {
  SuggestionRefreshOptions,
  SuggestionRefreshReason,
  TicketSuggestionService,
  TicketSuggestionsAPI
} from './ticket-suggestion-service'

export type IssueSuggestion = {
  inProgress: JiraTicket[]
  activeSprintTodo: JiraTicket[]
  viewHistory: JiraTicket[]
}

/**
 * Ticket service implementation
 */
class TicketServiceImpl {
  private database: Database
  readonly suggestions: TicketSuggestionsAPI

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

  async getIssueSuggestions(): Promise<IssueSuggestion> {
    const [inProgress, activeSprintTodo, viewHistory] = await Promise.all([
      this.getMyInProgressTickets(),
      this.getMyActiveSprintTodoTickets(),
      this.getRecentHistoryTickets()
    ])

    return {
      inProgress,
      activeSprintTodo,
      viewHistory
    }
  }

  private async getMyInProgressTickets(limit = 20): Promise<JiraTicket[]> {
    return this.withJira(async (jira) => {
      const user = await getCurrentUser()
      if (!user.email) {
        return []
      }
      const cachedTickets = await this.database.issues.findInProgress(
        user.email
      )

      nextTick(async () => {
        const tickets = await jira.issues.getMyUnresolvedIssues(limit)
        await this.database.collections.issues.bulkUpsert(tickets)
        sendMessage('onIssueSuggestionsUpdated', { inProgress: tickets })
      })

      return cachedTickets
    })
  }

  private async getMyActiveSprintTodoTickets(
    limit = 20
  ): Promise<JiraTicket[]> {
    return this.withJira(async (jira) => {
      const user = await getCurrentUser()
      const email = user.email?.trim()
      if (!email) {
        return []
      }

      const cachedTickets = await this.database.issues.findInOpenSprints(email)

      nextTick(async () => {
        const tickets = await jira.issues.getMyActiveSprintTodoIssues(limit)
        await this.database.collections.issues.bulkUpsert(tickets)
        sendMessage('onIssueSuggestionsUpdated', {
          activeSprintTodo: tickets
        })
      })

      return cachedTickets
    })
  }

  private async getRecentHistoryTickets(limit = 20): Promise<JiraTicket[]> {
    return this.withJira(async (jira) => {
      const user = await getCurrentUser()
      const email = user.email?.trim()
      if (!email) {
        return []
      }

      const cachedTickets = await this.database.issues.findRecentlyViewed()

      nextTick(async () => {
        const tickets = await jira.issues.getRecentHistoryIssues(limit)
        await this.database.collections.issues.bulkUpsert(tickets)
        sendMessage('onIssueSuggestionsUpdated', {
          viewHistory: tickets
        })
      })

      return cachedTickets
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

  async isConfigured() {
    console.info('TicketService: isConfigured checked')
    return (await this.getJira()) != null
  }

  private notifyTicketsUpdated(reason: string, tickets?: JiraTicket[]) {
    sendMessage('ticketsUpdated', {
      reason,
      tickets,
      fetchedAt: new Date().toISOString()
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
