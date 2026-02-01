import { useEffect, useMemo } from 'react'
import { keyBy, merge, unionBy } from 'lodash-es'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { ActionLoading } from '@/components/actions'
import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import {
  computeVisibleFields,
  type VisibleField
} from '~/services/template-service/gap-analysis'

import { CommandRoutes } from '../../routes'
import { CommandMenu } from '../CommandMenu'

import { FieldList } from './FieldList'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'
import { computePromotedFields, computeWizardSequence } from './utils'

export function CreateIssueFieldsMenu() {
  const navigate = useNavigate()

  const {
    template,
    values,
    errors,
    promotedFieldIds,
    clearError,
    wizardStarted,
    wizardFields,
    setWizardFields,
    setWizardStarted,
    setWizardIndex
  } = useCreateIssueDraftStore()

  // Metadata & conflicts
  const { projectKey, issueTypeId } = template.scope
  const { data: fieldsMetadata, isLoading: isLoadingFields } =
    useIssueCreateMeta(projectKey, issueTypeId)

  // Compute visible fields
  const visibleFieldsBase = useMemo(() => {
    return computeVisibleFields(template, fieldsMetadata ?? [])
  }, [fieldsMetadata, template])

  const visibleFields = useMemo(() => {
    const fieldConfigById = keyBy(visibleFieldsBase, 'fieldId')
    const promotedFields = computePromotedFields({
      promotedFieldIds,
      fieldsMetadata: fieldsMetadata ?? []
    })

    return unionBy(visibleFieldsBase, promotedFields, 'fieldId').map((field) =>
      merge({}, fieldConfigById[field.fieldId], field)
    )
  }, [visibleFieldsBase, promotedFieldIds, fieldsMetadata])

  // Auto-start wizard on first metadata load
  useEffect(() => {
    if (!wizardStarted && visibleFields.length > 0) {
      const sequence = computeWizardSequence(visibleFields)
      setWizardFields(sequence)
      setWizardStarted(true)

      if (sequence.length > 0) {
        setWizardIndex(0)
        navigate(CommandRoutes.CreateIssueEditField, {
          state: { field: sequence[0] }
        })
      }
    }
  }, [
    visibleFields,
    wizardStarted,
    setWizardFields,
    setWizardStarted,
    setWizardIndex,
    navigate
  ])

  // Form submission
  const { submit } = useCreateIssueForm({
    template,
    fieldsMetadata
  })

  // Hotkey
  useHotkeys(
    'meta+enter',
    () => {
      submit()
    },
    {
      preventDefault: true,
      enableOnFormTags: true
    },
    [submit]
  )

  // Field selection handler
  const handleSelectField = (field: VisibleField) => {
    if (field.fieldId === 'summary' || field.fieldId === 'description') {
      clearError('summary')
      clearError('description')
    } else {
      clearError(field.fieldId)
    }

    // Update wizard cursor so Cmd+Enter continues from this point
    const idx = wizardFields.findIndex((f) => f.fieldId === field.fieldId)
    if (idx >= 0) setWizardIndex(idx)

    navigate(CommandRoutes.CreateIssueEditField, { state: { field } })
  }

  // Conflict warning state
  // const [showConflictWarning, setShowConflictWarning] = useState(true)

  return (
    <CommandMenu searchPlaceholder={template.name} searchReadonly>
      <ActionLoading isLoading={isLoadingFields} />

      {/* {showConflictWarning && (
        <ConflictWarning
          missingFieldNames={missingFieldNames}
          onDismiss={() => setShowConflictWarning(false)}
        />
      )} */}

      <FieldList
        fields={visibleFields}
        values={values}
        errors={errors}
        onSelectField={handleSelectField}
      />
    </CommandMenu>
  )
}
