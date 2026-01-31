import {
  CommandGroup,
  CommandList,
  useCommandState
} from '@internal/ui/components/command'
import { compact } from 'lodash-es'
import { useNavigate } from 'react-router-dom'

import { ActionLoading } from '@/components/actions'
import { TicketItem } from '@/components/tickets'
import { useActionShortcut } from '@/hooks/useActionShortcut'
import { useIssueSuggestions } from '@/hooks/useIssueSuggestions'
import { IssueSuggestion } from '@/services/ticket-service'
import { useCommandSearch } from '@/stores/useCommandInputStore'
import { JiraTicket } from '@/types'
import { isTicketKey } from '@/utils/jira/issues'

import { CommandRoutes } from '../../routes'

import { SearchResultMenu } from './SearchResultMenu'

export function TicketListMenu() {
  const searchQuery = useCommandSearch()
  const shouldShowSuggestions = !searchQuery.trim()

  const { data: issueSuggestions, isLoading } = useIssueSuggestions()

  useQuickNavigate()

  return (
    <CommandList aria-label="Ticket search results">
      <ActionLoading isLoading={isLoading} />
      {shouldShowSuggestions ? (
        <SuggestedTickets issues={issueSuggestions} />
      ) : (
        <SearchResultMenu suggestions={issueSuggestions} />
      )}
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
      {renderGroup('Done', getTickets(issues?.done))}
      {renderGroup('Recommend for you', getTickets(issues?.recommend))}
    </>
  )
}

function useQuickNavigate() {
  const ticketKey = useCommandState((s) => s.value)
  const navigate = useNavigate()

  useActionShortcut(
    {
      Windows: { modifiers: ['alt', 'shift'], key: 's' },
      macOS: { modifiers: ['cmd', 'shift'], key: 's' }
    },
    () => {
      if (!isTicketKey(ticketKey)) return
      navigate(CommandRoutes.IssueStatus(ticketKey))
    }
  )

  useActionShortcut(
    {
      Windows: { modifiers: ['alt', 'shift'], key: 'p' },
      macOS: { modifiers: ['cmd', 'shift'], key: 'p' }
    },
    () => {
      if (!isTicketKey(ticketKey)) return
      navigate(CommandRoutes.IssuePriority(ticketKey))
    }
  )

  useActionShortcut(
    {
      Windows: { modifiers: ['alt', 'shift'], key: 'a' },
      macOS: { modifiers: ['cmd', 'shift'], key: 'a' }
    },
    () => {
      if (!isTicketKey(ticketKey)) return
      navigate(CommandRoutes.IssueAssign(ticketKey))
    }
  )
}
