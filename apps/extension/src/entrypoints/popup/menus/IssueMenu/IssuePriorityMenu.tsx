import { CommandGroup, CommandList, CommandPanel } from '@/common/commands'
import { Action } from '@/common/commands/actions'
import { useIssuePriorities } from '@/hooks/useIssuePriorities'
import { useMutationUpdatePriority } from '@/hooks/useMutationUpdatePriority'
import { PriorityIcon } from '~/components/ui/jira'

export function IssuePriorityMenu({ ticketKey }: { ticketKey: string }) {
  const { data: priorities, isLoading } = useIssuePriorities()
  const { mutate: updatePriority } = useMutationUpdatePriority()

  function renderList() {
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
    <CommandPanel>
      <CommandList emptyPlaceholder="No priorities" isLoading={isLoading}>
        <CommandGroup heading="Change priority...">{renderList()}</CommandGroup>
      </CommandList>
    </CommandPanel>
  )
}
