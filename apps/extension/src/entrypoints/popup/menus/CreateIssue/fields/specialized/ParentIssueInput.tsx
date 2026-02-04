import { useCallback, useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandLoading
} from '@internal/ui/components/command'
import { SuggestedIssue } from 'jira.js/version3/models/suggestedIssue'

import { useIssuePickerSuggestions } from '@/hooks/useIssuePickerSuggestions'
import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { isNonNullable } from '@/utils/assert'

import { useCreateIssueDraftStore } from '../../useCreateIssueDraftStore'
import { FieldInputProps } from '../primitive/types'
import { getFieldTitle } from '../utils'

export function ParentIssueInput({
  field,
  onChange,
  onConfirm
}: FieldInputProps) {
  const { search } = useCommandInput()
  const title = getFieldTitle(field)
  const { template } = useCreateIssueDraftStore()

  const project = template.scope.project
  const issueType = template.scope.issueType

  const { data: suggestions, isLoading } = useIssuePickerSuggestions({
    project,
    issueType,
    query: search
  })

  const issues = useMemo(
    () => (suggestions ?? []).filter(isNonNullable),
    [suggestions]
  )

  const handleSelect = useCallback(
    (issue: SuggestedIssue) => {
      onChange(issue)
      onConfirm()
    },
    [onChange, onConfirm]
  )

  return (
    <CommandList>
      <CommandGroup heading={title}>
        {isLoading ? <CommandLoading>Loading...</CommandLoading> : null}

        {issues.map((issue) => {
          const issueKey = issue.key ?? String(issue.id)
          const displayText = issue.summaryText ?? issue.summary ?? issueKey

          return (
            <CommandItem
              key={issueKey}
              value={issueKey}
              keywords={[issueKey, displayText]}
              onSelect={() => handleSelect(issue)}>
              <div className="flex w-full flex-col">
                <span className="truncate font-medium">{issueKey}</span>
                {displayText !== issueKey ? (
                  <span className="text-muted-foreground truncate text-xs">
                    {displayText}
                  </span>
                ) : null}
              </div>
            </CommandItem>
          )
        })}

        {!isLoading && issues.length === 0 && search.trim().length > 0 ? (
          <CommandEmpty>No issues found</CommandEmpty>
        ) : null}

        {!isLoading && issues.length === 0 && search.trim().length === 0 ? (
          <CommandEmpty>Type to search for parent issue...</CommandEmpty>
        ) : null}
      </CommandGroup>
    </CommandList>
  )
}
