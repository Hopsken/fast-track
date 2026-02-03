import { createElement, useMemo } from 'react'

import { getFieldEditor } from './components/fieldRegistry'
import { FieldInputBaseProps } from './types'

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
export function FieldInput(props: FieldInputBaseProps) {
  const FieldEditor = useMemo(() => getFieldEditor(props.field), [props.field])
  return createElement(FieldEditor, props)
}
