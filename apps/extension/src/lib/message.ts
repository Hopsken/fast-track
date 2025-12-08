import { defineExtensionMessaging } from '@webext-core/messaging'

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

  onMyInProgressUpdated: (payload: { tickets: JiraTicket[] }) => void
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
