import { JiraFieldMetadata } from '@/repository/schema'
import { UnwrapArray } from '@/utils/type-utils'
import type {
  FieldConfig,
  FieldConflict,
  IssueTemplate
} from '~/types/template'

export interface VisibleField<T = unknown> {
  fieldId: string
  config?: FieldConfig
  metadata?: JiraFieldMetadata

  // TODO: remove this following two
  presetValue?: unknown
  /** When set, the create-issue form should only show these options (restricted mode). */
  allowedOptions?: UnwrapArray<T>[]

  isEditable: boolean
  conflict?: FieldConflict
}

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
      metadata: getMetadata('summary'),
      isEditable: true
    },
    {
      fieldId: 'description',
      metadata: getMetadata('description'),
      isEditable: true
    }
  ]

  for (const [fieldId, config] of Object.entries(template.fields)) {
    if (shouldSkipField(fieldId)) continue

    const metadata = getMetadata(fieldId)
    const conflict = conflictMap.get(fieldId)

    if (config.behavior === 'restricted') {
      visible.push({
        fieldId,
        config,
        metadata: conflict?.fieldMetadata ?? metadata,
        allowedOptions: config.allowedOptions,
        isEditable: true,
        conflict
      })
      continue
    }

    if (config.behavior === 'preset') {
      visible.push({
        fieldId,
        config,
        metadata: conflict?.fieldMetadata ?? metadata,
        presetValue: config.presetValue,
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

    visible.push({
      fieldId: conflict.fieldId,
      metadata: conflict.fieldMetadata,
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
