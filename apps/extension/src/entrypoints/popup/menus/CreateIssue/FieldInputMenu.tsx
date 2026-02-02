import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { VisibleField } from '~/services/template-service/gap-analysis'
import type { AllowedValue } from '~/types/template'

import {
  ArrayFieldInput,
  MultiSelectFieldInput,
  NumberFieldInput,
  SingleSelectFieldInput,
  StringFieldInput,
  SummaryDescriptionFieldInput,
  UserFieldInputMenu
} from './fields'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

export function FieldInputMenu() {
  const { field } = useLocation().state as { field: VisibleField }
  const { fieldId, metadata } = field
  const schemaType = metadata?.schema.type
  const schemaItems = metadata?.schema.items

  const allowedOptions = useMemo<AllowedValue[]>(
    () => field.allowedOptions ?? field.metadata?.allowedValues ?? [],
    [field]
  )
  const title = useMemo(() => field.metadata?.name ?? field.fieldId, [field])

  const { setSearch } = useCommandInput()
  const { values, setValue } = useCreateIssueDraftStore()
  const { goToNextField } = useWizardNavigation()
  const currentValue = values[field.fieldId]

  const handleConfirm = (value: unknown) => {
    setValue(fieldId, value)
    setSearch('')
    goToNextField()
  }

  // Summary + Description combined field
  if (fieldId === 'summary' || fieldId === 'description') {
    return (
      <SummaryDescriptionFieldInput
        focusField={fieldId as 'summary' | 'description'}
        onConfirm={(value) => {
          const typedValue = value as { summary: string; description: string }
          setValue('summary', typedValue.summary)
          setValue('description', typedValue.description)
          setSearch('')
          goToNextField()
        }}
      />
    )
  }

  // User field with autocomplete
  if (schemaType === 'user') {
    return (
      <UserFieldInputMenu
        title={title}
        autoCompleteUrl={metadata?.autoCompleteUrl ?? ''}
        onConfirm={handleConfirm}
      />
    )
  }

  // Number field
  if (schemaType === 'number') {
    return (
      <NumberFieldInput
        title={title}
        currentValue={currentValue}
        onConfirm={handleConfirm}
      />
    )
  }

  // Single-select option fields
  if (
    schemaType === 'option' ||
    schemaType === 'priority' ||
    schemaType === 'resolution'
  ) {
    return (
      <SingleSelectFieldInput
        title={title}
        allowedOptions={allowedOptions}
        onConfirm={handleConfirm}
      />
    )
  }

  // Multi-select option fields
  if (schemaType === 'array' && allowedOptions.length > 0) {
    return (
      <MultiSelectFieldInput
        title={title}
        currentValue={currentValue}
        allowedOptions={allowedOptions}
        onChange={(value) => setValue(fieldId, value)}
        onConfirm={handleConfirm}
      />
    )
  }

  // Array of strings (comma-separated, like labels)
  if (
    schemaType === 'array' &&
    schemaItems === 'string' &&
    allowedOptions.length === 0
  ) {
    return (
      <ArrayFieldInput
        title={title}
        currentValue={currentValue}
        onConfirm={handleConfirm}
      />
    )
  }

  // Default: string field
  return (
    <StringFieldInput
      title={title}
      currentValue={currentValue}
      onConfirm={handleConfirm}
    />
  )
}
