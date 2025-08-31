import Fuse from 'fuse.js'

import { searchCache } from '@/utils/search/cache'
import { createScoringError } from '@/utils/search/errors'
import { calculateContextScore } from '@/utils/search/scoring'
import { JiraTicket } from '~/storage'

import { FUSE_OPTIONS, SEARCH_LIMITS, SCORING_WEIGHTS } from './config'
import { SearchContext, ScoredTicket } from './types'

/**
 * Get recent tickets based on context scoring
 */
export function getRecentTickets(
  tickets: JiraTicket[],
  context: SearchContext
): JiraTicket[] {
  const now = Date.now()
  const scoringContext = {
    now,
    isSearchMode: false,
    ...context,
    tickets
  }

  const scoredTickets = tickets.map((ticket): ScoredTicket => {
    try {
      return {
        ticket,
        score: calculateContextScore(ticket, scoringContext)
      }
    } catch (error) {
      const scoringError = createScoringError(
        ticket.key,
        error instanceof Error ? error.message : 'Unknown error'
      )
      console.warn('Error scoring ticket:', scoringError)
      return {
        ticket,
        score: 0
      }
    }
  })

  return scoredTickets
    .sort((a, b) => b.score - a.score)
    .slice(0, SEARCH_LIMITS.recentTicketsLimit)
    .map((item) => item.ticket)
}

/**
 * Perform actual search with Fuse.js and context scoring
 */
export function searchTickets(
  query: string,
  tickets: JiraTicket[],
  context: SearchContext
): JiraTicket[] {
  // Check cache first
  const cachedResults = searchCache.get(query)
  if (cachedResults) {
    return cachedResults
  }

  // Create Fuse.js instance for fuzzy search
  const fuse = new Fuse(tickets, FUSE_OPTIONS)
  const fuseResults = fuse.search(query.trim())

  // Performance optimization: Limit results early
  const maxResults = Math.min(fuseResults.length, SEARCH_LIMITS.maxResultsBeforeScoring)
  const limitedResults = fuseResults.slice(0, maxResults)

  // Enhanced scoring context
  const scoringContext = {
    now: Date.now(),
    isSearchMode: true,
    ...context,
    tickets
  }

  // Enhance Fuse.js results with context-aware scoring
  const enhancedResults = limitedResults.map((fuseResult): ScoredTicket => {
    try {
      const ticket = fuseResult.item
      const queryLower = query.toLowerCase().trim()

      // Start with Fuse.js relevance (invert score since lower Fuse scores are better)
      const fuseScore = Math.max(0, 1 - (fuseResult.score || 0)) * 100

      // Get context-aware score
      let contextScore = 0
      try {
        contextScore = calculateContextScore(ticket, scoringContext)
      } catch (error) {
        const scoringError = createScoringError(
          ticket.key,
          error instanceof Error ? error.message : 'Unknown error'
        )
        console.warn('Error calculating context score:', scoringError)
      }

      // Calculate match bonuses
      const exactMatchBonus = calculateExactMatchBonus(ticket.key, queryLower)
      const summaryMatchBonus = calculateSummaryMatchBonus(ticket.summary, queryLower)

      return {
        ticket,
        score:
          fuseScore +
          contextScore * SCORING_WEIGHTS.contextScoreMultiplier +
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
    .slice(0, SEARCH_LIMITS.finalResultLimit)
    .map((r) => r.ticket)

  // Cache the results
  searchCache.set(query, results)

  return results
}

/**
 * Calculate bonus score for exact key matches
 */
function calculateExactMatchBonus(ticketKey: string, queryLower: string): number {
  const ticketKeyLower = ticketKey.toLowerCase()

  if (ticketKeyLower === queryLower) {
    return SCORING_WEIGHTS.exactMatchBonus
  } else if (ticketKeyLower.includes(queryLower)) {
    return SCORING_WEIGHTS.partialMatchBonus
  }

  return 0
}

/**
 * Calculate bonus score for summary matches
 */
function calculateSummaryMatchBonus(summary: string, queryLower: string): number {
  const summaryLower = summary.toLowerCase()

  if (summaryLower.includes(queryLower)) {
    const matchPosition = summaryLower.indexOf(queryLower)
    return Math.max(
      SCORING_WEIGHTS.maxSummaryMatchBonus - matchPosition / SCORING_WEIGHTS.summaryPositionDivisor,
      SCORING_WEIGHTS.minSummaryMatchBonus
    )
  }

  return 0
}

/**
 * Create fallback search results for error recovery
 */
export function createFallbackResults(
  query: string,
  tickets: JiraTicket[]
): JiraTicket[] {
  const queryLower = query.toLowerCase().trim()
  
  return tickets
    .filter(
      (ticket) =>
        ticket.key.toLowerCase().includes(queryLower) ||
        ticket.summary.toLowerCase().includes(queryLower)
    )
    .slice(0, SEARCH_LIMITS.fallbackResultLimit)
}