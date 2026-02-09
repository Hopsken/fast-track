import {
  CommandGroup,
  CommandList,
  CommandPanel,
  useCommandSearch
} from '@/common/commands'
import { Action } from '@/common/commands/actions'
import { ActionUser } from '@/components/actions'
import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useMutationAssignIssue } from '@/hooks/useMutationAssignIssue'
import { AssigneeAvatar } from '~/components/ui/jira'

export function IssueAssignMenu({ ticketKey }: { ticketKey: string }) {
  return (
    <CommandPanel>
      <IssueAssignMenuInner ticketKey={ticketKey} />
    </CommandPanel>
  )
}

function IssueAssignMenuInner({ ticketKey }: { ticketKey: string }) {
  const { data: editMeta, isLoading: isLoadingEditMeta } =
    useIssueEditMeta(ticketKey)
  const search = useCommandSearch()

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
    <CommandList isLoading={isLoading} emptyPlaceholder="No matching users">
      <CommandGroup heading="Assign to...">
        {unassignAction}
        {renderList()}
      </CommandGroup>
    </CommandList>
  )
}
