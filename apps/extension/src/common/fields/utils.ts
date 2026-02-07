import { z, ZodType } from 'zod'

import { JiraFieldMetadata } from '@/repository/schema'
import { getJiraService } from '@/services'
import { isNonNullable } from '@/utils/assert'

export async function fetchAutoCompleteOptions<S extends ZodType>(
  metadata: JiraFieldMetadata,
  schema: S,
  query?: string
): Promise<z.infer<S>[]> {
  const svc = getJiraService()
  const { autoCompleteUrl } = metadata

  if (autoCompleteUrl) {
    const result = await svc.autoComplete(autoCompleteUrl, { query })
    if (!Array.isArray(result)) return []
    return result
      .map((item) => schema.safeParse(item).data)
      .filter(isNonNullable)
  }

  return []
}
