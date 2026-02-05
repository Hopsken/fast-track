import { useQuery } from '@tanstack/react-query'

import { JiraIssueType, JiraProject } from '@/repository/schema'
import { jiraService } from '@/services'
import { minutes } from '@/utils/time'

export function useIssuePickerSuggestions({
  project,
  issueType,
  query
}: {
  project: JiraProject
  issueType: JiraIssueType
  query: string
}) {
  const epicsOnly = !issueType.subtask
  return useQuery({
    queryKey: ['issues/suggestions', project.id, query, epicsOnly],
    queryFn: () => {
      return jiraService.issues.getIssuePickerSuggestions({
        query,
        currentProjectId: project.id,
        showSubTasks: false,
        currentJQL: epicsOnly ? 'issuetype = Epic' : 'issuetype != Epic'
      })
    },
    staleTime: minutes(1)
  })
}
