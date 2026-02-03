import { Input } from '@internal/ui/components/input'

import type { TextInputProps } from '../../types'

export function TextInput({
  value,
  onChange,
  placeholder,
  field
}: TextInputProps) {
  return (
    <Input
      type="text"
      placeholder={
        placeholder ?? (field ? `Enter ${field.name}` : 'Enter text')
      }
      value={value ?? ''}
      onChange={(e) => {
        const newValue = e.target.value
        onChange(newValue.length > 0 ? newValue : undefined)
      }}
    />
  )
}
