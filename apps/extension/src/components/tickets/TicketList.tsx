import { Fragment } from 'react'
import { CommandEmpty } from '@internal/ui/components/command'
import { HiInformationCircle } from 'react-icons/hi'

import {
  useSearchResults,
  useSearchQuery,
  useIsSearching
} from '~/stores/useTicketStore'

import { TicketItem } from './TicketItem'

interface TicketListProps {
  showNotConfiguredNotice?: boolean
  onOpenOptionsPage?: () => void
}

export function TicketList({
  showNotConfiguredNotice,
  onOpenOptionsPage
}: TicketListProps) {
  // Get state and actions from the unified store
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults() // Use search results from store instead of props
  const isSearching = useIsSearching()

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

  if (searchResults.length === 0) {
    return <CommandEmpty>{emptyMessage}</CommandEmpty>
  }

  return (
    <Fragment>
      {searchResults.map((ticket) => (
        <TicketItem
          key={ticket.key}
          ticket={ticket}
          searchQuery={searchQuery}
        />
      ))}
    </Fragment>
  )
}
