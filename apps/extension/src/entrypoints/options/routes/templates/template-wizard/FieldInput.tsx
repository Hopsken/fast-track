import { useMemo, useState } from 'react'
import { Input } from '@internal/ui/components/input'
import { useDebounce } from 'ahooks'

import {
  InputSearch,
  type SearchOption
} from '@/components/ui/forms/InputSearch'
import { useAutoCompleteUsers } from '~/hooks/useAutoComplete'
import type { FieldMetadata } from '~/types/template'

/* ------------------------------------------------------------------ */
/*  Field input (type-appropriate router)                              */
/* ------------------------------------------------------------------ */

export function FieldInput({
  field,
  value,
  onChange
}: {
  field: FieldMetadata
  value: unknown
  onChange: (v: unknown) => void
}) {
  const { schema, allowedValues } = field

  // Allowed values → select / multi-select
  if (allowedValues && allowedValues.length > 0) {
    return schema.type === 'array' ? (
      <MultiSelectChips
        allowedValues={allowedValues}
        value={value}
        onChange={onChange}
      />
    ) : (
      <SingleSelectField
        fieldName={field.name}
        allowedValues={allowedValues}
        value={value}
        onChange={onChange}
      />
    )
  }

  // User with auto-complete
  if (schema.type === 'user' && field.autoCompleteUrl) {
    return <UserFieldInput field={field} value={value} onChange={onChange} />
  }

  // User without auto-complete
  if (schema.type === 'user') {
    return <UserIdInput value={value} onChange={onChange} />
  }

  // Number
  if (schema.type === 'number') {
    return (
      <Input
        type="number"
        placeholder={`Enter ${field.name}`}
        value={typeof value === 'number' ? String(value) : ''}
        onChange={(e) => {
          const num = Number(e.target.value)
          onChange(!e.target.value || isNaN(num) ? undefined : num)
        }}
      />
    )
  }

  // Array of strings (labels, etc.)
  if (schema.type === 'array' && schema.items === 'string') {
    return <CommaSeparatedInput value={value} onChange={onChange} />
  }

  // Default text
  return (
    <Input
      placeholder={`Enter ${field.name}`}
      value={(value as string) ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Specialised sub-inputs                                             */
/* ------------------------------------------------------------------ */

function MultiSelectChips({
  allowedValues,
  value,
  onChange
}: {
  allowedValues: NonNullable<FieldMetadata['allowedValues']>
  value: unknown
  onChange: (v: unknown) => void
}) {
  const options = useMemo(
    () =>
      allowedValues.map((av) => ({
        value: String(av.id ?? av.value ?? av.name),
        label: av.name ?? av.value ?? av.id ?? 'Unknown',
        data: av as Record<string, unknown>
      })),
    [allowedValues]
  )

  const selectedIds = useMemo(
    () =>
      new Set(
        Array.isArray(value)
          ? (value as Array<Record<string, unknown>>).map((v) =>
              String(v.id ?? v.value ?? v)
            )
          : []
      ),
    [value]
  )

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const selected = selectedIds.has(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              const current = Array.isArray(value)
                ? (value as Array<Record<string, unknown>>)
                : []
              const next = selected
                ? current.filter(
                    (v) => String(v.id ?? v.value ?? v) !== opt.value
                  )
                : [...current, opt.data]
              onChange(next)
            }}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
              selected
                ? 'border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground hover:border-foreground/30 border-transparent bg-transparent'
            }`}>
            {opt.label}
          </button>
        )
      })}
      {selectedIds.size > 0 && (
        <button
          type="button"
          onClick={() => onChange([])}
          className="text-muted-foreground hover:text-foreground px-1 text-xs underline-offset-2 transition-colors hover:underline">
          Clear
        </button>
      )}
    </div>
  )
}

function SingleSelectField({
  fieldName,
  allowedValues,
  value,
  onChange
}: {
  fieldName: string
  allowedValues: NonNullable<FieldMetadata['allowedValues']>
  value: unknown
  onChange: (v: unknown) => void
}) {
  const options = useMemo<SearchOption<Record<string, unknown>>[]>(
    () =>
      allowedValues.map((av) => ({
        value: String(av.id ?? av.value ?? av.name),
        label: av.name ?? av.value ?? av.id ?? 'Unknown',
        data: av as Record<string, unknown>
      })),
    [allowedValues]
  )

  return (
    <InputSearch
      placeholder={`Select ${fieldName}…`}
      options={options}
      value={value as Record<string, unknown> | null}
      onSelect={(val) => onChange(val)}
      filter
    />
  )
}

function UserIdInput({
  value,
  onChange
}: {
  value: unknown
  onChange: (v: unknown) => void
}) {
  return (
    <div className="space-y-1">
      <Input
        placeholder="Account ID (e.g. 557058:…)"
        value={
          (value as { accountId?: string } | undefined)?.accountId ??
          (value as string) ??
          ''
        }
        onChange={(e) =>
          onChange(e.target.value ? { accountId: e.target.value } : undefined)
        }
      />
      <p className="text-muted-foreground text-xs">Enter the Jira account ID</p>
    </div>
  )
}

function CommaSeparatedInput({
  value,
  onChange
}: {
  value: unknown
  onChange: (v: unknown) => void
}) {
  const strValue = Array.isArray(value)
    ? (value as string[]).join(', ')
    : ((value as string) ?? '')

  return (
    <div className="space-y-1">
      <Input
        placeholder="tag1, tag2, …"
        value={strValue}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
      />
      <p className="text-muted-foreground text-xs">Comma-separated values</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  User field with autocomplete                                       */
/* ------------------------------------------------------------------ */

function UserFieldInput({
  field,
  value,
  onChange
}: {
  field: FieldMetadata
  value: unknown
  onChange: (v: unknown) => void
}) {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, { wait: 300 })

  const { data: users, isLoading } = useAutoCompleteUsers(
    field.autoCompleteUrl!,
    debouncedQuery
  )

  const selectedValue = value as
    | { accountId: string; displayName?: string; avatarUrl?: string }
    | undefined

  const options = useMemo(() => {
    const list = (users ?? [])
      .filter((u): u is typeof u & { accountId: string } =>
        Boolean(u.accountId)
      )
      .map((u) => ({
        value: u.accountId,
        label: u.displayName ?? u.name ?? 'Unknown',
        description: u.emailAddress,
        data: u.accountId
      }))

    if (
      selectedValue?.accountId &&
      !list.some((o) => o.value === selectedValue.accountId)
    ) {
      list.unshift({
        value: selectedValue.accountId,
        label: selectedValue.displayName ?? selectedValue.accountId,
        description: 'Currently selected',
        data: selectedValue.accountId
      })
    }

    return list
  }, [users, selectedValue])

  return (
    <InputSearch
      placeholder={`Search ${field.name}…`}
      query={query}
      onQueryChange={setQuery}
      options={options}
      value={selectedValue?.accountId ?? null}
      onSelect={(accountId) => {
        if (!accountId) {
          onChange(undefined)
          return
        }
        const user = users?.find((u) => u.accountId === accountId)
        if (user) {
          onChange({
            accountId: user.accountId,
            displayName: user.displayName,
            avatarUrl: user.avatarUrls?.['24x24']
          })
        } else if (selectedValue && selectedValue.accountId === accountId) {
          onChange(selectedValue)
        }
      }}
      isLoading={isLoading}
      filter={false}
      renderOptionIcon={(opt) => {
        const user = users?.find((u) => u.accountId === opt.data)
        const avatarUrl =
          user?.avatarUrls?.['24x24'] ??
          (selectedValue?.accountId === opt.data
            ? selectedValue.avatarUrl
            : undefined)
        if (!avatarUrl) return null
        return <img src={avatarUrl} className="size-5 rounded-full" alt="" />
      }}
    />
  )
}
