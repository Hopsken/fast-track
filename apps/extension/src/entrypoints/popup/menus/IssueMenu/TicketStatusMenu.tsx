import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'

import { TicketActionHeading } from '@/components'
import { Action, ActionLoading } from '@/components/actions'
import { useIssueTransitions } from '@/hooks/useIssueTransitions'
import { useMutationTransitionIssue } from '@/hooks/useMutationTransitionIssue'
import { JiraTicket, JiraTransition } from '@/types'

import { useCurrentTicket } from './useCurrentTicket'

export function TicketStatusMenu() {
  const { data: ticket } = useCurrentTicket()
  if (!ticket) return null
  return <TicketStatusMenuInner ticket={ticket} />
}

function TicketStatusMenuInner({ ticket }: { ticket: JiraTicket }) {
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
    <CommandList>
      <ActionLoading isLoading={isLoading} />
      <TicketActionHeading ticket={ticket} />
      <CommandGroup heading="Change status...">{renderList()}</CommandGroup>
      {!isLoading && <CommandEmpty>No available transitions</CommandEmpty>}
    </CommandList>
  )
}
