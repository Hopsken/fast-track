import { Input } from '@internal/ui/components/input'
import { ZodString } from 'zod'

import { FieldConfigComponentProps } from '@/common/fields/types'

export function DateTimeInput({
  value,
  onValueChange,
  context
}: FieldConfigComponentProps<ZodString>) {
  // Convert from Jira format (ISO 8601) to datetime-local format (YYYY-MM-DDTHH:mm)
  const displayValue = value

  return (
    <div className="space-y-1">
      <Input
        type="datetime-local"
        value={displayValue}
        onChange={(e) => {
          const newValue = e.target.value
          if (newValue.length === 0) {
            onValueChange(null)
            return
          }

          // Convert from datetime-local format to ISO 8601
          try {
            const date = new Date(newValue)
            if (!isNaN(date.getTime())) {
              // Format as ISO 8601 with UTC timezone for Jira
              const isoString = date
                .toISOString()
                .replace(/\.\d{3}Z$/, '.000+0000')
              onValueChange(isoString)
            }
          } catch {
            onValueChange(null)
          }
        }}
        aria-label={context.metadata.name ?? 'Date and Time'}
      />
      <p className="text-muted-foreground text-xs">Select date and time</p>
    </div>
  )
}
