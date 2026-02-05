/**
 * Ticket Service using @webext-core/proxy-service
 *
 * This service provides type-safe, cross-context access to ticket operations.
 * Functions are called from content scripts but executed in the background.
 */

import { defineProxyService } from '@webext-core/proxy-service'
import { UserDetails } from 'jira.js/version3/models/userDetails'
import { difference, keyBy, uniqBy } from 'lodash-es'

import { bucketSuggestionTickets } from '@/lib/tickets/issue-suggestions'
import { JiraPriority, JiraTicket, JiraTransition } from '@/types'
import { mapPriority } from '@/utils/jira/issues'
import { JiraAPI } from '~/lib/jira'
import { getLogger } from '~/utils/logger'

import { isValidCreateMetaFields, parseCreateMetaFields } from './create-meta'

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
  private jira = JiraAPI.getInstance()

  async getIssueSuggestions(): Promise<IssueSuggestion> {
    const [tickets, historyTickets] = await Promise.all([
      this.getMySuggestedTickets(),
      this.getRecentHistoryTickets()
    ])

    const { inProgress, todo, done } = bucketSuggestionTickets(tickets)
    const recommend = difference(
      historyTickets.map((ticket) => ticket.key),
      tickets.map((ticket) => ticket.key)
    )

    return {
      tickets: keyBy(uniqBy([...tickets, ...historyTickets], 'key'), 'key'),
      inProgress,
      todo,
      done,
      recommend
    }
  }

  private async getMySuggestedTickets(limit = 50): Promise<JiraTicket[]> {
    return this.jira.issues.getMySuggestedIssues(limit)
  }

  private async getRecentHistoryTickets(limit = 7): Promise<JiraTicket[]> {
    return this.jira.issues.getRecentHistoryIssues(limit)
  }

  async searchTickets(
    query: string,
    options?: { projectKeys?: string[]; limit?: number }
  ): Promise<JiraTicket[]> {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      return []
    }

    const results = await this.jira.issues.searchIssuesByText(
      normalizedQuery,
      options
    )
    return uniqBy(results, 'key')
  }

  async getCreateIssueFields(input: {
    projectIdOrKey: string
    issueTypeId: string
  }) {
    const page = await this.jira.issues.getCreateIssueMetaFields(input)
    const fields = parseCreateMetaFields(page)
    if (!isValidCreateMetaFields(fields)) return []
    return fields
  }

  async assignTicket(
    ticketKey: string,
    assignee: UserDetails | null
  ): Promise<JiraTicket> {
    this.log.info('assignTicket', ticketKey, assignee?.accountId ?? null)
    await this.jira.issues.assignIssue(ticketKey, assignee?.accountId ?? null)
    return this.jira.issues.getIssue(ticketKey)
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
    let refreshed = await this.jira.issues.transitionIssue(
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
        await this.jira.issues.assignIssue(
          ticket.key,
          assignee.accountId ?? null
        )
        // Fetch updated ticket with new assignee
        refreshed = await this.jira.issues.getIssue(ticket.key)
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

  async updateTicketPriority(
    ticketKey: string,
    priority: JiraPriority
  ): Promise<JiraTicket> {
    const normalizedPriority = mapPriority(priority)
    const { id: priorityId } = normalizedPriority
    if (!priorityId) {
      throw new Error('updateTicketPriority: priority id is required')
    }

    return this.jira.issues.updateIssuePriority(ticketKey, priorityId)
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
