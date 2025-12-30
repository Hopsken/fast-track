import { Fragment } from 'react'

import { JiraTicket } from '@/types'

import { TicketItem } from './TicketItem'

interface TicketListProps {
  searchQuery: string
  tickets: JiraTicket[]
}

export function TicketList({ searchQuery, tickets }: TicketListProps) {
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
    </Fragment>
  )
}
