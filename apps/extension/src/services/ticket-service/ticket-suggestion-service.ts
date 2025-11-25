import { Database } from '@/repository'
import { JiraTicket } from '@/types'
import { sendMessage } from '~/lib/message'

import type { TicketService } from './interface'

export type SuggestionRefreshReason = 'auth' | 'alarm' | 'manual' | 'startup'

export type SuggestionRefreshOptions = {
  force?: boolean
}

export type TicketSuggestionsAPI = {
  refresh(
    reason: SuggestionRefreshReason,
    options?: SuggestionRefreshOptions
  ): Promise<JiraTicket[]>
  onAuthSuccess(): Promise<JiraTicket[]>
  getCached(limit?: number): Promise<JiraTicket[]>
  getLastRefreshMeta(): {
    at: number | null
    reason: SuggestionRefreshReason | null
  }
}

export class TicketSuggestionService implements TicketSuggestionsAPI {
  private isRefreshing = false
  private lastRefreshAt: number | null = null
  private lastReason: SuggestionRefreshReason | null = null

  constructor(
    private ticketService: TicketService,
    private database: Database
  ) {}

  private async isConfigured() {
    return this.ticketService.isConfigured()
  }

  refresh = async (
    reason: SuggestionRefreshReason,
    options: SuggestionRefreshOptions = {}
  ) => {
    const { force = false } = options

    if (this.isRefreshing) {
      console.info(
        `TicketSuggestionService: Skip ${reason} refresh, another run is active`
      )
      return this.getCached()
    }

    const configured = await this.ticketService.isConfigured()
    if (!configured) {
      console.info(
        `TicketSuggestionService: Skip ${reason} refresh, Jira not configured`
      )
      return this.getCached()
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

      return this.getCached()
    } catch (error) {
      console.error('TicketSuggestionService: refresh failed', error)
      return this.getCached()
    } finally {
      this.isRefreshing = false
    }
  }

  onAuthSuccess() {
    return this.refresh('auth', { force: true })
  }

  getCached(limit = 30) {
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
