import {
  Action,
  ActionGroup,
  ActionList,
  ActionPanel,
  useNavigation
} from '@/common/commands'
import { GeneralIcon } from '@/components'
import type { JiraIssueType, JiraProject } from '@/types/jira'

import { CreateIssueMenu } from '../CreateIssue'

export function IssueTypePickerMenu({ project }: { project: JiraProject }) {
  const navigate = useNavigation()
  const issueTypes = (project.issueTypes ?? []).filter((it) => !it.subtask)

  const onSelect = (issueType: JiraIssueType) => {
    navigate.push(<CreateIssueMenu scope={{ project, issueType }} />)
  }

  return (
    <ActionPanel searchPlaceholder="Filter issue types…">
      <ActionList emptyPlaceholder="No issue types">
        <ActionGroup heading={`Issue type · ${project.name}`}>
          {issueTypes.map((issueType) => (
            <Action
              key={issueType.id}
              value={issueType.id}
              keywords={[issueType.name, issueType.description]}
              prefix={
                <GeneralIcon iconUrl={issueType.iconUrl} alt={issueType.name} />
              }
              title={issueType.name}
              onSelect={() => onSelect(issueType)}
              exitOnSelect={false}
            />
          ))}
        </ActionGroup>
      </ActionList>
    </ActionPanel>
  )
}
