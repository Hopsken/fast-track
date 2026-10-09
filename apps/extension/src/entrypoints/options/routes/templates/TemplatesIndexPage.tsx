import { useMemo, useState } from 'react'
import { Button } from '@internal/ui/components/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@internal/ui/components/empty'
import { partition } from 'lodash-es'
import { Link } from 'react-router-dom'

import { LoadingCursor } from '@/components/LoadingCursor'
import { useCurrentJiraHost } from '~/hooks/useCurrentJiraHost'
import { useTemplates } from '~/hooks/useTemplates'
import type { IssueTemplate } from '~/types/template'

import { TemplateListItem } from './TemplateListItem'

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
          <h2 className="text-foreground text-lg font-semibold">Templates</h2>
          <p className="text-muted-foreground text-sm">
            Reusable starting points for new issues.
          </p>
        </div>

        <Button asChild disabled={!canCreate}>
          <Link to="/templates/new">New template</Link>
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-foreground text-sm font-medium">
            Your templates
          </h3>

          {others.length > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowOthers((v) => !v)}>
              {showOthers ? 'Hide others' : 'Show others'}
            </Button>
          ) : null}
        </div>

        <div className="bg-card rounded-md border">
          {templatesLoading && <LoadingCursor />}

          {!templatesLoading && matching.length === 0 ? (
            <Empty className="py-8">
              <EmptyHeader>
                <EmptyTitle className="text-sm">No templates</EmptyTitle>
                <EmptyDescription>
                  {currentHost
                    ? 'Create a template to speed up issue creation.'
                    : 'Connect a Jira site to see your templates.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          {!templatesLoading && matching.length > 0 ? (
            <ul className="divide-y">
              {matching.map((t) => (
                <TemplateListItem key={t.id} template={t} />
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {showOthers ? (
        <div className="space-y-3">
          <h3 className="text-foreground text-sm font-medium">
            Other Jira sites
          </h3>

          <div className="space-y-4">
            {groupByHost(others).map(([host, items]) => (
              <div key={host} className="bg-card rounded-md border">
                <div className="text-muted-foreground border-b px-4 py-2 text-xs font-medium">
                  {host || 'Unknown host'}
                </div>
                <ul className="divide-y">
                  {items.map((t) => (
                    <TemplateListItem key={t.id} template={t} />
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
