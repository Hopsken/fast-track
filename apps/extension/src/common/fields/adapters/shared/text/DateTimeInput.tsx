import { ChangeEvent, useCallback, useState } from 'react'
import { Input } from '@internal/ui/components/input'
import { ZodString } from 'zod'

import { isNonNullable } from '@/utils/assert'

import { FieldConfigComponentProps, SelectComponentProps } from '../../../types'
import { GenericFieldConfig } from '../GenericFieldConfig'

const toJiraDateTime = (value: string) => {
  if (value.length === 0) return null

  try {
    const date = new Date(value)
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

const DateTimeSelect = ({
  isMultiple,
  value,
  onChange
}: SelectComponentProps<string>) => {
  const [inputValue, setInputValue] = useState(() => {
    if (value == null) return ''
    if (Array.isArray(value)) return value.join(',')
    return value
  })

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      const inputValue = e.target.value.trim()

      console.log({ inputValue })

      if (isMultiple) {
        const newValues = inputValue
          .split(',')
          .map((val) => toJiraDateTime(val.trim()))
          .filter(isNonNullable)
        onChange(newValues)
        return
      }

      const newValue = toJiraDateTime(inputValue)
      console.log({ newValue })
      onChange(newValue ?? null)
    },
    [isMultiple, onChange]
  )

  return (
    <div className="space-y-1">
      <Input
        type={isMultiple ? 'text' : 'datetime-local'}
        placeholder={'YYYY-MM-DDTHH:mm'}
        value={inputValue}
        onChange={handleInput}
      />
      <p className="text-muted-foreground text-xs">Select date and time</p>
    </div>
  )
}

export const DateTimeInput = (props: FieldConfigComponentProps<ZodString>) => {
  return <GenericFieldConfig {...props} SelectorComponent={DateTimeSelect} />
}
