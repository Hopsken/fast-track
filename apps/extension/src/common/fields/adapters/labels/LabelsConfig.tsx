import { useCallback, useMemo, useState } from 'react'
import { uniq } from 'lodash-es'
import { ZodString } from 'zod'

import { CreatableAutoComplete } from '@/components/ui/CreatableAutoComplete'

import { useFieldOptions } from '../../hooks/useFieldOptions'
import { FieldConfigComponentProps, SelectComponentProps } from '../../types'
import { useFieldContext } from '../shared/context'
import { GenericFieldConfig } from '../shared/GenericFieldConfig'

export const LabelsSelector = ({
  isMultiple,
  value,
  onChange,
  onConfirm
}: SelectComponentProps<string>) => {
  const [query, setQuery] = useState('')
  const { adapter, context, config } = useFieldContext<ZodString>()
  const { options: labels, isLoading } = useFieldOptions<ZodString>({
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
      multiple={isMultiple}
      isLoading={isLoading}
      value={value}
      onValueChange={(next) => {
        onChange(next)
        onConfirm?.(next)
      }}
      options={allOptions}
      onCreate={onCreate}
      query={query}
      onQueryChange={setQuery}
    />
  )
}

export const LabelsConfig = (props: FieldConfigComponentProps<ZodString>) => {
  return <GenericFieldConfig {...props} SelectorComponent={LabelsSelector} />
}
