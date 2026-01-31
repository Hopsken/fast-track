import { useQuery } from '@tanstack/react-query'

import { getTemplateService } from '~/services/template-service'

export function useFieldMetadataCache(cacheKey: string | null) {
  return useQuery({
    queryKey: ['template-field-metadata-cache', cacheKey],
    enabled: !!cacheKey,
    queryFn: async () => {
      if (!cacheKey) return null
      const svc = getTemplateService()
      return svc.getFieldMetadataCache(cacheKey)
    }
  })
}
