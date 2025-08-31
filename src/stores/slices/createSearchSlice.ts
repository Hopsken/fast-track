import Fuse from 'fuse.js'
import { StateCreator } from 'zustand'

import { searchCache } from '@/utils/search/cache'
import { calculateContextScore } from '@/utils/search/scoring'
import { JiraTicket, TicketViewRecord } from '~/storage'

import { NavigationSlice } from './createNavigationSlice'

export interface SearchSlice {
  // State
  searchQuery: string
  searchResults: JiraTicket[]
  searchHistory: string[]
  error?: string
  isSearching: boolean

  // Actions
  setSearchQuery: (query: string) => void
  performSearch: (
    query: string,
    tickets: JiraTicket[],
    searchHistory: string[],
    viewHistory: TicketViewRecord[],
    userEmail: string,
    primaryPrefix: string
  ) => void
  addToSearchHistory: (query: string, currentHistory: string[]) => string[]
  clearSearch: () => void
  setError: (error?: string) => void
  setIsSearching: (isSearching: boolean) => void
}

export const createSearchSlice: StateCreator<
  SearchSlice & NavigationSlice,
  [],
  [],
  SearchSlice
> = (set, get) => ({
  // Initial state
  searchQuery: '',
  searchResults: [],
  searchHistory: [],
  error: undefined,
  isSearching: false,

  // Actions
  setSearchQuery: (query: string) => {
    set({ searchQuery: query, error: undefined })
  },

  performSearch: (
    query: string,
    tickets: JiraTicket[],
    searchHistory: string[],
    viewHistory: TicketViewRecord[],
    userEmail: string,
    primaryPrefix: string
  ) => {
    try {
      set({ error: undefined, isSearching: true })

      // Validate input data
      if (!Array.isArray(tickets)) {
        throw new Error('Invalid tickets data')
      }

      if (!query.trim()) {
        // Smart recent tickets algorithm with enhanced context awareness
        const now = Date.now()
        const scoringContext = {
          now,
          isSearchMode: false,
          viewHistory,
          userEmail,
          primaryPrefix,
          searchHistory,
          tickets
        }

        const scoredTickets = tickets.map((ticket) => {
          try {
            return {
              ticket,
              score: calculateContextScore(ticket, scoringContext)
            }
          } catch (error) {
            console.warn('Error scoring ticket:', ticket.key, error)
            return {
              ticket,
              score: 0
            }
          }
        })

        const results = scoredTickets
          .sort((a, b) => b.score - a.score)
          .slice(0, 12)
          .map((item) => item.ticket)

        set({ searchResults: results, isSearching: false })

        // Auto-reset navigation selection when search results change
        const { resetSelection } = get()
        if (resetSelection) resetSelection()
        return
      }

      // Validate search query
      if (query.length > 200) {
        throw new Error('Search query too long')
      }

      // Check cache first
      const cachedResults = searchCache.get(query)
      if (cachedResults) {
        set({ searchResults: cachedResults, isSearching: false })
        const { resetSelection } = get()
        if (resetSelection) resetSelection()
        return
      }

      // Create Fuse.js instance for fuzzy search
      const fuseOptions = {
        keys: [
          { name: 'key', weight: 0.4 },
          { name: 'summary', weight: 0.3 },
          { name: 'assignee', weight: 0.15 },
          { name: 'status', weight: 0.1 },
          { name: 'projectKey', weight: 0.05 }
        ],
        threshold: 0.4,
        distance: 100,
        includeScore: true,
        findAllMatches: true,
        minMatchCharLength: 1
      }

      const fuse = new Fuse(tickets, fuseOptions)
      const fuseResults = fuse.search(query.trim())

      // Performance optimization: Limit results early
      const maxResults = Math.min(fuseResults.length, 50)
      const limitedResults = fuseResults.slice(0, maxResults)

      // Enhanced scoring context
      const scoringContext = {
        now: Date.now(),
        isSearchMode: true,
        viewHistory,
        userEmail,
        primaryPrefix,
        searchHistory,
        tickets
      }

      // Enhance Fuse.js results with context-aware scoring
      const enhancedResults = limitedResults.map((fuseResult) => {
        try {
          const ticket = fuseResult.item

          // Start with Fuse.js relevance (invert score since lower Fuse scores are better)
          const fuseScore = Math.max(0, 1 - (fuseResult.score || 0)) * 100

          // Get context-aware score
          let contextScore = 0
          try {
            contextScore = calculateContextScore(ticket, scoringContext)
          } catch (error) {
            console.warn(
              'Error calculating context score for ticket:',
              ticket.key,
              error
            )
          }

          // Exact key match gets highest priority
          let exactMatchBonus = 0
          const ticketKeyLower = ticket.key.toLowerCase()
          const queryLower = query.toLowerCase().trim()

          if (ticketKeyLower === queryLower) {
            exactMatchBonus = 75
          } else if (ticketKeyLower.includes(queryLower)) {
            exactMatchBonus = 35
          }

          // Partial summary match bonus
          let summaryMatchBonus = 0
          const summaryLower = ticket.summary.toLowerCase()
          if (summaryLower.includes(queryLower)) {
            const matchPosition = summaryLower.indexOf(queryLower)
            summaryMatchBonus = Math.max(20 - matchPosition / 5, 5)
          }

          return {
            ticket,
            score:
              fuseScore +
              contextScore * 0.6 +
              exactMatchBonus +
              summaryMatchBonus
          }
        } catch (error) {
          console.warn('Error processing search result:', error)
          return {
            ticket: fuseResult.item,
            score: 0
          }
        }
      })

      // Sort by combined score and return tickets
      const results = enhancedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 25)
        .map((r) => r.ticket)

      // Cache the results
      searchCache.set(query, results)

      set({ searchResults: results, isSearching: false })

      // Auto-reset navigation selection when search results change
      const { resetSelection } = get()
      if (resetSelection) resetSelection()
    } catch (error) {
      console.error('Search error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Search failed'
      set({ error: errorMessage, isSearching: false })

      // Fallback: return basic filtered results
      if (Array.isArray(tickets) && query.trim()) {
        const queryLower = query.toLowerCase().trim()
        const fallbackResults = tickets
          .filter(
            (ticket) =>
              ticket.key.toLowerCase().includes(queryLower) ||
              ticket.summary.toLowerCase().includes(queryLower)
          )
          .slice(0, 10)

        set({ searchResults: fallbackResults })
      } else {
        set({ searchResults: [] })
      }

      // Auto-reset navigation selection
      const { resetSelection } = get()
      if (resetSelection) resetSelection()
    }
  },

  addToSearchHistory: (query: string, currentHistory: string[]): string[] => {
    if (!query.trim()) return currentHistory
    return [query, ...currentHistory.filter((h) => h !== query)].slice(0, 10)
  },

  clearSearch: () => {
    set({ searchQuery: '', searchResults: [], error: undefined })
  },

  setError: (error?: string) => {
    set({ error })
  },

  setIsSearching: (isSearching: boolean) => {
    set({ isSearching })
  }
})
