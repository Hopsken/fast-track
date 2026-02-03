import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SuggestedIssue } from 'jira.js/version3/models/suggestedIssue'

import { InputSearch, SearchOption } from '@/components/ui'
import { useIssuePickerSuggestions } from '@/hooks/useIssuePickerSuggestions'
import { ticketService } from '@/services'
import { isNonNullable } from '@/utils/assert'
import { minutes } from '@/utils/time'

import { FieldInputBaseProps } from '../../types'

const isSameValue = (a: SuggestedIssue, b: SuggestedIssue) => {
  return a.id === b.id
}

export function ParentInput({
  field,
  value,
  onChange,
  project,
  issueType
}: FieldInputBaseProps<SuggestedIssue>) {
  const [query, setQuery] = useState('')
  const result = useIssuePickerSuggestions({ project, issueType, query })

  const searchOptions = useMemo<Array<SearchOption<SuggestedIssue>>>(() => {
    const issues = result.data ?? []
    return issues.filter(isNonNullable).map(
      (issue) =>
        ({
          value: String(issue.key),
          label:
            issue.summaryText ?? issue.summary ?? issue.key ?? String(issue.id),
          data: issue
        }) satisfies SearchOption<SuggestedIssue>
    )
  }, [result.data])

  return (
    <InputSearch<SuggestedIssue>
      placeholder={`Select ${field?.name}…`}
      options={searchOptions}
      value={value}
      onSelect={(val) => onChange(val ?? undefined)}
      query={query}
      onQueryChange={setQuery}
      isSameValue={isSameValue}
    />
  )
}
