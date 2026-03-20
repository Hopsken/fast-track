import { Link } from 'react-router-dom'

import { cn } from '~/lib/utils'
import type { IssueTemplate } from '~/types/template'

interface TemplateListItemProps {
  template: IssueTemplate
}

export function TemplateListItem({ template }: TemplateListItemProps) {
  const displayName = template.icon
    ? `${template.icon} ${template.name}`
    : template.name
  return (
    <li key={template.id}>
      <Link
        to={`/templates/${template.id}`}
        className={cn(
          'block px-4 py-3 text-sm transition-colors',
          'hover:bg-muted focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
        )}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-foreground truncate font-medium">
              {displayName}
            </div>
            <div className="text-muted-foreground truncate text-xs">
              {template.scope.project.name} • {template.scope.issueType.name}
            </div>
          </div>
        </div>
      </Link>
    </li>
  )
}
