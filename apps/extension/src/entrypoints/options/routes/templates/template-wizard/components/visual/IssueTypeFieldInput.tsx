import { useMemo } from 'react'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'
import { IssueTypeIcon } from '@/components/ui/jira/IssueTypeIcon'
import type { JiraIssueType } from '@/types/jira'

import type { IssueTypeFieldInputProps } from '../../types'

/**
 * Issue type field input with icon support.
 * Uses IssueTypeIcon component for visual display.
 */
export function IssueTypeFieldInput({
  value,
  onChange,
  allowedValues,
  field
}: IssueTypeFieldInputProps) {
  const options = useMemo<SearchOption<JiraIssueType>[]>(
    () =>
      allowedValues.map((av) => ({
        value: av.id,
        label: av.name ?? av.value ?? av.id,
        data: {
          id: av.id,
          name: av.name ?? av.value ?? av.id,
          iconUrl: av.iconUrl ?? ''
        } as JiraIssueType
      })),
    [allowedValues]
  )

  // Convert value to JiraIssueType if it exists
  const jiraValue = value
    ? ({
        id: value.id,
        name: value.name ?? value.id,
        iconUrl: value.iconUrl ?? '',
        description: ''
      } as JiraIssueType)
    : undefined

  return (
    <InputSearch
      placeholder={`Select ${field?.name ?? 'issue type'}…`}
      options={options}
      value={jiraValue}
      onSelect={(val) => onChange(val ?? undefined)}
      renderOptionIcon={(option) => (
        <IssueTypeIcon issueType={option.data} size="16" />
      )}
      filter
      clearable
    />
  )
}
