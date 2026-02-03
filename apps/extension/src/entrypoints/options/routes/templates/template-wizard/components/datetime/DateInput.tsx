import { Input } from '@internal/ui/components/input'

import type { DateInputProps } from '../../types'

/**
 * Date input component using HTML5 date picker.
 * Returns date in YYYY-MM-DD format (Jira-compatible).
 */
export function DateInput({ value, onChange, field }: DateInputProps) {
  return (
    <div className="space-y-1">
      <Input
        type="date"
        value={value ?? ''}
        onChange={(e) => {
          const newValue = e.target.value
          onChange(newValue.length > 0 ? newValue : undefined)
        }}
        aria-label={field?.name ?? 'Date'}
      />
      <p className="text-muted-foreground text-xs">Format: YYYY-MM-DD</p>
    </div>
  )
}
