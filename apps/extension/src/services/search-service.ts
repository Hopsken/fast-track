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
import { Database } from '@/repository'
import { JiraTicket } from '@/types'
import { rankTickets } from '~/utils/ticket-ranking'

import { TicketService } from './ticket-service'

export interface SearchService {
  initialize(): Promise<void>
  onSearchInput(query: string): Promise<void>
}

class SearchServiceImpl implements SearchService {
  private search$ = new BehaviorSubject<string>('')
  private ready$ = new BehaviorSubject<boolean>(false)

  constructor(
    private database: Database,
    private ticketService: TicketService
  ) {
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
    const rankedCached = rankTickets(cachedTickets, normalizedQuery)

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
      return issues
        .find()
        .sort({ isInProgress: 'desc', updated: 'desc' })
        .limit(30)
        .exec()
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
      .limit(30)
      .exec()
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
