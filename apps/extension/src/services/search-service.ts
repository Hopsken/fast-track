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

class SearchServiceImpl {
  private search$ = new BehaviorSubject<string>('')
  private ready$ = new BehaviorSubject<boolean>(false)

  constructor(private database: Database) {
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
    const tickets = await this.searchStoredTickets(query)

    sendMessage('onSearchResult', {
      search: query,
      tickets
    })

    // perform api search and emit again
  }

  private async searchStoredTickets(query: string) {
    if (!query) return this.database.issues.find().limit(10).exec()
    return this.database.issues.find().where('summary').regex(query).exec()
  }
}

export const [registerSearchService, getSearchService] = defineProxyService(
  'SearchService',
  (database: Database) => new SearchServiceImpl(database)
)

export type SearchService = InstanceType<typeof SearchServiceImpl>
