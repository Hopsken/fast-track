/**
 * Background service for handling ticket collection requests from content scripts
 * Uses centralized messaging service for communication
 */

import { onMessage } from '~/lib/messaging'
import { getTicketService } from '~/services/ticket-service'
import { StorageKey, JiraTicket, storageItems } from '~/storage'
import type {
  CollectTicketsRequest,
  CollectTicketsResponse
} from '~/types/ticket-collection'

/**
 * Initialize ticket collection message handlers
 */
export function initializeTicketCollectionService() {
  onMessage('collectTickets', async ({ data }) => {
    try {
      return await handleCollectTickets(data)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'

      return {
        success: false,
        count: 0,
        error: errorMessage
      }
    }
  })
}

/**
 * Handle ticket collection request from content script
 */
async function handleCollectTickets(
  request: CollectTicketsRequest
): Promise<CollectTicketsResponse> {
  const { keys } = request

  if (keys.length === 0) {
    return {
      success: true,
      count: 0
    }
  }

  // Step 1: Fetch ticket details using existing ticket service
  const ticketService = getTicketService()
  const tickets = await ticketService.fetchTicketDetails(keys)

  if (tickets.length === 0) {
    return {
      success: true,
      count: 0
    }
  }

  // Step 2: Merge with existing storage data
  await mergeTicketsData(tickets)

  return {
    success: true,
    count: tickets.length
  }
}

/**
 * Merge new tickets with existing data in storage
 * Same logic as the original content script but moved to background
 */
async function mergeTicketsData(newTickets: JiraTicket[]): Promise<void> {
  const existingTickets =
    (await storageItems[StorageKey.TicketsData].getValue()) || []
  const ticketMap = new Map<string, JiraTicket>()

  // Add existing tickets to map
  existingTickets.forEach((ticket: JiraTicket) => {
    ticketMap.set(ticket.key, ticket)
  })

  // Merge new tickets
  newTickets.forEach((newTicket) => {
    const existing = ticketMap.get(newTicket.key)
    if (existing) {
      // Update existing ticket with new data and increment view count
      const merged = {
        ...existing,
        ...newTicket,
        viewCount: existing.viewCount + 1,
        lastViewed: newTicket.lastViewed
      }
      ticketMap.set(newTicket.key, merged)
    } else {
      // Add new ticket
      ticketMap.set(newTicket.key, newTicket)
    }
  })

  // Convert back to array and limit size (keep most recent 1000 tickets)
  const mergedTickets = Array.from(ticketMap.values())
    .sort(
      (a, b) =>
        new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
    )
    .slice(0, 1000)

  await storageItems[StorageKey.TicketsData].setValue(mergedTickets)
}
