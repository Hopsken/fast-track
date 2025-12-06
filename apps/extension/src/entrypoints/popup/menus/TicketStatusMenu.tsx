import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'

import { Action } from '@/components/actions'
import { useIssueTransitions } from '@/hooks/useIssueTransitions'
import { useMutationTransitionIssue } from '@/hooks/useMutationTransitionIssue'
import { JiraTicket, JiraTransition } from '@/types'

export function TicketStatusMenu({ ticket }: { ticket: JiraTicket }) {
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
    if (isLoading) return <CommandLoading>Loading...</CommandLoading>

    return transitions?.map((transition) => (
      <Action
        key={transition.id}
        title={formattedTitle(transition)}
        onSelect={() => transitionIssue({ ticket, transition })}
      />
    ))
  }

  return (
    <CommandList>
      {!isLoading && <CommandEmpty>No available transitions</CommandEmpty>}
      <CommandGroup heading="Change status...">{renderList()}</CommandGroup>
    </CommandList>
  )
}
