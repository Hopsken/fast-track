import { useMemo, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import { partition } from 'lodash-es'
import { Link } from 'react-router-dom'

import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'
import { useTemplates } from '~/hooks/useTemplates'
import { cn } from '~/lib/utils'
import type { IssueTemplate } from '~/types/template'

function groupByHost(templates: IssueTemplate[]) {
  const groups = new Map<string, IssueTemplate[]>()

  for (const t of templates) {
    const host = t.scope.baseUrlHost || ''
    const arr = groups.get(host) ?? []
    arr.push(t)
    groups.set(host, arr)
  }

  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b))
}

export function TemplatesIndexPage() {
  const { data: currentHost } = useCurrentJiraHost()
  const { data: templates, isLoading: templatesLoading } = useTemplates({
    includeOtherHosts: true
  })

  const [showOthers, setShowOthers] = useState(false)

  const [matching, others] = useMemo(() => {
    if (!templates) return [[], []]
    if (!currentHost) return [[], templates]

    return partition(templates, (t) => t.scope.baseUrlHost === currentHost)
  }, [templates, currentHost])

  const canCreate = Boolean(currentHost)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
          <p className="text-sm text-gray-600">
            Templates are scoped to the currently connected Jira site.
          </p>
        </div>

        <Button asChild disabled={!canCreate}>
          <Link to="/templates/new">New template</Link>
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium text-gray-900">Your templates</h3>

          {others.length > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowOthers((v) => !v)}>
              {showOthers ? 'Hide others' : 'Show others'}
            </Button>
          ) : null}
        </div>

        <div className="rounded-md border bg-white">
          {templatesLoading ? (
            <div className="p-4 text-sm text-gray-600">Loading…</div>
          ) : null}

          {!templatesLoading && matching.length === 0 ? (
            <div className="p-4 text-sm text-gray-600">
              {currentHost
                ? 'No templates for this Jira site yet.'
                : 'No templates shown (not connected).'}
            </div>
          ) : null}

          {!templatesLoading && matching.length > 0 ? (
            <ul className="divide-y">
              {matching.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/templates/${t.id}`}
                    className={cn(
                      'block px-4 py-3 text-sm transition-colors',
                      'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                    )}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-900">
                          {t.name}
                        </div>
                        <div className="truncate text-xs text-gray-600">
                          {t.scope.project.name} • {t.scope.issueType.name}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {showOthers ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">
            Other Jira sites
          </h3>

          <div className="space-y-4">
            {groupByHost(others).map(([host, items]) => (
              <div key={host} className="rounded-md border bg-white">
                <div className="border-b px-4 py-2 text-xs font-medium text-gray-700">
                  {host || 'Unknown host'}
                </div>
                <ul className="divide-y">
                  {items.map((t) => (
                    <li key={t.id}>
                      <Link
                        to={`/templates/${t.id}`}
                        className={cn(
                          'block px-4 py-3 text-sm transition-colors',
                          'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
                        )}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium text-gray-900">
                              {t.name}
                            </div>
                            <div className="truncate text-xs text-gray-600">
                              {t.scope.project.name} • {t.scope.issueType.name}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
