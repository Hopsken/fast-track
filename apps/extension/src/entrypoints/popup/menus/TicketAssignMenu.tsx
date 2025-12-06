import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading,
  useCommandState
} from '@internal/ui/components/command'

import { ActionUser } from '@/components/actions'
import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useMutationAssignIssue } from '@/hooks/useMutationAssignIssue'
import { JiraTicket } from '@/types'

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

  const isLoading = isLoadingUsers || isLoadingEditMeta

  function renderList() {
    if (isLoading) return <CommandLoading>Loading...</CommandLoading>
    if (!users?.length) return <CommandEmpty>No matching users</CommandEmpty>

    return users.map((user) => (
      <ActionUser
        key={user.accountId || user.emailAddress || user.displayName}
        user={user}
        onSelect={() => assignTicket({ ticket, assignee: user })}
      />
    ))
  }

  return (
    <CommandList>
      <CommandGroup heading="Assign to...">{renderList()}</CommandGroup>
    </CommandList>
  )
}
