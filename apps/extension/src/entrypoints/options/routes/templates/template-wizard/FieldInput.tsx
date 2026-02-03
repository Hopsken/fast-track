import type { FieldMetadata } from '~/types/template'

import {
  // Text inputs
  TextInput,
  NumberInput,
  TextAreaInput,
  CommaSeparatedInput,
  // Date/Time inputs
  DateInput,
  DateTimeInput,
  // Selection inputs
  SingleSelectField,
  MultiSelectChips,
  // User inputs
  UserFieldInput,
  UserIdInput,
  // Visual entity inputs
  PriorityFieldInput,
  IssueTypeFieldInput,
  ProjectFieldInput,
  StatusFieldInput,
  ResolutionFieldInput,
  // Collection inputs
  ComponentFieldInput,
  VersionFieldInput,
  GroupFieldInput,
  // Complex inputs
  TimeTrackingInput,
  SecurityLevelInput,
  IssueLinkInput,
  // Fallback
  GenericInput
} from './components'

/* ------------------------------------------------------------------ */
/*  Field input (type-appropriate router)                              */
/* ------------------------------------------------------------------ */

/**
 * Router component that selects the appropriate input component
 * based on field type, schema, and allowed values.
 *
 * This component receives `unknown` types from template state and
 * casts to concrete types when passing to specific components.
 */
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
  const { type, items } = schema

  // ============================================================
  // PRIORITY 1: Visual entity types with specific handling
  // ============================================================

  // Priority field with icon support
  if (type === 'priority' && allowedValues?.length) {
    return (
      <PriorityFieldInput
        value={
          value as { id: string; name?: string; iconUrl?: string } | undefined
        }
        onChange={
          onChange as (
            v: { id: string; name?: string; iconUrl?: string } | undefined
          ) => void
        }
        allowedValues={allowedValues}
        field={field}
      />
    )
  }

  // Issue type field with icon support
  if (type === 'issuetype' && allowedValues?.length) {
    return (
      <IssueTypeFieldInput
        value={
          value as { id: string; name?: string; iconUrl?: string } | undefined
        }
        onChange={
          onChange as (
            v: { id: string; name?: string; iconUrl?: string } | undefined
          ) => void
        }
        allowedValues={allowedValues}
        field={field}
      />
    )
  }

  // Project field with avatar support
  if (type === 'project' && allowedValues?.length) {
    return (
      <ProjectFieldInput
        value={
          value as
            | { id: string; key: string; name: string; avatarUrl?: string }
            | undefined
        }
        onChange={
          onChange as (
            v:
              | { id: string; key: string; name: string; avatarUrl?: string }
              | undefined
          ) => void
        }
        allowedValues={allowedValues}
        field={field}
      />
    )
  }

  // Status field with badge support
  if (type === 'status' && allowedValues?.length) {
    return (
      <StatusFieldInput
        value={
          value as
            | { id: string; name: string; statusCategory?: string }
            | undefined
        }
        onChange={
          onChange as (
            v: { id: string; name: string; statusCategory?: string } | undefined
          ) => void
        }
        allowedValues={allowedValues}
        field={field}
      />
    )
  }

  // Resolution field with icon support
  if (type === 'resolution' && allowedValues?.length) {
    return (
      <ResolutionFieldInput
        value={
          value as { id: string; name?: string; iconUrl?: string } | undefined
        }
        onChange={
          onChange as (
            v: { id: string; name?: string; iconUrl?: string } | undefined
          ) => void
        }
        allowedValues={allowedValues}
        field={field}
      />
    )
  }

  // ============================================================
  // PRIORITY 2: Generic allowed values (option type)
  // ============================================================

  // Single select from allowed values
  if (allowedValues?.length && type !== 'array') {
    return (
      <SingleSelectField
        fieldName={field.name}
        allowedValues={allowedValues}
        value={value}
        onChange={onChange}
      />
    )
  }

  // Multi-select from allowed values (array type)
  if (allowedValues?.length && type === 'array') {
    // Check for collection-specific types
    if (items === 'component') {
      return (
        <ComponentFieldInput
          value={value as { id: string; name?: string }[] | undefined}
          onChange={
            onChange as (v: { id: string; name?: string }[] | undefined) => void
          }
          allowedValues={allowedValues}
          field={field}
        />
      )
    }

    if (items === 'version') {
      return (
        <VersionFieldInput
          value={value as { id: string; name?: string }[] | undefined}
          onChange={
            onChange as (v: { id: string; name?: string }[] | undefined) => void
          }
          allowedValues={allowedValues}
          field={field}
        />
      )
    }

    if (items === 'group') {
      return (
        <GroupFieldInput
          value={value as { id: string; name?: string }[] | undefined}
          onChange={
            onChange as (v: { id: string; name?: string }[] | undefined) => void
          }
          allowedValues={allowedValues}
          field={field}
        />
      )
    }

    // Default multi-select
    return (
      <MultiSelectChips
        allowedValues={allowedValues}
        value={value}
        onChange={onChange}
      />
    )
  }

  // ============================================================
  // PRIORITY 3: User fields
  // ============================================================

  // User with auto-complete
  if (type === 'user' && field.autoCompleteUrl) {
    return <UserFieldInput field={field} value={value} onChange={onChange} />
  }

  // User without auto-complete
  if (type === 'user') {
    return <UserIdInput value={value} onChange={onChange} />
  }

  // ============================================================
  // PRIORITY 4: Date/Time fields
  // ============================================================

  // Date field (YYYY-MM-DD)
  if (type === 'date') {
    return (
      <DateInput
        value={value as string | undefined}
        onChange={onChange as (v: string | undefined) => void}
        field={field}
      />
    )
  }

  // DateTime field (ISO 8601)
  if (type === 'datetime') {
    return (
      <DateTimeInput
        value={value as string | undefined}
        onChange={onChange as (v: string | undefined) => void}
        field={field}
      />
    )
  }

  // ============================================================
  // PRIORITY 5: Complex fields
  // ============================================================

  // Time tracking (original + remaining estimate)
  if (type === 'timetracking') {
    return (
      <TimeTrackingInput
        value={
          value as
            | { originalEstimate?: string; remainingEstimate?: string }
            | undefined
        }
        onChange={
          onChange as (
            v:
              | { originalEstimate?: string; remainingEstimate?: string }
              | undefined
          ) => void
        }
        field={field}
      />
    )
  }

  // Security level
  if (type === 'securitylevel' && allowedValues?.length) {
    return (
      <SecurityLevelInput
        value={value as { id: string; name?: string } | undefined}
        onChange={
          onChange as (v: { id: string; name?: string } | undefined) => void
        }
        allowedValues={allowedValues}
        field={field}
      />
    )
  }

  // Issue link
  if (type === 'issuelink' && allowedValues?.length) {
    return (
      <IssueLinkInput
        value={
          value as
            | {
                type: { id: string; name: string }
                outwardIssue?: { key: string }
              }
            | undefined
        }
        onChange={
          onChange as (
            v:
              | {
                  type: { id: string; name: string }
                  outwardIssue?: { key: string }
                }
              | undefined
          ) => void
        }
        allowedValues={allowedValues}
        field={field}
      />
    )
  }

  // ============================================================
  // PRIORITY 6: Basic scalar types
  // ============================================================

  // Number
  if (type === 'number') {
    return (
      <NumberInput
        value={value as number | undefined}
        onChange={onChange as (v: number | undefined) => void}
        field={field}
      />
    )
  }

  // Array of strings (labels, etc.)
  if (type === 'array' && items === 'string') {
    return <CommaSeparatedInput value={value} onChange={onChange} />
  }

  // Multi-line text (description field)
  if (field.key === 'description' || type === 'string') {
    // Use textarea for description fields
    if (field.key === 'description') {
      return (
        <TextAreaInput
          value={value as string | undefined}
          onChange={onChange as (v: string | undefined) => void}
          field={field}
          rows={6}
        />
      )
    }

    // Use regular text input for other string fields
    return (
      <TextInput
        value={value as string | undefined}
        onChange={onChange as (v: string | undefined) => void}
        field={field}
      />
    )
  }

  // ============================================================
  // FALLBACK: Unknown types
  // ============================================================

  return <GenericInput value={value} onChange={onChange} field={field} />
}
