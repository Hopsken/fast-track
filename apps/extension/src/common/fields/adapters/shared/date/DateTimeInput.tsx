import { useMemo, useState } from 'react'
import { ZodString } from 'zod'

import {
  ActionGroup,
  ActionItem,
  ActionList,
  ActionPanel
} from '@/common/commands'
import { formatDateTimeDisplay, formatDateTimeISO } from '@/utils/date-format'

import { FieldInputComponentProps } from '../../../types'
import { GenericSelectInput } from '../select/GenericSelectInput'

import { parseNaturalDateTime, toJiraDateTime } from './dateParsing'
import { resolveTemporalValue } from './resolvePreset'

export const DateTimeInput = (props: FieldInputComponentProps<ZodString>) => {
  const { onChange, onConfirm } = props

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

  // TU-56: restricted mode — resolve preset keys to ISO at selection time
  if (
    props.config?.behavior === 'restricted' &&
    props.config.allowedOptions?.length
  ) {
    return (
      <GenericSelectInput
        {...props}
        onChange={(next) => {
          if (typeof next !== 'string') return onChange(next as null)
          const result = resolveTemporalValue(next, 'datetime')
          return onChange((result.ok ? result.iso : next) as string)
        }}
      />
    )
  }

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
      onChange(trimmed)
    }
    onConfirm()
  }

  const emptyPlaceholder = search.trim() ? 'Invalid date/time format' : ''

  return (
    <ActionPanel
      searchPlaceholder="Type a date/time (e.g., 'tomorrow at 3pm', 'next friday 9am')"
      value={search}
      search={search}
      onSearchChange={setSearch}
      onSearchConfirm={handleSelect}>
      <ActionList emptyPlaceholder={emptyPlaceholder}>
        <ActionGroup>
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
