import { useCallback, useMemo, useState } from 'react'
import { uniq } from 'lodash-es'

import { CreatableAutoComplete } from '@/components/ui/CreatableAutoComplete'
import { useLabels } from '@/hooks/useLabels'

import { FieldInputBaseProps } from '../../types'

export function LabelsInput({
  value,
  onChange
}: FieldInputBaseProps<string[]>) {
  const [query, setQuery] = useState('')
  const { data: labels, isLoading } = useLabels()
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
      value={value ?? []}
      onValueChange={onChange}
      options={allOptions}
      // No need to actually create labels
      onCreate={onCreate}
      query={query}
      onQueryChange={setQuery}
    />
  )
}
