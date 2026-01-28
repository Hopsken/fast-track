import type {
  CachedFieldMetadata,
  FieldConflict,
  FieldMetadata,
  IssueTemplate
} from '~/types/template'

export interface VisibleField {
  fieldId: string
  metadata?: FieldMetadata
  presetValue?: unknown
  isEditable: boolean
  conflict?: FieldConflict
}

export function computeVisibleFields(
  template: IssueTemplate,
  cache?: CachedFieldMetadata,
  conflicts?: FieldConflict[]
): VisibleField[] {
  const visible: VisibleField[] = []
  const conflictMap = new Map((conflicts ?? []).map((c) => [c.fieldId, c]))

  const getMetadata = (fieldId: string) =>
    cache?.fields.find((f) => f.fieldId === fieldId)

  // 1) Summary always
  visible.push({
    fieldId: 'summary',
    metadata: getMetadata('summary'),
    isEditable: true
  })

  // 2) Description (if visible or template exists)
  const descConfig = template.fields['description']
  if (descConfig?.behavior === 'visible' || template.descriptionTemplate) {
    visible.push({
      fieldId: 'description',
      metadata: getMetadata('description'),
      presetValue: template.descriptionTemplate,
      isEditable: true
    })
  }

  // 3) Process configured fields
  for (const [fieldId, config] of Object.entries(template.fields)) {
    if (fieldId === 'summary' || fieldId === 'description') continue
    if (fieldId === 'project' || fieldId === 'issuetype') continue

    const metadata = getMetadata(fieldId)
    const conflict = conflictMap.get(fieldId)

    if (config.behavior === 'visible') {
      visible.push({ fieldId, metadata, isEditable: true, conflict })
      continue
    }

    if (config.behavior === 'preset' && conflict) {
      visible.push({
        fieldId,
        metadata: conflict.fieldMetadata ?? metadata,
        presetValue: config.presetValue,
        isEditable: true,
        conflict
      })
    }
  }

  // 4) Add now_required conflicts not already visible
  for (const conflict of conflicts ?? []) {
    if (conflict.type !== 'now_required') continue
    if (conflict.fieldId === 'project' || conflict.fieldId === 'issuetype')
      continue
    if (conflict.fieldId === 'summary') continue

    const alreadyVisible = visible.some((f) => f.fieldId === conflict.fieldId)
    if (alreadyVisible) continue

    visible.push({
      fieldId: conflict.fieldId,
      metadata: conflict.fieldMetadata,
      isEditable: true,
      conflict
    })
  }

  return visible
}
