import { createElement, useMemo } from 'react'

import type { FieldMetadata } from '~/types/template'

import { getFieldEditor } from './components/fieldRegistry'

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
  const FieldEditor = useMemo(() => getFieldEditor(field), [field])

  return createElement(FieldEditor, { value, onChange, field })
}
