import { useState, useEffect, useMemo } from 'react'
import { useStorage, StorageKey, JiraTicket } from '~/storage'

export interface SearchResult {
  tickets: JiraTicket[]
  isLoading: boolean
  searchQuery: string
}

export function useTicketSearch() {
  const [tickets] = useStorage(StorageKey.TicketsData, [])
  const [searchHistory, setSearchHistory] = useStorage(StorageKey.SearchHistory, [])
  const [viewHistory] = useStorage(StorageKey.TicketViewHistory, [])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Fuzzy search implementation
  const searchTickets = useMemo(() => {
    if (!searchQuery.trim()) {
      // Return recently viewed tickets when no search query
      const recentTickets = tickets
        .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
        .slice(0, 10)
      
      return recentTickets
    }

    const query = searchQuery.toLowerCase().trim()
    const results: Array<{ ticket: JiraTicket; score: number }> = []

    tickets.forEach((ticket) => {
      let score = 0

      // Exact matches get highest score
      if (ticket.key.toLowerCase() === query) {
        score += 100
      } else if (ticket.key.toLowerCase().includes(query)) {
        score += 80
      }

      // Summary matches
      if (ticket.summary.toLowerCase().includes(query)) {
        score += 60
      }

      // Status matches
      if (ticket.status.toLowerCase().includes(query)) {
        score += 40
      }

      // Assignee matches
      if (ticket.assignee && ticket.assignee.toLowerCase().includes(query)) {
        score += 50
      }

      // Project key matches
      if (ticket.projectKey.toLowerCase().includes(query)) {
        score += 30
      }

      // Boost score for frequently viewed tickets
      const viewRecord = viewHistory.find(v => v.ticketKey === ticket.key)
      if (viewRecord) {
        score += Math.min(viewRecord.viewCount * 2, 20)
      }

      // Boost score for recently viewed tickets
      const daysSinceViewed = (new Date().getTime() - new Date(ticket.lastViewed).getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceViewed < 7) {
        score += Math.max(10 - daysSinceViewed, 0)
      }

      if (score > 0) {
        results.push({ ticket, score })
      }
    })

    // Sort by score and return tickets
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(r => r.ticket)
  }, [tickets, searchQuery, viewHistory])

  const addToSearchHistory = async (query: string) => {
    if (!query.trim()) return

    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(newHistory)
  }

  const clearSearchHistory = async () => {
    setSearchHistory([])
  }

  const handleSearch = (query: string) => {
    setIsLoading(true)
    setSearchQuery(query)
    
    // Simulate search delay for better UX
    setTimeout(() => {
      setIsLoading(false)
      if (query.trim()) {
        addToSearchHistory(query.trim())
      }
    }, 150)
  }

  return {
    searchQuery,
    searchResults: searchTickets,
    searchHistory,
    isLoading,
    handleSearch,
    clearSearchHistory,
    setSearchQuery
  }
}