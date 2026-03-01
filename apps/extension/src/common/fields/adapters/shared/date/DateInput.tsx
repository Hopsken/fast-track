import { useMemo, useState } from 'react'
import { ZodString } from 'zod'

import {
  ActionGroup,
  ActionItem,
  ActionList,
  ActionPanel
} from '@/common/commands'
import { formatDateDisplay } from '@/utils/date-format'

import type { FieldInputComponentProps } from '../../../types'
import { GenericSelectInput } from '../select/GenericSelectInput'

import { parseNaturalDate, toJiraDate } from './dateParsing'
import { resolveTemporalValue } from './resolvePreset'

export const DateInput = (props: FieldInputComponentProps<ZodString>) => {
  const { value, onChange, onConfirm } = props

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
          const result = resolveTemporalValue(next, 'date')
          return onChange((result.ok ? result.iso : next) as string)
        }}
      />
    )
  }

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
      onChange(trimmed)
    }
    onConfirm()
  }

  return (
    <ActionPanel
      searchPlaceholder='Type a date (e.g., "tomorrow", "next friday")'
      value={value}
      search={search}
      onSearchChange={setSearch}
      onSearchConfirm={handleSelect}>
      <ActionList emptyPlaceholder="Invalid date format">
        <ActionGroup>
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
