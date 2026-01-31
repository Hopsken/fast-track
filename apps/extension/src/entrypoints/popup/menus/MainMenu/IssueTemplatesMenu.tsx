import { useCallback } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { FileText, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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
            // TODO: replace icon with issue type icon
            icon={FileText}
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
