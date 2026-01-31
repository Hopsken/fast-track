import { useMemo } from 'react'
import { CheckIcon } from 'lucide-react'

import type { AllowedValue, FieldMetadata } from '~/types/template'

/**
 * Checkbox-style picker for selecting which allowed values to include
 * in a restricted field configuration.
 *
 * Used in the template wizard when a field is in "restricted" mode.
 * The selected options become the only choices available at issue creation.
 *
 * TODO(phase2): Support restricted mode for user fields (search + add by accountId)
 * TODO(phase2): Support restricted mode for number fields (manual entry of allowed numbers)
 */
export function RestrictedOptionsInput({
  field,
  selectedOptions,
  onChange
}: {
  field: FieldMetadata
  selectedOptions: AllowedValue[]
  onChange: (options: AllowedValue[]) => void
}) {
  const allOptions = field.allowedValues ?? []

  const selectedIds = useMemo(
    () => new Set(selectedOptions.map((o) => o.id)),
    [selectedOptions]
  )

  const allSelected =
    allOptions.length > 0 && selectedIds.size === allOptions.length
  const noneSelected = selectedIds.size === 0

  function toggleOption(option: AllowedValue) {
    if (selectedIds.has(option.id)) {
      onChange(selectedOptions.filter((o) => o.id !== option.id))
    } else {
      onChange([...selectedOptions, option])
    }
  }

  function toggleAll() {
    onChange(allSelected ? [] : allOptions)
  }

  if (allOptions.length === 0) {
    return (
      <p className="text-muted-foreground text-xs">
        No allowed values available for this field.
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          {selectedIds.size} of {allOptions.length} options included
          {noneSelected && (
            <span className="text-destructive ml-1">(select at least 1)</span>
          )}
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="text-muted-foreground hover:text-foreground text-xs underline-offset-2 transition-colors hover:underline">
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {allOptions.map((option) => {
          const selected = selectedIds.has(option.id)
          const label = option.name ?? option.value ?? option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleOption(option)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                selected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:border-foreground/30 border-transparent bg-transparent'
              }`}>
              {selected && <CheckIcon className="size-3" />}
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
