import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'

import { useSprints } from '@/hooks/useSprints'
import { formatDateToISO } from '@/lib/date'
import type { AgileSprint } from '@/lib/jira/agile'
import { useCommandInput } from '@/stores/command/useCommandInputStore'

import { useCreateIssueDraftStore } from '../../useCreateIssueDraftStore'
import { FieldInputProps } from '../primitive/types'
import { asRecord, getFieldTitle } from '../utils'

export function SprintInput({
  field,
  currentValue,
  onChange,
  onConfirm
}: FieldInputProps) {
  const { setValue } = useCommandInput()
  const title = getFieldTitle(field)
  const { template } = useCreateIssueDraftStore()
  const projectKey = template.scope.project.key

  const { data: sprints, isLoading } = useSprints(projectKey)

  // Extract selected sprint from currentValue
  const selected = useMemo((): AgileSprint | undefined => {
    const rec = asRecord(currentValue)
    if (!rec || typeof rec.id !== 'number') return undefined
    return sprints?.find((s) => s.id === rec.id)
  }, [currentValue, sprints])

  useMount(() => {
    if (selected) {
      setValue(String(selected.id))
    }
  })

  const onSelect = (sprint: AgileSprint) => {
    onChange(sprint)
    onConfirm()
  }

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {isLoading ? <CommandLoading>Loading...</CommandLoading> : null}

        {(sprints ?? []).map((sprint) => {
          const dateRange =
            sprint.startDate && sprint.endDate
              ? `${formatDateToISO(sprint.startDate)} - ${formatDateToISO(sprint.endDate)}`
              : ''

          return (
            <CommandItem
              key={sprint.id}
              value={String(sprint.id)}
              keywords={[sprint.name, dateRange]}
              onSelect={() => {
                onSelect(sprint)
              }}>
              <div className="flex w-full flex-col">
                <span className="truncate">{sprint.name}</span>
                {dateRange ? (
                  <span className="text-muted-foreground truncate text-xs">
                    {dateRange}
                  </span>
                ) : null}
              </div>
            </CommandItem>
          )
        })}

        {!isLoading && (sprints ?? []).length === 0 ? (
          <CommandEmpty>No sprints available</CommandEmpty>
        ) : null}
      </CommandGroup>
    </CommandList>
  )
}
