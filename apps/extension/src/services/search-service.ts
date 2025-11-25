import { defineProxyService } from '@webext-core/proxy-service'
import { escapeRegExp } from 'lodash-es'
import {
  BehaviorSubject,
  combineLatest,
  debounceTime,
  map,
  skipUntil,
  switchMap
} from 'rxjs'

import { sendMessage } from '@/lib/message'
import { fromStorage$ } from '@/lib/storage'
import { Database } from '@/repository'
import { JiraTicket } from '@/types'
import { rankTickets } from '~/utils/ticket-ranking'

import { TicketService } from './ticket-service'

const DEFAULT_RESULT_LIMIT = 30

export interface SearchService {
  initialize(): Promise<void>
  onSearchInput(query: string): Promise<void>
}

class SearchServiceImpl implements SearchService {
  private search$ = new BehaviorSubject<string>('')
  private ready$ = new BehaviorSubject<boolean>(false)
  private currentUserEmail: string | null = null

  constructor(
    private database: Database,
    private ticketService: TicketService
  ) {
    this.setupUserWatcher()
    this.setupSearchListener()
  }

  async initialize() {
    this.ready$.next(true)
    // trigger initial search
    this.handleSearch('')
  }

  async onSearchInput(query: string) {
    this.search$.next(query)
  }

  private async setupSearchListener() {
    combineLatest([this.search$, this.ready$])
      .pipe(
        skipUntil(this.ready$),
        map(([query]) => query),
        debounceTime(200),
        switchMap((query) => this.handleSearch(query))
      )
      .subscribe()
  }

  private async handleSearch(query: string) {
    const normalizedQuery = query.trim()
    const cachedTickets = await this.searchStoredTickets(normalizedQuery)
    const rankedCached = normalizedQuery
      ? rankTickets(cachedTickets, normalizedQuery)
      : cachedTickets

    this.emitResults(query, rankedCached)

    if (!normalizedQuery) return

    try {
      const remoteTickets =
        await this.ticketService.searchTickets(normalizedQuery)
      if (this.search$.getValue() !== query) {
        return
      }

      const combinedTickets = rankTickets(
        [...cachedTickets, ...remoteTickets],
        normalizedQuery
      )

      this.emitResults(query, combinedTickets)
    } catch (error) {
      console.error('SearchService: remote search failed', error)
      this.emitResults(query, rankedCached, 'Search failed. Please reconnect.')
    }
  }

  private emitResults(search: string, tickets: JiraTicket[], error?: string) {
    sendMessage('onSearchResult', {
      search,
      tickets,
      error
    })
  }

  private async searchStoredTickets(query: string) {
    const { issues } = this.database.collections

    if (!query) {
      return this.getRecommendations()
    }

    const escaped = escapeRegExp(query)
    const regexSelector = { $regex: escaped, $options: 'i' }

    return issues
      .find({
        selector: {
          $or: [
            { summary: regexSelector },
            { key: regexSelector },
            { 'status.name': regexSelector },
            { 'issueType.name': regexSelector },
            { 'assignee.displayName': regexSelector },
            { 'priority.name': regexSelector }
          ]
        }
      })
      .limit(DEFAULT_RESULT_LIMIT)
      .exec()
  }

  private async getRecommendations() {
    const { issues } = this.database.collections
    const email = this.currentUserEmail

    if (!email) {
      return []
    }

    const assignedTickets = await issues
      .find({
        selector: {
          'assignee.emailAddress': email
        }
      })
      .sort({ isInProgress: 'desc', updated: 'desc' })
      .limit(DEFAULT_RESULT_LIMIT)
      .exec()

    const remainingLimit = DEFAULT_RESULT_LIMIT - assignedTickets.length
    if (remainingLimit <= 0) return assignedTickets

    const otherTickets = await issues
      .find({
        selector: {
          'assignee.emailAddress': {
            $ne: email
          }
        }
      })
      .sort({ isInProgress: 'desc', updated: 'desc' })
      .limit(remainingLimit)
      .exec()

    return [...assignedTickets, ...otherTickets]
  }

  private setupUserWatcher() {
    fromStorage$('OAuthUserInfo').subscribe((userInfo) => {
      this.currentUserEmail = userInfo?.email
        ? userInfo.email.trim().toLowerCase()
        : null
    })
  }
}

export const [registerSearchService, getSearchService] = defineProxyService<
  SearchService,
  [Database, TicketService]
>(
  'SearchService',
  (database: Database, ticketService: TicketService) =>
    new SearchServiceImpl(database, ticketService)
)
