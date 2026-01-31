import { useQuery } from '@tanstack/react-query'

import { templateService } from '@/services'

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      return templateService.getTemplates()
    }
  })
}
