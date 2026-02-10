import {
  Action,
  CommandGroup,
  CommandList,
  ActionPanel
} from '@/common/commands'
import { useIssueTransitions } from '@/hooks/useIssueTransitions'
import { useMutationTransitionIssue } from '@/hooks/useMutationTransitionIssue'
import { useTicketDetails } from '@/hooks/useTicketDetails'
import { JiraIssue, JiraTransition } from '@/types'

export function IssueStatusMenu({ ticketKey }: { ticketKey: string }) {
  const { data: ticketData, isLoading } = useTicketDetails(ticketKey)
  return (
    <ActionPanel isLoading={isLoading}>
      {ticketData ? <IssueStatusMenuInner ticket={ticketData} /> : null}
    </ActionPanel>
  )
}

function IssueStatusMenuInner({ ticket }: { ticket: JiraIssue }) {
  const { data: transitions, isLoading } = useIssueTransitions(ticket)
  const { mutate: transitionIssue } = useMutationTransitionIssue()

  function formattedTitle(transition: JiraTransition): string {
    if (!transition.name) {
      return 'Unknown status name'
    }
    if (!transition.to.name) {
      return transition.name
    }
    if (transition.name === transition.to.name) {
      return transition.name
    }
    return `${transition.name} -> ${transition.to.name}`
  }

  function renderList() {
    if (!transitions) return null

    return transitions
      .filter((transition) => transition.to.id !== ticket.status.id)
      .map((transition) => {
        const title = formattedTitle(transition)
        const value = `${transition.id || ''} ${title}`.trim()

        return (
          <Action
            key={transition.id}
            value={value}
            title={title}
            onSelect={() => transitionIssue({ ticket, transition })}
          />
        )
      })
  }

  return (
    <CommandList
      isLoading={isLoading}
      emptyPlaceholder="No available transitions">
      <CommandGroup heading="Change status...">{renderList()}</CommandGroup>
    </CommandList>
  )
}
