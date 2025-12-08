import { getStorageItem } from '@/lib/storage'
import { Database } from '@/repository'
import { JiraTicket } from '@/types'
import { mergeTicketsByKey } from '@/utils/jira/issues'
import { concatPromises } from '@/utils/promise'
import { sendMessage } from '~/lib/message'

import type { TicketService } from './'

export type SuggestionRefreshReason = 'auth' | 'alarm' | 'manual' | 'startup'

export type SuggestionRefreshOptions = {
  force?: boolean
}

export type TicketSuggestionsAPI = {
  refresh(
    reason: SuggestionRefreshReason,
    options?: SuggestionRefreshOptions
  ): Promise<void>
  getLastRefreshMeta(): Promise<{
    at: string
    reason: SuggestionRefreshReason
  } | null>
}

export class TicketSuggestionService implements TicketSuggestionsAPI {
  private isRefreshing = false
  private lastSyncStorage = getStorageItem('LastSyncAt')

  constructor(
    private ticketService: TicketService,
    private database: Database
  ) {}

  public refresh = async (
    reason: SuggestionRefreshReason,
    options: SuggestionRefreshOptions = {}
  ) => {
    const { force = false } = options

    const shouldSync = await this.shouldSync(force)
    if (!shouldSync || this.isRefreshing) {
      return
    }

    this.isRefreshing = true

    try {
      await this.loadSuggestions()

      const lastRefreshAt = new Date().toISOString()
      await this.lastSyncStorage.setValue({
        at: lastRefreshAt.toString(),
        reason
      })

      sendMessage('ticketsUpdated', {
        reason,
        fetchedAt: lastRefreshAt
      })
    } catch (error) {
      console.error('TicketSuggestionService: refresh failed', error)
    } finally {
      this.isRefreshing = false
    }
  }

  /**
   * Loads suggestions related to the current user
   */
  private async loadSuggestions(): Promise<JiraTicket[]> {
    return this.ticketService.withJira(async (jira) => {
      const results = await concatPromises([
        jira.issues.getMyUnresolvedIssues(10),
        jira.issues.getRecentHistoryIssues(20),
        jira.issues.getMyRecentDoneIssues(10),
        jira.issues.getMyWatchingIssues(10),
        jira.issues.getMyActiveSprintTodoIssues(20)
      ])

      const uniqTickets = mergeTicketsByKey(results)

      await this.database.collections.issues.bulkUpsert(uniqTickets)

      return uniqTickets
    })
  }

  private async shouldSync(force = false) {
    if (force) return true

    const lastSyncAt = await this.lastSyncStorage.getValue()
    if (!lastSyncAt || force) {
      return true
    }

    const lastSyncDate = new Date(lastSyncAt.at)
    const now = new Date()
    const diff = now.getTime() - lastSyncDate.getTime()
    return diff > 1000 * 60 // 1 min
  }

  public async getLastRefreshMeta() {
    const lastSyncAt = await this.lastSyncStorage.getValue()
    if (!lastSyncAt) return null
    return {
      at: lastSyncAt.at,
      reason: lastSyncAt.reason as SuggestionRefreshReason
    }
  }
}
