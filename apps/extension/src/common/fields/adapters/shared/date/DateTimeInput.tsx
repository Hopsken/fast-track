import { useMemo } from 'react'
import { ZodString } from 'zod'

import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandPanel,
  useCommandSearch
} from '@/common/commands'
import { useHotkey } from '@/lib/hotkeys'
import { formatDateTimeDisplay, formatDateTimeISO } from '@/utils/date-format'

import { FieldInputComponentProps } from '../../../types'

import { parseNaturalDateTime, toJiraDateTime } from './dateParsing'

const DateTimeInputInner = (props: FieldInputComponentProps<ZodString>) => {
  const { adapter, context, onChange, onConfirm } = props
  const search = useCommandSearch()

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
    <CommandList emptyPlaceholder="invalid date/time format">
      <CommandGroup heading={adapter.title ?? context.metadata.name}>
        {parsedDateTime && displayDateTime ? (
          <CommandItem value={search} onSelect={handleSelect}>
            <div className="flex flex-col">
              <span className="font-medium">{displayDateTime}</span>
              <span className="text-muted-foreground text-xs">
                {formatDateTimeISO(parsedDateTime)}
              </span>
            </div>
          </CommandItem>
        ) : null}
      </CommandGroup>
    </CommandList>
  )
}

export const DateTimeInput = (props: FieldInputComponentProps<ZodString>) => {
  return (
    <CommandPanel searchPlaceholder="Type a date/time (e.g., 'tomorrow at 3pm', 'next friday 9am')">
      <DateTimeInputInner {...props} />
    </CommandPanel>
  )
}
