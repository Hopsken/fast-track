import { createElement } from 'react'
import { noop } from 'lodash-es'

import { useFieldAdapter } from '@/common/fields'
import { FieldConfig, JiraFieldMetadata } from '@/repository/schema'
import { JiraProject, JiraIssueType } from '@/types'

export function FieldConfigRow({
  field,
  project,
  issueType,
  config
}: {
  project: JiraProject
  issueType: JiraIssueType
  field: JiraFieldMetadata
  config: FieldConfig
  onChangeConfig: (config: FieldConfig) => void
}) {
  const adapter = useFieldAdapter(field)

  const ConfigComponent = adapter.ConfigComponent

  return createElement(ConfigComponent, {
    adapter,
    context: { project, issueType, metadata: field },
    config,
    // FIXME
    value: undefined,
    onValueChange: noop,
    onConfirm: noop
  })
}
