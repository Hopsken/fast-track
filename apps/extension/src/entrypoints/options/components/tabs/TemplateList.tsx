import { useCallback } from 'react'
import { Button } from '@internal/ui/components/button'

import { useTemplates } from '~/hooks/useTemplates'
import { cn } from '~/lib/utils'

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

      <div className="bg-background rounded-md border">
        {isLoading ? (
          <div className="text-muted-foreground p-3 text-sm">Loading…</div>
        ) : null}

        {!isLoading && (templates?.length ?? 0) === 0 ? (
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="text-muted-foreground text-sm">
              No templates yet.
            </div>
            <Button size="sm" variant="secondary" onClick={handleNew}>
              Create one
            </Button>
          </div>
        ) : null}

        {!isLoading && (templates?.length ?? 0) > 0 ? (
          <ul className="divide-y">
            {templates?.map((t) => {
              const isSelected = selectedId === t.id

              return (
                <li key={t.id}>
                  <button
                    type="button"
                    aria-current={isSelected ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors',
                      'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      isSelected
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => onSelect(t.id)}>
                    <span className="truncate font-medium">{t.name}</span>
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
