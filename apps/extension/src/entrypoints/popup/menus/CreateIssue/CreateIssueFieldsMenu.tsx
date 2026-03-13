import { Button } from '@internal/ui/components/button'
import { useMemoizedFn } from 'ahooks'

import {
  ActionPanel,
  ActionPanelSlot,
  ActionShortcut,
  useNavigation
} from '@/common/commands'
import { useIssueCreateMeta } from '@/hooks/useIssueCreateMeta'
import { useHotkey } from '@/lib/hotkeys'
import type { VisibleField } from '~/services/template-service/gap-analysis'

import { FieldList } from './FieldList'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useCreateIssueForm } from './useCreateIssueForm'
import { WizardProgressBar } from './WizardProgressBar'

export function CreateIssueFieldsMenu() {
  const {
    scope,
    template,
    values,
    errors,
    clearError,
    setValue,
    wizardFields,
    setWizardIndex,
    lastVisitedFieldId
  } = useCreateIssueDraftStore()

  const navigate = useNavigation()

  // Metadata & conflicts
  const { isLoading: isLoadingFields } = useIssueCreateMeta(
    scope.project.key,
    scope.issueType.id
  )

  // Form submission
  const { submit } = useCreateIssueForm({ scope, template })

  // Hotkeys
  useHotkey('issue.create.cancel', () => navigate.pop())
  const hotkeyRef = useHotkey<HTMLDivElement>('issue.create.proceed', submit)

  const summary = typeof values['summary'] === 'string' ? values['summary'] : ''

  const handleSummaryChange = useMemoizedFn((next: string) => {
    setValue('summary', next)
    clearError('summary')
  })

  // Field selection handler
  const handleSelectField = useMemoizedFn((field: VisibleField) => {
    clearError(field.fieldId)

    const idx = wizardFields.findIndex((f) => f.fieldId === field.fieldId)
    if (idx >= 0) setWizardIndex(idx)
  })

  const listFields = wizardFields

  const initialListItemValue =
    lastVisitedFieldId == null ? undefined : `field:${lastVisitedFieldId}`

  return (
    <ActionPanel
      defaultValue={initialListItemValue}
      ref={hotkeyRef}
      search={summary}
      onSearchChange={handleSummaryChange}
      shouldFilter={false}
      isLoading={isLoadingFields}
      searchPlaceholder="Issue title…">
      {errors['summary'] ? (
        <div className="border-b-2 border-gray-200 px-4 py-2 text-xs text-rose-600">
          {errors['summary']}
        </div>
      ) : null}

      <FieldList
        heading={template?.name ? `Review · ${template.name}` : 'New Issue'}
        fields={listFields}
        values={values}
        errors={errors}
        isLoading={isLoadingFields}
        onSelectField={handleSelectField}
      />

      <ActionPanelSlot>
        <div className="flex items-center gap-2">
          {/*<WizardProgressBar />*/}
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
