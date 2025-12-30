import { CommandGroup, CommandList } from '@internal/ui/components/command'

import { ActionLoading } from '@/components/actions'
import { TicketItem, TicketList } from '@/components/tickets'
import { useIssueSuggestions } from '@/hooks/useIssueSuggestions'
import { useSearchQuery, useTicketSearch } from '@/hooks/useTicketSearch'
import { IssueSuggestion } from '@/services/ticket-service'
import { JiraTicket } from '@/types'

export function SearchResultMenu() {
  const searchQuery = useSearchQuery()
  const shouldShowSuggestions = !searchQuery.trim()

  const { data: searchResults = [], isFetching: isSearching } =
    useTicketSearch()
  const { data: issueSuggestions, isLoading } = useIssueSuggestions()

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
      <ActionLoading isLoading={isLoading || isSearching} />
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
