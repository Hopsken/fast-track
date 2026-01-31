import { CommandGroup, CommandItem } from '@internal/ui/components/command'
import { AlertTriangle } from 'lucide-react'

export interface ConflictWarningProps {
  missingFieldNames: string[]
  onDismiss: () => void
}

export function ConflictWarning({
  missingFieldNames,
  onDismiss
}: ConflictWarningProps) {
  if (missingFieldNames.length === 0) return null

  return (
    <CommandGroup heading="⚠️ Template Issue">
      <CommandItem
        value="dismiss-warning"
        onSelect={onDismiss}
        className="text-amber-700">
        <AlertTriangle className="mr-2 size-4 shrink-0" />
        <div className="flex-1">
          <div className="font-medium">Some required fields are missing</div>
          <div className="text-muted-foreground text-xs">
            {missingFieldNames.join(', ')}
          </div>
        </div>
      </CommandItem>
    </CommandGroup>
  )
}
