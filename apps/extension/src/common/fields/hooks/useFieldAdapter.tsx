import { useMemo } from 'react'

import { JiraFieldMetadata } from '@/repository/schema'

import { FallbackAdapter } from '../adapters/FallbackAdapter'
import { getFieldAdapter } from '../registry'

export const useFieldAdapter = (field: JiraFieldMetadata) => {
  const adapter = useMemo(() => getFieldAdapter(field.schema), [field.schema])

  console.log('ad', adapter)

  if (!adapter) return FallbackAdapter

  return adapter
}
