import { useMemo } from 'react'
import { CommandGroup, CommandList } from '@internal/ui/components/command'
import { Outlet, Route, Routes, useLocation } from 'react-router-dom'

import { TicketBasicFields } from '@/components'
import { CommandFooterSlot } from '@/stores/command/useCommandFooterSlot'
import { JiraIssueType, JiraTicket } from '@/types'
import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { IssueTemplate } from '~/types/template'

import { CreateIssueFieldsMenu } from './CreateIssueFieldsMenu'
import { FieldInputMenu } from './FieldInputMenu'
import { SummaryDescriptionFieldInput } from './fields'
import {
  CreateIssueDraftStoreProvider,
  useCreateIssueDraftStore
} from './useCreateIssueDraftStore'
import { useSetupWizard } from './useSetupWizard'

function FieldInputMenuRouter() {
  const { field } = useLocation().state as { field: VisibleField }
  // Key forces full remount when wizard moves to a different field
  return <FieldInputMenu key={field.fieldId} />
}

function CreateIssueMenuLayout() {
  const { template, values } = useCreateIssueDraftStore()

  const ticket = useMemo<Partial<JiraTicket>>(() => {
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
        <TicketBasicFields ticket={ticket} />
      </CommandGroup>

      <Outlet />
    </CommandList>
  )
}

function CreateIssueMenuInner() {
  useSetupWizard()

  return (
    <Routes>
      <Route
        index
        element={<SummaryDescriptionFieldInput focusField="summary" />}
      />

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
    <CreateIssueDraftStoreProvider template={template}>
      <CreateIssueMenuInner />
    </CreateIssueDraftStoreProvider>
  )
}
