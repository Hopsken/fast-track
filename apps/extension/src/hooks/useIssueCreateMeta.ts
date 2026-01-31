import { useQuery } from '@tanstack/react-query'

import { ticketService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'
import { minutes } from '@/utils/time'

export function useIssueCreateMeta(project: string, issueTypeId: string) {
  return useQuery({
    queryKey: queryKeys.issues.createMeta(project, issueTypeId),
    queryFn: () => {
      return ticketService.getCreateIssueFields({
        projectIdOrKey: project,
        issueTypeId
      })
    },
    staleTime: minutes(1)
  })
}
