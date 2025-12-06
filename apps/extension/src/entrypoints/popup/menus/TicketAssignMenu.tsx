import {
  CommandList,
  CommandGroup,
  useCommandState,
  CommandEmpty,
  CommandItem,
  CommandLoading
} from '@internal/ui/components/command'

import { ActionUser } from '@/components/actions'
import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { JiraTicket } from '@/types'

export function TicketAssignMenu({ ticket }: { ticket: JiraTicket }) {
  const { data: editMeta } = useIssueEditMeta(ticket)
  const search = useCommandState((state) => state.search)

  const assigneeAutoCompleteUrl =
    editMeta?.fields?.assignee?.autoCompleteUrl || ''
  const { data: users, isLoading: isLoadingUsers } = useAutoCompleteUsers(
    assigneeAutoCompleteUrl,
    search
  )

  return (
    <CommandList>
      <CommandGroup heading="Assign to...">
        {isLoadingUsers ? (
          <CommandLoading>Loading...</CommandLoading>
        ) : (
          users?.map((user) => (
            <ActionUser key={user.emailAddress} user={user} />
          ))
        )}
      </CommandGroup>
    </CommandList>
  )
}
