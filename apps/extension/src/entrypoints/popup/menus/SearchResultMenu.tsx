import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandSeparator
} from '@internal/ui/components/command'

import { DevActionRefreshSuggestions } from '@/components/DevActionRefreshSuggestions'
import { DevOnly } from '@/components/DevOnly'
import { TicketItem, TicketList } from '@/components/tickets'
import { useMyInProgressTickets } from '@/hooks/useMyInProgressTickets'
import { JiraTicket } from '@/types'
import { openOptionsPage } from '@/utils'
import { useSearchQuery, useSearchResults } from '~/stores/useTicketStore'

export function SearchResultMenu() {
  const searchQuery = useSearchQuery()
  const searchResults = useSearchResults()

  const shouldShowSuggestions = !searchQuery.trim()

  const { data: myInProgressTickets = [], isLoading: isLoadingMyInProgress } =
    useMyInProgressTickets({
      enabled: shouldShowSuggestions
    })

  const otherTickets = useMemo(() => {
    const inProgressKeys = new Set(
      myInProgressTickets.map((ticket) => ticket.key)
    )

    return searchResults.filter((ticket) => !inProgressKeys.has(ticket.key))
  }, [myInProgressTickets, searchResults])

  const handleOpenOptionsPage = () => {
    openOptionsPage()
    window.close()
  }

  return (
    <CommandList aria-label="Ticket search results">
      {shouldShowSuggestions ? (
        <SuggestedTickets
          inProgressTickets={myInProgressTickets}
          otherTickets={otherTickets}
          isLoadingInProgress={isLoadingMyInProgress}
        />
      ) : (
        <TicketList onOpenOptionsPage={handleOpenOptionsPage} />
      )}

      <DevOnly>
        <DevActionRefreshSuggestions />
      </DevOnly>
    </CommandList>
  )
}

interface SuggestedTicketsProps {
  inProgressTickets: JiraTicket[]
  otherTickets: JiraTicket[]
  isLoadingInProgress?: boolean
}

function SuggestedTickets({
  inProgressTickets,
  otherTickets,
  isLoadingInProgress
}: SuggestedTicketsProps) {
  const hasTickets = inProgressTickets.length + otherTickets.length > 0

  if (!hasTickets) {
    return (
      <CommandEmpty>
        {isLoadingInProgress
          ? 'Loading your in-progress issues...'
          : 'Suggested issues will appear once we sync with Jira'}
      </CommandEmpty>
    )
  }

  return (
    <>
      {inProgressTickets.length ? (
        <CommandGroup heading="In Progress">
          {inProgressTickets.map((ticket) => (
            <TicketItem key={ticket.key} ticket={ticket} />
          ))}
        </CommandGroup>
      ) : null}

      {inProgressTickets.length && otherTickets.length ? (
        <CommandSeparator />
      ) : null}

      {otherTickets.length ? (
        <CommandGroup heading="Recommend for you">
          {otherTickets.map((ticket) => (
            <TicketItem key={ticket.key} ticket={ticket} />
          ))}
        </CommandGroup>
      ) : null}
    </>
  )
}
