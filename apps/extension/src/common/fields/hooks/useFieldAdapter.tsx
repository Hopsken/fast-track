import { useMemo } from 'react'

import { JiraFieldMetadata } from '@/repository/schema'

import { FallbackAdapter } from '../adapters/fallback'
import { getFieldAdapter } from '../registry'

export const useFieldAdapter = (field: JiraFieldMetadata) => {
  const adapter = useMemo(() => getFieldAdapter(field.schema), [field.schema])

  if (!adapter) return FallbackAdapter

  return adapter
}
