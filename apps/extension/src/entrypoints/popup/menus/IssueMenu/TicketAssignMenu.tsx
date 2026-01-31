import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading,
  useCommandState
} from '@internal/ui/components/command'

import { TicketActionHeading } from '@/components'
import { Action, ActionLoading, ActionUser } from '@/components/actions'
import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useMutationAssignIssue } from '@/hooks/useMutationAssignIssue'
import { AssigneeAvatar } from '~/components/ui/jira'

import { useCurrentTicket, useCurrentTicketKey } from './useCurrentTicket'

export function TicketAssignMenu() {
  const ticketKey = useCurrentTicketKey()
  const { data: ticket } = useCurrentTicket()
  const { data: editMeta, isLoading: isLoadingEditMeta } =
    useIssueEditMeta(ticketKey)
  const search = useCommandState((state) => state.search)

  const assigneeAutoCompleteUrl =
    editMeta?.fields?.assignee?.autoCompleteUrl || ''
  const { data: users, isLoading: isLoadingUsers } = useAutoCompleteUsers(
    assigneeAutoCompleteUrl,
    search
  )
  const { mutate: assignTicket } = useMutationAssignIssue()

  const unassignAction = (
    <Action
      value="assignee-none"
      prefix={<AssigneeAvatar assignee={null} />}
      title="No assignee"
      onSelect={() => assignTicket({ ticketKey, assignee: null })}
    />
  )

  const isLoading = isLoadingUsers || isLoadingEditMeta

  function renderList() {
    if (isLoading) return <CommandLoading>Loading...</CommandLoading>

    return users?.map((user) => {
      const identifier =
        user.accountId || user.emailAddress || user.displayName || 'assignee'
      const displayName =
        user.displayName || user.name || user.emailAddress || 'Anonymous'

      return (
        <ActionUser
          key={identifier}
          value={`${displayName} ${identifier}`}
          user={user}
          onSelect={() => assignTicket({ ticketKey, assignee: user })}
        />
      )
    })
  }

  return (
    <CommandList>
      <ActionLoading isLoading={isLoading} />
      {ticket && <TicketActionHeading ticket={ticket} />}
      <CommandGroup heading="Assign to...">
        {unassignAction}
        {renderList()}
      </CommandGroup>
      {!isLoading && <CommandEmpty>No matching users</CommandEmpty>}
    </CommandList>
  )
}
