import { Input } from '@internal/ui/components/input'

import type { NumberInputProps } from '../../types'

export function NumberInput({
  value,
  onChange,
  placeholder,
  field
}: NumberInputProps) {
  return (
    <Input
      type="number"
      placeholder={
        placeholder ?? (field ? `Enter ${field.name}` : 'Enter number')
      }
      value={typeof value === 'number' ? String(value) : ''}
      onChange={(e) => {
        const num = Number(e.target.value)
        onChange(!e.target.value || isNaN(num) ? undefined : num)
      }}
    />
  )
}
