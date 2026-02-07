import { JiraFieldMetadata } from '@/repository/schema'
import type {
  FieldConfig,
  FieldConflict,
  IssueTemplate
} from '~/types/template'

export interface VisibleField<T = unknown> {
  fieldId: string
  config?: FieldConfig<T>
  metadata: JiraFieldMetadata

  isEditable: boolean
  conflict?: FieldConflict
}

const DEFAULT_SCHEMAS = {
  summary: {
    required: true,
    schema: {
      type: 'string',
      system: 'summary'
    },
    name: 'Summary',
    key: 'summary',
    hasDefaultValue: false,
    fieldId: 'summary'
  },
  description: {
    required: false,
    schema: {
      type: 'string',
      system: 'description'
    },
    name: 'Description',
    key: 'description',
    hasDefaultValue: false,
    fieldId: 'description'
  }
} satisfies Record<string, JiraFieldMetadata>

// eslint-disable-next-line sonarjs/cognitive-complexity
export function computeVisibleFields(
  template: IssueTemplate,
  fieldsMetadata: JiraFieldMetadata[],
  conflicts?: FieldConflict[]
): VisibleField[] {
  const conflictList = conflicts ?? []
  const conflictMap = new Map(conflictList.map((c) => [c.fieldId, c]))

  const getMetadata = (fieldId: string) =>
    fieldsMetadata.find((f) => f.fieldId === fieldId)

  const shouldSkipField = (fieldId: string) =>
    fieldId === 'summary' ||
    fieldId === 'description' ||
    fieldId === 'project' ||
    fieldId === 'issuetype'

  const visible: VisibleField[] = [
    {
      fieldId: 'summary',
      metadata: DEFAULT_SCHEMAS.summary,
      isEditable: true
    },
    {
      fieldId: 'description',
      metadata: DEFAULT_SCHEMAS.description,
      isEditable: true
    }
  ]

  for (const [fieldId, config] of Object.entries(template.fields)) {
    if (shouldSkipField(fieldId)) continue

    const metadata = getMetadata(fieldId)

    // Skip field if unable to get metadata of it
    if (!metadata) continue

    const conflict = conflictMap.get(fieldId)

    if (config.behavior === 'restricted') {
      visible.push({
        fieldId,
        config,
        metadata,
        isEditable: true,
        conflict
      })
      continue
    }

    if (config.behavior === 'preset') {
      visible.push({
        fieldId,
        config,
        metadata,
        isEditable: true,
        conflict
      })
    }
  }

  for (const conflict of conflictList) {
    if (conflict.type !== 'now_required') continue
    if (shouldSkipField(conflict.fieldId)) continue

    const alreadyVisible = visible.some((f) => f.fieldId === conflict.fieldId)
    if (alreadyVisible) continue

    const metadata = conflict.fieldMetadata
    // skip field if no metadata defined
    if (!metadata) continue

    visible.push({
      fieldId: conflict.fieldId,
      metadata,
      isEditable: true,
      conflict
    })
  }

  // Surface required fields from cache that have no template config.
  // These need user input at create-issue time.
  for (const field of fieldsMetadata) {
    if (!field.required) continue
    if (shouldSkipField(field.fieldId)) continue

    const alreadyVisible = visible.some((f) => f.fieldId === field.fieldId)
    if (alreadyVisible) continue

    // Field is required but has no template config — show it
    const hasConfig = field.fieldId in template.fields
    if (!hasConfig) {
      visible.push({
        fieldId: field.fieldId,
        metadata: field,
        isEditable: true
      })
    }
  }

  return visible
}
