import { switchMap, type Subscription } from 'rxjs'
import { StoreApi } from 'zustand'

import { getSearchService, SearchService } from '@/services/search-service'
import { TicketStore } from '@/stores/useTicketStore'
import { JiraTicket } from '@/types'
import { toStream } from '@/utils/toStream'

/**
 * External orchestrator that manages RxJS streams and updates Zustand store
 *
 * This orchestrator creates the necessary observables from both Zustand state
 * and WXT storage, coordinates the search stream, and updates the store externally
 * to avoid circular dependencies.
 */
export class SearchOrchestrator {
  private searchService: SearchService
  private subscription?: Subscription

  constructor() {
    // Provide suggestions via background TicketService when query is empty
    this.searchService = getSearchService()
  }

  /**
   * Initialize search orchestration for the given store
   *
   * @param store - The Zustand ticket store instance
   * @returns Subscription for cleanup
   */
  initialize(store: StoreApi<TicketStore>): Subscription {
    // Clean up any existing subscription
    if (this.subscription) {
      this.subscription.unsubscribe()
    }

    // Create observables from Zustand state using toStream utility
    const searchQuery$ = toStream(store, (state) => state.searchQuery, {
      fireImmediately: true
    })

    // Create the main search stream
    const searchResults$ = searchQuery$.pipe(
      switchMap((query) => this.searchService.search(query))
    )

    // Subscribe to search results and update Zustand store externally
    this.subscription = searchResults$.subscribe({
      next: (result: JiraTicket[]) => {
        const state = store.getState()

        if (result.length === 0) {
          // Handle error case
          state.setSearchError('No results found')
          state.setSearchResults(result) // May include fallback results
        } else {
          // Handle success case
          state.setSearchError(undefined)
          state.setSearchResults(result)
        }

        // Auto-reset navigation selection when results change
        if (state.resetSelection) {
          state.resetSelection()
        }
      },
      error: (error) => {
        console.error('Search stream error:', error)
        const state = store.getState()
        state.setSearchError(error?.message || 'Stream error')
        state.setSearchResults([])
      }
    })

    return this.subscription
  }

  /**
   * Clean up subscriptions
   */
  destroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
      this.subscription = undefined
    }
  }
}

/**
 * Global orchestrator instance
 */
let globalOrchestrator: SearchOrchestrator | undefined

/**
 * Initialize search orchestration for the given store
 *
 * @param store - The Zustand ticket store instance
 * @returns Subscription for cleanup
 */
export function initializeSearchOrchestration(
  store: StoreApi<TicketStore>
): Subscription {
  // Clean up existing orchestrator
  if (globalOrchestrator) {
    globalOrchestrator.destroy()
  }

  // Create new orchestrator
  globalOrchestrator = new SearchOrchestrator()

  return globalOrchestrator.initialize(store)
}

/**
 * Clean up the global search orchestration
 */
export function destroySearchOrchestration(): void {
  if (globalOrchestrator) {
    globalOrchestrator.destroy()
    globalOrchestrator = undefined
  }
}
