import { combineLatest, Observable, of, from } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  shareReplay,
  startWith,
  catchError
} from 'rxjs/operators'

import { getRecentTickets, searchTickets } from '@/stores/slices/search/engine'
import type { SearchContext } from '@/stores/slices/search/types'
import { JiraTicket, TicketViewRecord } from '~/storage'

import { TicketService } from '../ticket-service'

export interface SearchResult {
  query: string
  results: JiraTicket[]
  isError: boolean
  error?: string
}

/**
 * Pure RxJS-based search service that handles stream orchestration
 *
 * This service focuses purely on stream manipulation and search logic,
 * without any state management concerns.
 */
export class SearchStreamService {
  constructor(private ticketService: TicketService) {}
  /**
   * Creates a search results stream from input observables
   *
   * @param searchQuery$ - Observable of search query strings
   * @param ticketData$ - Observable of ticket data from storage
   * @param contextData$ - Observable of search context (userEmail, viewHistory, etc.)
   * @returns Observable that emits search results
   */
  createSearchStream(
    searchQuery$: Observable<string>,
    ticketData$: Observable<JiraTicket[]>,
    contextData$: Observable<SearchContext>
  ): Observable<SearchResult> {
    const normalizedQuery$ = searchQuery$.pipe(
      debounceTime(150),
      distinctUntilChanged(),
      startWith('')
    )

    const normalizedTickets$ = ticketData$.pipe(startWith([]))

    const normalizedContext$ = contextData$.pipe(
      startWith({
        viewHistory: [],
        userEmail: '',
        primaryPrefix: ''
      })
    )

    // Fetch suggestions when query is empty; treat suggestions as an additional
    // ticket source and merge with existing tickets downstream.
    const suggestions$ = from(
      this.ticketService.getIssuePickerSuggestions()
    ).pipe(
      startWith([]),
      catchError((err) => {
        console.warn('Issue picker suggestions failed:', err)
        return of([] as JiraTicket[])
      })
    )

    // Merge base tickets and suggestions by key
    const candidateTickets$ = combineLatest([
      normalizedTickets$,
      suggestions$
    ]).pipe(
      map(([tickets, suggested]) => {
        const merged = new Map<string, JiraTicket>()
        tickets.forEach((t) => merged.set(t.key, t))
        suggested.forEach((s) => {
          if (s && s.key) merged.set(s.key, s)
        })
        return Array.from(merged.values())
      }),
      shareReplay(1)
    )

    return combineLatest([
      normalizedQuery$,
      candidateTickets$,
      normalizedContext$
    ]).pipe(
      switchMap(([query, tickets, context]) =>
        this.performSearchAsObservable(query, tickets, context)
      ),
      shareReplay(1)
    )
  }

  /**
   * Performs search operation as an observable
   *
   * @param query - Search query string
   * @param tickets - Array of tickets to search
   * @param context - Search context for scoring
   * @returns Observable that emits search results
   */
  private performSearchAsObservable(
    query: string,
    tickets: JiraTicket[],
    context: SearchContext
  ): Observable<SearchResult> {
    return new Observable<SearchResult>((subscriber) => {
      try {
        // Validate input data
        if (!Array.isArray(tickets)) {
          throw new Error('tickets must be an array')
        }

        let results: JiraTicket[]

        if (!query.trim()) {
          // Empty query: compute recent tickets from provided candidate set
          const effective = getRecentTickets(tickets, context)
          subscriber.next({ query, results: effective, isError: false })
          subscriber.complete()
          return
        } else {
          // Validate search query
          if (query.length > 200) {
            throw new Error('query too long (max 200 characters)')
          }

          // Perform actual search
          results = searchTickets(query, tickets, context)
        }

        // Emit successful result
        subscriber.next({ query, results, isError: false })
        subscriber.complete()
      } catch (error) {
        console.error('Search error:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown search error'

        // Try to provide fallback results for recoverable errors
        let fallbackResults: JiraTicket[] = []

        if (Array.isArray(tickets) && query.trim()) {
          // Simple fallback: filter by key or summary containing query
          const queryLower = query.toLowerCase()
          fallbackResults = tickets
            .filter(
              (ticket) =>
                ticket.key.toLowerCase().includes(queryLower) ||
                ticket.summary.toLowerCase().includes(queryLower)
            )
            .slice(0, 20)
        }

        // Emit error result with fallback
        subscriber.next({
          query,
          results: fallbackResults,
          isError: true,
          error: errorMessage
        })
        subscriber.complete()
      }
    }).pipe(
      // Additional error handling at stream level
      catchError((error) => {
        console.error('Stream error:', error)
        return of({
          query,
          results: [],
          isError: true,
          error: error instanceof Error ? error.message : 'Stream error'
        })
      })
    )
  }

  /**
   * Creates a simple search context observable from individual observables
   */
  createContextObservable(
    userEmail$: Observable<string>,
    viewHistory$: Observable<TicketViewRecord[]>,
    primaryPrefix$: Observable<string>
  ): Observable<SearchContext> {
    return combineLatest([
      userEmail$.pipe(startWith('')),
      viewHistory$.pipe(startWith([])),
      primaryPrefix$.pipe(startWith(''))
    ]).pipe(
      distinctUntilChanged(
        (prev, curr) =>
          prev[0] === curr[0] && prev[1] === curr[1] && prev[2] === curr[2]
      ),
      map(([userEmail, viewHistory, primaryPrefix]) => ({
        userEmail,
        viewHistory,
        primaryPrefix
      }))
    )
  }
}
