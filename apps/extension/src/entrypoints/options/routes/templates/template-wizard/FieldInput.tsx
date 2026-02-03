import { Input } from '@internal/ui/components/input'

import type { FieldMetadata } from '~/types/template'

import {
  CommaSeparatedInput,
  MultiSelectChips,
  SingleSelectField,
  UserFieldInput,
  UserIdInput
} from './components'

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
