import { ActionGroup, ActionList } from '@/common/commands'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { FieldListItem } from './FieldListItem'

export interface FieldListProps {
  heading?: string
  fields: VisibleField[]
  values: Record<string, unknown>
  errors: Record<string, string>
  isLoading?: boolean
  onSelectField: (field: VisibleField) => void
}

export function FieldList({
  heading,
  fields,
  values,
  errors,
  isLoading = false,
  onSelectField
}: FieldListProps) {
  return (
    <ActionList
      isLoading={isLoading}
      loadingPlaceholder="Loading fields..."
      emptyPlaceholder="No fields available for this template">
      {fields.length > 0 ? (
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
      ) : null}
    </ActionList>
  )
}
