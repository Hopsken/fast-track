import { CommandList } from '@internal/ui/components/command'

import { CommandPanel } from '@/common/commands'
import { HotkeysScopeProvider } from '@/lib/hotkeys'
import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { IssueTemplate } from '~/types/template'

import { CreateIssueFieldsMenu } from './CreateIssueFieldsMenu'
import { FieldInputMenu } from './FieldInputMenu'
import { SummaryDescriptionInput } from './SummaryDescriptionInput'
import {
  CreateIssueDraftStoreProvider,
  useCreateIssueDraftStore
} from './useCreateIssueDraftStore'
import { useSetupWizard } from './useSetupWizard'

function FieldInputMenuRouter(props: { field: VisibleField }) {
  const { fieldId } = props.field
  const isSummaryOrDescription =
    fieldId === 'summary' || fieldId === 'description'

  // Key forces full remount when wizard moves to a different field
  return (
    <HotkeysScopeProvider scope="field-input">
      {isSummaryOrDescription ? (
        <SummaryDescriptionInput focusField={fieldId} />
      ) : (
        <FieldInputMenu key={fieldId} field={props.field} />
      )}
    </HotkeysScopeProvider>
  )
}

function CreateIssueMenuInner() {
  useSetupWizard()

  const { wizardFields, wizardIndex } = useCreateIssueDraftStore()
  const activeField = wizardFields[wizardIndex]

  if (!activeField) {
    return <CreateIssueFieldsMenu />
  }

  return <FieldInputMenuRouter field={activeField} />
}

export function CreateIssueMenu({ template }: { template: IssueTemplate }) {
  return (
    <HotkeysScopeProvider scope="create-issue">
      <CreateIssueDraftStoreProvider template={template}>
        <CreateIssueMenuInner />
      </CreateIssueDraftStoreProvider>
    </HotkeysScopeProvider>
  )
}
