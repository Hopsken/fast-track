import { useMemo } from 'react'
import { CommandGroup, CommandList } from '@internal/ui/components/command'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { TicketBasicFields } from '@/components'
import { HotkeysScopeProvider } from '@/lib/hotkeys'
import type { JiraIssue } from '@/types'
import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { IssueTemplate } from '~/types/template'

import { CreateIssueFieldsMenu } from './CreateIssueFieldsMenu'
import { FieldInputMenu } from './FieldInputMenu'
import { SummaryDescriptionInput } from './fields'
import {
  CreateIssueDraftStoreProvider,
  useCreateIssueDraftStore
} from './useCreateIssueDraftStore'
import { useSetupWizard } from './useSetupWizard'

function FieldInputMenuRouter() {
  const { field } = useLocation().state as { field: VisibleField }
  const { fieldId } = field
  const isSummaryOrDescription =
    fieldId === 'summary' || fieldId === 'description'

  // Key forces full remount when wizard moves to a different field
  return (
    <HotkeysScopeProvider scope="field-input">
      {isSummaryOrDescription ? (
        <SummaryDescriptionInput focusField={fieldId} />
      ) : (
        <FieldInputMenu key={field.fieldId} />
      )}
    </HotkeysScopeProvider>
  )
}

function CreateIssueMenuLayout() {
  const { template, values } = useCreateIssueDraftStore()

  const ticket = useMemo<Partial<JiraIssue>>(() => {
    const { project, issueType } = template.scope
    return {
      key: `${project.key}-?`,
      summary: values['summary'] as string,
      issueType,
      status: undefined,
      assignee: null,
      priority: null
    }
  }, [template, values])

  return (
    <CommandList>
      <CommandGroup>
        <div className="outline-hidden relative flex min-h-[44px] cursor-default select-none items-center gap-2 rounded-sm p-3 text-sm">
          <TicketBasicFields ticket={ticket} />
        </div>
      </CommandGroup>

      <Outlet />
    </CommandList>
  )
}

function CreateIssueMenuInner() {
  useSetupWizard()

  return (
    <Routes>
      <Route index element={<SummaryDescriptionInput focusField="summary" />} />

      <Route element={<CreateIssueMenuLayout />}>
        <Route path="edit" element={<FieldInputMenuRouter />} />
        <Route path="review" element={<CreateIssueFieldsMenu />} />
      </Route>
    </Routes>
  )
}

export function CreateIssueMenu() {
  const { template } = (useLocation().state ?? {}) as {
    template: IssueTemplate
  }

  return (
    <HotkeysScopeProvider scope="create-issue">
      <CreateIssueDraftStoreProvider template={template}>
        <CreateIssueMenuInner />
      </CreateIssueDraftStoreProvider>
    </HotkeysScopeProvider>
  )
}
