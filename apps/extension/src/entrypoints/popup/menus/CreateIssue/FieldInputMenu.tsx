import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'
import { useLocation } from 'react-router-dom'

import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { VisibleField } from '~/services/template-service/gap-analysis'
import type { AllowedValue } from '~/types/template'

import {
  MultiSelectFieldInput,
  SingleSelectFieldInput,
  SummaryDescriptionFieldInput,
  UserFieldInputMenu
} from './fields'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useScalarFieldEnter } from './useScalarFieldEnter'
import { useWizardNavigation } from './useWizardNavigation'

export function FieldInputMenu() {
  const { field } = useLocation().state as { field: VisibleField }
  const { fieldId, metadata } = field
  const schemaType = metadata?.schema.type
  const schemaItems = metadata?.schema.items

  const isCombinedField = fieldId === 'summary' || fieldId === 'description'

  const allowedOptions = useMemo<AllowedValue[]>(
    () => field.allowedOptions ?? field.metadata?.allowedValues ?? [],
    [field]
  )
  const title = useMemo(() => field.metadata?.name ?? field.fieldId, [field])

  const { setSearch } = useCommandInput()
  const { values, setValue } = useCreateIssueDraftStore()
  const { goToNextField } = useWizardNavigation()
  const currentValue = values[field.fieldId]

  // Pre-fill the global command input for scalar fields.
  useMount(() => {
    if (isCombinedField) return // combined component handles its own pre-fill
    if (!currentValue) return
    if (
      fieldId === 'summary' ||
      schemaType === 'string' ||
      schemaType === 'number'
    ) {
      const next = String(currentValue)
      setSearch(next)
    }
  })

  const saveAndContinue = (value: unknown) => {
    setValue(fieldId, value)
    setSearch('')
    goToNextField()
  }

  useScalarFieldEnter({
    fieldId,
    schemaType,
    schemaItems,
    hasAllowedOptions: allowedOptions.length > 0,
    isCombinedField,
    onSubmit: saveAndContinue
  })

  if (isCombinedField) {
    return (
      <SummaryDescriptionFieldInput
        focusField={fieldId as 'summary' | 'description'}
      />
    )
  }

  if (schemaType === 'user') {
    const autoCompleteUrl = metadata?.autoCompleteUrl ?? ''
    return (
      <UserFieldInputMenu
        fieldId={fieldId}
        title={title}
        autoCompleteUrl={autoCompleteUrl}
        onDone={() => {
          setSearch('')
          goToNextField()
        }}
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
        onSelect={saveAndContinue}
      />
    )
  }

  // Multi-select option fields
  if (schemaType === 'array' && allowedOptions.length > 0) {
    return (
      <MultiSelectFieldInput
        fieldId={fieldId}
        title={title}
        allowedOptions={allowedOptions}
        onDone={() => {
          setSearch('')
          goToNextField()
        }}
      />
    )
  }

  // labels-style fallback: array<string> (comma separated)
  if (
    schemaType === 'array' &&
    schemaItems === 'string' &&
    allowedOptions.length === 0
  ) {
    return (
      <CommandList>
        <CommandGroup heading={title}>
          <CommandEmpty>
            Type comma-separated values in the search box and press Enter
          </CommandEmpty>
        </CommandGroup>
      </CommandList>
    )
  }

  // Default: plain text
  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>Type a value and press Enter</CommandEmpty>
      </CommandGroup>
    </CommandList>
  )
}
