import { useMemo, useState } from 'react'
import { ZodString } from 'zod'

import {
  ActionGroup,
  ActionItem,
  ActionList,
  ActionPanel
} from '@/common/commands'
import { useHotkey } from '@/lib/hotkeys'
import { formatDateTimeDisplay, formatDateTimeISO } from '@/utils/date-format'

import { FieldInputComponentProps } from '../../../types'

import { parseNaturalDateTime, toJiraDateTime } from './dateParsing'

export const DateTimeInput = (props: FieldInputComponentProps<ZodString>) => {
  const { adapter, context, onChange, onConfirm } = props

  const [search, setSearch] = useState('')

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
    <ActionPanel
      searchPlaceholder="Type a date/time (e.g., 'tomorrow at 3pm', 'next friday 9am')"
      value={search}
      search={search}
      onSearchChange={setSearch}>
      <ActionList emptyPlaceholder="invalid date/time format">
        <ActionGroup heading={adapter.title ?? context.metadata.name}>
          {parsedDateTime && displayDateTime ? (
            <ActionItem value={search} onSelect={handleSelect}>
              <div className="flex flex-col">
                <span className="font-medium">{displayDateTime}</span>
                <span className="text-muted-foreground text-xs">
                  {formatDateTimeISO(parsedDateTime)}
                </span>
              </div>
            </ActionItem>
          ) : null}
        </ActionGroup>
      </ActionList>
    </ActionPanel>
  )
}
