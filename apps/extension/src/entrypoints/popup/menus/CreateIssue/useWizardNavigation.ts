import { useMemoizedFn } from 'ahooks'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { isEmptyValue } from './utils'

export function useWizardNavigation() {
  const { values, wizardFields, wizardIndex, setWizardIndex, clearError } =
    useCreateIssueDraftStore()

  const goBackToFieldsMenu = useMemoizedFn(() => {
    setWizardIndex(-1)
  })

  /**
   * Save has already happened in the caller.
   * This finds the next unfilled field and navigates there,
   * or navigates to the review screen if every field has a value.
   */
  const goToNextField = useMemoizedFn(() => {
    // Fallback: if wizard never initialized, just reset the wizard field (go to fields menu)
    if (wizardFields.length === 0) {
      setWizardIndex(-1)
      return
    }

    // Scan forward for next field without a value
    for (let i = wizardIndex + 1; i < wizardFields.length; i++) {
      const field = wizardFields[i]
      if (!field) continue
      if (!isEmptyValue(values[field.fieldId])) continue

      setWizardIndex(i)
      clearError(field.fieldId)
      return
    }

    // All remaining fields filled → navigate to review
    setWizardIndex(-1)
  })

  return {
    goToNextField,
    goBackToFieldsMenu,
    currentStep: wizardIndex + 1,
    totalSteps: wizardFields.length
  }
}
