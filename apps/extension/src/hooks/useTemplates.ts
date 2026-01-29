import { useQuery } from '@tanstack/react-query'

import { getTemplateService } from '~/services/template-service'

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const svc = getTemplateService()
      return svc.getTemplates()
    }
  })
}
