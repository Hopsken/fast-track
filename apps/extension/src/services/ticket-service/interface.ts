import { JiraTicket } from '@/types'

import { TicketSuggestionsAPI } from './ticket-suggestion-service'

export interface TicketService {
  suggestions: TicketSuggestionsAPI

  getIssueEditMeta(issue: JiraTicket): Promise<any>

  fetchTicketDetails(ticketKeys: string[]): Promise<JiraTicket[]>
  loadSuggestions(force?: boolean): Promise<JiraTicket[]>
  searchTickets(query: string): Promise<JiraTicket[]>
  isConfigured(): Promise<boolean>
}
