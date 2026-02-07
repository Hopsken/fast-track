import { ChangeEvent, useCallback, useState } from 'react'
import { Input } from '@internal/ui/components/input'
import { z, ZodString } from 'zod'

import { isNonNullable } from '@/utils/assert'

import { FieldConfigComponentProps, SelectComponentProps } from '../../../types'
import { GenericFieldConfig } from '../GenericFieldConfig'

const DateSelect = ({
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

      if (isMultiple) {
        const newValues = inputValue
          .split(',')
          .map((val) => z.iso.date().safeParse(val.trim()).data)
          .filter(isNonNullable)
        onChange(newValues)
        return
      }

      const newValue = z.iso.date().safeParse(inputValue).data
      onChange(newValue ?? null)
    },
    [isMultiple, onChange]
  )

  return (
    <div className="space-y-1">
      <Input
        type={isMultiple ? 'text' : 'date'}
        placeholder={'YYYY-MM-DD'}
        value={inputValue}
        onChange={handleInput}
      />
      <p className="text-muted-foreground text-xs">Format: YYYY-MM-DD</p>
    </div>
  )
}

export const DateInput = (props: FieldConfigComponentProps<ZodString>) => {
  return <GenericFieldConfig {...props} SelectorComponent={DateSelect} />
}
