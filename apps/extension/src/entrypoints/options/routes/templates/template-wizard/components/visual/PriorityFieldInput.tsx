import { useMemo } from 'react'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'
import { PriorityIcon } from '@/components/ui/jira/PriorityIcon'
import type { JiraPriority } from '@/types/jira'

import type { PriorityFieldInputProps } from '../../types'

/**
 * Priority field input with icon support.
 * Uses PriorityIcon component for visual display.
 */
export function PriorityFieldInput({
  value,
  onChange,
  allowedValues,
  field
}: PriorityFieldInputProps) {
  const options = useMemo<SearchOption<JiraPriority>[]>(
    () =>
      allowedValues.map((av) => ({
        value: av.id,
        label: av.name ?? av.value ?? av.id,
        data: {
          id: av.id,
          name: av.name ?? av.value ?? av.id,
          iconUrl: av.iconUrl ?? ''
        } as JiraPriority
      })),
    [allowedValues]
  )

  // Convert value to JiraPriority if it exists
  const jiraValue = value
    ? ({
        id: value.id,
        name: value.name ?? value.id,
        iconUrl: value.iconUrl ?? ''
      } as JiraPriority)
    : undefined

  return (
    <InputSearch
      placeholder={`Select ${field?.name ?? 'priority'}…`}
      options={options}
      value={jiraValue}
      onSelect={(val) =>
        onChange(
          val
            ? {
                id: val.id ?? '',
                name: val.name,
                iconUrl: val.iconUrl
              }
            : undefined
        )
      }
      renderOptionIcon={(option) => (
        <PriorityIcon priority={option.data} size="16" />
      )}
      filter
      clearable
    />
  )
}
