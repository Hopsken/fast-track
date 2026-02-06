import { useAutoCompleteQuery } from '@/hooks/useAutoComplete'
import { JiraFieldMetadata } from '@/repository/schema'

export function useFieldOptions<T = unknown>(
  field: JiraFieldMetadata,
  query: string
) {
  const { autoCompleteUrl, allowedValues } = field
  const { data: options } = useAutoCompleteQuery<T[]>(
    autoCompleteUrl ?? '',
    query
  )
  return options || (allowedValues as T[]) || []
}
