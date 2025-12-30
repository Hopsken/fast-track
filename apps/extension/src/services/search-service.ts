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
import { JiraTicket } from '@/types'
import { getLogger } from '~/utils/logger'
import { rankTickets } from '~/utils/ticket-ranking'

import { getTicketService } from './ticket-service'

export interface SearchService {
  initialize(): Promise<void>
  onSearchInput(query: string): Promise<void>
}

class SearchServiceImpl implements SearchService {
  private search$ = new BehaviorSubject<string>('')
  private ready$ = new BehaviorSubject<boolean>(false)
  private log = getLogger('search-service')

  constructor() {
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
    if (!normalizedQuery) {
      this.emitResults(query, [])
      return
    }

    try {
      const ticketService = getTicketService()
      const remoteTickets = await ticketService.searchTickets(normalizedQuery)
      if (this.search$.getValue() !== query) {
        return
      }

      this.emitResults(query, rankTickets(remoteTickets, normalizedQuery))
    } catch (error) {
      this.log.error('SearchService: remote search failed', error)
      this.emitResults(query, [], 'Search failed. Please reconnect.')
    }
  }

  private emitResults(search: string, tickets: JiraTicket[], error?: string) {
    sendMessage('onSearchResult', {
      search,
      tickets,
      error
    })
  }
}

export const [registerSearchService, getSearchService] = defineProxyService<
  SearchService,
  []
>('SearchService', () => new SearchServiceImpl())
