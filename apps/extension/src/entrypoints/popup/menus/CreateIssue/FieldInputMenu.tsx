import { useEffect, useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem
} from '@internal/ui/components/command'
import { Check } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useNavigate } from 'react-router-dom'

import { useFieldMetadataCache } from '@/hooks/useFieldMetadataCache'
import { useTemplateConflicts } from '@/hooks/useTemplateConflicts'
import { useTemplates } from '@/hooks/useTemplates'
import { useCommandInput } from '@/stores/useCommandInputStore'
import { computeVisibleFields } from '~/services/template-service/gap-analysis'
import type {
  AllowedValue,
  FieldMetadata,
  IssueTemplate
} from '~/types/template'

import { DescriptionFieldInputMenu } from './DescriptionFieldInputMenu'
import { useCreateIssueDraftStore } from './useCreateIssueDraftStore'
import { UserFieldInputMenu } from './UserFieldInputMenu'

type Props = {
  templateId: string
  fieldId: string
}

declare global {
  interface RouteMap {
    '/create-issue/field-input': Props
  }
}

function toCacheKey(template: IssueTemplate) {
  const { baseUrlHost, projectKey, issueTypeId } = template.scope
  return `${baseUrlHost}:${projectKey}:${issueTypeId}`
}

function getFieldName(fieldId: string, metadata?: FieldMetadata) {
  return metadata?.name ?? fieldId
}

function getAllowedOptions(input: {
  visibleAllowedOptions?: AllowedValue[]
  metadata?: FieldMetadata
}): AllowedValue[] {
  return input.visibleAllowedOptions ?? input.metadata?.allowedValues ?? []
}

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

export function FieldInputMenu({ templateId, fieldId }: Props) {
  const { data: templates, isLoading: isLoadingTemplates } = useTemplates()
  const template = useMemo(
    () => templates?.find((t) => t.id === templateId) ?? null,
    [templateId, templates]
  )

  const cacheKey = template ? toCacheKey(template) : null
  const { data: cache } = useFieldMetadataCache(cacheKey)
  const { data: conflicts } = useTemplateConflicts(templateId)

  const cacheFields = cache?.fields ?? []
  const metadata = cacheFields.find((f) => f.fieldId === fieldId)

  const visibleField = useMemo(() => {
    if (!template) return null
    const computed = computeVisibleFields(
      template,
      cache ?? undefined,
      conflicts ?? []
    )
    return computed.find((f) => f.fieldId === fieldId) ?? null
  }, [cache, conflicts, fieldId, template])

  const allowedOptions = getAllowedOptions({
    visibleAllowedOptions: visibleField?.allowedOptions,
    metadata
  })

  const schemaType = metadata?.schema.type
  const schemaItems = metadata?.schema.items

  const navigate = useNavigate()
  const { search, setSearch } = useCommandInput()

  const { values, setValue } = useCreateIssueDraftStore()
  const currentValue = values[fieldId]

  const title = getFieldName(fieldId, metadata)

  // Pre-fill the global command input for scalar fields.
  useEffect(() => {
    if (
      fieldId === 'summary' ||
      schemaType === 'string' ||
      schemaType === 'number'
    ) {
      const next = String(currentValue)
      setSearch(next)
    }
  }, [currentValue, fieldId, schemaType, setSearch])

  const saveAndBack = (value: unknown) => {
    setValue(fieldId, value)
    setSearch('')
    navigate(-1)
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
          saveAndBack(undefined)
          return
        }
        const num = Number(trimmed)
        if (!Number.isFinite(num)) return
        saveAndBack(num)
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
        saveAndBack(parts)
        return
      }

      if (fieldId === 'summary' || schemaType === 'string' || !schemaType) {
        saveAndBack(search)
      }
    },
    {
      enabled: enableEnterSave,
      preventDefault: true,
      enableOnFormTags: true
    },
    [
      search,
      enableEnterSave,
      allowedOptions.length,
      fieldId,
      navigate,
      saveAndBack,
      schemaItems,
      schemaType,
      setSearch,
      setValue
    ]
  )

  if (isLoadingTemplates || !templates) {
    return (
      <CommandList>
        <CommandEmpty>Loading...</CommandEmpty>
      </CommandList>
    )
  }

  if (!template) {
    return (
      <CommandList>
        <CommandEmpty>Template not found</CommandEmpty>
      </CommandList>
    )
  }

  if (fieldId === 'description') {
    return <DescriptionFieldInputMenu />
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
          navigate(-1)
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
              onSelect={() => saveAndBack(opt)}>
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
              navigate(-1)
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
