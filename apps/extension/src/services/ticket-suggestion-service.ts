import { defineProxyService } from '@webext-core/proxy-service'

import { Database } from '@/repository'
import { JiraTicket } from '@/types'
import { sendMessage } from '~/lib/message'

import { TicketService } from './ticket-service'

export type SuggestionRefreshReason = 'auth' | 'alarm' | 'manual' | 'startup'

type RefreshOptions = {
  force?: boolean
}

export interface TicketSuggestionServiceAPI {
  refreshSuggestions(
    reason: SuggestionRefreshReason,
    options?: RefreshOptions
  ): Promise<JiraTicket[]>
  handleAuthSuccess(): Promise<JiraTicket[]>
  getCachedSuggestions(limit?: number): Promise<JiraTicket[]>
  getLastRefreshMeta(): {
    at: number | null
    reason: SuggestionRefreshReason | null
  }
  isConfigured(): Promise<boolean>
}

export class TicketSuggestionService implements TicketSuggestionServiceAPI {
  private isRefreshing = false
  private lastRefreshAt: number | null = null
  private lastReason: SuggestionRefreshReason | null = null

  constructor(
    private ticketService: TicketService,
    private database: Database
  ) {}

  async isConfigured() {
    return this.ticketService.isConfigured()
  }

  async refreshSuggestions(
    reason: SuggestionRefreshReason,
    options: RefreshOptions = {}
  ): Promise<JiraTicket[]> {
    const { force = false } = options

    if (this.isRefreshing) {
      console.info(
        `TicketSuggestionService: Skip ${reason} refresh, another run is active`
      )
      return this.getCachedSuggestions()
    }

    const configured = await this.ticketService.isConfigured()
    if (!configured) {
      console.info(
        `TicketSuggestionService: Skip ${reason} refresh, Jira not configured`
      )
      return this.getCachedSuggestions()
    }

    this.isRefreshing = true

    try {
      await this.ticketService.loadSuggestions(force)
      this.lastRefreshAt = Date.now()
      this.lastReason = reason

      sendMessage('ticketsUpdated', {
        reason,
        fetchedAt: this.lastRefreshAt
      })

      return this.getCachedSuggestions()
    } catch (error) {
      console.error('TicketSuggestionService: refresh failed', error)
      return this.getCachedSuggestions()
    } finally {
      this.isRefreshing = false
    }
  }

  async handleAuthSuccess(): Promise<JiraTicket[]> {
    return this.refreshSuggestions('auth', { force: true })
  }

  async getCachedSuggestions(limit = 30): Promise<JiraTicket[]> {
    const { issues } = this.database.collections
    return issues
      .find()
      .sort({ isInProgress: 'desc', updated: 'desc' })
      .limit(limit)
      .exec()
  }

  getLastRefreshMeta() {
    return {
      at: this.lastRefreshAt,
      reason: this.lastReason
    }
  }
}

export const [registerTicketSuggestionService, getTicketSuggestionService] =
  defineProxyService<TicketSuggestionServiceAPI, [TicketService, Database]>(
    'TicketSuggestionService',
    (ticketService: TicketService, database: Database) =>
      new TicketSuggestionService(ticketService, database)
  )
