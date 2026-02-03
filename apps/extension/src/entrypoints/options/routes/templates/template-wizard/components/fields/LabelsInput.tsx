import { AutoComplete } from '@/components/ui/AutoComplete'
import { useLabels } from '@/hooks/useLabels'

import { FieldInputBaseProps } from '../../types'

export function LabelsInput({
  value,
  onChange
}: FieldInputBaseProps<string[]>) {
  const { data: labels } = useLabels()

  return (
    <AutoComplete<string, true>
      multiple
      value={value ?? []}
      onValueChange={onChange}
      options={labels ?? []}
      getOptionValue={(option) => option}
      getOptionLabel={(option) => option}
    />
  )
}
