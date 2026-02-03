import { Textarea } from '@internal/ui/components/textarea'

import type { TextAreaInputProps } from '../../types'

export function TextAreaInput({
  value,
  onChange,
  placeholder,
  rows = 4,
  field
}: TextAreaInputProps) {
  return (
    <Textarea
      placeholder={
        placeholder ?? (field ? `Enter ${field.name}` : 'Enter text')
      }
      value={value ?? ''}
      rows={rows}
      onChange={(e) => {
        const newValue = e.target.value
        onChange(newValue.length > 0 ? newValue : undefined)
      }}
    />
  )
}
