import { Route, Routes, useLocation } from 'react-router-dom'

import type { VisibleField } from '~/services/template-service/gap-analysis'
import type { IssueTemplate } from '~/types/template'

import { CreateIssueFieldsMenu } from './CreateIssueFieldsMenu'
import { FieldInputMenu } from './FieldInputMenu'
import { CreateIssueDraftStoreProvider } from './useCreateIssueDraftStore'

function FieldInputMenuRouter() {
  const { field } = useLocation().state as { field: VisibleField }
  // Key forces full remount when wizard moves to a different field
  return <FieldInputMenu key={field.fieldId} />
}

export function CreateIssueMenu() {
  const { template } = useLocation().state as { template: IssueTemplate }

  return (
    <CreateIssueDraftStoreProvider template={template}>
      <Routes>
        <Route index element={<CreateIssueFieldsMenu />} />
        <Route path="edit-field" element={<FieldInputMenuRouter />} />
      </Routes>
    </CreateIssueDraftStoreProvider>
  )
}
