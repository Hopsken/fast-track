import { Fragment } from 'react'
import { CommandEmpty } from '@internal/ui/components/command'
import { HiInformationCircle } from 'react-icons/hi'

import { JiraTicket } from '@/types'

import { TicketItem } from './TicketItem'

interface TicketListProps {
  searchQuery: string
  isSearching: boolean
  tickets: JiraTicket[]

  showNotConfiguredNotice?: boolean
  onOpenOptionsPage?: () => void
}

export function TicketList({
  searchQuery,
  isSearching,
  tickets,

  showNotConfiguredNotice,
  onOpenOptionsPage
}: TicketListProps) {
  function renderEmpty() {
    let emptyMessage = 'Tickets will appear here once collected from Jira'

    if (isSearching) {
      emptyMessage = 'Searching tickets...'
    } else if (searchQuery) {
      emptyMessage = 'No tickets found'
    }

    if (showNotConfiguredNotice) {
      return (
        <CommandEmpty>
          <HiInformationCircle aria-hidden="true" />
          <div>
            <p>Connect to Jira to search.</p>
            <p>Connect your Jira account in settings to start searching.</p>
          </div>
          {onOpenOptionsPage ? (
            <button type="button" onClick={onOpenOptionsPage}>
              Open settings
            </button>
          ) : null}
        </CommandEmpty>
      )
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
