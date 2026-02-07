import { ChangeEvent, useCallback, useState } from 'react'
import { Input } from '@internal/ui/components/input'
import { z, ZodString } from 'zod'

import { isNonNullable } from '@/utils/assert'

import { FieldConfigComponentProps, SelectComponentProps } from '../../../types'
import { GenericFieldConfig } from '../GenericFieldConfig'

const TextSelect = ({
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
          .map((val) => z.string().min(1).safeParse(val).data)
          .filter(isNonNullable)
        onChange(newValues)
        return
      }

      const newValue = z.string().min(1).safeParse(inputValue).data
      onChange(newValue ?? null)
    },
    [isMultiple, onChange]
  )

  return (
    <Input
      type="text"
      placeholder={'Enter text...'}
      value={inputValue}
      onChange={handleInput}
    />
  )
}

export const GenericTextConfig = (
  props: FieldConfigComponentProps<ZodString>
) => {
  return <GenericFieldConfig {...props} SelectorComponent={TextSelect} />
}
