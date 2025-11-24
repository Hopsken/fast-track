import { defineExtensionMessaging } from '@webext-core/messaging'

import { JiraTicket } from '@/types'

interface ProtocolMap {
  onSearchResult: (payload: {
    search: string
    tickets: JiraTicket[]
    error?: string
  }) => void
  ticketsUpdated: (payload: { reason: string; fetchedAt: number }) => void
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
