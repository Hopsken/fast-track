import { defineExtensionMessaging } from '@webext-core/messaging'

import { JiraTicket } from '@/types'

// TODO: Review if messaging is still needed after normy integration
interface ProtocolMap {
  onSearchResult: (payload: {
    search: string
    tickets: JiraTicket[]
    error?: string
  }) => void
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
