import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'ahooks'
import { UserDetails } from 'jira.js/version2/models/userDetails'

import { getJiraService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'

export function useProjectUsers(projectKey: string, query: string) {
  const debouncedQuery = useDebounce(query, { wait: 300 })
  return useQuery({
    queryKey: queryKeys.users.search(projectKey, debouncedQuery),
    queryFn: async () => {
      try {
        const result = await getJiraService().searchUserOfProject(
          projectKey,
          debouncedQuery
        )
        return result as UserDetails[]
      } catch (error) {
        console.error('Failed to fetch project users:', error)
        return []
      }
    }
  })
}
