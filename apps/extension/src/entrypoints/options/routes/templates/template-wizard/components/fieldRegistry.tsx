import { ComponentType } from 'react'

import { FieldMetadata } from '@/repository/schema'

import { NumberInput, TextAreaInput, TextInput } from './primitive'
import { DateInput } from './primitive/DateInput'
import { DateTimeInput } from './primitive/DateTimeInput'
import { MultiSelectChips } from './primitive/MultiSelectChips'
import { SingleSelectField } from './primitive/SingleSelectField'
import { UserFieldInput } from './primitive/UserFieldInput'

const UnsupportedField = () => {
  return <span>Not implemented</span>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentByFieldKey: Record<string, ComponentType<any>> = {
  summary: TextInput,
  description: TextAreaInput,
  parent: SingleSelectField,
  assignee: UserFieldInput,
  reporter: UserFieldInput,
  priority: SingleSelectField,
  labels: MultiSelectChips,
  components: MultiSelectChips,
  fixVersions: SingleSelectField,
  duedate: DateInput,
  resolution: SingleSelectField
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentBySchemaCustomType: Record<string, ComponentType<any>> = {
  'com.pyxis.greenhopper.jira:gh-sprint': UnsupportedField,
  'com.atlassian.jira.plugin.system.customfieldtypes:textfield': TextInput,
  'com.atlassian.jira.plugin.system.customfieldtypes:textarea': TextAreaInput
}

// type: 'string' | 'number' | 'array' | 'user' | | 'date' | 'datetime'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentBySchemaType: Record<string, ComponentType<any>> = {
  string: TextInput,
  number: NumberInput,
  user: UserFieldInput,
  date: DateInput,
  datetime: DateTimeInput,
  option: SingleSelectField,
  team: SingleSelectField,
  array: MultiSelectChips
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentBySchemaItemsType: Record<string, ComponentType<any>> = {
  string: MultiSelectChips
  // user: MultiSelectChips
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFieldEditor(field: FieldMetadata): ComponentType<any> {
  const { key, schema } = field
  return (
    // First determine by known system field key
    componentByFieldKey[key] ||
    // then by well known custom field - Sprint, etc
    componentBySchemaCustomType[schema.custom ?? ''] ||
    // then by array item type
    componentBySchemaItemsType[schema.items ?? ''] ||
    // then by custom field schema type
    componentBySchemaType[schema.type] ||
    UnsupportedField
  )
}
