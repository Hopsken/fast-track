import { useQuery } from '@tanstack/react-query'
import { IssueTransition } from 'jira.js/version3/models/issueTransition'

import { jiraService } from '@/services'
import { JiraTicket, JiraTransition } from '@/types'
import { isNonNullable } from '@/utils/assert'
import { mapStatus } from '@/utils/jira/issues'
import { queryKeys } from '@/utils/queryKeys'

function mapTransition(transition: IssueTransition): JiraTransition | null {
  if (!transition.id) return null

  return {
    id: transition.id,
    name: transition.name || transition.to?.name || transition.id,
    to: mapStatus(transition.to)
  }
}

export function useIssueTransitions(issue: JiraTicket) {
  return useQuery({
    queryKey: queryKeys.issue.transitions(issue),
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const result = await jiraService.proxyCall(
        'issues.getIssueTransitions',
        issue
      )

      const transitions = Array.isArray(result) ? result : []

      return transitions.map(mapTransition).filter(isNonNullable)
    }
  })
}
