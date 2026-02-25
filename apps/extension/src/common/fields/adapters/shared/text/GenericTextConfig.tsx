import { ChangeEvent, KeyboardEvent, useCallback, useState } from 'react'
import { Input } from '@internal/ui/components/input'
import { z, ZodString } from 'zod'

import { isNonNullable } from '@/utils/assert'

import { FieldConfigComponentProps, SelectComponentProps } from '../../../types'
import { GenericFieldConfig } from '../GenericFieldConfig'

const TextSelect = ({
  isMultiple,
  value,
  onChange,
  onConfirm
}: SelectComponentProps<string>) => {
  const [inputValue, setInputValue] = useState(() => {
    if (value == null) return ''
    if (Array.isArray(value)) return value.join(',')
    return value
  })

  const parse = useCallback(
    (raw: string) => {
      const inputValue = raw.trim()

      if (isMultiple) {
        const newValues = inputValue
          .split(',')
          .map((val) => z.string().min(1).safeParse(val).data)
          .filter(isNonNullable)
        return newValues
      }

      const newValue = z.string().min(1).safeParse(inputValue).data
      return newValue ?? null
    },
    [isMultiple]
  )

  const handleInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value)
      onChange(parse(e.target.value))
    },
    [onChange, parse]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== 'Enter') return
      if (e.shiftKey || e.metaKey || e.ctrlKey || e.altKey) return

      const next = parse(e.currentTarget.value)
      onConfirm?.(next)
    },
    [onConfirm, parse]
  )

  return (
    <Input
      type="text"
      placeholder={'Enter text...'}
      value={inputValue}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
    />
  )
}

export const GenericTextConfig = (
  props: FieldConfigComponentProps<ZodString>
) => {
  return <GenericFieldConfig {...props} SelectorComponent={TextSelect} />
}
