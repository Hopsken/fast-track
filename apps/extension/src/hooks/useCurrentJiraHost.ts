import { useQuery } from '@tanstack/react-query'

import { getAuthService } from '~/services/auth-service'
import { normalizeBaseUrlHost } from '~/utils/normalize-host'

export function useCurrentJiraHost(): {
  host: string | null
  isLoading: boolean
  error: string | null
} {
  const query = useQuery({
    queryKey: ['auth', 'credentials'],
    queryFn: async () => {
      const svc = getAuthService()
      return svc.getCredentials()
    }
  })

  const host = query.data?.host ? normalizeBaseUrlHost(query.data.host) : null

  return {
    host: host || null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null
  }
}
