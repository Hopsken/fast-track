import { useMemo, useState } from 'react'
import { CheckIcon, XIcon } from 'lucide-react'
import { nanoid } from 'nanoid'

import type { AllowedValue, FieldMetadata } from '~/types/template'

/**
 * Two-mode input for restricted field configuration:
 *
 * 1. **Jira-provided options** (field.allowedValues exists):
 *    - Checkbox grid to select subset
 *
 * 2. **User-defined options** (no field.allowedValues):
 *    - Chip input to add custom values
 *    - Number fields: validates numeric input
 *    - Text fields: free-text input
 *    - User fields: TODO — needs user search picker
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
  const hasJiraOptions = Boolean(
    field.allowedValues && field.allowedValues.length > 0
  )

  return hasJiraOptions ? (
    <JiraProvidedOptions
      field={field}
      selectedOptions={selectedOptions}
      onChange={onChange}
    />
  ) : (
    <UserDefinedOptions
      field={field}
      selectedOptions={selectedOptions}
      onChange={onChange}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Jira-provided options (checkbox grid)                             */
/* ------------------------------------------------------------------ */

function JiraProvidedOptions({
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

/* ------------------------------------------------------------------ */
/*  User-defined options (chip input)                                 */
/* ------------------------------------------------------------------ */

function UserDefinedOptions({
  field,
  selectedOptions,
  onChange
}: {
  field: FieldMetadata
  selectedOptions: AllowedValue[]
  onChange: (options: AllowedValue[]) => void
}) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isNumberField = field.schema.type === 'number'
  const isUserField =
    field.schema.type === 'user' ||
    (field.schema.type === 'array' && field.schema.items === 'user')

  function addOption() {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setError('Value cannot be empty')
      return
    }

    // Validate number fields
    if (isNumberField) {
      const num = Number(trimmed)
      if (!Number.isFinite(num)) {
        setError('Must be a valid number')
        return
      }
    }

    // Check for duplicates
    if (
      selectedOptions.some((o) => o.value === trimmed || o.name === trimmed)
    ) {
      setError('Value already added')
      return
    }

    // Create new option
    const newOption: AllowedValue = {
      id: nanoid(8),
      ...(isNumberField
        ? { value: trimmed, name: trimmed }
        : { value: trimmed, name: trimmed })
    }

    onChange([...selectedOptions, newOption])
    setInputValue('')
    setError(null)
  }

  function removeOption(id: string) {
    onChange(selectedOptions.filter((o) => o.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addOption()
    }
  }

  // TODO: User fields need special handling (user search)
  if (isUserField) {
    return (
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-muted-foreground text-xs">
          User field restricted mode coming soon. Use <strong>Fill</strong> mode
          to preset a user, or <strong>Show</strong> mode for user search at
          creation.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Input */}
      <div className="space-y-1">
        <div className="flex gap-1.5">
          <input
            type={isNumberField ? 'number' : 'text'}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isNumberField
                ? 'Enter number (e.g., 1, 2, 3, 5, 8)'
                : 'Enter allowed value'
            }
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex-1 rounded-md border px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-1"
          />
          <button
            type="button"
            onClick={addOption}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-xs font-medium transition-colors">
            Add
          </button>
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>

      {/* Chips */}
      {selectedOptions.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          No options added yet.{' '}
          <span className="text-destructive">(add at least 1)</span>
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {selectedOptions.map((option) => {
            const label = option.name ?? option.value ?? option.id
            return (
              <div
                key={option.id}
                className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs">
                {label}
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  className="text-primary/70 hover:text-primary transition-colors"
                  aria-label={`Remove ${label}`}>
                  <XIcon className="size-3" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {isNumberField && selectedOptions.length === 0 && (
        <p className="text-muted-foreground text-xs">
          💡 Tip: Common story point sequences: 1, 2, 3, 5, 8, 13
        </p>
      )}
    </div>
  )
}
