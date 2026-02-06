import { Input } from '@internal/ui/components/input'
import { ZodNumber } from 'zod'

import { FieldConfigComponentProps } from '../../../types'

export const GenericNumberConfig = ({
  value,
  onValueChange
}: FieldConfigComponentProps<ZodNumber>) => {
  return (
    <Input
      type="number"
      placeholder={'Enter number...'}
      value={value}
      onChange={(e) => {
        const inputValue = e.target.value.trim()
        const newValue = Number(inputValue)
        if (isNaN(newValue) || !inputValue) {
          onValueChange(null)
        } else {
          onValueChange(newValue)
        }
      }}
    />
  )
}
