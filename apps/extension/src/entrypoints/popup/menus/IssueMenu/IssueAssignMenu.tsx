import {
  Action,
  ActionUser,
  ActionGroup,
  ActionList,
  ActionPanel
} from '@/common/commands'
import { useRouteState } from '@/common/commands/navigation'
import { useAutoCompleteUsers } from '@/hooks/useAutoComplete'
import { useIssueEditMeta } from '@/hooks/useIssueEditMeta'
import { useMutationAssignIssue } from '@/hooks/useMutationAssignIssue'
import { JiraUserSchema } from '@/repository/schema/jira/user'
import { AssigneeAvatar } from '~/components/ui/jira'

export function IssueAssignMenu({ ticketKey }: { ticketKey: string }) {
  const { data: editMeta, isLoading: isLoadingEditMeta } =
    useIssueEditMeta(ticketKey)

  const [search, setSearch] = useRouteState('search', '')

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
      const jiraUser = JiraUserSchema.parse(user)
      const identifier =
        jiraUser.accountId || jiraUser.emailAddress || jiraUser.displayName

      return (
        <ActionUser
          key={identifier}
          value={`${jiraUser.displayName} ${identifier}`}
          user={jiraUser}
          onSelect={() => assignTicket({ ticketKey, assignee: user })}
        />
      )
    })
  }

  return (
    <ActionPanel
      search={search}
      onSearchChange={setSearch}
      autoSelectSearchOnMount>
      <ActionList isLoading={isLoading} emptyPlaceholder="No matching users">
        <ActionGroup heading="Assign to...">
          {unassignAction}
          {renderList()}
        </ActionGroup>
      </ActionList>
    </ActionPanel>
  )
}
