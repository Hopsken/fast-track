import { createElement } from 'react'
import { useLocation } from 'react-router-dom'

import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { VisibleField } from '~/services/template-service/gap-analysis'

import { getFieldInputComponent } from './fields/fieldRegistry'
import { SummaryDescriptionInput } from './fields/specialized'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

export function FieldInputMenu() {
  const { field } = useLocation().state as { field: VisibleField }
  const { fieldId } = field

  const { setSearch } = useCommandInput()
  const { values, setValue } = useCreateIssueDraftStore()
  const { goToNextField } = useWizardNavigation()
  const currentValue = values[field.fieldId]

  const handleConfirm = (value: unknown) => {
    setValue(fieldId, value)
    setSearch('')
    goToNextField()
  }

  // Summary + Description combined field (special case)
  if (fieldId === 'summary' || fieldId === 'description') {
    return (
      <SummaryDescriptionInput
        focusField={fieldId as 'summary' | 'description'}
      />
    )
  }

  // Get component from registry
  const FieldComponent = getFieldInputComponent(field)
  return createElement(FieldComponent, {
    field,
    currentValue,
    onConfirm: handleConfirm
  })
}
