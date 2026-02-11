import { AlertTriangle } from 'lucide-react'

import { ActionGroup, ActionItem } from '@/common/commands'

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
    <ActionGroup heading="⚠️ Template Issue">
      <ActionItem
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
      </ActionItem>
    </ActionGroup>
  )
}
