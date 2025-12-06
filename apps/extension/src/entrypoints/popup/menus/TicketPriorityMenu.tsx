import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'

import { Action } from '@/components/actions'
import { useIssuePriorities } from '@/hooks/useIssuePriorities'
import { useMutationUpdatePriority } from '@/hooks/useMutationUpdatePriority'
import { JiraTicket } from '@/types'
import { PriorityIcon } from '~/components/ui/jira'

export function TicketPriorityMenu({ ticket }: { ticket: JiraTicket }) {
  const { data: priorities, isLoading } = useIssuePriorities()
  const { mutate: updatePriority } = useMutationUpdatePriority()

  function renderList() {
    if (isLoading) return <CommandLoading>Loading...</CommandLoading>

    return priorities?.map((priority) => (
      <Action
        key={priority.id || priority.name}
        prefix={<PriorityIcon priority={priority} />}
        title={priority.name}
        onSelect={() => updatePriority({ ticket, priority })}
      />
    ))
  }

  return (
    <CommandList>
      {!isLoading && <CommandEmpty>No priorities</CommandEmpty>}
      <CommandGroup heading="Change priority...">{renderList()}</CommandGroup>
    </CommandList>
  )
}
