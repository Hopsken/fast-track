import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'

import { TicketActionHeading } from '@/components'
import { Action, ActionLoading } from '@/components/actions'
import { useIssuePriorities } from '@/hooks/useIssuePriorities'
import { useMutationUpdatePriority } from '@/hooks/useMutationUpdatePriority'
import { PriorityIcon } from '~/components/ui/jira'

import { useCurrentTicket, useCurrentTicketKey } from './useCurrentTicket'

export function TicketPriorityMenu() {
  const ticketKey = useCurrentTicketKey()
  const { data: ticket } = useCurrentTicket()
  const { data: priorities, isLoading } = useIssuePriorities()
  const { mutate: updatePriority } = useMutationUpdatePriority()

  function renderList() {
    if (isLoading) return <CommandLoading>Loading...</CommandLoading>

    return priorities?.map((priority) => (
      <Action
        key={priority.id || priority.name}
        value={priority.name || priority.id || 'priority'}
        prefix={<PriorityIcon priority={priority} />}
        title={priority.name}
        onSelect={() => updatePriority({ ticketKey, priority })}
      />
    ))
  }

  return (
    <CommandList>
      {ticket && <TicketActionHeading ticket={ticket} />}
      <CommandGroup heading="Change priority...">{renderList()}</CommandGroup>
      <ActionLoading isLoading={isLoading} />
      {!isLoading && <CommandEmpty>No priorities</CommandEmpty>}
    </CommandList>
  )
}
