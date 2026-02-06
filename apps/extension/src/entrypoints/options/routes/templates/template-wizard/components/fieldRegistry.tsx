import { ComponentType } from 'react'

import { JiraFieldMetadata } from '@/repository/schema'

import { FieldInputBaseProps } from '../types'

import {
  LabelsInput,
  ProjectUserInput,
  SprintInput,
  ParentInput
} from './fields'
import {
  DateInput,
  DateTimeInput,
  MultiSelectInput,
  NumberInput,
  SingleSelectInput,
  TextAreaInput,
  TextInput,
  UserFieldInput
} from './primitive'

const UnsupportedField = ({ field }: FieldInputBaseProps) => {
  return <span>Field {field.name} is not supported</span>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentByFieldKey: Record<string, ComponentType<any>> = {
  summary: TextInput,
  description: TextAreaInput,
  parent: ParentInput,
  assignee: UserFieldInput,
  reporter: ProjectUserInput,
  priority: SingleSelectInput,
  labels: LabelsInput,
  components: MultiSelectInput,
  fixVersions: MultiSelectInput,
  duedate: DateInput,
  resolution: SingleSelectInput
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentBySchemaCustomType: Record<string, ComponentType<any>> = {
  'com.pyxis.greenhopper.jira:gh-sprint': SprintInput,
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
  option: SingleSelectInput,
  // team: SingleSelectField,
  array: MultiSelectInput
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentBySchemaItemsType: Record<string, ComponentType<any>> = {
  string: MultiSelectInput
  // user: MultiSelectChips
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFieldEditor(field: JiraFieldMetadata): ComponentType<any> {
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
