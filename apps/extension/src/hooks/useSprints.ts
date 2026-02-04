import { useQuery } from '@tanstack/react-query'

import { jiraService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'

export function useSprints(projectKeyOrId: string) {
  return useQuery({
    queryKey: queryKeys.agile.projectSprints(projectKeyOrId),
    queryFn: async () => {
      const result = await jiraService.agile.getSprints(projectKeyOrId)
      return result
    }
  })
}
