import { useCallback, useState } from 'react'
import { Textarea } from '@internal/ui/components/textarea'
import { z, ZodString } from 'zod'

import type {
  FieldConfigComponentProps,
  SelectComponentProps
} from '../../types'
import { GenericFieldConfig } from '../shared/GenericFieldConfig'

const TextAreaSelect = ({ value, onChange }: SelectComponentProps<string>) => {
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

export const TextAreaConfig = (props: FieldConfigComponentProps<ZodString>) => {
  // Only meaningful for preset mode; restricted mode doesn't make much sense for multiline text.
  return <GenericFieldConfig {...props} SelectorComponent={TextAreaSelect} />
}
