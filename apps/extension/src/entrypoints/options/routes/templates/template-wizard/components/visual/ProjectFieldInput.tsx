import { useMemo } from 'react'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'
import { GeneralIcon } from '@/components/ui/jira/GeneralIcon'
import type { JiraProject } from '@/types/jira'

import type { ProjectFieldInputProps } from '../../types'

/**
 * Project field input with avatar support.
 * Uses GeneralIcon component for visual display.
 */
export function ProjectFieldInput({
  value,
  onChange,
  allowedValues,
  field
}: ProjectFieldInputProps) {
  const options = useMemo<SearchOption<JiraProject>[]>(
    () =>
      allowedValues.map((av) => {
        // Extract key from value field if available (format: "KEY: Project Name")
        const key = av.value?.split(':')[0]?.trim() ?? av.id
        return {
          value: av.id,
          label: av.name ?? av.value ?? av.id,
          description: key ? `Key: ${key}` : undefined,
          data: {
            id: av.id,
            key,
            name: av.name ?? av.value ?? av.id,
            avatarUrl: av.iconUrl
          } as JiraProject
        }
      }),
    [allowedValues]
  )

  return (
    <InputSearch
      placeholder={`Select ${field?.name ?? 'project'}…`}
      options={options}
      value={value ? (value as JiraProject) : null}
      onSelect={(val) => onChange(val ?? undefined)}
      renderOptionIcon={(option) =>
        option.data ? (
          <GeneralIcon
            iconUrl={option.data.avatarUrl ?? ''}
            alt={option.data.name}
            size="16"
          />
        ) : null
      }
      filter
      clearable
    />
  )
}
