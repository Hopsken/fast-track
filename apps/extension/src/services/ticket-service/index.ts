/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */

import { defineProxyService } from '@webext-core/proxy-service'
import { UserDetails } from 'jira.js/version3/models/userDetails'
import { difference, keyBy, uniqBy } from 'lodash-es'

import { sendMessage } from '@/lib/message'
import {
  buildHistoryRecommendKeys,
  bucketSuggestionTickets,
  filterSuggestionTickets
} from '@/lib/tickets/issue-suggestions'
import {
  IssueDetail,
  JiraMergeRequest,
  JiraPriority,
  JiraTicket,
  JiraTransition
} from '@/types'
import { mapPriority } from '@/utils/jira/issues'
import { getJiraApi, JiraAPI } from '~/lib/jira'
import { getLogger } from '~/utils/logger'

export type IssueSuggestion = {
  tickets: Record<string, JiraTicket>
  inProgress: string[]
  todo: string[]
  done: string[]
  recommend: string[]
}

/**
 * Ticket service implementation
 */
class TicketServiceImpl {
  private log = getLogger('ticket-service')

  private async getJira(): Promise<JiraAPI | null> {
    try {
      return await getJiraApi()
    } catch (error) {
      this.log.error('TicketService: failed to initialize Jira client', error)
      return null
    }
  }

  async getIssueSuggestions(): Promise<IssueSuggestion> {
    const [tickets, historyTickets] = await Promise.all([
      this.getMySuggestedTickets(),
      this.getRecentHistoryTickets()
    ])
    const filteredTickets = filterSuggestionTickets(tickets)
    const { inProgress, todo, done } = bucketSuggestionTickets(filteredTickets)
    const uniqueTodo = difference(todo, inProgress)
    const uniqueDone = difference(done, inProgress, uniqueTodo)
    const recommend = buildHistoryRecommendKeys(historyTickets, [
      ...inProgress,
      ...uniqueTodo,
      ...uniqueDone
    ])

    return {
      tickets: keyBy(
        uniqBy([...filteredTickets, ...historyTickets], 'key'),
        'key'
      ),
      inProgress,
      todo: uniqueTodo,
      done: uniqueDone,
      recommend
    }
  }

  private async getMySuggestedTickets(limit = 50): Promise<JiraTicket[]> {
    return this.withJira(async (jira) => {
      return jira.issues.getMySuggestedIssues(limit)
    })
  }

  private async getRecentHistoryTickets(limit = 7): Promise<JiraTicket[]> {
    return this.withJira(async (jira) => {
      return jira.issues.getRecentHistoryIssues(limit)
    })
  }

  async searchTickets(
    query: string,
    options?: { projectKeys?: string[]; limit?: number }
  ): Promise<JiraTicket[]> {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      return []
    }

    return this.withJira(async (jira) => {
      const results = await jira.issues.searchIssuesByText(
        normalizedQuery,
        options
      )
      return uniqBy(results, 'key')
    })
  }

  async getTicketDetails(ticketKey: string): Promise<IssueDetail | null> {
    return this.withJira(async (jira) => {
      return jira.issues.getIssueDetail(ticketKey)
    })
  }

  async getIssueMergeRequests(issueKey: string): Promise<JiraMergeRequest[]> {
    return this.withJira(async (jira) => {
      return jira.issues.getIssueMergeRequests(issueKey)
    })
  }

  async isConfigured() {
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
      perform: (jira: JiraAPI) => Promise<JiraTicket | null>
    }
  ): Promise<JiraTicket | null> {
    const jira = await this.getJira()
    if (!jira) {
      throw new Error(
        'TicketService: updateTicketOptimistically skipped, not configured'
      )
    }

    const refreshed = await options.perform(jira)
    if (refreshed) {
      this.notifyTicketsUpdated(options.reason)
    }
    return refreshed
  }

  async assignTicket(ticketKey: string, assignee: UserDetails | null) {
    return this.updateTicketOptimistically(ticketKey, {
      reason: 'assign',
      perform: async (jira) => {
        this.log.info('assignTicket', ticketKey, assignee?.accountId ?? null)
        await jira.issues.assignIssue(ticketKey, assignee?.accountId ?? null)
        return jira.issues.getIssue(ticketKey)
      }
    })
  }

  async transitionTicket(
    ticket: JiraTicket,
    transition: JiraTransition,
    options?: {
      autoAssign?: {
        assignee: UserDetails
      }
    }
  ) {
    return this.updateTicketOptimistically(ticket.key, {
      reason: 'transition',
      perform: async (jira) => {
        let refreshed = await jira.issues.transitionIssue(
          ticket.key,
          transition.id
        )

        // Auto-assign if requested
        if (options?.autoAssign) {
          try {
            const { assignee } = options.autoAssign
            this.log.info(
              'transitionTicket: auto-assigning',
              ticket.key,
              assignee.accountId
            )
            await jira.issues.assignIssue(
              ticket.key,
              assignee.accountId ?? null
            )
            // Fetch updated ticket with new assignee
            refreshed = await jira.issues.getIssue(ticket.key)
          } catch (error) {
            this.log.error(
              'transitionTicket: auto-assign failed',
              ticket.key,
              error
            )
            // Don't throw - transition succeeded, just log the assign failure
          }
        }

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
  []
>('TicketService', () => new TicketServiceImpl())
