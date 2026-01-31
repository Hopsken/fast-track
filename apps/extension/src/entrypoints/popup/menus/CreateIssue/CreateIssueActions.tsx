import { CommandGroup, CommandItem } from '@internal/ui/components/command'
import { Plus } from 'lucide-react'

export interface CreateIssueActionsProps {
  onSubmit: () => void
  disabled?: boolean
}

export function CreateIssueActions({
  onSubmit,
  disabled
}: CreateIssueActionsProps) {
  return (
    <CommandGroup>
      <CommandItem
        value="create-issue-submit"
        onSelect={onSubmit}
        disabled={disabled}>
        <Plus className="mr-2 size-4 shrink-0" />
        <span>Create issue</span>
        <span className="text-muted-foreground ml-auto text-xs">⌘ Enter</span>
      </CommandItem>
    </CommandGroup>
  )
}
