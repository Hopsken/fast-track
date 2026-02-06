import { Input } from '@internal/ui/components/input'
import { ZodString } from 'zod'

import { FieldConfigComponentProps } from '../../../types'

export const GenericTextConfig = ({
  value,
  onValueChange
}: FieldConfigComponentProps<ZodString>) => {
  return (
    <Input
      type="text"
      placeholder={'Enter text...'}
      value={value}
      onChange={(e) => {
        const newValue = e.target.value
        onValueChange(newValue)
      }}
    />
  )
}
