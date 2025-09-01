// Barrel exports for search modules

// Types
export type {
  SearchState,
  SearchContext,
  SearchSlice,
  ScoredTicket
} from './types'

// Configuration
export { FUSE_OPTIONS, SEARCH_LIMITS, SCORING_WEIGHTS } from './config'

// Search engine functions
export {
  getRecentTickets,
  searchTickets,
  createFallbackResults
} from './engine'
