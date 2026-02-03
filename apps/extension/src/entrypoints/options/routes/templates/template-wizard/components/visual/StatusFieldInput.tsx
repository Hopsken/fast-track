import { useMemo } from 'react'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'
import { StatusBadge } from '@/components/ui/jira/StatusBadge'
import type { JiraStatus } from '@/types/jira'

import type { StatusFieldInputProps } from '../../types'

/**
 * Status field input with badge support.
 * Uses StatusBadge component for visual display.
 */
export function StatusFieldInput({
  value,
  onChange,
  allowedValues,
  field
}: StatusFieldInputProps) {
  const options = useMemo<SearchOption<JiraStatus>[]>(
    () =>
      allowedValues.map((av) => {
        const category = (
          av as {
            statusCategory?: { key?: string; colorName?: string; name?: string }
          }
        ).statusCategory
        return {
          value: av.id,
          label: av.name ?? av.value ?? av.id,
          data: {
            id: av.id,
            name: av.name ?? av.value ?? av.id,
            description: '',
            statusCategory: {
              key: category?.key ?? 'indeterminate',
              colorName: category?.colorName ?? 'default',
              name: category?.name ?? 'Unknown'
            }
          } as JiraStatus
        }
      }),
    [allowedValues]
  )

  // Convert value to JiraStatus if it exists
  const jiraValue = value
    ? ({
        id: value.id,
        name: value.name,
        description: '',
        statusCategory:
          typeof value.statusCategory === 'string'
            ? {
                key: value.statusCategory,
                colorName: 'default',
                name: value.statusCategory
              }
            : value.statusCategory
              ? (value.statusCategory as {
                  key: string
                  colorName: string
                  name: string
                })
              : { key: 'indeterminate', colorName: 'default', name: 'Unknown' }
      } as JiraStatus)
    : undefined

  return (
    <InputSearch
      placeholder={`Select ${field?.name ?? 'status'}…`}
      options={options}
      value={jiraValue}
      onSelect={(val) =>
        onChange(
          val
            ? {
                id: val.id,
                name: val.name,
                statusCategory:
                  typeof val.statusCategory === 'string'
                    ? val.statusCategory
                    : val.statusCategory.key
              }
            : undefined
        )
      }
      renderOption={(option, isSelected) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={option.data} />
        </div>
      )}
      filter
      clearable
    />
  )
}
