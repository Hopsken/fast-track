import { useMemo } from 'react'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'
import { GeneralIcon } from '@/components/ui/jira/GeneralIcon'

import type { ResolutionFieldInputProps, IconOption } from '../../types'

/**
 * Resolution field input with icon support.
 * Uses GeneralIcon component for visual display.
 */
export function ResolutionFieldInput({
  value,
  onChange,
  allowedValues,
  field
}: ResolutionFieldInputProps) {
  const options = useMemo<SearchOption<IconOption>[]>(
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

  return (
    <InputSearch
      placeholder={`Select ${field?.name ?? 'resolution'}…`}
      options={options}
      value={value ?? null}
      onSelect={(val) => onChange(val ?? undefined)}
      renderOptionIcon={(option) =>
        option.data ? (
          <GeneralIcon
            iconUrl={option.data.iconUrl ?? ''}
            alt={option.data.name ?? 'Resolution'}
            size="16"
          />
        ) : null
      }
      filter
      clearable
    />
  )
}
