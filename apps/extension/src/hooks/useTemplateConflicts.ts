import { useQuery } from '@tanstack/react-query'

export function useTemplateConflicts(templateId: string | null) {
  return useQuery({
    queryKey: ['template-conflicts', templateId],
    enabled: !!templateId,
    queryFn: async () => {
      if (!templateId) return []

      throw new Error('Not implemented')
    }
  })
}
