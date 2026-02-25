import { ChangeEvent, useCallback, useState } from 'react'
import { Input } from '@internal/ui/components/input'
import { Textarea } from '@internal/ui/components/textarea'
import { z, ZodString } from 'zod'

import type {
  FieldConfigComponentProps,
  SelectComponentProps
} from '../../types'
import { GenericFieldConfig } from '../shared/GenericFieldConfig'

const TextAreaPresetSelect = ({
  value,
  onChange
}: SelectComponentProps<string>) => {
  const [inputValue, setInputValue] = useState(() => {
    if (value == null) return ''
    if (Array.isArray(value)) return value.join('\n')
    return value
  })

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const next = e.target.value
      setInputValue(next)

      // For textarea we treat the whole content as one string.
      const parsed = z.string().safeParse(next).data
      onChange(parsed ?? null)
    },
    [onChange]
  )

  return (
    <Textarea
      className="min-h-36"
      placeholder="Enter text…"
      value={inputValue}
      onChange={handleInput}
    />
  )
}

const TextAreaRestrictedSelect = ({
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
      const next = e.target.value.trim()
      const parsed = z.string().min(1).safeParse(next).data
      onChange(parsed ?? null)
    },
    [onChange]
  )

  return (
    <Input
      type="text"
      placeholder="Enter text…"
      value={inputValue}
      onChange={handleInput}
    />
  )
}

export const TextAreaConfig = (props: FieldConfigComponentProps<ZodString>) => {
  const selector =
    props.config.behavior === 'restricted'
      ? TextAreaRestrictedSelect
      : TextAreaPresetSelect

  return <GenericFieldConfig {...props} SelectorComponent={selector} />
}
