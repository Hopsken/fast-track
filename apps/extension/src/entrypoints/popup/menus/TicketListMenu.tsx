import { CommandGroup, CommandList } from '@internal/ui/components/command'
import { compact } from 'lodash-es'

import { ActionLoading } from '@/components/actions'
import { TicketItem } from '@/components/tickets'
import { useIssueSuggestions } from '@/hooks/useIssueSuggestions'
import { useSearchQuery } from '@/hooks/useTicketSearch'
import { IssueSuggestion } from '@/services/ticket-service'
import { JiraTicket } from '@/types'

import { SearchResultMenu } from './SearchResultMenu'

export function TicketListMenu() {
  const searchQuery = useSearchQuery()
  const shouldShowSuggestions = !searchQuery.trim()

  const { data: issueSuggestions, isLoading } = useIssueSuggestions()

  return (
    <CommandList aria-label="Ticket search results">
      {shouldShowSuggestions ? (
        <SuggestedTickets issues={issueSuggestions} />
      ) : (
        <SearchResultMenu suggestions={issueSuggestions} />
      )}
      <ActionLoading isLoading={isLoading} />
    </CommandList>
  )
}

interface SuggestedTicketsProps {
  issues?: IssueSuggestion
}

function SuggestedTickets({ issues }: SuggestedTicketsProps) {
  const getTickets = (keys?: string[]) =>
    compact(keys?.map((ticketKey) => issues?.tickets[ticketKey])) ?? []

  function renderGroup(heading: string, tickets?: JiraTicket[]) {
    if (!tickets?.length) return null

    return (
      <CommandGroup heading={heading}>
        {tickets.map((ticket) => (
          <TicketItem key={ticket.key} ticket={ticket} source="suggestion" />
        ))}
      </CommandGroup>
    )
  }
  return (
    <>
      {renderGroup('In Progress', getTickets(issues?.inProgress))}
      {renderGroup('Upcoming', getTickets(issues?.todo))}
      {renderGroup('Recommend for you', getTickets(issues?.related))}
    </>
  )
}
