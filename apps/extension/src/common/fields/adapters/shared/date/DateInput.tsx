import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@internal/ui/components/command'
import { ZodString } from 'zod'

import { useHotkey } from '@/lib/hotkeys'
import { formatDateDisplay } from '@/utils/date-format'

import { FieldInputComponentProps } from '../../../types'

import { parseNaturalDate, toJiraDate } from './dateParsing'

export const DateInput = (props: FieldInputComponentProps<ZodString>) => {
  const { adapter, context, onChange, onConfirm, search } = props

  const parsedDate = useMemo(() => {
    const trimmed = search?.trim()
    if (!trimmed) return null
    return parseNaturalDate(trimmed)
  }, [search])

  const displayDate = useMemo(() => {
    if (!parsedDate) return null
    return formatDateDisplay(parsedDate)
  }, [parsedDate])

  const handleSelect = () => {
    const trimmed = search?.trim()
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
    <CommandList>
      {!search?.trim() && (
        <CommandEmpty>
          {`Type a date (e.g., "tomorrow", "next friday")`}
        </CommandEmpty>
      )}
      <CommandGroup heading={adapter.title ?? context.metadata.name}>
        {parsedDate && displayDate ? (
          <CommandItem value={search} onSelect={handleSelect}>
            <div className="flex flex-col">
              <span className="font-medium">{displayDate}</span>
              <span className="text-muted-foreground text-xs">
                {toJiraDate(parsedDate)}
              </span>
            </div>
          </CommandItem>
        ) : (
          <CommandEmpty>Invalid date format</CommandEmpty>
        )}
      </CommandGroup>
    </CommandList>
  )
}
