import { AutoComplete } from '@/components/ui/AutoComplete'
import { useSprints } from '@/hooks/useSprints'
import { formatDateToISO } from '@/lib/date'
import { AgileSprint } from '@/lib/jira/agile'

import { FieldInputBaseProps } from '../../types'

export function SprintInput({
  project,
  value,
  onChange
}: FieldInputBaseProps<AgileSprint>) {
  const { data: users, isLoading } = useSprints(project.key)

  return (
    <AutoComplete<AgileSprint>
      filter
      multiple={false}
      isLoading={isLoading}
      options={users ?? []}
      value={value}
      onValueChange={(v) => onChange(v ?? undefined)}
      getOptionValue={(opt) => String(opt.id)}
      getOptionLabel={(opt) => opt.name}
      getOptionDescription={(opt) =>
        `${opt.startDate ? formatDateToISO(opt.startDate) : ''} - ${
          opt.endDate ? formatDateToISO(opt.endDate) : ''
        }`
      }
    />
  )
}
