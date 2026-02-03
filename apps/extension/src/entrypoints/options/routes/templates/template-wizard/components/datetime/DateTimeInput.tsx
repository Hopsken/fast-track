import { Input } from '@internal/ui/components/input'

import type { DateTimeInputProps } from '../../types'
import { parseDateTimeFromJira } from '../utils'

/**
 * DateTime input component using HTML5 datetime-local picker.
 * Handles conversion between Jira's ISO 8601 format and browser's datetime-local format.
 * Automatically converts browser input to Jira-compatible ISO 8601 format with UTC timezone.
 *
 * @component
 * @example
 * ```tsx
 * <DateTimeInput
 *   value="2024-12-31T23:59:59.000+0000"
 *   onChange={setDateTime}
 *   field={fieldMetadata}
 * />
 * ```
 *
 * @param {DateTimeInputProps} props - Component props
 * @param {string | undefined} props.value - Current datetime value in ISO 8601 format (Jira format)
 * @param {(v: string | undefined) => void} props.onChange - Callback when datetime changes, returns ISO 8601 format
 * @param {FieldMetadata} [props.field] - Field metadata for accessibility label
 * @returns {JSX.Element} DateTime input component with helper text
 */
export function DateTimeInput({ value, onChange, field }: DateTimeInputProps) {
  // Convert from Jira format (ISO 8601) to datetime-local format (YYYY-MM-DDTHH:mm)
  const displayValue = value ? (parseDateTimeFromJira(value) ?? '') : ''

  return (
    <div className="space-y-1">
      <Input
        type="datetime-local"
        value={displayValue}
        onChange={(e) => {
          const newValue = e.target.value
          if (newValue.length === 0) {
            onChange(undefined)
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
              onChange(isoString)
            }
          } catch {
            onChange(undefined)
          }
        }}
        aria-label={field?.name ?? 'Date and Time'}
      />
      <p className="text-muted-foreground text-xs">Select date and time</p>
    </div>
  )
}
