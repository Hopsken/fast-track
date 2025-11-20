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
import { Database } from '@/repository'
import { JiraTicket } from '@/types'

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
    const cachedTickets = await this.searchStoredTickets(query)

    this.emitResults(query, cachedTickets)

    if (!query.trim()) return

    try {
      const remoteTickets = await this.ticketService.searchTickets(query)
      if (this.search$.getValue() !== query) {
        return
      }

      this.emitResults(query, remoteTickets)
    } catch (error) {
      console.error('SearchService: remote search failed', error)
    }
  }

  private emitResults(search: string, tickets: JiraTicket[]) {
    sendMessage('onSearchResult', {
      search,
      tickets
    })
  }

  private async searchStoredTickets(query: string) {
    const { issues } = this.database.collections

    if (!query) return issues.find().limit(10).exec()
    return issues.find().where('summary').regex(query).exec()
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
