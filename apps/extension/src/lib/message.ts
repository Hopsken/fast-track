import { defineExtensionMessaging } from '@webext-core/messaging'

import type { SearchScope } from '@/stores/slices/createSearchSlice'
import type { JiraTicket } from '@/types'

interface ProtocolMap {
  onSearchResult: (payload: {
    search: string
    scope: SearchScope
    tickets: JiraTicket[]
    error?: string
  }) => void
  ticketsUpdated: (payload: {
    reason: string
    tickets?: JiraTicket[]
    fetchedAt: string
  }) => void
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
