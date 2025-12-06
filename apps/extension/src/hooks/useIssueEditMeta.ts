import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getJiraService } from '@/services/jira-service'
import { JiraTicket } from '@/types'
import { queryKeys } from '@/utils/queryKeys'

export function useIssueEditMeta(issue: JiraTicket) {
  const [jiraService] = useState(() => getJiraService())

  return useQuery({
    queryKey: queryKeys.issue.editMeta(issue),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const result = await jiraService.proxyCall(
        'issues.getIssueEditMetadata',
        issue
      )

      return result as {
        fields?: {
          assignee?: {
            autoCompleteUrl: string
          }
        }
      }
    }
  })
}
