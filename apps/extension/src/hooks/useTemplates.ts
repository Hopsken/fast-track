import { useQuery } from '@tanstack/react-query'

import { getTemplateService } from '@/services'
import { queryKeys } from '@/utils/queryKeys'

export function useTemplates(options?: { includeOtherHosts?: boolean }) {
  const { includeOtherHosts = false } = options ?? {}
  return useQuery({
    queryKey: queryKeys.issueTemplates.list(includeOtherHosts),
    queryFn: async () => {
      return getTemplateService().getTemplates({ includeOtherHosts })
    }
  })
}
