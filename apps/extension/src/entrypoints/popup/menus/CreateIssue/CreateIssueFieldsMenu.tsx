import { ActionLoading } from '@/components/actions'
import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import { useHotkey } from '@/lib/hotkeys'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { CommandControl } from '../CommandMenu'

import { FieldConfirm } from './FieldConfirm'
import { FieldList } from './FieldList'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'

export function CreateIssueFieldsMenu() {
  const { template, values, errors, clearError, wizardFields, setWizardIndex } =
    useCreateIssueDraftStore()

  // Metadata & conflicts
  const {
    project: { key: projectKey },
    issueType: { id: issueTypeId }
  } = template.scope
  const { isLoading: isLoadingFields } = useIssueCreateMeta(
    projectKey,
    issueTypeId
  )

  // Form submission
  const { submit } = useCreateIssueForm({
    template
  })

  useHotkey('issue.create.proceed', submit, {
    eventListenerOptions: {
      capture: true
    }
  })

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
  }

  return (
    <CommandControl searchPlaceholder={template.name} searchReadonly>
      <ActionLoading isLoading={isLoadingFields} />

      <FieldList
        heading="Review"
        fields={wizardFields}
        values={values}
        errors={errors}
        onSelectField={handleSelectField}
      />

      <FieldConfirm onClick={submit} text="Create Issue" />
    </CommandControl>
  )
}
