import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { ActionLoading } from '@/components/actions'
import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { CommandRoutes } from '../../routes'
import { CommandControl } from '../CommandMenu'

import { FieldList } from './FieldList'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'

export function CreateIssueFieldsMenu() {
  const navigate = useNavigate()

  const {
    template,
    values,
    errors,
    clearError,
    wizardFields,
    setWizardIndex
  } = useCreateIssueDraftStore()

  // Metadata & conflicts
  const { projectKey, issueTypeId } = template.scope
  const { data: fieldsMetadata, isLoading: isLoadingFields } =
    useIssueCreateMeta(projectKey, issueTypeId)

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

  return (
    <CommandControl searchPlaceholder={template.name} searchReadonly>
      <ActionLoading isLoading={isLoadingFields} />

      <FieldList
        fields={wizardFields}
        values={values}
        errors={errors}
        onSelectField={handleSelectField}
      />
    </CommandControl>
  )
}
