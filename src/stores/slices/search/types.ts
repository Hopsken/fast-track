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
  searchRequestId: number

  // Actions
  search: (
    query: string,
    tickets: JiraTicket[],
    viewHistory: TicketViewRecord[],
    userEmail: string,
    primaryPrefix: string
  ) => void
  clearSearch: () => void
  setError: (error?: string) => void
}

// Internal scoring result
export interface ScoredTicket {
  ticket: JiraTicket
  score: number
}