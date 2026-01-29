import { useCallback } from 'react'
import { Button } from '@internal/ui/components/button'

import { useTemplates } from '~/hooks/useTemplates'

interface TemplateListProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function TemplateList({ selectedId, onSelect }: TemplateListProps) {
  const { data: templates, isLoading } = useTemplates()

  const handleNew = useCallback(() => onSelect(null), [onSelect])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Your templates</div>
        <Button size="sm" variant="secondary" onClick={handleNew}>
          New
        </Button>
      </div>

      <div className="rounded-md border border-gray-200 bg-white">
        {isLoading ? (
          <div className="p-3 text-sm text-gray-600">Loading…</div>
        ) : null}

        {!isLoading && (templates?.length ?? 0) === 0 ? (
          <div className="p-3 text-sm text-gray-600">No templates yet.</div>
        ) : null}

        {!isLoading && (templates?.length ?? 0) > 0 ? (
          <ul className="divide-y">
            {templates?.map((t) => {
              const isSelected = selectedId === t.id
              const buttonClass =
                'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ' +
                (isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50')

              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className={buttonClass}
                    onClick={() => onSelect(t.id)}>
                    <span className="truncate font-medium">{t.name}</span>
                    <span className="ml-2 shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      {t.trigger}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
