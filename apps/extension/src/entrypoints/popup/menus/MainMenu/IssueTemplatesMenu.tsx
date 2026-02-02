import { useCallback } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { FileText, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { GeneralIcon } from '@/components'
import { Action } from '@/components/actions'
import { useTemplates } from '@/hooks/useTemplates'
import { IssueTemplate } from '@/types/template'
import { openOptionsPage } from '@/utils'

import { CommandRoutes } from '../../routes'

export function IssueTemplatesMenu() {
  const { data: templates, isLoading } = useTemplates()
  const navigate = useNavigate()

  const handleCreateTemplate = () => {
    openOptionsPage('/templates')
  }

  const onSelect = useCallback(
    (template: IssueTemplate) => {
      navigate(CommandRoutes.CreateIssueFromTemplate(template.id), {
        state: { template }
      })
    },
    [navigate]
  )

  return (
    <CommandList>
      <CommandEmpty>No templates</CommandEmpty>

      <CommandGroup heading="Issue Templates">
        {templates?.map((template) => (
          <Action
            key={template.id}
            value={`C+${template.name}`}
            prefix={
              template.icon || (
                <GeneralIcon
                  iconUrl={template.scope.issueType.iconUrl}
                  alt={template.scope.issueType.name}
                />
              )
            }
            title={template.name}
            onSelect={() => onSelect(template)}
            exitOnSelect={false}
          />
        ))}
      </CommandGroup>

      {templates?.length === 0 && !isLoading && (
        <Action
          value="create-template"
          icon={Settings}
          title="Create issue template"
          onSelect={handleCreateTemplate}
        />
      )}
    </CommandList>
  )
}
