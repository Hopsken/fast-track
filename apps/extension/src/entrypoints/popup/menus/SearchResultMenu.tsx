import { CommandGroup, CommandList } from '@internal/ui/components/command'

import { TicketItem, TicketList } from '@/components/tickets'
import { useIssueSuggestions } from '@/hooks/useIssueSuggestions'
import { IssueSuggestion } from '@/services/ticket-service'
import { JiraTicket } from '@/types'
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

  return (
    <CommandList aria-label="Ticket search results">
      {shouldShowSuggestions ? (
        <SuggestedTickets issues={issueSuggestions} />
      ) : (
        <TicketList
          searchQuery={searchQuery}
          isSearching={isSearching}
          tickets={searchResults}
        />
      )}

    </CommandList>
  )
}

interface SuggestedTicketsProps {
  issues?: IssueSuggestion
}

function SuggestedTickets({ issues }: SuggestedTicketsProps) {
  function renderGroup(
    heading: string,
    tickets?: JiraTicket[],
    showAvatar = true
  ) {
    if (!tickets?.length) return null

    return (
      <CommandGroup heading={heading}>
        {tickets.map((ticket) => (
          <TicketItem
            key={ticket.key}
            ticket={ticket}
            showAvatar={showAvatar}
            source="suggestion"
          />
        ))}
      </CommandGroup>
    )
  }
  return (
    <>
      {renderGroup('In Progress', issues?.inProgress, false)}
      {renderGroup('Upcoming', issues?.activeSprintTodo, false)}
      {renderGroup('Recommend for you', issues?.viewHistory)}
    </>
  )
}
