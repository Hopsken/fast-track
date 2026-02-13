import { Button } from '@internal/ui/components/button'
import { useMemoizedFn } from 'ahooks'

import { ActionPanel, ActionPanelSlot, ActionShortcut } from '@/common/commands'
import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import { useHotkey } from '@/lib/hotkeys'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { FieldList } from './FieldList'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'
import { WizardProgressBar } from './WizardProgressBar'

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

  const hotkeyRef = useHotkey<HTMLDivElement>('issue.create.proceed', submit)

  // Field selection handler
  const handleSelectField = useMemoizedFn((field: VisibleField) => {
    if (field.fieldId === 'summary' || field.fieldId === 'description') {
      clearError('summary')
      clearError('description')
    } else {
      clearError(field.fieldId)
    }

    // Update wizard cursor so Cmd+Enter continues from this point
    const idx = wizardFields.findIndex((f) => f.fieldId === field.fieldId)
    if (idx >= 0) setWizardIndex(idx)
  })

  return (
    <ActionPanel
      ref={hotkeyRef}
      searchReadonly
      isLoading={isLoadingFields}
      searchPlaceholder={template.name}>
      <FieldList
        heading="Review"
        fields={wizardFields}
        values={values}
        errors={errors}
        onSelectField={handleSelectField}
      />

      <ActionPanelSlot>
        <div className="flex items-center gap-2">
          <WizardProgressBar />
          <Button
            variant={'ghost'}
            size={'sm'}
            onClick={submit}
            className="-my-1 -mr-4">
            <span>Create issue</span>
            <ActionShortcut hotkeyId="issue.create.proceed" />
          </Button>
        </div>
      </ActionPanelSlot>
    </ActionPanel>
  )
}
