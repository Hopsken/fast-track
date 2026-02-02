import { useMemoizedFn } from 'ahooks'
import { useNavigate } from 'react-router-dom'

import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { CommandRoutes } from '../../routes'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { isEmptyValue } from './utils'

export function useWizardNavigation() {
  const { values, wizardFields, wizardIndex, setWizardIndex, clearError } =
    useCreateIssueDraftStore()

  const navigate = useNavigate()
  const { setSearch } = useCommandInput()

  /**
   * Save has already happened in the caller.
   * This finds the next unfilled field and navigates there,
   * or navigates to the review screen if every field has a value.
   */
  const goToNextField = useMemoizedFn(() => {
    // Fallback: if wizard never initialized, just go back
    if (wizardFields.length === 0) {
      setSearch('')
      navigate(-1)
      return
    }

    // Scan forward for next field without a value
    for (let i = wizardIndex + 1; i < wizardFields.length; i++) {
      const field = wizardFields[i]
      if (!field) continue
      if (!isEmptyValue(values[field.fieldId])) continue

      setWizardIndex(i)
      setSearch('')
      clearError(field.fieldId)
      navigate(CommandRoutes.CreateIssueEditField, {
        state: { field }
      })
      return
    }

    // All remaining fields filled → navigate to review
    setSearch('')
    navigate(CommandRoutes.CreateIssueReview)
  })

  return {
    goToNextField,
    currentStep: wizardIndex + 1,
    totalSteps: wizardFields.length
  }
}
