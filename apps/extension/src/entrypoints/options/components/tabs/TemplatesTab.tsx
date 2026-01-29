import { useMemo, useState } from 'react'

import type { IssueTemplate, IssueTemplateScope } from '~/types/template'

import { TemplateEditor } from './TemplateEditor'
import { TemplateList } from './TemplateList'

const EMPTY_SCOPE: IssueTemplateScope = {
  baseUrlHost: '',
  projectKey: '',
  issueTypeId: '',
  issueTypeName: ''
}

export function TemplatesTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const initialDraft = useMemo<
    Omit<IssueTemplate, 'id' | 'createdAt' | 'updatedAt'>
  >(
    () => ({
      name: '',
      trigger: '',
      icon: undefined,
      scope: EMPTY_SCOPE,
      fields: {},
      descriptionTemplate: undefined,
      lastUsedAt: undefined
    }),
    []
  )

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
        <p className="text-sm text-gray-600">
          Create reusable issue templates for fast capture.
        </p>

        <TemplateList selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedId ? 'Edit template' : 'New template'}
        </h2>
        <TemplateEditor templateId={selectedId} initialDraft={initialDraft} />
      </div>
    </div>
  )
}
