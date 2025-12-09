import { defineProxyService } from '@webext-core/proxy-service'
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
import { getLogger } from '~/utils/logger'
import { rankTickets } from '~/utils/ticket-ranking'

import { getTicketService } from './ticket-service'

const DEFAULT_RESULT_LIMIT = 10

export interface SearchService {
  initialize(): Promise<void>
  onSearchInput(query: string): Promise<void>
}

class SearchServiceImpl implements SearchService {
  private search$ = new BehaviorSubject<string>('')
  private ready$ = new BehaviorSubject<boolean>(false)
  private currentUserEmail: string | null = null
  private log = getLogger('search-service')

  constructor(private database: Database) {
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
      const ticketService = getTicketService()
      const remoteTickets = await ticketService.searchTickets(normalizedQuery)
      if (this.search$.getValue() !== query) {
        return
      }

      const combinedTickets = rankTickets(
        [...cachedTickets, ...remoteTickets],
        normalizedQuery
      )

      this.emitResults(query, combinedTickets)
    } catch (error) {
      this.log.error('SearchService: remote search failed', error)
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
    if (!query) {
      return []
    }

    return this.database.issues.fuzzySearch(query, {
      limit: DEFAULT_RESULT_LIMIT
    })
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
  [Database]
>('SearchService', (database: Database) => new SearchServiceImpl(database))
