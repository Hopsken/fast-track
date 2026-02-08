import { useMemo } from 'react'
import { Calendar } from '@internal/ui/components/calendar'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@internal/ui/components/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@internal/ui/components/popover'
import { CalendarIcon } from 'lucide-react'
import { z, ZodString } from 'zod'

import { FieldConfigComponentProps, SelectComponentProps } from '../../../types'
import { isSchemaMulti } from '../../../utils'
import { GenericFieldConfig } from '../GenericFieldConfig'
import { Unsupported } from '../Unsupported'

import { parseJiraDate, toJiraDate } from './dateParsing'

const DateSelect = ({ value, onChange }: SelectComponentProps<string>) => {
  const singleValue = Array.isArray(value) || value == null ? '' : value
  const selectedDate = useMemo(() => parseJiraDate(singleValue), [singleValue])

  return (
    <InputGroup>
      <InputGroupInput
        placeholder="YYYY-MM-DD"
        value={singleValue}
        onChange={(e) => {
          const nextValue = e.target.value.trim()
          if (!nextValue) {
            onChange(null)
            return
          }

          onChange(z.iso.date().safeParse(nextValue).data ?? null)
        }}
      />
      <InputGroupAddon align="inline-start">
        <Popover>
          <PopoverTrigger asChild>
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label="Select date">
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate ?? undefined}
              onSelect={(date) => {
                if (date == null) {
                  onChange(null)
                  return
                }

                onChange(toJiraDate(date))
              }}
              defaultMonth={selectedDate ?? undefined}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  )
}

export const DateFieldConfig = (
  props: FieldConfigComponentProps<ZodString>
) => {
  if (isSchemaMulti(props.context.metadata)) {
    return <Unsupported context={props.context} />
  }

  return <GenericFieldConfig {...props} SelectorComponent={DateSelect} />
}
