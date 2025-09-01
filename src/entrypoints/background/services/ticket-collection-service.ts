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
  console.log('🔧 Initializing ticket collection service...')

  onMessage('collectTickets', async ({ data }) => {
    return await handleCollectTickets(data)
  })

  console.log('✅ Ticket collection service initialized')
}

/**
 * Handle ticket collection request from content script
 */
async function handleCollectTickets(
  request: CollectTicketsRequest
): Promise<CollectTicketsResponse> {
  const { keys, trigger, url } = request

  console.log(
    `\n🚀 BACKGROUND: Starting ticket collection (${trigger.toUpperCase()})`
  )
  console.log(`📍 URL: ${url}`)
  console.log(
    `🎫 Keys: ${keys.length} ticket(s) - ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`
  )

  try {
    if (keys.length === 0) {
      console.log('⚠️ No ticket keys provided')
      return {
        success: true,
        count: 0
      }
    }

    // Step 1: Fetch ticket details using existing ticket service
    console.log(`🔄 Fetching ticket details via TicketService...`)
    const ticketService = getTicketService()
    const tickets = await ticketService.fetchTicketDetails(keys)

    console.log(
      `✅ Fetched ${tickets.length}/${keys.length} tickets successfully`
    )

    if (tickets.length === 0) {
      console.log('⚠️ No tickets were successfully fetched')
      return {
        success: true,
        count: 0
      }
    }

    // Step 2: Merge with existing storage data
    console.log(`💾 Merging ${tickets.length} tickets with existing storage...`)
    await mergeTicketsData(tickets)
    console.log('✅ Tickets successfully merged and saved to storage')

    // Log summary for debugging
    if (tickets.length > 0) {
      console.log('📊 Collection Summary:')
      console.table(
        tickets.slice(0, 5).map((ticket) => ({
          Key: ticket.key,
          Summary:
            ticket.summary.substring(0, 40) +
            (ticket.summary.length > 40 ? '...' : ''),
          Status: ticket.status || 'Unknown',
          Project: ticket.projectKey
        }))
      )
      if (tickets.length > 5) {
        console.log(`... and ${tickets.length - 5} more tickets`)
      }
    }

    console.log(`🏁 BACKGROUND: Collection completed successfully\n`)

    return {
      success: true,
      count: tickets.length
    }
  } catch (error) {
    console.error('❌ BACKGROUND: Error collecting tickets:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return {
      success: false,
      count: 0,
      error: errorMessage
    }
  }
}

/**
 * Merge new tickets with existing data in storage
 * Same logic as the original content script but moved to background
 */
async function mergeTicketsData(newTickets: JiraTicket[]): Promise<void> {
  console.log(
    `💾 MergeTicketsData: Starting merge with ${newTickets.length} new tickets`
  )

  const existingTickets =
    (await storageItems[StorageKey.TicketsData].getValue()) || []
  console.log(
    `💾 MergeTicketsData: Found ${existingTickets.length} existing tickets in storage`
  )

  const ticketMap = new Map<string, JiraTicket>()

  // Add existing tickets to map
  existingTickets.forEach((ticket: JiraTicket) => {
    ticketMap.set(ticket.key, ticket)
  })

  // Merge new tickets
  let updatedCount = 0
  let addedCount = 0

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
      updatedCount++
    } else {
      // Add new ticket
      ticketMap.set(newTicket.key, newTicket)
      addedCount++
    }
  })

  console.log(
    `💾 MergeTicketsData: Updated ${updatedCount} tickets, added ${addedCount} new tickets`
  )

  // Convert back to array and limit size (keep most recent 1000 tickets)
  const mergedTickets = Array.from(ticketMap.values())
    .sort(
      (a, b) =>
        new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime()
    )
    .slice(0, 1000)

  console.log(
    `💾 MergeTicketsData: Final collection has ${mergedTickets.length} tickets (limited to 1000)`
  )

  await storageItems[StorageKey.TicketsData].setValue(mergedTickets)
  console.log('💾 MergeTicketsData: Successfully saved to storage')
}
