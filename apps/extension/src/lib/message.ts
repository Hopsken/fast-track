import { defineExtensionMessaging } from '@webext-core/messaging'

import { JiraTicket } from '@/types'

interface ProtocolMap {
  onSearchResult: (payload: {
    search: string
    tickets: JiraTicket[]
    error?: string
  }) => void
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>()
