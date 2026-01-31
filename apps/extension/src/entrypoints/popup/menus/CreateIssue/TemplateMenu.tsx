import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '@internal/ui/components/command'
import { FileText, Settings } from 'lucide-react'

import { Action, ActionPush } from '@/components/actions'
import { useTemplates } from '@/hooks/useTemplates'
import { openOptionsPage } from '@/utils'

export function TemplateMenu({ keyword }: { keyword: string }) {
  const { data: templates } = useTemplates()

  const normalizedKeyword = keyword.trim().toLowerCase()

  const handleCreateTemplate = () => {
    openOptionsPage('/templates')
  }

  const emptyMessage = normalizedKeyword
    ? 'No matching templates'
    : 'No templates'

  return (
    <CommandList>
      <CommandEmpty>{emptyMessage}</CommandEmpty>

      <CommandGroup heading="Issue Templates">
        {templates?.map((template) => (
          <ActionPush
            key={template.id}
            value={`+${template.name}`}
            // TODO: replace icon with issue type icon
            icon={FileText}
            title={template.name}
            target={() => ({
              path: '/create-issue',
              state: { templateId: template.id }
            })}
          />
        ))}
      </CommandGroup>

      {templates?.length === 0 && (
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
