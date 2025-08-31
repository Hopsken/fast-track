import { JiraTicket, TicketViewRecord } from '~/storage'

// Search state type
export type SearchState = 'idle' | 'searching' | 'success' | 'error'

// Context for search operations
export interface SearchContext {
  viewHistory: TicketViewRecord[]
  userEmail: string
  primaryPrefix: string
}

// Search slice interface
export interface SearchSlice {
  // State
  searchQuery: string
  searchResults: JiraTicket[]
  error?: string
  searchState: SearchState

  // Simple state management actions - no complex search logic
  setSearchQuery: (query: string) => void
  setSearchResults: (results: JiraTicket[]) => void
  setSearchError: (error?: string) => void
  setSearching: () => void
  clearSearch: () => void
}

// Internal scoring result
export interface ScoredTicket {
  ticket: JiraTicket
  score: number
}
