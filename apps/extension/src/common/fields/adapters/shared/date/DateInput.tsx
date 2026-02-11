import { useMemo, useState } from 'react'
import { ZodString } from 'zod'

import {
  ActionPanel,
  ActionGroup,
  ActionItem,
  ActionList
} from '@/common/commands'
import { useHotkey } from '@/lib/hotkeys'
import { formatDateDisplay } from '@/utils/date-format'

import { FieldInputComponentProps } from '../../../types'

import { parseNaturalDate, toJiraDate } from './dateParsing'

export const DateInput = (props: FieldInputComponentProps<ZodString>) => {
  const { adapter, context, value, onChange, onConfirm } = props

  const [search, setSearch] = useState('')

  const parsedDate = useMemo(() => {
    const trimmed = search.trim()
    if (!trimmed) return null
    return parseNaturalDate(trimmed)
  }, [search])

  const displayDate = useMemo(() => {
    if (!parsedDate) return null
    return formatDateDisplay(parsedDate)
  }, [parsedDate])

  const handleSelect = () => {
    const trimmed = search.trim()
    if (!trimmed) {
      onChange(null)
      onConfirm()
      return
    }

    if (parsedDate) {
      onChange(toJiraDate(parsedDate))
    } else {
      // Keep raw input for backward compatibility
      onChange(trimmed)
    }
    onConfirm()
  }

  useHotkey('field.confirm-simple', handleSelect)

  return (
    <ActionPanel
      searchPlaceholder='Type a date (e.g., "tomorrow", "next friday")'
      value={value}
      search={search}
      onSearchChange={setSearch}>
      <ActionList emptyPlaceholder="Invalid date format">
        <ActionGroup heading={adapter.title ?? context.metadata.name}>
          {parsedDate && displayDate ? (
            <ActionItem value={search} onSelect={handleSelect}>
              <div className="flex flex-col">
                <span className="font-medium">{displayDate}</span>
                <span className="text-muted-foreground text-xs">
                  {toJiraDate(parsedDate)}
                </span>
              </div>
            </ActionItem>
          ) : null}
        </ActionGroup>
      </ActionList>
    </ActionPanel>
  )
}
