import { JiraTicket } from '@/types'

import { TicketSuggestionsAPI } from './ticket-suggestion-service'

export interface TicketService {
  suggestions: TicketSuggestionsAPI
  fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]>
  loadSuggestions(force?: boolean): Promise<JiraTicket[]>
  searchTickets(query: string): Promise<JiraTicket[]>
  isConfigured(): Promise<boolean>
}
