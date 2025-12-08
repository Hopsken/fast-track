import { defineExtensionMessaging } from '@webext-core/messaging'

import { IssueSuggestion } from '@/services/ticket-service'
import { JiraTicket } from '@/types'

interface ProtocolMap {
  onSearchResult: (payload: {
    search: string
    tickets: JiraTicket[]
    error?: string
  }) => void
  ticketsUpdated: (payload: {
    reason: string
    tickets?: JiraTicket[]
    fetchedAt: number
  }) => void

  onIssueSuggestionsUpdated: (payload: Partial<IssueSuggestion>) => void
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
