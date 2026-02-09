import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@internal/ui/components/command'
import { ZodString } from 'zod'

import { useHotkey } from '@/lib/hotkeys'
import { formatDateTimeDisplay, formatDateTimeISO } from '@/utils/date-format'

import { FieldInputComponentProps } from '../../../types'

import { parseNaturalDateTime, toJiraDateTime } from './dateParsing'

export const DateTimeInput = (props: FieldInputComponentProps<ZodString>) => {
  const { adapter, context, onChange, onConfirm, search } = props

  const parsedDateTime = useMemo(() => {
    const trimmed = search?.trim()
    if (!trimmed) return null
    return parseNaturalDateTime(trimmed)
  }, [search])

  const displayDateTime = useMemo(() => {
    if (!parsedDateTime) return null
    return formatDateTimeDisplay(parsedDateTime)
  }, [parsedDateTime])

  const handleSelect = () => {
    const trimmed = search?.trim()
    if (!trimmed) {
      onChange(null)
      onConfirm()
      return
    }

    if (parsedDateTime) {
      onChange(toJiraDateTime(parsedDateTime))
    } else {
      // Keep raw input for backward compatibility
      onChange(trimmed)
    }
    onConfirm()
  }

  useHotkey('field.confirm-simple', handleSelect)

  return (
    <CommandList>
      <CommandGroup heading={adapter.title ?? context.metadata.name}>
        {!search?.trim() ? (
          <CommandEmpty>
            {`Type a date/time (e.g., "tomorrow at 3pm", "next friday 9am")`}
          </CommandEmpty>
        ) : parsedDateTime && displayDateTime ? (
          <CommandItem value={search} onSelect={handleSelect}>
            <div className="flex flex-col">
              <span className="font-medium">{displayDateTime}</span>
              <span className="text-muted-foreground text-xs">
                {formatDateTimeISO(parsedDateTime)}
              </span>
            </div>
          </CommandItem>
        ) : (
          <CommandEmpty>Invalid date/time format</CommandEmpty>
        )}
      </CommandGroup>
    </CommandList>
  )
}
