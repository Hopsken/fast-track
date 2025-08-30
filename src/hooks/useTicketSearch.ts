import { useState, useEffect, useMemo, useCallback } from 'react'
import Fuse from 'fuse.js'
import { useStorage, StorageKey, JiraTicket, TicketViewRecord } from '~/storage'

export interface SearchResult {
  tickets: JiraTicket[]
  isLoading: boolean
  searchQuery: string
  error?: string
}

export function useTicketSearch() {
  const [tickets] = useStorage(StorageKey.TicketsData, [])
  const [searchHistory, setSearchHistory] = useStorage(StorageKey.SearchHistory, [])
  const [viewHistory] = useStorage(StorageKey.TicketViewHistory, [])
  const [userEmail] = useStorage(StorageKey.JiraUserEmail, '')
  const [primaryPrefix] = useStorage(StorageKey.PrimaryIssueKeyPrefix, '')
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | undefined>()
  const [isSearching, setIsSearching] = useState(false)

  // Fuse.js configuration for fuzzy search
  const fuseOptions = useMemo(() => ({
    keys: [
      { name: 'key', weight: 0.4 },
      { name: 'summary', weight: 0.3 },
      { name: 'assignee', weight: 0.15 },
      { name: 'status', weight: 0.1 },
      { name: 'projectKey', weight: 0.05 }
    ],
    threshold: 0.4, // Lower = more strict matching
    distance: 100,
    includeScore: true,
    findAllMatches: true,
    minMatchCharLength: 1
  }), [])

  // Create Fuse instance with error handling
  const fuse = useMemo(() => {
    try {
      if (!Array.isArray(tickets) || tickets.length === 0) {
        return null
      }
      return new Fuse(tickets, fuseOptions)
    } catch (error) {
      console.error('Error creating Fuse instance:', error)
      setError('Search initialization failed')
      return null
    }
  }, [tickets, fuseOptions])

  // Get time-based context for intelligent prioritization
  const getTimeContext = useMemo(() => {
    const now = new Date()
    const hour = now.getHours()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    return {
      isWorkingHours: hour >= 9 && hour <= 17, // 9 AM - 5 PM
      isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5, // Monday to Friday
      isMonday: dayOfWeek === 1,
      isFriday: dayOfWeek === 5,
      hour,
      dayOfWeek
    }
  }, [])

  // Context-aware scoring algorithm with performance optimizations
  const calculateContextScore = useCallback((ticket: JiraTicket, now: number, isSearchMode = false) => {
    let score = 0
    const timeContext = getTimeContext
    const lastViewedTime = new Date(ticket.lastViewed).getTime()
    const daysSinceViewed = (now - lastViewedTime) / (1000 * 60 * 60 * 24)
    
    // 1. RECENCY SCORE - More sophisticated time decay
    if (daysSinceViewed < 0.5) {
      score += 60 // Very recent (last 12 hours)
    } else if (daysSinceViewed < 1) {
      score += 45 // Today
    } else if (daysSinceViewed < 2) {
      score += 35 // Yesterday
    } else if (daysSinceViewed < 7) {
      score += Math.max(25 - daysSinceViewed * 3, 10) // Last week (exponential decay)
    } else if (daysSinceViewed < 30) {
      score += Math.max(15 - daysSinceViewed, 5) // Last month
    }
    
    // 2. FREQUENCY AND ENGAGEMENT SCORE
    const viewRecord = viewHistory.find(v => v.ticketKey === ticket.key)
    if (viewRecord) {
      // Logarithmic scaling for view count to prevent outliers
      const frequencyScore = Math.min(Math.log2(viewRecord.viewCount + 1) * 8, 40)
      score += frequencyScore
      
      // Consistency bonus - frequently viewed tickets over time
      if (viewRecord.viewCount > 5) {
        score += 10
      }
    }
    
    // 3. ASSIGNEE RELEVANCE - Prioritize user's own tickets
    if (ticket.assignee && userEmail) {
      const assigneeEmail = ticket.assignee.toLowerCase()
      const currentUserEmail = userEmail.toLowerCase()
      
      if (assigneeEmail === currentUserEmail || assigneeEmail.includes(currentUserEmail.split('@')[0])) {
        score += 25 // Own tickets get high priority
        
        // Extra boost during working hours for own tickets
        if (timeContext.isWorkingHours && timeContext.isWeekday) {
          score += 10
        }
      }
    }
    
    // 4. STATUS-BASED CONTEXTUAL PRIORITY
    const statusLower = ticket.status.toLowerCase()
    if (statusLower.includes('progress') || statusLower.includes('development') || statusLower.includes('doing')) {
      score += 20 // Active work gets highest priority
      
      // Extra boost on weekdays for active tickets
      if (timeContext.isWeekday) {
        score += 8
      }
    } else if (statusLower.includes('review') || statusLower.includes('testing') || statusLower.includes('qa')) {
      score += 15 // Review items are important
      
      // Boost review tickets on Monday (start of week planning)
      if (timeContext.isMonday) {
        score += 5
      }
    } else if (statusLower.includes('todo') || statusLower.includes('backlog') || statusLower.includes('ready')) {
      score += 8 // Ready to start tickets
    } else if (statusLower.includes('blocked') || statusLower.includes('impediment')) {
      score += 12 // Blocked tickets need attention
    } else if (statusLower.includes('done') || statusLower.includes('resolved') || statusLower.includes('closed')) {
      score -= 10 // Reduce closed tickets priority
    }
    
    // 5. PRIORITY-BASED SCORING
    if (ticket.priority) {
      const priorityLower = ticket.priority.toLowerCase()
      if (priorityLower.includes('highest') || priorityLower.includes('critical')) {
        score += 25
      } else if (priorityLower.includes('high')) {
        score += 15
      } else if (priorityLower.includes('medium')) {
        score += 5
      } else if (priorityLower.includes('low') || priorityLower.includes('lowest')) {
        score -= 5
      }
    }
    
    // 6. PROJECT CONTEXT AND MOMENTUM
    const projectTickets = tickets.filter(t => t.projectKey === ticket.projectKey)
    
    // Primary project boost
    if (primaryPrefix && ticket.key.startsWith(primaryPrefix)) {
      score += 15
    }
    
    // Project activity momentum
    const recentProjectViews = projectTickets.filter(t => {
      const ticketDays = (now - new Date(t.lastViewed).getTime()) / (1000 * 60 * 60 * 24)
      return ticketDays < 3
    }).length
    
    if (recentProjectViews > 1) {
      score += Math.min(recentProjectViews * 3, 15) // Active project bonus
    }
    
    // Project size consideration - smaller projects might need more attention
    if (projectTickets.length < 5) {
      score += 3
    }
    
    // 7. SEARCH CONTEXT ADJUSTMENTS (only in search mode)
    if (isSearchMode) {
      // Boost recently searched for similar terms
      const recentSearches = searchHistory.slice(0, 5)
      const hasRelatedSearch = recentSearches.some(search => {
        const searchLower = search.toLowerCase()
        return ticket.key.toLowerCase().includes(searchLower) || 
               ticket.summary.toLowerCase().includes(searchLower) ||
               (ticket.assignee && ticket.assignee.toLowerCase().includes(searchLower))
      })
      
      if (hasRelatedSearch) {
        score += 8
      }
    }
    
    // 8. TIME-SENSITIVE PATTERNS
    // End of week cleanup - boost review/testing tickets on Friday
    if (timeContext.isFriday) {
      if (statusLower.includes('review') || statusLower.includes('testing')) {
        score += 8
      }
    }
    
    // Start of week planning - boost backlog/ready tickets on Monday
    if (timeContext.isMonday) {
      if (statusLower.includes('backlog') || statusLower.includes('ready') || statusLower.includes('todo')) {
        score += 6
      }
    }
    
    return Math.max(score, 0) // Ensure non-negative scores
  }, [getTimeContext, viewHistory, userEmail, primaryPrefix, searchHistory, tickets])

  // Fuzzy search implementation with performance optimizations and error handling
  const searchTickets = useMemo(() => {
    try {
      setError(undefined)
      const now = new Date().getTime()
      
      // Validate input data
      if (!Array.isArray(tickets)) {
        throw new Error('Invalid tickets data')
      }

      if (!searchQuery.trim()) {
        // Smart recent tickets algorithm with enhanced context awareness
        const scoredTickets = tickets.map(ticket => {
          try {
            return {
              ticket,
              score: calculateContextScore(ticket, now, false)
            }
          } catch (error) {
            console.warn('Error scoring ticket:', ticket.key, error)
            return {
              ticket,
              score: 0
            }
          }
        })
        
        return scoredTickets
          .sort((a, b) => b.score - a.score)
          .slice(0, 12) // Show a few more recent tickets
          .map(item => item.ticket)
      }

      // Validate search query
      if (searchQuery.length > 200) {
        throw new Error('Search query too long')
      }

      // Performance optimization: Skip search for very large datasets without Fuse
      if (!fuse) {
        // Fallback to basic string matching for performance
        const query = searchQuery.toLowerCase().trim()
        return tickets
          .filter(ticket => 
            ticket.key.toLowerCase().includes(query) ||
            ticket.summary.toLowerCase().includes(query) ||
            (ticket.assignee && ticket.assignee.toLowerCase().includes(query))
          )
          .slice(0, 20)
      }

      // Perform fuzzy search using Fuse.js
      const fuseResults = fuse.search(searchQuery.trim())
    
      // Performance optimization: Limit results early to avoid excessive processing
      const maxResults = Math.min(fuseResults.length, 50)
      const limitedResults = fuseResults.slice(0, maxResults)

      // Enhance Fuse.js results with context-aware scoring
      const enhancedResults = limitedResults.map(fuseResult => {
        try {
          const ticket = fuseResult.item
          
          // Start with Fuse.js relevance (invert score since lower Fuse scores are better)
          const fuseScore = Math.max(0, 1 - (fuseResult.score || 0)) * 100
          
          // Get context-aware score with error handling
          let contextScore = 0
          try {
            contextScore = calculateContextScore(ticket, now, true)
          } catch (error) {
            console.warn('Error calculating context score for ticket:', ticket.key, error)
          }
          
          // Exact key match gets highest priority
          let exactMatchBonus = 0
          const ticketKeyLower = ticket.key.toLowerCase()
          const queryLower = searchQuery.toLowerCase().trim()
          
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
            // Earlier matches in summary get higher bonus
            summaryMatchBonus = Math.max(20 - matchPosition / 5, 5)
          }
          
          return {
            ticket,
            score: fuseScore + contextScore * 0.6 + exactMatchBonus + summaryMatchBonus
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
      return enhancedResults
        .sort((a, b) => b.score - a.score)
        .slice(0, 25) // Show more search results
        .map(r => r.ticket)

    } catch (error) {
      console.error('Search error:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
      
      // Fallback: return basic filtered results
      if (Array.isArray(tickets) && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        return tickets
          .filter(ticket => 
            ticket.key.toLowerCase().includes(query) ||
            ticket.summary.toLowerCase().includes(query)
          )
          .slice(0, 10)
      }
      
      return []
    }
  }, [tickets, searchQuery, calculateContextScore, fuse])

  const addToSearchHistory = useCallback(async (query: string) => {
    try {
      if (!query.trim()) return

      const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
      setSearchHistory(newHistory)
    } catch (error) {
      console.error('Error adding to search history:', error)
    }
  }, [searchHistory, setSearchHistory])

  const clearSearchHistory = useCallback(async () => {
    try {
      setSearchHistory([])
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }, [setSearchHistory])

  const handleSearch = useCallback((query: string) => {
    try {
      setSearchQuery(query)
      setError(undefined)
      
      // Add to search history if query is not empty
      if (query.trim()) {
        addToSearchHistory(query.trim())
      }
    } catch (error) {
      console.error('Error handling search:', error)
      setError('Search failed')
    }
  }, [addToSearchHistory])

  return {
    searchQuery,
    searchResults: searchTickets,
    searchHistory,
    handleSearch,
    clearSearchHistory,
    setSearchQuery,
    error,
    isSearching: isSearching || (searchQuery.length > 0 && searchTickets.length === 0 && !error)
  }
}