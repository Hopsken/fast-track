import { Route, Routes, useLocation } from 'react-router-dom'

import type { IssueTemplate } from '~/types/template'

import { CreateIssueFieldsMenu } from './CreateIssueFieldsMenu'
import { FieldInputMenu } from './FieldInputMenu'
import { CreateIssueDraftStoreProvider } from './useCreateIssueDraftStore'

export function CreateIssueMenu() {
  const { template } = useLocation().state as { template: IssueTemplate }

  return (
    <CreateIssueDraftStoreProvider template={template}>
      <Routes>
        <Route index element={<CreateIssueFieldsMenu />} />
        <Route path="edit-field" element={<FieldInputMenu />} />
      </Routes>
    </CreateIssueDraftStoreProvider>
  )
}
