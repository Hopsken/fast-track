import { useCallback } from 'react'
import { Settings, Zap } from 'lucide-react'

import {
  Action,
  ActionGroup,
  ActionList,
  useNavigation
} from '@/common/commands'
import { GeneralIcon } from '@/components'
import { useTemplates } from '@/hooks/useTemplates'
import { IssueTemplate } from '@/types/template'
import { openOptionsPage } from '@/utils'

import { CreateIssueMenu } from '../CreateIssue'
import { ProjectPickerMenu } from '../QuickCreate/ProjectPickerMenu'

export function IssueTemplatesMenu() {
  const { data: templates, isLoading } = useTemplates()
  const navigate = useNavigation()

  const handleCreateTemplate = () => {
    openOptionsPage('/templates')
  }

  const onSelect = useCallback(
    (template: IssueTemplate) => {
      navigate.push(
        <CreateIssueMenu scope={template.scope} template={template} />
      )
    },
    [navigate]
  )

  return (
    <ActionList isLoading={isLoading} emptyPlaceholder="No templates">
      <ActionGroup heading="New issue">
        <Action
          value="quick-create"
          icon={Zap}
          title="Quick create"
          keywords={['new', 'issue', 'create']}
          onSelect={() => navigate.push(<ProjectPickerMenu />)}
          exitOnSelect={false}
        />
      </ActionGroup>

      <ActionGroup heading="Issue Templates">
        {templates?.map((template) => (
          <Action
            key={template.id}
            value={template.id}
            keywords={[
              'create',
              template.name,
              template.scope.project.key,
              template.scope.project.name,
              template.scope.issueType.name
            ]}
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
      </ActionGroup>

      {templates?.length === 0 && !isLoading && (
        <Action
          value="create-template"
          icon={Settings}
          title="Create issue template"
          onSelect={handleCreateTemplate}
        />
      )}
    </ActionList>
  )
}
