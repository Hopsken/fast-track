import { CommandGroup, CommandList } from '@internal/ui/components/command'

import { DevActionRefreshSuggestions } from '@/components/DevActionRefreshSuggestions'
import { DevOnly } from '@/components/DevOnly'
import { TicketItem, TicketList } from '@/components/tickets'
import { useIssueSuggestions } from '@/hooks/useIssueSuggestions'
import { IssueSuggestion } from '@/services/ticket-service'
import { openOptionsPage } from '@/utils'
import {
  useIsSearching,
  useSearchQuery,
  useSearchResults
} from '~/stores/useTicketStore'

export function SearchResultMenu() {
  const searchQuery = useSearchQuery()
  const isSearching = useIsSearching()
  const searchResults = useSearchResults()

  const shouldShowSuggestions = !searchQuery.trim()

  const { data: issueSuggestions } = useIssueSuggestions()

  const handleOpenOptionsPage = () => {
    openOptionsPage()
    window.close()
  }

  return (
    <CommandList aria-label="Ticket search results">
      {shouldShowSuggestions ? (
        <SuggestedTickets issues={issueSuggestions} />
      ) : (
        <TicketList
          searchQuery={searchQuery}
          isSearching={isSearching}
          tickets={searchResults}
          onOpenOptionsPage={handleOpenOptionsPage}
        />
      )}

      <DevOnly>
        <DevActionRefreshSuggestions />
      </DevOnly>
    </CommandList>
  )
}

interface SuggestedTicketsProps {
  issues?: IssueSuggestion
}

function SuggestedTickets({ issues }: SuggestedTicketsProps) {
  return (
    <>
      {issues?.inProgress ? (
        <CommandGroup heading="In Progress">
          {issues.inProgress.map((ticket) => (
            <TicketItem key={ticket.key} ticket={ticket} />
          ))}
        </CommandGroup>
      ) : null}
      {issues?.activeSprintTodo ? (
        <CommandGroup heading="Upcoming">
          {issues.activeSprintTodo.map((ticket) => (
            <TicketItem key={ticket.key} ticket={ticket} />
          ))}
        </CommandGroup>
      ) : null}
    </>
  )
}
