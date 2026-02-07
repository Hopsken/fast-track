import { ChangeEvent, useCallback, useState } from 'react'
import { Input } from '@internal/ui/components/input'
import { z, ZodNumber } from 'zod'

import { isNonNullable } from '@/utils/assert'

import { FieldConfigComponentProps, SelectComponentProps } from '../../../types'
import { GenericFieldConfig } from '../GenericFieldConfig'

const NumberSelect = ({
  isMultiple,
  value,
  onChange
}: SelectComponentProps<number>) => {
  const [inputValue, setInputValue] = useState(() => {
    if (value == null) return ''
    if (Array.isArray(value)) return value.join(',')
    return value.toString()
  })

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      const inputValue = e.target.value.trim()

      if (isMultiple) {
        const newValues = inputValue
          .split(',')
          .map((val) => z.number().safeParse(val).data)
          .filter(isNonNullable)
        onChange(newValues)
        return
      }

      const newValue = z.number().safeParse(inputValue).data
      onChange(newValue ?? null)
    },
    [isMultiple, onChange]
  )

  return (
    <Input
      type="number"
      placeholder={'Enter number...'}
      value={inputValue}
      onChange={handleInput}
    />
  )
}

export const GenericNumberConfig = (
  props: FieldConfigComponentProps<ZodNumber>
) => {
  return <GenericFieldConfig {...props} SelectorComponent={NumberSelect} />
}
