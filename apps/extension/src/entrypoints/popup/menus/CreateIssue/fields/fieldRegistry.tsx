import { ComponentType } from 'react'

import type { VisibleField } from '~/services/template-service/gap-analysis'

import {
  CommandArrayInput,
  CommandMultiSelect,
  CommandNumberInput,
  CommandSingleSelect,
  CommandStringInput,
  CommandUserSelect,
  FieldInputProps
} from './primitive'
import {
  LabelsInput,
  ParentIssueInput,
  ProjectUserSelect,
  SprintInput
} from './specialized'

/**
 * Fallback component for unsupported field types.
 * Displays a message indicating the field type is not yet supported.
 */
function UnsupportedFieldInput({ field }: FieldInputProps) {
  const fieldType = field.metadata?.schema.type ?? 'unknown'
  const customType = field.metadata?.schema.custom

  return (
    <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
      <div className="text-center">
        <p>Field type not supported:</p>
        <p className="font-mono text-xs">
          {customType ? `${customType}` : `type: ${fieldType}`}
        </p>
      </div>
    </div>
  )
}

/**
 * Level 1: Field key registry
 * Maps specific field IDs to their components (system fields + special cases)
 */
const componentByFieldKey: Record<
  string,
  ComponentType<FieldInputProps> | undefined
> = {
  labels: LabelsInput,
  parent: ParentIssueInput,
  reporter: ProjectUserSelect
}

/**
 * Level 2: Custom type registry
 * Maps Jira custom field types to their components
 */
const componentByCustomType: Record<
  string,
  ComponentType<FieldInputProps> | undefined
> = {
  'com.pyxis.greenhopper.jira:gh-sprint': SprintInput
}

/**
 * Level 3: Array items type registry
 * Maps array item types to their components
 */
const componentByArrayItems: Record<
  string,
  ComponentType<FieldInputProps> | undefined
> = {
  string: CommandArrayInput // string[] with comma parsing
}

/**
 * Level 4: Schema type registry
 * Maps generic Jira schema types to their components
 */
const componentBySchemaType: Record<
  string,
  ComponentType<FieldInputProps> | undefined
> = {
  string: CommandStringInput,
  number: CommandNumberInput,
  user: CommandUserSelect,
  option: CommandSingleSelect,
  priority: CommandSingleSelect,
  resolution: CommandSingleSelect,
  array: CommandMultiSelect // default for arrays
}

/**
 * Get the appropriate field input component for a given field.
 *
 * Uses a 5-level fallback strategy:
 * 1. Field key (summary, labels, parent, etc.)
 * 2. Custom type (Sprint custom fields, etc.)
 * 3. Array items type (string[] vs AllowedValue[])
 * 4. Schema type (string, number, user, etc.)
 * 5. Fallback (UnsupportedFieldInput)
 *
 * @param field - The field to get a component for
 * @returns The component to render for this field
 */
export function getFieldInputComponent(
  field: VisibleField
): ComponentType<FieldInputProps> {
  const { fieldId, metadata } = field
  const schema = metadata?.schema

  // Level 1: Field key (system fields + special cases)
  const byFieldKey = componentByFieldKey[fieldId]
  if (byFieldKey) {
    return byFieldKey
  }

  // Level 2: Custom type (Sprint, custom fields)
  if (schema?.custom) {
    const byCustomType = componentByCustomType[schema.custom]
    if (byCustomType) {
      return byCustomType
    }
  }

  // Level 3: Array items type (string[] vs AllowedValue[])
  if (schema?.type === 'array' && schema.items) {
    const byArrayItems = componentByArrayItems[schema.items]
    if (byArrayItems) {
      return byArrayItems
    }
  }

  // Level 4: Schema type (generic type mapping)
  if (schema?.type) {
    const bySchemaType = componentBySchemaType[schema.type]
    if (bySchemaType) {
      return bySchemaType
    }
  }

  // Level 5: Fallback
  return UnsupportedFieldInput
}
