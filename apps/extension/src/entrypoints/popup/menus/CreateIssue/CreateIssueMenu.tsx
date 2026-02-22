import { NavigateBackProvider } from '@/common/commands'
import { HotkeysScopeProvider } from '@/lib/hotkeys'
import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { IssueTemplate } from '~/types/template'

import { CreateIssueFieldsMenu } from './CreateIssueFieldsMenu'
import { FieldInputMenu } from './FieldInputMenu'
import {
  CreateIssueDraftStoreProvider,
  useCreateIssueDraftStore
} from './useCreateIssueDraftStore'
import { useSetupWizard } from './useSetupWizard'
import { useWizardNavigation } from './useWizardNavigation'

function FieldInputMenuRouter(props: { field: VisibleField }) {
  const { fieldId } = props.field

  const { goBackToFieldsMenu } = useWizardNavigation()

  // Key forces full remount when wizard moves to a different field
  return (
    <HotkeysScopeProvider scope="field-input">
      <NavigateBackProvider onNavigateBack={goBackToFieldsMenu}>
        <FieldInputMenu key={fieldId} field={props.field} />
      </NavigateBackProvider>
    </HotkeysScopeProvider>
  )
}

function CreateIssueMenuInner() {
  useSetupWizard()

  const { wizardFields, wizardIndex } = useCreateIssueDraftStore()

  // -1 means hub/review screen
  if (wizardIndex < 0) {
    return (
      <HotkeysScopeProvider scope="create-issue">
        <CreateIssueFieldsMenu />
      </HotkeysScopeProvider>
    )
  }

  const activeField = wizardFields[wizardIndex]

  // Defensive: if wizardIndex is out of range, fall back to hub.
  if (!activeField) {
    return (
      <HotkeysScopeProvider scope="create-issue">
        <CreateIssueFieldsMenu />
      </HotkeysScopeProvider>
    )
  }

  return <FieldInputMenuRouter field={activeField} />
}

export function CreateIssueMenu({ template }: { template: IssueTemplate }) {
  return (
    <CreateIssueDraftStoreProvider template={template}>
      <CreateIssueMenuInner />
    </CreateIssueDraftStoreProvider>
  )
}
