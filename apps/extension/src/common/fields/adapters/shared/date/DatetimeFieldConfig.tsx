import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import { Calendar } from '@internal/ui/components/calendar'
import { Input } from '@internal/ui/components/input'
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
import { format, isValid, parseISO } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { ZodString } from 'zod'

import { FieldConfigComponentProps, SelectComponentProps } from '../../../types'
import { isSchemaMulti } from '../../../utils'
import { GenericFieldConfig } from '../GenericFieldConfig'
import { Unsupported } from '../Unsupported'

import { toJiraDateTime } from './dateParsing'

const parseDateTime = (raw: string) => {
  const value = raw.trim()
  if (!value) return null

  try {
    const parsed = parseISO(value)
    return isValid(parsed) ? parsed : null
  } catch {
    return null
  }
}

const toDateValue = (date: Date) => format(date, 'yyyy-MM-dd')

const toTimeValue = (date: Date) => format(date, 'HH:mm:ss')

const withTime = (date: Date, time: string) => {
  const [hours, minutes, seconds] = time
    .split(':')
    .map((unit) => Number.parseInt(unit, 10))
  const nextDate = new Date(date)
  nextDate.setHours(hours || 0, minutes || 0, seconds || 0, 0)
  return nextDate
}

const DateTimeSelect = ({
  value,
  onChange,
  onConfirm
}: SelectComponentProps<string>) => {
  const initialDate = useMemo(() => {
    if (value == null || Array.isArray(value)) return null
    return parseDateTime(value)
  }, [value])

  const [inputValue, setInputValue] = useState(() =>
    initialDate ? toDateValue(initialDate) : ''
  )
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate)
  const [timeValue, setTimeValue] = useState(() =>
    initialDate ? toTimeValue(initialDate) : '09:00:00'
  )

  useEffect(() => {
    if (value == null || Array.isArray(value)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInputValue('')
      setSelectedDate(null)
      setTimeValue('09:00:00')
      return
    }

    const parsed = parseDateTime(value)
    setInputValue(parsed ? toDateValue(parsed) : '')
    setSelectedDate(parsed)
    setTimeValue(parsed ? toTimeValue(parsed) : '09:00:00')
  }, [value])

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newInputValue = e.target.value
      setInputValue(newInputValue)

      if (!newInputValue.trim()) {
        setSelectedDate(null)
        onChange(null)
        return
      }

      // Parse date-only input (YYYY-MM-DD)
      const parsed = parseISO(newInputValue.trim())
      if (!isValid(parsed)) {
        return
      }

      // Merge with current time
      const merged = withTime(parsed, timeValue)
      setSelectedDate(merged)
      onChange(toJiraDateTime(merged))
    },
    [onChange, timeValue]
  )

  const onSelectDate = useCallback(
    (date: Date | undefined) => {
      if (date == null) {
        setSelectedDate(null)
        setInputValue('')
        onChange(null)
        return
      }

      const base = selectedDate ?? new Date()
      const merged = withTime(date, toTimeValue(base))
      setSelectedDate(merged)
      setTimeValue(toTimeValue(merged))
      setInputValue(toDateValue(merged))
      onChange(toJiraDateTime(merged))
    },
    [onChange, selectedDate]
  )

  const onChangeTime = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const nextTime = e.target.value
      setTimeValue(nextTime)

      if (selectedDate == null) return
      const merged = withTime(selectedDate, nextTime)
      setSelectedDate(merged)
      setInputValue(toDateValue(merged))
      onChange(toJiraDateTime(merged))
    },
    [onChange, selectedDate]
  )

  const commitCurrent = useCallback(() => {
    const date = parseISO(inputValue.trim())
    if (!isValid(date)) return

    const merged = withTime(date, timeValue)
    onConfirm?.(toJiraDateTime(merged))
  }, [inputValue, onConfirm, timeValue])

  const onKeyDownCommit = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return
      if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return
      commitCurrent()
    },
    [commitCurrent]
  )

  return (
    <div className="flex flex-row gap-2">
      <InputGroup>
        <InputGroupInput
          placeholder="YYYY-MM-DD"
          value={inputValue}
          onChange={handleInput}
          onKeyDown={onKeyDownCommit}
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
                onSelect={onSelectDate}
                defaultMonth={selectedDate ?? undefined}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      <Input
        type="time"
        step={1}
        value={timeValue}
        onChange={onChangeTime}
        onKeyDown={onKeyDownCommit}
      />
    </div>
  )
}

export const DatetimeFieldConfig = (
  props: FieldConfigComponentProps<ZodString>
) => {
  if (isSchemaMulti(props.context.metadata)) {
    return <Unsupported context={props.context} />
  }

  return <GenericFieldConfig {...props} SelectorComponent={DateTimeSelect} />
}
