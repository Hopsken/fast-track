import { Input } from '@internal/ui/components/input'
import { ZodString } from 'zod'

import { FieldConfigComponentProps } from '@/common/fields/types'

export function DateInput({
  value,
  onValueChange,
  context
}: FieldConfigComponentProps<ZodString>) {
  return (
    <div className="space-y-1">
      <Input
        type="date"
        value={value ?? ''}
        onChange={(e) => {
          const newValue = e.target.value
          onValueChange(newValue.length > 0 ? newValue : null)
        }}
        aria-label={context.metadata.name ?? 'Date'}
      />
      <p className="text-muted-foreground text-xs">Format: YYYY-MM-DD</p>
    </div>
  )
}
