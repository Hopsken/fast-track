import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem
} from '@internal/ui/components/command'
import { useMount } from 'ahooks'
import { Check } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useLocation } from 'react-router-dom'

import { useCommandInput } from '@/stores/command/useCommandInputStore'
import { VisibleField } from '~/services/template-service/gap-analysis'
import type { AllowedValue } from '~/types/template'

import { SummaryDescriptionFieldInputMenu } from './fields/SummaryDescriptionFieldInputMenu'
import { UserFieldInputMenu } from './fields/UserFieldInputMenu'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { useWizardNavigation } from './useWizardNavigation'

const asRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' ? (v as Record<string, unknown>) : null

function isArrayOfAllowedValues(value: unknown): value is AllowedValue[] {
  return (
    Array.isArray(value) &&
    value.every((v) => {
      const rec = asRecord(v)
      return !!rec && typeof rec.id === 'string'
    })
  )
}

export function FieldInputMenu() {
  const { field } = useLocation().state as { field: VisibleField }
  const { fieldId, metadata } = field
  const schemaType = metadata?.schema.type
  const schemaItems = metadata?.schema.items

  const isCombinedField = fieldId === 'summary' || fieldId === 'description'

  const allowedOptions = useMemo<AllowedValue[]>(
    () => field.allowedOptions ?? field.metadata?.allowedValues ?? [],
    [field]
  )
  const title = useMemo(() => field.metadata?.name ?? field.fieldId, [field])

  const { search, setSearch } = useCommandInput()
  const { values, setValue } = useCreateIssueDraftStore()
  const { goToNextField } = useWizardNavigation()
  const currentValue = values[field.fieldId]

  // Pre-fill the global command input for scalar fields.
  useMount(() => {
    if (isCombinedField) return // combined component handles its own pre-fill
    if (!currentValue) return
    if (
      fieldId === 'summary' ||
      schemaType === 'string' ||
      schemaType === 'number'
    ) {
      const next = String(currentValue)
      setSearch(next)
    }
  })

  const saveAndContinue = (value: unknown) => {
    setValue(fieldId, value)
    setSearch('')
    goToNextField()
  }

  const enableEnterSave =
    fieldId === 'summary' ||
    schemaType === 'string' ||
    schemaType === 'number' ||
    (schemaType === 'array' &&
      schemaItems === 'string' &&
      allowedOptions.length === 0) ||
    !schemaType

  // Text / number fields: press Enter to save.
  useHotkeys(
    'enter',
    () => {
      if (schemaType === 'number') {
        const trimmed = search.trim()
        if (!trimmed) {
          saveAndContinue(undefined)
          return
        }
        const num = Number(trimmed)
        if (!Number.isFinite(num)) return
        saveAndContinue(num)
        return
      }

      // labels-style fallback: array<string> (comma separated)
      if (
        schemaType === 'array' &&
        schemaItems === 'string' &&
        allowedOptions.length === 0
      ) {
        const parts = search
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
        saveAndContinue(parts)
        return
      }

      if (fieldId === 'summary' || schemaType === 'string' || !schemaType) {
        saveAndContinue(search)
      }
    },
    {
      enabled: enableEnterSave && !isCombinedField,
      preventDefault: true,
      enableOnFormTags: true
    },
    [
      search,
      enableEnterSave,
      allowedOptions.length,
      fieldId,
      saveAndContinue,
      schemaItems,
      schemaType
    ]
  )

  if (isCombinedField) {
    return (
      <SummaryDescriptionFieldInputMenu
        focusField={fieldId as 'summary' | 'description'}
      />
    )
  }

  if (schemaType === 'user') {
    const autoCompleteUrl = metadata?.autoCompleteUrl ?? ''
    return (
      <UserFieldInputMenu
        fieldId={fieldId}
        title={title}
        autoCompleteUrl={autoCompleteUrl}
        onDone={() => {
          setSearch('')
          goToNextField()
        }}
      />
    )
  }

  // Single-select option fields
  if (
    schemaType === 'option' ||
    schemaType === 'priority' ||
    schemaType === 'resolution'
  ) {
    return (
      <CommandList>
        <CommandGroup heading={title}>
          {allowedOptions.map((opt) => (
            <CommandItem
              key={opt.id}
              value={opt.name ?? opt.value ?? opt.id}
              onSelect={() => saveAndContinue(opt)}>
              <span className="truncate">
                {opt.name ?? opt.value ?? opt.id}
              </span>
            </CommandItem>
          ))}

          {allowedOptions.length === 0 ? (
            <CommandEmpty>No options available</CommandEmpty>
          ) : null}
        </CommandGroup>
      </CommandList>
    )
  }

  // Multi-select option fields
  if (schemaType === 'array' && allowedOptions.length > 0) {
    const selected = isArrayOfAllowedValues(currentValue) ? currentValue : []
    const selectedIds = new Set(selected.map((o) => o.id))

    const toggle = (opt: AllowedValue) => {
      const next = selectedIds.has(opt.id)
        ? selected.filter((o) => o.id !== opt.id)
        : [...selected, opt]
      setValue(fieldId, next)
    }

    return (
      <CommandList>
        <CommandGroup heading={title}>
          {allowedOptions.map((opt) => {
            const isSelected = selectedIds.has(opt.id)
            const label = opt.name ?? opt.value ?? opt.id
            return (
              <CommandItem
                key={opt.id}
                value={label}
                onSelect={() => toggle(opt)}>
                <div className="flex w-full items-center justify-between">
                  <span className="truncate">{label}</span>
                  {isSelected ? <Check className="size-4" /> : null}
                </div>
              </CommandItem>
            )
          })}

          <CommandItem
            value="done"
            onSelect={() => {
              setSearch('')
              goToNextField()
            }}>
            <div className="flex w-full items-center justify-between">
              <span>Done</span>
              <span className="text-muted-foreground text-[10px]">Enter</span>
            </div>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    )
  }

  // labels-style fallback: array<string> (comma separated)
  if (
    schemaType === 'array' &&
    schemaItems === 'string' &&
    allowedOptions.length === 0
  ) {
    return (
      <CommandList>
        <CommandGroup heading={title}>
          <CommandEmpty>
            Type comma-separated values in the search box and press Enter
          </CommandEmpty>
        </CommandGroup>
      </CommandList>
    )
  }

  // Default: plain text
  return (
    <CommandList>
      <CommandGroup heading={title}>
        <CommandEmpty>Type a value and press Enter</CommandEmpty>
      </CommandGroup>
    </CommandList>
  )
}
