import { useQuery } from '@tanstack/react-query'
import { useDebounce } from 'ahooks'
import { UserDetails } from 'jira.js/version3/models/userDetails'
import { z } from 'zod'

import { jiraService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'

export function useAutoComplete<T>(
  url: string,
  params?: Record<string, unknown>
) {
  return useQuery({
    queryKey: queryKeys.autoComplete(url, JSON.stringify(params ?? {})),
    queryFn: async () => {
      const result = await jiraService.autoComplete(url, params)
      return result as T
    },
    enabled: !!url && z.url().safeParse(url).success
  })
}

export function useAutoCompleteQuery<T>(url: string, query: string) {
  const debouncedQuery = useDebounce(query, { wait: 300 })
  return useAutoComplete<T>(url, { query: debouncedQuery })
}

export function useAutoCompleteUsers(url: string, query: string) {
  return useAutoCompleteQuery<UserDetails[]>(url, query)
}
