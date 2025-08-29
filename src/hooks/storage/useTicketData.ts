/**
 * Hooks for ticket data management
 */

import { useCallback } from 'react'
import { useStorage } from './useStorage'
import { StorageKey } from '~/storage/keys'
import type { JiraTicket, TicketViewRecord } from '~/storage/types'

/**
 * Hook for managing ticket data
 */
export function useTicketData() {
  const [tickets, setTickets] = useStorage(StorageKey.TicketsData, [])
  const [viewHistory, setViewHistory] = useStorage(StorageKey.TicketViewHistory, [])

  const addTickets = useCallback((newTickets: JiraTicket[]) => {
    setTickets(prevTickets => {
      const ticketMap = new Map<string, JiraTicket>()

      // Add existing tickets to map
      prevTickets.forEach(ticket => {
        ticketMap.set(ticket.key, ticket)
      })

      // Merge new tickets
      newTickets.forEach(newTicket => {
        const existing = ticketMap.get(newTicket.key)
        if (existing) {
          // Update existing ticket with new data and increment view count
          ticketMap.set(newTicket.key, {
            ...existing,
            ...newTicket,
            viewCount: existing.viewCount + 1,
            lastViewed: newTicket.lastViewed
          })
        } else {
          // Add new ticket
          ticketMap.set(newTicket.key, newTicket)
        }
      })

      // Convert back to array and limit size (keep most recent 1000 tickets)
      return Array.from(ticketMap.values())
        .sort((a, b) => new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime())
        .slice(0, 1000)
    })
  }, [setTickets])

  const updateTicketViewCount = useCallback((ticketKey: string) => {
    // Update view history
    setViewHistory(prevHistory => {
      const existingRecord = prevHistory.find(record => record.ticketKey === ticketKey)
      const updatedHistory = existingRecord
        ? prevHistory.map(record => 
            record.ticketKey === ticketKey
              ? { ...record, viewCount: record.viewCount + 1, lastViewed: new Date().toISOString() }
              : record
          )
        : [
            ...prevHistory,
            {
              ticketKey,
              viewCount: 1,
              lastViewed: new Date().toISOString()
            } as TicketViewRecord
          ]

      return updatedHistory.slice(0, 100) // Keep only recent 100 records
    })

    // Update ticket data
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.key === ticketKey
          ? { ...ticket, viewCount: ticket.viewCount + 1, lastViewed: new Date().toISOString() }
          : ticket
      )
    )
  }, [setViewHistory, setTickets])

  const getTicketByKey = useCallback((key: string): JiraTicket | undefined => {
    return tickets.find(ticket => ticket.key === key)
  }, [tickets])

  const searchTickets = useCallback((query: string): JiraTicket[] => {
    if (!query) return tickets.slice(0, 20) // Return recent tickets

    const lowerQuery = query.toLowerCase()
    return tickets.filter(ticket => 
      ticket.key.toLowerCase().includes(lowerQuery) ||
      ticket.summary.toLowerCase().includes(lowerQuery) ||
      ticket.assignee?.toLowerCase().includes(lowerQuery) ||
      ticket.projectKey.toLowerCase().includes(lowerQuery)
    ).slice(0, 50) // Limit search results
  }, [tickets])

  const clearTickets = useCallback(() => {
    setTickets([])
  }, [setTickets])

  const removeTicket = useCallback((ticketKey: string) => {
    setTickets(prevTickets => prevTickets.filter(ticket => ticket.key !== ticketKey))
  }, [setTickets])

  return {
    tickets,
    viewHistory,
    addTickets,
    updateTicketViewCount,
    getTicketByKey,
    searchTickets,
    clearTickets,
    removeTicket,
    totalTickets: tickets.length,
  }
}

/**
 * Hook for search history management
 */
export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useStorage(StorageKey.SearchHistory, [])

  const addSearchTerm = useCallback((term: string) => {
    if (!term || term.trim().length < 2) return

    setSearchHistory(prevHistory => {
      const trimmedTerm = term.trim()
      const filteredHistory = prevHistory.filter(item => item !== trimmedTerm)
      
      return [trimmedTerm, ...filteredHistory].slice(0, 50) // Keep last 50 searches
    })
  }, [setSearchHistory])

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([])
  }, [setSearchHistory])

  const removeSearchTerm = useCallback((term: string) => {
    setSearchHistory(prevHistory => prevHistory.filter(item => item !== term))
  }, [setSearchHistory])

  return {
    searchHistory,
    addSearchTerm,
    clearSearchHistory,
    removeSearchTerm,
  }
}