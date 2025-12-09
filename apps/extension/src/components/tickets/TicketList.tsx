import { Fragment } from 'react'
import { CommandEmpty } from '@internal/ui/components/command'

import { JiraTicket } from '@/types'

import { TicketItem } from './TicketItem'

interface TicketListProps {
  searchQuery: string
  isSearching: boolean
  tickets: JiraTicket[]
}

export function TicketList({
  searchQuery,
  isSearching,
  tickets
}: TicketListProps) {
  function renderEmpty() {
    let emptyMessage = 'Tickets will appear here once collected from Jira'

    if (isSearching) {
      emptyMessage = 'Searching tickets...'
    } else if (searchQuery) {
      emptyMessage = 'No tickets found'
    }

    return <CommandEmpty>{emptyMessage}</CommandEmpty>
  }

  return (
    <Fragment>
      {renderEmpty()}
      {tickets.map((ticket) => (
        <TicketItem
          key={ticket.key}
          ticket={ticket}
          searchQuery={searchQuery}
        />
      ))}
    </Fragment>
  )
}
