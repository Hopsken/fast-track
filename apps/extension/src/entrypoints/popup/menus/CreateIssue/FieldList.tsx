import { ActionGroup, ActionList } from '@/common/commands'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { FieldListItem } from './FieldListItem'

export interface FieldListProps {
  heading?: string
  fields: VisibleField[]
  values: Record<string, unknown>
  errors: Record<string, string>
  onSelectField: (field: VisibleField) => void
}

export function FieldList({
  heading,
  fields,
  values,
  errors,
  onSelectField
}: FieldListProps) {
  if (fields.length === 0) return null

  return (
    <ActionList>
      <ActionGroup heading={heading}>
        {fields.map((field) => (
          <FieldListItem
            key={field.fieldId}
            field={field}
            value={values[field.fieldId]}
            error={errors[field.fieldId]}
            required={field.metadata?.required ?? false}
            onSelect={() => onSelectField(field)}
          />
        ))}
      </ActionGroup>
    </ActionList>
  )
}
