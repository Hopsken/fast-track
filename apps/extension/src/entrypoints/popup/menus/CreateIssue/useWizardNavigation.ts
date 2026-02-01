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
    // Fallback: if wizard never initialized, just go back
    if (wizardFields.length === 0) {
      setSearch('')
      navigate(-1)
      return
    }

    // Scan forward for next field needing input
    for (let i = wizardIndex + 1; i < wizardFields.length; i++) {
      const field = wizardFields[i]
      if (!field) continue

      if (!hasValue(values[field.fieldId])) {
        setWizardIndex(i)

        // Clear stale errors for the target field
        if (field.fieldId === 'summary' || field.fieldId === 'description') {
          clearError('summary')
          clearError('description')
        } else {
          clearError(field.fieldId)
        }

        setSearch('')
        navigate(CommandRoutes.CreateIssueEditField, {
          state: { field }
        })
        return
      }
    }

    // Every field has a value → submit
    setSearch('')
    submit()
  })

  return {
    goToNextField,
    currentStep: wizardIndex + 1,
    totalSteps: wizardFields.length
  }
}
