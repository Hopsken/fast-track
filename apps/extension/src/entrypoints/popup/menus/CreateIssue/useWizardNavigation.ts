import { useMemoizedFn } from 'ahooks'
import { useNavigate } from 'react-router-dom'

import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { CommandRoutes } from '../../routes'

import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'

function hasValue(val: unknown): boolean {
  if (val == null || val === '') return false
  if (Array.isArray(val) && val.length === 0) return false
  return true
}

export function useWizardNavigation() {
  const {
    template,
    values,
    wizardFields,
    wizardIndex,
    setWizardIndex,
    clearError
  } = useCreateIssueDraftStore()

  const { data: fieldsMetadata } = useIssueCreateMeta(
    template.scope.projectKey,
    template.scope.issueTypeId
  )
  // submit() is stable (useMemoizedFn inside useCreateIssueForm)
  const { submit } = useCreateIssueForm({ template, fieldsMetadata })
  const navigate = useNavigate()
  const { setSearch } = useCommandInput()

  /**
   * Save has already happened in the caller.
   * This finds the next unfilled field and navigates there,
   * or auto-submits if every field has a value.
   */
  const goToNextField = useMemoizedFn(() => {
    console.log({ wizardFields })
    // Fallback: if wizard never initialized, just go back
    if (wizardFields.length === 0) {
      setSearch('')
      navigate(-1)
      return
    }

    // Submit if is last field
    if (wizardIndex === wizardFields.length - 1) {
      // Every field has a value → submit
      setSearch('')
      submit()
      return
    }

    // Scan forward for next valid field
    for (let i = wizardIndex + 1; i < wizardFields.length; i++) {
      const field = wizardFields[i]
      if (!field) continue

      setWizardIndex(i)
      setSearch('')
      clearError(field.fieldId)
      navigate(CommandRoutes.CreateIssueEditField, {
        state: { field }
      })
      return
    }
  })

  return {
    goToNextField,
    currentStep: wizardIndex + 1,
    totalSteps: wizardFields.length
  }
}
