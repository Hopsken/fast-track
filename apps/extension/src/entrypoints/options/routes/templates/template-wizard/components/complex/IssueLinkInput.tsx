import { useMemo } from 'react'
import { Input } from '@internal/ui/components/input'
import { Label } from '@internal/ui/components/label'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'

import type { IssueLinkInputProps, IconOption } from '../../types'

/**
 * Issue link input (Phase 1: simple text input).
 * User selects link type and enters issue key manually.
 */
export function IssueLinkInput({
  value,
  onChange,
  allowedValues
}: IssueLinkInputProps) {
  const linkTypeOptions = useMemo<SearchOption<IconOption>[]>(
    () =>
      allowedValues.map((av) => ({
        value: av.id,
        label: av.name ?? av.value ?? av.id,
        data: {
          id: av.id,
          name: av.name ?? av.value ?? av.id,
          value: av.value,
          iconUrl: av.iconUrl
        }
      })),
    [allowedValues]
  )

  const selectedLinkType = value?.type
    ? {
        id: value.type.id,
        name: value.type.name
      }
    : null

  const issueKey = value?.outwardIssue?.key ?? ''

  const handleLinkTypeChange = (newType: IconOption | null) => {
    if (!newType) {
      onChange(undefined)
      return
    }

    onChange({
      type: { id: newType.id, name: newType.name ?? newType.id },
      outwardIssue: value?.outwardIssue
    })
  }

  const handleIssueKeyChange = (newKey: string) => {
    if (!selectedLinkType) return

    onChange({
      type: selectedLinkType,
      outwardIssue: newKey.length > 0 ? { key: newKey } : undefined
    })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="link-type" className="text-sm">
          Link Type
        </Label>
        <InputSearch
          id="link-type"
          placeholder="Select link type…"
          options={linkTypeOptions}
          value={selectedLinkType ?? undefined}
          onSelect={handleLinkTypeChange}
          filter
          clearable
        />
      </div>

      {selectedLinkType && (
        <div className="space-y-1">
          <Label htmlFor="issue-key" className="text-sm">
            Issue Key
          </Label>
          <Input
            id="issue-key"
            type="text"
            placeholder="e.g., PROJ-123"
            value={issueKey}
            onChange={(e) => handleIssueKeyChange(e.target.value)}
          />
          <p className="text-muted-foreground text-xs">
            Enter the key of the issue to link (e.g., PROJ-123)
          </p>
        </div>
      )}
    </div>
  )
}
