import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading,
  useCommandState
} from '@internal/ui/components/command'

import { Action, ActionUser } from '@/components/actions'
import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useMutationAssignIssue } from '@/hooks/useMutationAssignIssue'
import { JiraTicket } from '@/types'
import { AssigneeAvatar } from '~/components/ui/jira'

export function TicketAssignMenu({ ticket }: { ticket: JiraTicket }) {
  const { data: editMeta, isLoading: isLoadingEditMeta } =
    useIssueEditMeta(ticket)
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
      prefix={<AssigneeAvatar assignee={null} />}
      title="No assignee"
      onSelect={() => assignTicket({ ticket, assignee: null })}
    />
  )

  const isLoading = isLoadingUsers || isLoadingEditMeta

  function renderList() {
    if (isLoading) return <CommandLoading>Loading...</CommandLoading>

    return users?.map((user) => (
      <ActionUser
        key={user.accountId || user.emailAddress || user.displayName}
        user={user}
        onSelect={() => assignTicket({ ticket, assignee: user })}
      />
    ))
  }

  return (
    <CommandList>
      {!isLoading && <CommandEmpty>No matching users</CommandEmpty>}
      <CommandGroup heading="Assign to...">
        {unassignAction}
        {renderList()}
      </CommandGroup>
    </CommandList>
  )
}
