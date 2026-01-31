import { useQuery } from '@tanstack/react-query'

import { getTemplateService } from '~/services/template-service'

export function useTemplateConflicts(templateId: string | null) {
  return useQuery({
    queryKey: ['template-conflicts', templateId],
    enabled: !!templateId,
    queryFn: async () => {
      if (!templateId) return []
      const svc = getTemplateService()
      return svc.getTemplateConflicts(templateId)
    }
  })
}
