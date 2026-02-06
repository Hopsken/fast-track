import { useCallback, useMemo, useState } from 'react'
import { uniq } from 'lodash-es'
import { ZodString } from 'zod'

import { CreatableAutoComplete } from '@/components/ui/CreatableAutoComplete'

import { useFieldOptions } from '../../hooks/useFieldOptions'
import { FieldConfigComponentProps } from '../../types'

/**
 * Single select field input with search/filter functionality.
 * Converts field metadata allowed values into searchable options.
 * Supports filtering to quickly find options in large lists.
 */
export const LabelsConfig = ({
  value,
  onValueChange,
  adapter,
  context,
  config
}: FieldConfigComponentProps<ZodString>) => {
  const [query, setQuery] = useState('')
  const { options: labels, isLoading } = useFieldOptions({
    adapter,
    context,
    config,
    query
  })

  const [newLabels, setNewLabels] = useState<string[]>([])

  const onCreate = useCallback((label: string) => {
    setNewLabels((prev) => uniq([...prev, label]))
  }, [])

  const allOptions = useMemo(() => {
    return uniq([...(labels ?? []), ...newLabels])
  }, [labels, newLabels])

  return (
    <CreatableAutoComplete
      multiple
      isLoading={isLoading}
      value={(value as unknown as string[]) ?? []}
      // @ts-expect-error to fix
      onValueChange={onValueChange}
      options={allOptions}
      // No need to actually create labels
      onCreate={onCreate}
      query={query}
      onQueryChange={setQuery}
    />
  )
}
