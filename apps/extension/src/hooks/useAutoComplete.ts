import { useQuery } from '@tanstack/react-query'
import { UserDetails } from 'jira.js/version3/models/userDetails'
import { z } from 'zod'

import { getJiraService } from '@/services/jira-service'
import { queryKeys } from '@/utils/queryKeys'

export function useAutoCompleteQuery<T>(url: string, query: string) {
  return useQuery({
    queryKey: queryKeys.autoComplete(url, query),
    queryFn: async () => {
      const jiraService = getJiraService()
      const result = await jiraService.autoComplete<T>(url, query)
      return result
    },
    enabled: !!url && z.url().safeParse(url).success
  })
}

export function useAutoCompleteUsers(url: string, query: string) {
  return useAutoCompleteQuery<UserDetails[]>(url, query)
}
