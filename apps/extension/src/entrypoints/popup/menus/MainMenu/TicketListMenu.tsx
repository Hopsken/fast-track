import { useCommandState } from '@internal/ui/components/command'
import { compact } from 'lodash-es'

import { ActionGroup, ActionList } from '@/common/commands'
import { TicketItem } from '@/components/tickets'
import { useIssueSuggestions } from '@/hooks/useIssueSuggestions'
import { useHotkey } from '@/lib/hotkeys'
import { IssueSuggestion } from '@/services/suggestion-service'
import { JiraIssue } from '@/types'
import { isTicketKey } from '@/utils/jira/issues'

import { useIssueMenus } from '../IssueMenu'

import { SearchResultMenu } from './SearchResultMenu'

export function TicketListMenu({ searchQuery }: { searchQuery: string }) {
  const shouldShowSuggestions = !searchQuery.trim()

  const { data: issueSuggestions, isLoading } = useIssueSuggestions()

  useQuickNavigate()

  return shouldShowSuggestions ? (
    <SuggestedTickets issues={issueSuggestions} isLoading={isLoading} />
  ) : (
    <SearchResultMenu
      searchQuery={searchQuery}
      suggestions={issueSuggestions}
    />
  )
}

interface SuggestedTicketsProps {
  isLoading?: boolean
  issues?: IssueSuggestion
}

function SuggestedTickets({ isLoading, issues }: SuggestedTicketsProps) {
  const getTickets = (keys?: string[]) =>
    compact(keys?.map((ticketKey) => issues?.tickets[ticketKey])) ?? []

  function renderGroup(heading: string, tickets?: JiraIssue[]) {
    if (!tickets?.length) return null

    return (
      <ActionGroup heading={heading}>
        {tickets.map((ticket) => (
          <TicketItem key={ticket.key} ticket={ticket} source="suggestion" />
        ))}
      </ActionGroup>
    )
  }
  return (
    <ActionList isLoading={isLoading}>
      {renderGroup('In Progress', getTickets(issues?.inProgress))}
      {renderGroup('Upcoming', getTickets(issues?.todo))}
      {renderGroup('Done', getTickets(issues?.done))}
      {renderGroup('Recommend for you', getTickets(issues?.recommend))}
    </ActionList>
  )
}

function useQuickNavigate() {
  const ticketKey = useCommandState((s) => s.value)

  const issueMenus = useIssueMenus()

  useHotkey('issue.status', () => {
    if (!isTicketKey(ticketKey)) return
    issueMenus.openIssueStatusMenu(ticketKey)
  })

  useHotkey('issue.priority', () => {
    if (!isTicketKey(ticketKey)) return
    issueMenus.openIssuePriorityMenu(ticketKey)
  })

  useHotkey('issue.assign', () => {
    if (!isTicketKey(ticketKey)) return
    issueMenus.openIssueAssignMenu(ticketKey)
  })
}
