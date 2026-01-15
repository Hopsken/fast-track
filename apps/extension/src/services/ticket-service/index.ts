/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */

import { defineProxyService } from '@webext-core/proxy-service'
import { UserDetails } from 'jira.js/version3/models/userDetails'
import { difference, keyBy, uniqBy } from 'lodash-es'

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

  private async getJira(): Promise<JiraAPI> {
    const jira = await getJiraApi()
    if (!jira) {
      throw new Error('Jira client not configured')
    }
    return jira
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

  async getTicketDetails(ticketKey: string): Promise<IssueDetail> {
    return this.withJira((jira) => jira.issues.getIssueDetail(ticketKey))
  }

  async getIssueMergeRequests(issueKey: string): Promise<JiraMergeRequest[]> {
    return this.withJira(async (jira) => {
      return jira.issues.getIssueMergeRequests(issueKey)
    })
  }

  async isConfigured(): Promise<boolean> {
    try {
      await this.getJira()
      return true
    } catch {
      return false
    }
  }

  async assignTicket(
    ticketKey: string,
    assignee: UserDetails | null
  ): Promise<JiraTicket> {
    return this.withJira(async (jira) => {
      this.log.info('assignTicket', ticketKey, assignee?.accountId ?? null)
      await jira.issues.assignIssue(ticketKey, assignee?.accountId ?? null)
      return jira.issues.getIssue(ticketKey)
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
  ): Promise<JiraTicket> {
    return this.withJira(async (jira) => {
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
          await jira.issues.assignIssue(ticket.key, assignee.accountId ?? null)
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
    })
  }

  async updateTicketPriority(
    ticket: JiraTicket,
    priority: JiraPriority
  ): Promise<JiraTicket> {
    const normalizedPriority = mapPriority(priority)
    const { id: priorityId } = normalizedPriority
    if (!priorityId) {
      throw new Error('updateTicketPriority: priority id is required')
    }

    return this.withJira((jira) =>
      jira.issues.updateIssuePriority(ticket.key, priorityId)
    )
  }

  private async withJira<T>(action: (jira: JiraAPI) => Promise<T>): Promise<T> {
    const jira = await this.getJira()
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
