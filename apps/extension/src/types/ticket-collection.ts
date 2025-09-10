/**
 * Ticket collection communication protocol for @webext-core/messaging
 */

export interface CollectTicketsRequest {
  keys: string[]
  trigger: 'dom' | 'url' | 'initial'
  url: string
}

export interface CollectTicketsResponse {
  success: boolean
  count: number
  error?: string
}

/**
 * Protocol Map for @webext-core/messaging
 * Defines message types and their return types
 */
export interface TicketCollectionProtocol {
  collectTickets(data: CollectTicketsRequest): Promise<CollectTicketsResponse>
}
