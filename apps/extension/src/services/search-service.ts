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
import type { SearchScope } from '@/stores/slices/createSearchSlice'
import type { JiraTicket } from '@/types'
import { getLogger } from '~/utils/logger'
import { rankTickets } from '~/utils/ticket-ranking'
import { minutes } from '~/utils/time'

import { getTicketService } from './ticket-service'

type SearchInput = {
  query: string
  scope: SearchScope
}

export interface SearchService {
  initialize(): Promise<void>
  onSearchInput(input: SearchInput): Promise<void>
}

class SearchServiceImpl implements SearchService {
  private search$ = new BehaviorSubject<SearchInput>({
    query: '',
    scope: 'frequent'
  })
  private ready$ = new BehaviorSubject<boolean>(false)
  private log = getLogger('search-service')
  private frequentProjectsCache: {
    projectKeys: string[]
    fetchedAt: number
  } | null = null

  constructor() {
    this.setupSearchListener()
  }

  async initialize() {
    this.ready$.next(true)
    // trigger initial search
    this.handleSearch({ query: '', scope: 'frequent' })
  }

  async onSearchInput(input: SearchInput) {
    this.search$.next({
      query: input.query.trim(),
      scope: input.scope
    })
  }

  private async setupSearchListener() {
    combineLatest([this.search$, this.ready$])
      .pipe(
        skipUntil(this.ready$),
        map(([input]) => input),
        debounceTime(200),
        switchMap((input) => this.handleSearch(input))
      )
      .subscribe()
  }

  private async handleSearch({ query, scope }: SearchInput) {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
      this.emitResults(normalizedQuery, scope, [])
      return
    }

    try {
      const ticketService = getTicketService()
      const projectKeys =
        scope === 'frequent' ? await this.getFrequentProjectKeys() : []
      const limit = scope === 'frequent' ? 5 : 30

      const remoteTickets = await ticketService.searchTickets(normalizedQuery, {
        limit,
        projectKeys: projectKeys.length ? projectKeys : undefined
      })

      const currentSearch = this.search$.getValue()
      if (
        currentSearch.query !== normalizedQuery ||
        currentSearch.scope !== scope
      ) {
        return
      }

      this.emitResults(
        normalizedQuery,
        scope,
        rankTickets(remoteTickets, normalizedQuery)
      )
    } catch (error) {
      this.log.error('SearchService: remote search failed', error)
      this.emitResults(
        normalizedQuery,
        scope,
        [],
        'Search failed. Please reconnect.'
      )
    }
  }

  private async getFrequentProjectKeys(): Promise<string[]> {
    if (
      this.frequentProjectsCache &&
      Date.now() - this.frequentProjectsCache.fetchedAt < minutes(5)
    ) {
      return this.frequentProjectsCache.projectKeys
    }

    const ticketService = getTicketService()
    const projectKeys = await ticketService.getFrequentProjectKeys()
    this.frequentProjectsCache = {
      projectKeys,
      fetchedAt: Date.now()
    }

    return projectKeys
  }

  private emitResults(
    search: string,
    scope: SearchScope,
    tickets: JiraTicket[],
    error?: string
  ) {
    sendMessage('onSearchResult', {
      search,
      scope,
      tickets,
      error
    })
  }
}

export const [registerSearchService, getSearchService] = defineProxyService<
  SearchService,
  []
>('SearchService', () => new SearchServiceImpl())
