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
import { JiraPriority, JiraTicket, JiraTransition } from '@/types'
import { mapPriority } from '@/utils/jira/issues'
import { getJiraApi, JiraAPI } from '~/lib/jira'
import { getLogger } from '~/utils/logger'

export type IssueSuggestion = {
  inProgress: JiraTicket[]
  activeSprintTodo: JiraTicket[]
  viewHistory: JiraTicket[]
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
      return jira.issues.getMyUnresolvedIssues(limit)
    })
  }

  private async getMyActiveSprintTodoTickets(
    limit = 20
  ): Promise<JiraTicket[]> {
    return this.withJira(async (jira) => {
      return jira.issues.getMyActiveSprintTodoIssues(limit)
    })
  }

  private async getRecentHistoryTickets(limit = 20): Promise<JiraTicket[]> {
    return this.withJira(async (jira) => {
      return jira.issues.getRecentHistoryIssues(limit)
    })
  }

  async searchTickets(
    query: string,
    options?: {
      limit?: number
      projectKeys?: string[]
    }
  ): Promise<JiraTicket[]> {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      return []
    }

    return this.withJira(async (jira) => {
      const results = await jira.issues.searchIssuesByText(normalizedQuery, {
        maxResults: options?.limit,
        projectKeys: options?.projectKeys
      })
      return uniqBy(results, 'key')
    })
  }

  async getFrequentProjectKeys(limit = 3): Promise<string[]> {
    const historyTickets = await this.getRecentHistoryTickets(50)
    if (!historyTickets.length) {
      return []
    }

    const projectCounts = historyTickets.reduce((acc, ticket) => {
      if (!ticket.projectKey) {
        return acc
      }

      acc.set(ticket.projectKey, (acc.get(ticket.projectKey) ?? 0) + 1)
      return acc
    }, new Map<string, number>())

    return Array.from(projectCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([projectKey]) => projectKey)
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

  async transitionTicket(ticket: JiraTicket, transition: JiraTransition) {
    return this.updateTicketOptimistically(ticket.key, {
      reason: 'transition',
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
