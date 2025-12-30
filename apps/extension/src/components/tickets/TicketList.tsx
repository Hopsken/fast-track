import { Fragment } from 'react'
import { CommandEmpty } from '@internal/ui/components/command'

import { JiraTicket } from '@/types'

import { TicketItem } from './TicketItem'

interface TicketListProps {
  searchQuery: string
  showEmptyNotice: boolean
  tickets: JiraTicket[]
}

export function TicketList({
  searchQuery,
  showEmptyNotice,
  tickets
}: TicketListProps) {
  return (
    <Fragment>
      {tickets.map((ticket) => (
        <TicketItem
          key={ticket.key}
          ticket={ticket}
          source="search"
          searchQuery={searchQuery}
        />
      ))}
      {showEmptyNotice && <CommandEmpty>No tickets found</CommandEmpty>}
    </Fragment>
  )
}
